import { useCallback, useContext, useEffect, useRef, useState } from "react";
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
    XYPosition,
    NodeToolbar,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GraphViewContext } from "../context";
import type { NodeInfo } from "../../../src/nodes";
import clsx from "clsx";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

const NodeOffset = 10;
const NodeSize = { width: 200, height: 125 };
const GroupPadding = 20;

type YarnNodeData = {
    nodeInfo?: NodeInfo;
    groupName?: string;
} & NodeEventHandlers;

type NodeEventHandlers = {
    onNodeOpened?: (id: string) => void;
    onNodeDeleted?: (id: string) => void;
};

const nodeBackgroundClasses: Record<string, string[]> = {
    red: ["bg-node-red-bg"],
    blue: ["bg-node-blue-bg"],
    yellow: ["bg-node-yellow-bg"],
    orange: ["bg-node-orange-bg"],
    green: ["bg-node-green-bg"],
    purple: ["bg-node-purple-bg"],
    __default: ["bg-editor-background"],
};

const topBarClasses: Record<string, string[]> = {
    red: ["bg-red"],
    blue: ["bg-blue"],
    yellow: ["bg-yellow"],
    orange: ["bg-orange"],
    green: ["bg-green"],
    purple: ["bg-purple"],
    __default: ["bg-editor-background"],
};

const stickyNoteBackgroundClasses: Record<string, string[]> = {
    red: ["bg-stickynote-red-bg"],
    blue: ["bg-stickynote-blue-bg"],
    yellow: ["bg-stickynote-yellow-bg"],
    orange: ["bg-stickynote-orange-bg"],
    green: ["bg-stickynote-green-bg"],
    purple: ["bg-stickynote-purple-bg"],
    __default: ["bg-stickynote-yellow-bg"],
};

function YarnNode(props: {} & NodeProps<GraphNode<YarnNodeData>>) {
    const isNote =
        props.data.nodeInfo?.headers.find(
            (h) => h.key === "style" && h.value === "note",
        ) !== undefined;

    const colour = props.data.nodeInfo?.headers.find(
        (h) => h.key === "color",
    )?.value;

    const thisNodeBackgroundClasses = isNote
        ? stickyNoteBackgroundClasses
        : nodeBackgroundClasses;

    const backgroundClass =
        thisNodeBackgroundClasses[colour ?? "__default"] ??
        topBarClasses["__default"];

    const topBarClass =
        topBarClasses[colour ?? "__default"] ?? topBarClasses["__default"];

    return (
        <>
            <NodeToolbar
                className="flex flex-col gap-2"
                position={Position.Right}
            >
                <VSCodeButton
                    onClick={() =>
                        props.data.onNodeOpened &&
                        props.data.onNodeOpened(props.id)
                    }
                >
                    Edit
                </VSCodeButton>
                <VSCodeButton
                    onClick={() =>
                        props.data.onNodeDeleted &&
                        props.data.onNodeDeleted(props.id)
                    }
                >
                    Delete
                </VSCodeButton>
            </NodeToolbar>
            {isNote && (
                <div
                    style={{ width: props.width, height: props.height }}
                    className={clsx(
                        "p-2 border-2 shadow-lg rotate-3 rounded-md",
                        ...backgroundClass,
                        {
                            "border-transparent": !props.selected,
                            "border-note-orange": props.selected,
                        },
                    )}
                >
                    {props.data.nodeInfo?.previewText}
                </div>
            )}
            {!isNote && (
                <div
                    className={clsx(
                        "text-[13px] flex flex-col overflow-clip box-border border-2 rounded-sm",
                        ...backgroundClass,
                        {
                            "border-transparent": !props.selected,
                            "border-selected": props.selected,
                        },
                    )}
                    style={{ width: props.width, height: props.height }}
                >
                    {colour !== undefined && (
                        <div
                            className={clsx(
                                "h-1 shrink-0",
                                ...topBarClass,
                                "w-full",
                            )}
                        ></div>
                    )}
                    <div className="p-2">
                        <div className="font-bold">
                            {props.data.nodeInfo?.sourceTitle}
                        </div>
                        <div className="whitespace-pre-line">
                            {props.data.nodeInfo?.previewText}
                        </div>
                    </div>
                    <Handle type="target" position={Position.Top} />
                    <Handle type="source" position={Position.Bottom} />
                </div>
            )}
        </>
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

function getContentNodes(
    nodes: NodeInfo[],
    eventHandlers: NodeEventHandlers,
): GraphNode<YarnNodeData>[] {
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
            data: { nodeInfo: n, ...eventHandlers },
            position,
            width: NodeSize.width,
            height: NodeSize.height,
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

type GraphViewProps = {
    onNodesMoved: (
        nodes: {
            id: string;
            x: number;
            y: number;
        }[],
    ) => void;
} & NodeEventHandlers;

export type GraphViewStateRef = {
    position: XYPosition;
};

export function GraphViewInProvider(props: GraphViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const context = useContext(GraphViewContext);

    const [contentNodes, setContentNodes] = useState(
        getContentNodes(context.nodes, props),
    );
    const [groupNodes, setGroupNodes] = useState(getGroupNodes(contentNodes));
    const [edges, setEdges] = useState(getEdges(context.nodes));

    useEffect(() => {
        setContentNodes(getContentNodes(context.nodes, props));
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
            <div className="size-full" ref={containerRef}>
                <ReactFlow
                    nodes={[...groupNodes, ...contentNodes]}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    minZoom={0.1}
                    edgesFocusable={false}
                    nodesConnectable={false}
                    onNodeDragStop={onNodeDragStop}
                    selectNodesOnDrag={true}
                    selectionKeyCode={"Shift"}
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
            </div>
        </>
    );
}

export default function GraphView(props: GraphViewProps) {
    return (
        <ReactFlowProvider>
            <GraphViewInProvider {...props} />
        </ReactFlowProvider>
    );
}
