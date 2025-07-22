import type { NodeInfo } from "../../../src/nodes";
import type { NodeEventHandlers } from "../components/GraphView";

export type YarnNodeData = {
    nodeInfo?: NodeInfo;
    groupName?: string;
} & NodeEventHandlers;
