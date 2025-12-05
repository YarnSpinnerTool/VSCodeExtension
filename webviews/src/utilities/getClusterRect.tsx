import type { NodeInfo } from "@/extension/nodes";

import { GroupPadding as ClusterPadding, NodeSize } from "./constants";

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

export function getBoundingBox<
    T extends { position: { x: number; y: number } },
>(
    nodes: T[] | undefined,
    selector?: (node: T) => boolean,
    size = NodeSize,
    padding = ClusterPadding,
): {
    position: { x: number; y: number };
    size: { width: number; height: number };
} {
    if (!nodes || nodes.length == 0) {
        return { position: { x: 0, y: 0 }, size: { width: 0, height: 0 } };
    }
    const corners = nodes.reduce(
        (curr, next) => {
            if (selector && selector(next) == false) {
                return curr;
            } else {
                return {
                    topLeft: {
                        x: Math.min(curr.topLeft.x, next.position.x),
                        y: Math.min(curr.topLeft.y, next.position.y),
                    },
                    bottomRight: {
                        x: Math.max(
                            curr.bottomRight.x,
                            next.position.x + size.width,
                        ),
                        y: Math.max(
                            curr.bottomRight.y,
                            next.position.y + size.height,
                        ),
                    },
                };
            }
        },
        {
            topLeft: { x: Infinity, y: Infinity },
            bottomRight: { x: -Infinity, y: -Infinity },
        },
    );

    return {
        position: {
            x: corners.topLeft.x - padding.left,
            y: corners.topLeft.y - padding.top,
        },
        size: {
            width:
                corners.bottomRight.x -
                corners.topLeft.x +
                padding.left +
                padding.right,
            height:
                corners.bottomRight.y -
                corners.topLeft.y +
                padding.top +
                padding.bottom,
        },
    };
}
