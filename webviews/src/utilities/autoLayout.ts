import type { Edge as GraphEdge, Node as GraphNode } from "@xyflow/react";

import type { YarnNodeData } from "./nodeData";

// export function autoLayoutNodes(
//     graphContents: { nodes: GraphNode<YarnNodeData>[]; edges: GraphEdge[] },
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     _direction: "RIGHT" | "DOWN",
// ): Promise<GraphNode<YarnNodeData>[]> {
//     return Promise.resolve(graphContents.nodes);
// }

export async function autoLayoutNodes(
    graphContents: { nodes: GraphNode<YarnNodeData>[]; edges: GraphEdge[] },
    direction: "RIGHT" | "DOWN",
): Promise<GraphNode<YarnNodeData>[]> {
    const { autoLayoutNodesImpl } = await import("./autoLayoutImpl");
    return autoLayoutNodesImpl(graphContents, direction);
}
