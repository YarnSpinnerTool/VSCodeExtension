import { NodeOffset, NodeSize } from "./constants";
import { getNodePosition } from "./getNodePosition";
import type { Node as GraphNode } from "@xyflow/react";
import type { NodeInfo } from "../../../src/nodes";
import type { NodeEventHandlers } from "../components/GraphView";
import type { YarnNodeData } from "./nodeData";

export function getContentNodes(
    nodes: NodeInfo[],
    eventHandlers: NodeEventHandlers,
    selectedNodes: string[],
): GraphNode<YarnNodeData>[] {
    let nodesWithoutPositions = 0;

    const contentNodes = nodes.map<GraphNode<YarnNodeData> | undefined>(
        (n, i) => {
            // Content nodes in a node group get drawn as a single combined
            // node, so don't include them here
            const isNodeGroup = n.nodeGroup != undefined;
            if (isNodeGroup) {
                return undefined;
            }

            let position = getNodePosition(n);

            if (!position) {
                position = {
                    x: NodeOffset * nodesWithoutPositions,
                    y: NodeOffset * nodesWithoutPositions,
                };

                nodesWithoutPositions += 1;
            }

            const id = n.uniqueTitle ?? "Node-" + i;

            return {
                id,
                data: { nodeInfo: n, ...eventHandlers },
                position,
                width: NodeSize.width,
                selected: selectedNodes.includes(id),
                height: NodeSize.height,
                type: "yarnNode",
            };
        },
    );

    return contentNodes.filter((n) => n !== undefined);
}
