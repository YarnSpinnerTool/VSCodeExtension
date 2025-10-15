import type { NodeInfo } from "@/extension/nodes";
import type { NodeEventHandlers } from "@/components/graph-view/GraphView";

export type YarnNodeData = {
    isNodeGroup?: boolean;
    nodeInfos?: NodeInfo[];
    clusterName?: string;
} & (
    | { nodeInfos: undefined; clusterName: string }
    | {
          nodeInfos: [NodeInfo];
          isNodeGroup: false;
      }
    | {
          nodeInfos: NodeInfo[];
          isNodeGroup: true;
      }
) &
    NodeEventHandlers;
