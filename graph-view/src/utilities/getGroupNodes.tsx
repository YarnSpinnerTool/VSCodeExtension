import { Node as GraphNode } from "@xyflow/react";
import { getGroupRect } from "./getGroupRect";
import { NodeInfo } from "../../../src/nodes";
import { getNodePosition } from "./getNodePosition";

export function getGroupNodes(contentNodes: NodeInfo[]): GraphNode[] {
    const groupedNodes: Record<string, NodeInfo[]> = {};

    for (const contentNode of contentNodes) {
        const groupHeaders =
            contentNode.headers
                .filter((h) => h.key == "group")
                .map((h) => h.value) ?? [];

        for (const header of groupHeaders) {
            if (!(header in groupedNodes)) {
                groupedNodes[header] = [];
            }
            groupedNodes[header].push(contentNode);
        }
    }

    const nodeGroups = Object.entries(groupedNodes)
        .map<GraphNode | null>(([groupName, nodes]) => {
            if (groupName === "{}") {
                return null;
            }
            if (!nodes) {
                return null;
            }

            const nodePositions = nodes.map((n) => ({
                position: getNodePosition(n) ?? { x: 0, y: 0 },
            }));

            const { position: groupPosition, size: groupSize } =
                getGroupRect(nodePositions);

            return {
                id: groupName,
                data: { groupName },
                position: groupPosition,
                ...groupSize,
                type: "group",
            };
        })
        .filter((n) => n !== null);
    return nodeGroups;
}
