import { type FMSConfig, GetConfigFields } from "./config";

import {
  InstanceBase,
  runEntrypoint,
  InstanceStatus,
  type SomeCompanionConfigField,
} from "@companion-module/base";

import { UpgradeScripts } from "./upgrades";
import { UpdateVariableDefinitions } from "./variables";
import FMSSystem from "./FMS";

class ModuleInstance extends InstanceBase<FMSConfig> {
  public config: FMSConfig;
  
  private FMSInstance: FMSSystem;
  
  constructor(internal: unknown) {
    super(internal);
    this.config = {
      host: "localhost",
      port: "8080",
      cloudFMS: false,
      cloudFMSYear: "2024",
      eventID: "",
    };
    this.FMSInstance = new FMSSystem(this);
  }

  async init(config: FMSConfig) {
    this.config = config;

    this.updateStatus(InstanceStatus.Disconnected);

    this.updateActions(); // export actions
    this.updateFeedbacks(); // export feedbacks
    this.updateVariableDefinitions(); // export variable definitions
  }

  // When module gets deleted
  async destroy() {
    this.log("debug", "destroy");
    this.FMSInstance.disconnectFMS();
  }

  async configUpdated(config: FMSConfig) {
    this.config = config;
    this.FMSInstance.reloadFMSConnection();
  }

  // Return config fields for web config
  getConfigFields(): SomeCompanionConfigField[] {
    return GetConfigFields(this);
  }

  updateActions() {
    //UpdateActions(this)
  }

  updateFeedbacks() {
    // UpdateFeedbacks(this)
  }

  updateVariableDefinitions() {
    UpdateVariableDefinitions(this)
  }
}

runEntrypoint(ModuleInstance, UpgradeScripts);
