import type { XYPosition } from "@xyflow/react";
import { GroupPadding as ClusterPadding, NodeSize } from "./constants";
import type { NodeInfo } from "../../../src/nodes";

export function getClusterForNode(node: NodeInfo) {
    // Look for a 'cluster' header first
    const clusterHeader = node.headers?.find((h) => h.key === "cluster");
    if (clusterHeader) {
        return clusterHeader.value;
    }

    // If we don't have one, look for the older 'group' header
    const groupHeader = node.headers?.find((h) => h.key === "group");

    if (groupHeader) {
        return groupHeader.value;
    }
    return null;
}

export function getClusterRect(
    nodes: { position: { x: number; y: number } }[],
): {
    position: XYPosition;
    size: {
        width: number;
        height: number;
    };
} {
    const min = nodes.reduce(
        (prev, curr) => ({
            x: Math.min(prev.x, curr.position.x),
            y: Math.min(prev.y, curr.position.y),
        }),
        { x: Infinity, y: Infinity },
    );
    const max = nodes.reduce(
        (prev, curr) => ({
            x: Math.max(prev.x, curr.position.x),
            y: Math.max(prev.y, curr.position.y),
        }),
        { x: -Infinity, y: -Infinity },
    );

    const clusterPosition = {
        x: min.x - ClusterPadding.left,
        y: min.y - ClusterPadding.top,
    };
    const groupSize = {
        width:
            max.x -
            min.x +
            NodeSize.width +
            ClusterPadding.left +
            ClusterPadding.right,
        height:
            max.y -
            min.y +
            NodeSize.height +
            ClusterPadding.top +
            ClusterPadding.bottom,
    };

    return { position: clusterPosition, size: groupSize };
}
