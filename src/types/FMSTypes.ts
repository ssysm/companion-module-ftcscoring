export enum FMSUpdateType {
  MATCH_LOAD = "MATCH_LOAD",
  MATCH_START = "MATCH_START",
  MATCH_ABORT = "MATCH_ABORT",
  MATCH_COMMIT = "MATCH_COMMIT",
  MATCH_POST = "MATCH_POST",
  SHOW_MATCH = "SHOW_MATCH",
  SHOW_RANDOM = "SHOW_RANDOM",
}

export interface FMSUpdatePayload {
  payload: {
    number: number;
    field: number;
    shortName: string;
  };
  updateTime: number;
  updateType: FMSUpdateType;
}
