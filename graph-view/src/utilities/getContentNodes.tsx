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
            if (n.nodeGroup != undefined) {
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
                data: {
                    isNodeGroup: false,
                    nodeInfos: [n],
                    ...eventHandlers,
                } satisfies YarnNodeData,
                position,
                selected: selectedNodes.includes(id),
                width: NodeSize.width,
                height: NodeSize.height,
                type: "yarnNode",
            };
        },
    );

    // Now create content graph nodes that represent node groups (collections of
    // Yarn nodes that all appear as a single element)
    const nodeGroups: Map<string, NodeInfo[]> = new Map();

    for (const contentNode of nodes) {
        if (!contentNode.nodeGroup) {
            continue;
        }

        const groupName = contentNode.nodeGroup;
        if (!nodeGroups.has(groupName)) {
            nodeGroups.set(groupName, []);
        }

        nodeGroups.get(groupName)!.push(contentNode);
    }

    const nodeGroupsNodes: GraphNode<YarnNodeData>[] = [];

    for (const nodeGroupName of nodeGroups.keys()) {
        const nodesInGroup = nodeGroups.get(nodeGroupName) ?? [];

        if (nodesInGroup.length == 0) {
            continue;
        }

        const positions = nodesInGroup.map(
            (n) => getNodePosition(n) ?? { x: 0, y: 0 },
        );
        const averagePosition = positions.reduce(
            (sum, next) => ({ x: sum.x + next.x, y: sum.y + next.y }),
            { x: 0, y: 0 },
        );
        averagePosition.x /= positions.length;
        averagePosition.y /= positions.length;

        nodeGroupsNodes.push({
            id: nodeGroupName,
            data: {
                nodeInfos: nodesInGroup,
                isNodeGroup: true,
                groupName: undefined,
                ...eventHandlers,
            } satisfies YarnNodeData,
            position: averagePosition,
            width: NodeSize.width,
            type: "yarnNode",
            height: NodeSize.height,
            selected: selectedNodes.includes(nodeGroupName),
        });
    }

    return [...contentNodes.filter((n) => n !== undefined), ...nodeGroupsNodes];
}
