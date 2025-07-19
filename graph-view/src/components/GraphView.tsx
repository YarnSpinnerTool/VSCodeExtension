import { useCallback, useContext, useEffect, useState } from "react";
import {
    ReactFlow,
    Controls,
    Node as GraphNode,
    Edge as GraphEdge,
    NodeProps,
    Handle,
    Background,
    BackgroundVariant,
    MarkerType,
    ReactFlowProvider,
    OnNodesChange,
    applyNodeChanges,
    OnNodeDrag,
    Position,
    MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GraphViewContext } from "../context";
import type { NodeInfo } from "../../../src/nodes";

const NodeOffset = 10;
const NodeSize = { width: 200, height: 125 };
const GroupPadding = 20;

type YarnNodeData = { nodeInfo?: NodeInfo; groupName?: string };

function YarnNode(props: {} & NodeProps<GraphNode<YarnNodeData>>) {
    return (
        <div
            className="text-[13px] bg-white border-gray-200 p-2"
            style={{ ...NodeSize }}
        >
            {props.data.nodeInfo?.sourceTitle}
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}

function GroupNode(props: {} & NodeProps) {
    return (
        <div
            style={{
                width: props.width,
                height: props.height,
                position: "absolute",
                top: 0,
                left: 0,
            }}
        >
            {props.id}
            <Handle type="target" position={Position.Top} />
        </div>
    );
}

const nodeTypes = {
    yarnNode: YarnNode,
    group: GroupNode,
};

function getEdges(nodes: NodeInfo[]): GraphEdge[] {
    return nodes
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
}

function getContentNodes(nodes: NodeInfo[]): GraphNode<YarnNodeData>[] {
    let nodesWithoutPositions = 0;
    const contentNodes = nodes.map<GraphNode<YarnNodeData>>((n, i) => {
        const positionHeader = n.headers.find(
            (h) => h.key === "position",
        )?.value;
        let position: { x: number; y: number };
        if (!positionHeader) {
            position = {
                x: NodeOffset * nodesWithoutPositions,
                y: NodeOffset * nodesWithoutPositions,
            };
            nodesWithoutPositions += 1;
        } else {
            const [x, y] = positionHeader
                .split(",")
                .map((s) => s.trim())
                .map((s) => parseInt(s))
                .map((s) => (isNaN(s) ? 0 : s));
            position = { x, y };
        }
        return {
            id: n.uniqueTitle ?? "Node-" + i,
            data: { nodeInfo: n },
            position,
            type: "yarnNode",
        };
    });

    return contentNodes;
}

function getGroupNodes(contentNodes: GraphNode<YarnNodeData>[]): GraphNode[] {
    const groupedNodes = Object.entries(
        Object.groupBy(contentNodes, (n) => n.data.nodeInfo?.nodeGroup ?? "{}"),
    );

    const nodeGroups = groupedNodes
        .map<GraphNode | null>(([groupName, nodes], i) => {
            if (groupName === "{}") {
                return null;
            }
            if (!nodes) {
                return null;
            }
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

            return {
                id: groupName,
                data: { groupName },
                position: groupPosition,
                ...groupSize,
                type: "group",
            };
        })
        .filter((n) => n !== null);
    return nodeGroups;
}

export default function GraphView(props: {
    onNodesMoved: (nodes: { id: string; x: number; y: number }[]) => void;
}) {
    const context = useContext(GraphViewContext);

    const [contentNodes, setContentNodes] = useState(
        getContentNodes(context.nodes),
    );
    const [groupNodes, setGroupNodes] = useState(getGroupNodes(contentNodes));
    const [edges, setEdges] = useState(getEdges(context.nodes));

    useEffect(() => {
        setContentNodes(getContentNodes(context.nodes));
        setEdges(getEdges(context.nodes));
    }, [context.nodes]);

    useEffect(() => {
        setGroupNodes(getGroupNodes(contentNodes));
    }, [contentNodes]);

    const onNodesChange: OnNodesChange<GraphNode<YarnNodeData>> = useCallback(
        (changes) => {
            // Apply the changes to our content nodes. This will trigger group
            // nodes to recalculate as well.
            setContentNodes((snapshot) => applyNodeChanges(changes, snapshot));
        },
        [setContentNodes, setGroupNodes],
    );

    const onNodeDragStop: OnNodeDrag<GraphNode<YarnNodeData>> = useCallback(
        (_ev, _node, nodes) => {
            const positions = nodes
                .map((n) => ({
                    id: n.data.nodeInfo?.uniqueTitle ?? "<unknown>",
                    x: n.position.x,
                    y: n.position.y,
                }))
                .filter((n) => n.id !== "<unknown>");

            if (positions.length > 0) {
                props.onNodesMoved(positions);
            }
        },
        [props.onNodesMoved],
    );

    return (
        <>
            <div className="size-full">
                <ReactFlowProvider>
                    <ReactFlow
                        nodes={[...groupNodes, ...contentNodes]}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        minZoom={0.1}
                        edgesFocusable={false}
                        nodesConnectable={false}
                        onNodeDragStop={onNodeDragStop}
                        onNodesChange={onNodesChange}
                        fitView
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background
                            variant={BackgroundVariant.Dots}
                            size={2}
                            gap={40}
                        />
                        <Controls />
                        <MiniMap pannable draggable />
                    </ReactFlow>
                </ReactFlowProvider>
            </div>
        </>
    );
}
