import { XYPosition } from "@xyflow/react";
import { GroupPadding, NodeSize } from "./constants";

export function getGroupRect(nodes: { position: { x: number; y: number } }[]): {
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

    const groupPosition = {
        x: min.x - GroupPadding,
        y: min.y - GroupPadding,
    };
    const groupSize = {
        width: max.x - min.x + NodeSize.width + GroupPadding * 2,
        height: max.y - min.y + NodeSize.height + GroupPadding * 2,
    };

    return { position: groupPosition, size: groupSize };
}
