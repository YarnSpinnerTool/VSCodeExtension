import { Node as GraphNode } from "@xyflow/react";
import { getClusterForNode, getClusterRect } from "./getClusterRect";
import { NodeInfo } from "../../../src/nodes";
import { getNodePosition } from "./getNodePosition";
import { YarnNodeData } from "./nodeData";

export function getGraphIdForCluster(groupName: string): string {
    return "#Cluster#" + groupName;
}

export function getClusterNodes(
    nodeInfos: NodeInfo[],
): GraphNode<YarnNodeData>[] {
    const clusteredNodes: Record<string, NodeInfo[]> = {};

    for (const contentNode of nodeInfos) {
        const clusterName = getClusterForNode(contentNode);
        if (!clusterName) {
            continue;
        }

        if (!(clusterName in clusteredNodes)) {
            clusteredNodes[clusterName] = [];
        }
        clusteredNodes[clusterName].push(contentNode);
    }

    const nodeClusters = Object.entries(clusteredNodes)
        .map<GraphNode<YarnNodeData> | null>(([clusterName, nodes]) => {
            if (clusterName === "{}") {
                return null;
            }
            if (!nodes) {
                return null;
            }

            const nodePositions = nodes.map((n) => ({
                position: getNodePosition(n) ?? { x: 0, y: 0 },
            }));

            const { position: clusterPosition, size: clusterSize } =
                getClusterRect(nodePositions);

            return {
                id: getGraphIdForCluster(clusterName),
                data: {
                    clusterName: clusterName,
                    nodeInfos: undefined,
                } satisfies YarnNodeData,
                position: clusterPosition,
                ...clusterSize,
                type: "cluster",
            };
        })
        .filter((n) => n !== null);
    return nodeClusters;
}
