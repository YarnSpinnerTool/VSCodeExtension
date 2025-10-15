import type { Edge as GraphEdge, Node as GraphNode } from "@xyflow/react";

import type { YarnNodeData } from "./nodeData";

export async function autoLayoutNodes(
    graphContents: { nodes: GraphNode<YarnNodeData>[]; edges: GraphEdge[] },
    direction: "RIGHT" | "DOWN",
): Promise<GraphNode<YarnNodeData>[]> {
    const { autoLayoutNodesImpl } = await import("./autoLayoutImpl");
    return autoLayoutNodesImpl(graphContents, direction);
}
