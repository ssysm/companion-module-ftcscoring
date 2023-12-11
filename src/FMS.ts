import WebSocket from "ws";
import { CLOUD_FMS_HOST, type FMSConfig } from "./config";
import type { InstanceBaseExt } from "./util";
import { InstanceStatus } from "@companion-module/base";
import { FMSUpdatePayload, FMSUpdateType } from "./types/FMSTypes";

const KEEP_ALIVE_ACCEPTABLE_DELAY = 10 * 1000; // 10 seconds

export default class FMSSystem {
  private websocketInstance: WebSocket | undefined;
  private instance: InstanceBaseExt<FMSConfig>;

  private lastUpdatedPong = 0;
  private keepAliveCheckerInterval: NodeJS.Timeout | undefined;

  constructor(instance: InstanceBaseExt<FMSConfig>) {
    this.instance = instance;
  }

  public connectFMS = (instance: InstanceBaseExt<FMSConfig>) => {
    if (instance.config.cloudFMS) {
      instance.log("info", "Using Cloud FMS");
      this.websocketInstance = new WebSocket(
        `wss://${CLOUD_FMS_HOST}/${instance.config.cloudFMSYear}/api/v2/stream/?code=${instance.config.eventID}`
      );
    } else {
      instance.log("info", "Using Local FMS");
      this.websocketInstance = new WebSocket(
        `ws://${instance.config.host}:${instance.config.port}/api/v2/stream/?code=${instance.config.eventID}`
      );
    }
    // setup event handlers
    this.websocketInstance.on("error", this.websocketErrorHandler);
    this.websocketInstance.on("open", this.websocketOpenHandler);
    this.websocketInstance.on("close", this.WebSocketCloseHandler);
    this.websocketInstance.on("message", this.websocketMessageHandler);

    this.keepAliveCheckerInterval = setInterval(this.keepAliveChecker, 5000);
    this.instance.updateStatus(InstanceStatus.Connecting);
  };

  public disconnectFMS = () => {
    if (this.websocketInstance === undefined) {
      return;
    }
    this.websocketInstance.close();
  };

  public reloadFMSConnection = () => {
    if (this.websocketInstance !== undefined) {
      this.websocketInstance.close();
    }
    this.websocketInstance = undefined;
    this.connectFMS(this.instance);
  };

  private WebSocketCloseHandler = () => {
    this.websocketInstance = undefined;
    this.instance.log("info", "Disconnected from FMS");
    this.instance.updateStatus(InstanceStatus.Disconnected);
    clearInterval(this.keepAliveCheckerInterval);
  };

  private websocketErrorHandler = (ws: WebSocket, error: Error) => {
    ws.close();
    this.websocketInstance = undefined;
    this.instance.log("error", "Error with FMS: " + error.message);
    this.instance.updateStatus(InstanceStatus.ConnectionFailure);
    clearInterval(this.keepAliveCheckerInterval);

    // Try to reconnect
    this.instance.log("info", "Attempting to reconnect to FMS...");
    this.reloadFMSConnection();
  };

  private websocketOpenHandler = () => {
    this.instance.log("info", "Connected to FMS");
    this.instance.updateStatus(InstanceStatus.Ok);
  };

  private websocketMessageHandler = (message: WebSocket.Data) => {
    this.instance.log("debug", "Message from FMS: " + message);

    const payload = message.toString();

    if (payload === "pong") {
      this.socketPongHandler();
      return;
    }

    const parsedUpdate = JSON.parse(payload);

    if (parsedUpdate === undefined) {
      this.instance.log("warn", "Unable to parse FMS update");
      return;
    }

    this.fieldUpdateHandler(parsedUpdate);
    this.lastUpdatedPong = parsedUpdate.updateTime;
  };

  private fieldUpdateHandler = (updatePayload: FMSUpdatePayload) => {
    this.instance.log(
      "debug",
      `Handling update type: ${updatePayload.updateType}`
    );
    switch (updatePayload.updateType) {
      case FMSUpdateType.MATCH_LOAD:
        this.instance.setVariableValues({
          loaded_match_field: updatePayload.payload.field,
        });
        this.instance.log(
          "info",
          `Loaded match ${updatePayload.payload.number} on field ${updatePayload.payload.field}`
        );
        break;
      case FMSUpdateType.SHOW_RANDOM:
      case FMSUpdateType.SHOW_MATCH:
      case FMSUpdateType.MATCH_START:
        this.instance.setVariableValues({
          active_field: updatePayload.payload.field,
          active_match: updatePayload.payload.number,
          active_match_status: updatePayload.updateType,
        });
        this.instance.log(
          "info",
          `Started match ${updatePayload.payload.number} on field ${updatePayload.payload.field}`
        );
        break;
      case FMSUpdateType.MATCH_ABORT:
        this.instance.setVariableValues({
          active_match: updatePayload.payload.number,
          active_match_status: updatePayload.updateType,
        });
        this.instance.log(
          "info",
          `Aborted match ${updatePayload.payload.number}`
        );
        break;
      case FMSUpdateType.MATCH_COMMIT:
        // TODO: Add commit logic
        this.instance.log(
          "info",
          `Committed match ${updatePayload.payload.number}`
        );
        break;
      case FMSUpdateType.MATCH_POST:
        // TODO: Add post logic
        this.instance.log(
          "info",
          `Posted match ${updatePayload.payload.number}`
        );
        break;
      default:
        this.instance.log(
          "warn",
          `Unknown update type: ${updatePayload.updateType}`
        );
        break;
    }
  };

  private socketPongHandler = () => {
    if (this.websocketInstance === undefined) {
      return;
    }
    // this.websocketInstance.ping();
  };

  private keepAliveChecker = () => {
    if (this.websocketInstance === undefined) {
      return;
    }
    if (Date.now() - this.lastUpdatedPong > KEEP_ALIVE_ACCEPTABLE_DELAY) {
      this.instance.log("error", "FMS connection lost, reconnecting...");
      this.instance.updateStatus(InstanceStatus.ConnectionFailure);
      this.websocketInstance.close();
      this.websocketInstance = undefined;
      this.connectFMS(this.instance);
    } else {
      this.instance.log("debug", "FMS connection is alive");
    }
  };
}
