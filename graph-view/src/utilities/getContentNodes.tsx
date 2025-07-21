import { Node as GraphNode } from "@xyflow/react";
import type { NodeInfo } from "../../../src/nodes";
import { NodeOffset, NodeSize } from "./constants";
import { NodeEventHandlers, YarnNodeData } from "../components/GraphView";

export function getContentNodes(
    nodes: NodeInfo[],
    eventHandlers: NodeEventHandlers,
    selectedNodes: string[],
): GraphNode<YarnNodeData>[] {
    let nodesWithoutPositions = 0;

    const contentNodes = nodes.map<GraphNode<YarnNodeData>>((n, i) => {
        const positionHeader = n.headers.find(
            (h) => h.key === "position",
        )?.value;

        let position: { x: number; y: number };

        if (!positionHeader) {
            position = {
                x: NodeOffset * nodesWithoutPositions,
                y: NodeOffset * nodesWithoutPositions,
            };

            nodesWithoutPositions += 1;
        } else {
            const [x, y] = positionHeader
                .split(",")
                .map((s) => s.trim())
                .map((s) => parseInt(s))
                .map((s) => (isNaN(s) ? 0 : s));

            position = { x, y };
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
    });

    return contentNodes;
}
