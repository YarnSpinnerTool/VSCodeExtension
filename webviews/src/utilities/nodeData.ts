import type { NodeInfo } from "@/extension/nodes";

export type YarnNodeData = {
    clusterName?: string;
} & (
    | {
          nodeInfos: [NodeInfo];
          isNodeGroup: false;
      }
    | {
          nodeInfos: NodeInfo[];
          isNodeGroup: true;
      }
);
