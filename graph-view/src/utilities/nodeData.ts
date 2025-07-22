import type { NodeInfo } from "../../../src/nodes";
import type { NodeEventHandlers } from "../components/GraphView";

export type YarnNodeData = {
    isNodeGroup?: boolean;
    nodeInfos?: NodeInfo[];
    groupName?: string;
} & (
    | { nodeInfos: undefined; groupName: string }
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
