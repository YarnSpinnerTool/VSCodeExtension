import { useCallback, useContext } from "react";
import {
    ReactFlow,
    Controls,
    Node as GraphNode,
    Edge as GraphEdge,
    NodeProps,
    Handle,
    Position,
    Background,
    BackgroundVariant,
    MarkerType,
    ReactFlowProvider,
    OnNodesChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GraphViewContext } from "../context";
import type { NodeInfo } from "../../../src/nodes";
import NodeInspector from "./NodeInspector";

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

const NodeOffset = 10;
const NodeSize = { width: 200, height: 125 };
const GroupPadding = 20;

type YarnNodeData = {
    nodeInfo: NodeInfo;
};

function YarnNode(props: {} & NodeProps<GraphNode<YarnNodeData>>) {
    return (
        <div
            className="text-[13px] bg-white border-gray-200 p-2"
            style={{ ...NodeSize }}
        >
            {props.data.nodeInfo.sourceTitle}
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

export default function GraphView() {
    const context = useContext(GraphViewContext);

    let nodesWithoutPositions = 0;
    const nodes = context.nodes.map<GraphNode<YarnNodeData>>((n, i) => {
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

    const groupedNodes = Object.entries(
        Object.groupBy(nodes, (n) => n.data.nodeInfo.nodeGroup ?? "{}"),
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
                data: {},
                position: groupPosition,
                ...groupSize,
                type: "group",
            };
        })
        .filter((n) => n !== null);

    const edges = getEdges(context.nodes);

    return (
        <>
            <div className="size-full">
                <ReactFlowProvider>
                    <ReactFlow
                        nodes={[...nodeGroups, ...nodes]}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        minZoom={0.1}
                        fitView
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background
                            variant={BackgroundVariant.Dots}
                            size={2}
                            gap={40}
                        />
                        <Controls />
                    </ReactFlow>
                </ReactFlowProvider>
            </div>
        </>
    );
}
