import { type FMSConfig } from "./config";
import { FMSUpdateType } from "./types/FMSTypes";
import { type InstanceBaseExt } from "./util";

export const UpdateVariableDefinitions = async (
  self: InstanceBaseExt<FMSConfig>
) => {
  self.setVariableDefinitions([
    { variableId: "loaded_match_field", name: "Loaded Match Field Number" },
    { variableId: "active_field", name: "Currently Active Field Number" },
    { variableId: "active_match", name: "Currently Active Match Number" },
    {
      variableId: "active_match_status",
      name: "Currently Active Match Status",
    },
  ]);
  self.setVariableValues({
    loaded_match_field: 1,
    active_field: 1,
    active_match: 1,
    active_match_status: FMSUpdateType.MATCH_LOAD,
  });
};
