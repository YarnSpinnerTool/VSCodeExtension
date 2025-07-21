import { Node as GraphNode } from "@xyflow/react";
import { getGroupRect } from "./getGroupRect";
import { YarnNodeData } from "../components/GraphView";

export function getGroupNodes(
    contentNodes: GraphNode<YarnNodeData>[],
): GraphNode[] {
    const groupedNodes = Object.entries(
        Object.groupBy(contentNodes, (n) => n.data.nodeInfo?.nodeGroup ?? "{}"),
    );

    const nodeGroups = groupedNodes
        .map<GraphNode | null>(([groupName, nodes]) => {
            if (groupName === "{}") {
                return null;
            }
            if (!nodes) {
                return null;
            }

            const { position: groupPosition, size: groupSize } =
                getGroupRect(nodes);

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
