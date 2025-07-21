import { Edge as GraphEdge, MarkerType } from "@xyflow/react";
import type { NodeInfo } from "../../../src/nodes";

export function getEdges(nodes: NodeInfo[]): GraphEdge[] {
    const allEdges = nodes
        .flatMap<GraphEdge | null>((n) => {
            if (n.sourceTitle === undefined || n.uniqueTitle === undefined) {
                return null;
            }

            return n.jumps.map<GraphEdge>((j) => ({
                id: `${n.sourceTitle}-${j.destinationTitle}`,
                source: n.uniqueTitle ?? "<unknown>",
                target: j.destinationTitle,
                style: {
                    strokeWidth: 2,
                },

                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20,
                },
            }));
        })
        .filter((n) => n !== null);

    const result: GraphEdge[] = [];
    const seenIDs = new Set<string>();

    for (const edge of allEdges) {
        if (seenIDs.has(edge.id)) {
            continue;
        }
        seenIDs.add(edge.id);
        result.push(edge);
    }
    return result;
}
