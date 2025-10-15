import type { Node as GraphNode, Edge as GraphEdge } from "@xyflow/react";
import { YarnNodeData } from "./nodeData";

export async function autoLayoutNodes(
    graphContents: { nodes: GraphNode<YarnNodeData>[]; edges: GraphEdge[] },
    direction: "RIGHT" | "DOWN",
): Promise<GraphNode<YarnNodeData>[]> {
    const { autoLayoutNodesImpl } = await import("./autoLayoutImpl");
    return autoLayoutNodesImpl(graphContents, direction);
}
