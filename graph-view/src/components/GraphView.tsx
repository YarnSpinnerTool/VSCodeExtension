import {
    FunctionComponent,
    useCallback,
    useContext,
    useEffect,
    useReducer,
    useRef,
    useState,
} from "react";
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
    OnNodeDrag,
    Position,
    MiniMap,
    XYPosition,
    NodeToolbar,
    Panel,
    OnSelectionChangeFunc,
    useReactFlow,
    applyNodeChanges,
    NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { NodeInfo } from "../../../src/nodes";
import clsx from "clsx";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

import IconAlignLeft from "../images/align-left.svg?react";
import IconAlignRight from "../images/align-right.svg?react";
import IconAlignTop from "../images/align-top.svg?react";
import IconAlignBottom from "../images/align-bottom.svg?react";
import IconAutoLayoutVertical from "../images/auto-layout-vertical.svg?react";
import IconAutoLayoutHorizontal from "../images/auto-layout-horizontal.svg?react";

import ELK, { ElkExtendedEdge, ElkNode } from "elkjs/lib/elk.bundled";
import { GraphViewContext } from "../context";

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
    onNodeHeadersUpdated?: (
        id: string,
        headers: Record<string, string | null>,
    ) => void;
};

const KnownColours = [
    "red",
    "blue",
    "yellow",
    "orange",
    "green",
    "purple",
    null,
];

type ColourClassMap = Record<string, string[]>;

const nodeBackgroundClasses: ColourClassMap = {
    red: ["bg-node-red-bg"],
    blue: ["bg-node-blue-bg"],
    yellow: ["bg-node-yellow-bg"],
    orange: ["bg-node-orange-bg"],
    green: ["bg-node-green-bg"],
    purple: ["bg-node-purple-bg"],
    __default: ["bg-editor-background"],
};

const nodeTopBarClasses: ColourClassMap = {
    red: ["bg-red"],
    blue: ["bg-blue"],
    yellow: ["bg-yellow"],
    orange: ["bg-orange"],
    green: ["bg-green"],
    purple: ["bg-purple"],
    __default: ["bg-editor-background"],
};

const stickyNoteTopBarClasses: ColourClassMap = {
    red: ["bg-stickynote-red"],
    blue: ["bg-stickynote-blue"],
    yellow: ["bg-stickynote-yellow"],
    orange: ["bg-stickynote-orange"],
    green: ["bg-stickynote-green"],
    purple: ["bg-stickynote-purple"],
    __default: ["bg-editor-background"],
};

const stickyNoteBackgroundClasses: ColourClassMap = {
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

    const nodeColour = props.data.nodeInfo?.headers.find(
        (h) => h.key === "color",
    )?.value;

    const thisNodeBackgroundClasses = isNote
        ? stickyNoteBackgroundClasses
        : nodeBackgroundClasses;

    const thisNodeTopbarClasses = isNote
        ? stickyNoteTopBarClasses
        : nodeTopBarClasses;

    const backgroundClass =
        thisNodeBackgroundClasses[nodeColour ?? "__default"];

    const topBarClass = thisNodeTopbarClasses[nodeColour ?? "__default"];

    return (
        <>
            <NodeToolbar
                position={Position.Top}
                className="flex bg-editor-background shadow-widget-shadow shadow-lg rounded-full p-2 gap-1"
            >
                {KnownColours.map((colour) => {
                    return (
                        <div
                            className={clsx(
                                "rounded-full w-4 h-4 cursor-pointer",
                                {
                                    "border-2 border-selected":
                                        colour === nodeColour,
                                    "border border-editor-foreground/25":
                                        colour !== nodeColour,
                                },
                                thisNodeTopbarClasses[colour ?? "__default"],
                            )}
                            onClick={() =>
                                props.data.onNodeHeadersUpdated &&
                                props.data.onNodeHeadersUpdated(props.id, {
                                    color: colour,
                                })
                            }
                        ></div>
                    );
                })}
            </NodeToolbar>
            <NodeToolbar
                className="flex flex-col bg-editor-background shadow-widget-shadow shadow-lg rounded-md p-2 gap-2"
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
                    {nodeColour !== undefined && (
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
            className="nodrag"
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

function getContentNodes(
    nodes: NodeInfo[],
    eventHandlers: NodeEventHandlers,
    selectedNodes: string[],
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
        const id = n.uniqueTitle ?? "Node-" + i;
        return {
            id,
            data: { nodeInfo: n, ...eventHandlers },
            position,
            width: NodeSize.width,
            selected: selectedNodes.includes(id),
            height: NodeSize.height,
            type: "yarnNode",
        };
    });

    return contentNodes;
}

function getGroupRect(nodes: { position: { x: number; y: number } }[]): {
    position: XYPosition;
    size: {
        width: number;
        height: number;
    };
} {
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

    return { position: groupPosition, size: groupSize };
}

function getGroupNodes(contentNodes: GraphNode<YarnNodeData>[]): GraphNode[] {
    const groupedNodes = Object.entries(
        Object.groupBy(contentNodes, (n) => n.data.nodeInfo?.nodeGroup ?? "{}"),
    );

    const nodeGroups = groupedNodes
        .map<GraphNode | null>(([groupName, nodes]) => {
            if (groupName === "{}") {
                return null;
            }
            if (!nodes) {
                return null;
            }

            const { position: groupPosition, size: groupSize } =
                getGroupRect(nodes);

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

const elk = new ELK();

export function GraphViewInProvider(props: GraphViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const context = useContext(GraphViewContext);

    const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

    const [interactive, setInteractive] = useState(true);

    type GraphUpdate =
        | {
              type: "replace-graph";
              graphContents: NodeInfo[];
          }
        | { type: "nodes-moved"; changes: { id: string; position: XYPosition } }
        | { type: "nodes-updated"; changes: NodeChange[] }
        | { type: "selection-changed"; selection: string[] };

    type GraphState = {
        nodeData: NodeInfo[];
        contentNodes: GraphNode<YarnNodeData>[];
        groupNodes: GraphNode<YarnNodeData>[];
        edges: GraphEdge[];
        selectedNodes: string[];
    };

    const [graphContents, updateGraphContents] = useReducer(
        (prev: GraphState, update: GraphUpdate): GraphState => {
            console.log(update);
            switch (update.type) {
                case "replace-graph": {
                    const contentNodes = getContentNodes(
                        update.graphContents,
                        props,
                        prev.selectedNodes,
                    );
                    const groupNodes = getGroupNodes(contentNodes);
                    const edges = getEdges(update.graphContents);

                    return {
                        nodeData: update.graphContents,
                        contentNodes,
                        groupNodes,
                        edges,
                        selectedNodes: prev.selectedNodes,
                    };
                }
                case "nodes-moved":
                    return prev;
                case "nodes-updated": {
                    return {
                        ...prev,
                        contentNodes: applyNodeChanges(
                            update.changes,
                            prev.contentNodes,
                        ),
                        groupNodes: applyNodeChanges(
                            update.changes,
                            prev.groupNodes,
                        ),
                        // groupNodes: applyNodeChanges(
                        //     update.changes,
                        //     prev.groupNodes,
                        // ),
                    };
                }
                case "selection-changed": {
                    const contentNodes = getContentNodes(
                        prev.nodeData,
                        props,
                        update.selection,
                    );
                    return {
                        ...prev,
                        contentNodes,
                    };
                }
            }
        },
        {
            contentNodes: [],
            edges: [],
            groupNodes: [],
            selectedNodes: [],
            nodeData: [],
        },
    );

    useEffect(() => {
        // When our source data changes, replace the entire graph view contents
        updateGraphContents({
            type: "replace-graph",
            graphContents: context.nodes,
        });
    }, [context.nodes]);

    const flow = useReactFlow<GraphNode<YarnNodeData>>();

    const { onNodesMoved } = props;

    const onNodesChange: OnNodesChange<GraphNode<YarnNodeData>> = useCallback(
        (changes) => {
            updateGraphContents({ type: "nodes-updated", changes });
        },
        [],
    );

    const onNodeDrag: OnNodeDrag<GraphNode<YarnNodeData>> = useCallback(
        (_event, _node, draggedNodes) => {
            const movedNodes = draggedNodes;
            // Find the groups that these nodes are in
            const groups = Object.groupBy(
                movedNodes,
                (n) => n.data.nodeInfo?.nodeGroup ?? "{}",
            );

            const nodes = graphContents.contentNodes;

            for (const [groupName] of Object.entries(groups)) {
                console.log(`Updating group ${groupName}`);

                const nodesInGroup = nodes.filter(
                    (n) => n.data.nodeInfo?.nodeGroup == groupName,
                );
                const updatedGroupDimensions = getGroupRect(nodesInGroup);

                flow.updateNode(groupName, {
                    position: updatedGroupDimensions.position,
                    ...updatedGroupDimensions.size,
                });
            }
        },
        [flow, graphContents.contentNodes],
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
                onNodesMoved(positions);
            }
        },
        [onNodesMoved],
    );

    const onSelectionChange: OnSelectionChangeFunc<GraphNode<YarnNodeData>> =
        useCallback(
            (params) => {
                setSelectedNodes(
                    params.nodes.map(
                        (n) => n.data.nodeInfo?.uniqueTitle ?? "<unknown>",
                    ),
                );
            },
            [setSelectedNodes],
        );

    const multipleNodesSelected = selectedNodes.length > 1;

    function alignSelectedNodes(
        alignment: "top" | "bottom" | "left" | "right",
    ) {
        const selectedNodes = graphContents.contentNodes.filter(
            (n) => n.selected === true,
        );

        const min = selectedNodes.reduce(
            (prev, curr) => ({
                x: Math.min(prev.x, curr.position.x),
                y: Math.min(prev.y, curr.position.y),
            }),
            { x: Infinity, y: Infinity },
        );
        const max = selectedNodes.reduce(
            (prev, curr) => ({
                x: Math.max(prev.x, curr.position.x),
                y: Math.max(prev.y, curr.position.y),
            }),
            { x: -Infinity, y: -Infinity },
        );

        let update: Partial<XYPosition>;

        switch (alignment) {
            case "top":
                update = { y: min.y };
                break;
            case "bottom":
                update = { y: max.y };
                break;
            case "left":
                update = { x: min.x };
                break;
            case "right":
                update = { x: max.x };
                break;
        }

        const nodeMovements: { id: string; x: number; y: number }[] = [];

        for (const node of selectedNodes) {
            const newPosition = { ...node.position, ...update };
            flow.updateNode(node.id, {
                position: newPosition,
            });
            nodeMovements.push({
                id: node.id,
                x: newPosition.x,
                y: newPosition.y,
            });
        }

        props.onNodesMoved(nodeMovements);
    }

    function autoLayoutSelectedNodes(direction: "RIGHT" | "DOWN") {
        // const nodes =
        //     selectedNodes.length > 0
        //         ? contentNodes.filter((n) => selectedNodes.includes(n.id))
        //         : contentNodes;
        const nodes = graphContents.contentNodes;

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

        elk.layout(graph)
            .then((result) => {
                const layoutedNodes = (result.children ?? []).map<GraphNode>(
                    (n) => ({
                        ...n,
                        position: { x: n.x ?? 0, y: n.y ?? 0 },
                        data: {},
                    }),
                );

                const nodeMovements: { id: string; x: number; y: number }[] =
                    [];
                for (const node of layoutedNodes) {
                    flow.updateNode(node.id, { position: node.position });
                    nodeMovements.push({
                        id: node.id,
                        ...node.position,
                    });
                }

                props.onNodesMoved(nodeMovements);
                flow.fitView({
                    nodes,
                    padding: "20px",
                });
            })
            .catch(console.error);
    }

    return (
        <>
            <div className="size-full" ref={containerRef}>
                <ReactFlow
                    nodes={[
                        ...graphContents.groupNodes,
                        ...graphContents.contentNodes,
                    ]}
                    edges={graphContents.edges}
                    nodeTypes={nodeTypes}
                    minZoom={0.1}
                    edgesFocusable={false}
                    nodesConnectable={false}
                    onNodeDrag={onNodeDrag}
                    onNodeDragStop={onNodeDragStop}
                    selectNodesOnDrag={true}
                    selectionKeyCode={"Shift"}
                    onNodesChange={onNodesChange}
                    onSelectionChange={onSelectionChange}
                    fitView
                    proOptions={{ hideAttribution: true }}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        size={2}
                        gap={40}
                    />
                    <Controls onInteractiveChange={setInteractive} />
                    <MiniMap pannable draggable />
                    <Panel position="bottom-center" className="flex gap-2">
                        <div className="flex gap-2 p-1 bg-editor-background shadow-md shadow-widget-shadow rounded-sm">
                            <IconButton
                                icon={IconAlignLeft}
                                title="Align Selected to Left"
                                enabled={interactive && multipleNodesSelected}
                                onClick={() => alignSelectedNodes("left")}
                            />
                            <IconButton
                                icon={IconAlignRight}
                                title="Align Selected to Right"
                                enabled={interactive && multipleNodesSelected}
                                onClick={() => alignSelectedNodes("right")}
                            />
                            <IconButton
                                icon={IconAlignTop}
                                title="Align Selected to Top"
                                enabled={interactive && multipleNodesSelected}
                                onClick={() => alignSelectedNodes("top")}
                            />
                            <IconButton
                                icon={IconAlignBottom}
                                title="Align Selected to Bottom"
                                enabled={interactive && multipleNodesSelected}
                                onClick={() => alignSelectedNodes("bottom")}
                            />
                        </div>
                        <div className="flex gap-2 p-1 bg-editor-background shadow-md shadow-widget-shadow rounded-sm">
                            <IconButton
                                icon={IconAutoLayoutVertical}
                                title="Auto Layout Vertically"
                                enabled={interactive}
                                onClick={() => autoLayoutSelectedNodes("DOWN")}
                            />
                            <IconButton
                                icon={IconAutoLayoutHorizontal}
                                title="Auto Layout Horizontally"
                                enabled={interactive}
                                onClick={() => autoLayoutSelectedNodes("RIGHT")}
                            />
                        </div>
                    </Panel>
                </ReactFlow>
            </div>
        </>
    );
}

function IconButton(props: {
    icon: FunctionComponent;
    enabled?: boolean;
    onClick?: React.MouseEventHandler;
    title?: string;
}) {
    return (
        <div
            onClick={props.onClick}
            title={props.title}
            className={clsx("h-[20px] flex", {
                "fill-editor-foreground/75 hover:fill-editor-foreground cursor-pointer":
                    props.enabled === true || props.enabled === undefined,
                "fill-editor-foreground/25 cursor-auto":
                    props.enabled === false,
            })}
        >
            <props.icon />
        </div>
    );
}

export default function GraphView(props: GraphViewProps) {
    return (
        <ReactFlowProvider>
            <GraphViewInProvider {...props} />
        </ReactFlowProvider>
    );
}
