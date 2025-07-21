import type { Node as GraphNode, Edge as GraphEdge } from "@xyflow/react";
import ELK, { ElkExtendedEdge, ElkNode } from "elkjs/lib/elk.bundled";

const elk = new ELK();

export async function autoLayoutNodes(
    graphContents: { nodes: GraphNode[]; edges: GraphEdge[] },
    direction: "RIGHT" | "DOWN",
): Promise<GraphNode[]> {
    // const nodes =
    //     selectedNodes.length > 0
    //         ? contentNodes.filter((n) => selectedNodes.includes(n.id))
    //         : contentNodes;
    const nodes = graphContents.nodes;

    const graph: ElkNode = {
        id: "root",
        layoutOptions: {
            "elk.algorithm": "layered",
            "elk.direction": direction,
            "elk.layered.spacing.nodeNodeBetweenLayers": "100",
            "elk.spacing.nodeNode": "80",
        },
        children: nodes.map<ElkNode>((n) => ({
            ...n,
        })),
        edges: graphContents.edges
            .filter(
                (e) =>
                    nodes.find((n) => n.id == e.source) &&
                    nodes.find((n) => n.id == e.target),
            )
            .map<ElkExtendedEdge>((e) => {
                return {
                    id: e.id,
                    sources: [e.source],
                    targets: [e.target],
                };
            }),
    };

    const result = await elk.layout(graph);
    const layoutedNodes = (result.children ?? []).map<GraphNode>((n) => ({
        ...n,
        position: { x: n.x ?? 0, y: n.y ?? 0 },
        data: {},
    }));

    return layoutedNodes;
}
