import { useState, useCallback } from "react";
import {
    ReactFlow,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Node,
    OnNodesChange,
    Edge,
    OnEdgesChange,
    OnConnect,
    Controls,
    MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const initialNodes = [
    { id: "n1", position: { x: 0, y: 0 }, data: { label: "Holy Moly" } },
    {
        id: "n2",
        position: { x: 0, y: 100 },
        data: { label: "It's Yarn Spinner" },
    },
    { id: "n3", position: { x: 0, y: 200 }, data: { label: "Wow" } },
];
const initialEdges = [
    { id: "n1-n2", source: "n1", target: "n2" },
    { id: "n2-n3", source: "n2", target: "n3" },
];

export default function GraphView() {
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);

    const onNodesChange: OnNodesChange = useCallback(
        (changes) =>
            setNodes((nodesSnapshot) =>
                applyNodeChanges(changes, nodesSnapshot),
            ),
        [],
    );
    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) =>
            setEdges((edgesSnapshot) =>
                applyEdgeChanges(changes, edgesSnapshot),
            ),
        [],
    );
    const onConnect: OnConnect = useCallback(
        (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
        [],
    );

    return (
        <>
            <div className="size-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    proOptions={{ hideAttribution: true }}
                >
                    <Controls />
                    <MiniMap className="border border-black rounded-md" />
                </ReactFlow>
            </div>
        </>
    );
}
