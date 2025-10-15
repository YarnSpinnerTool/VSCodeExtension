import type { XYPosition } from "@xyflow/react";
import type { NodeInfo } from "@/extension/nodes";

export function getNodePosition(n: NodeInfo): XYPosition | null {
    const positionHeader = n.headers?.find((h) => h.key === "position")?.value;

    let position: { x: number; y: number } | null = null;

    if (positionHeader) {
        const [x, y] = positionHeader
            .split(",")
            .map((s) => s.trim())
            .map((s) => parseInt(s))
            .map((s) => (isNaN(s) ? 0 : s));

        position = { x, y };
    }
    return position;
}
