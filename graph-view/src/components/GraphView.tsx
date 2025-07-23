import {
    applyNodeChanges,
    Background,
    BackgroundVariant,
    Edge as GraphEdge,
    Node as GraphNode,
    MiniMap,
    NodeChange,
    OnNodeDrag,
    OnNodesChange,
    OnSelectionChangeFunc,
    Panel,
    ReactFlow,
    ReactFlowInstance,
    ReactFlowProvider,
    useReactFlow,
    XYPosition,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
    useCallback,
    useContext,
    useEffect,
    useReducer,
    useRef,
    useState,
} from "react";

import type { NodeInfo } from "../../../src/nodes";

import IconAlignBottom from "../images/align-bottom.svg?react";
import IconAlignLeft from "../images/align-left.svg?react";
import IconAlignRight from "../images/align-right.svg?react";
import IconAlignTop from "../images/align-top.svg?react";
import IconAutoLayoutHorizontal from "../images/auto-layout-horizontal.svg?react";
import IconAutoLayoutVertical from "../images/auto-layout-vertical.svg?react";

import { GraphViewContext } from "../context";
import { ContentNode } from "./ContentNode";
import { GroupNode } from "./GroupNode";
import { IconButton } from "./IconButton";
import { autoLayoutNodes } from "../utilities/autoLayout";
import { getContentNodes } from "../utilities/getContentNodes";
import { getEdges } from "../utilities/getEdges";
import { getGraphIdForGroup, getGroupNodes } from "../utilities/getGroupNodes";
import { getGroupForNode, getGroupRect } from "../utilities/getGroupRect";
import { YarnNodeData } from "../utilities/nodeData";
import { NodeSize } from "../utilities/constants";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { NodeGroupView } from "./NodeGroupView";
import { ButtonGroup } from "./ButtonGroup";
import { FlowControls } from "./FlowControls";

export type NodeEventHandlers = {
    onNodeOpened?: (id: string) => void;
    onNodeDeleted?: (id: string) => void;
    onNodeHeadersUpdated?: (
        id: string,
        headers: Record<string, string | null>,
    ) => void;
    onNodeGroupExpanded?: (id: string) => void;
};

const nodeTypes = {
    yarnNode: ContentNode,
    group: GroupNode,
};

type GraphViewProps = {
    onNodesMoved: (
        nodes: {
            id: string;
            x: number;
            y: number;
        }[],
    ) => void;
    onNodeAdded: (position: XYPosition) => void;
    onStickyNoteAdded: (position: XYPosition) => void;
} & NodeEventHandlers;

export type GraphState = {
    nodeData: NodeInfo[];
    contentNodes: GraphNode<YarnNodeData>[];
    groupNodes: GraphNode<YarnNodeData>[];
    edges: GraphEdge[];
    selectedNodes: string[];
};

export function GraphViewInProvider(props: GraphViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const context = useContext(GraphViewContext);

    const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

    const [interactive, setInteractive] = useState(true);

    const [currentNodeGroup, setCurrentNodeGroup] = useState<string | null>(
        null,
    );

    type GraphUpdate =
        | {
              type: "replace-graph";
              graphContents: NodeInfo[];
          }
        | { type: "nodes-moved"; changes: { id: string; position: XYPosition } }
        | {
              type: "nodes-updated";
              changes: NodeChange<GraphNode<YarnNodeData>>[];
          }
        | { type: "selection-changed"; selection: string[] };

    const [graphContents, updateGraphContents] = useReducer(
        (prev: GraphState, update: GraphUpdate): GraphState => {
            switch (update.type) {
                case "replace-graph": {
                    const contentNodes = getContentNodes(
                        update.graphContents,
                        { ...props, onNodeGroupExpanded: setCurrentNodeGroup },
                        prev.selectedNodes,
                    );
                    const groupNodes = getGroupNodes(update.graphContents);
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
                        contentNodes: applyNodeChanges<GraphNode<YarnNodeData>>(
                            update.changes,
                            prev.contentNodes,
                        ),
                        groupNodes: applyNodeChanges(
                            update.changes,
                            prev.groupNodes,
                        ),
                    };
                }
                case "selection-changed": {
                    const contentNodes = getContentNodes(
                        prev.nodeData,
                        { ...props, onNodeGroupExpanded: setCurrentNodeGroup },
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
        (_event, _node, draggedGraphNodes) => {
            // Find the groups that these nodes are in

            const groupNames = new Set<string>();

            for (const node of draggedGraphNodes) {
                for (const nodeInfo of node.data.nodeInfos ?? []) {
                    const group = getGroupForNode(nodeInfo);
                    if (group) {
                        groupNames.add(group);
                    }
                }
            }

            const nodes = graphContents.contentNodes;

            for (const [groupName] of groupNames.entries()) {
                // A graph node is in the group if any of its NodeInfos are in the group
                const allGraphNodesInGroup = nodes.filter((n) =>
                    n.data.nodeInfos?.find(
                        (n) => getGroupForNode(n) === groupName,
                    ),
                );

                const updatedGroupDimensions =
                    getGroupRect(allGraphNodesInGroup);

                flow.updateNode(getGraphIdForGroup(groupName), {
                    position: updatedGroupDimensions.position,
                    ...updatedGroupDimensions.size,
                });
            }
        },
        [flow, graphContents.contentNodes],
    );

    const onNodeDragStop: OnNodeDrag<GraphNode<YarnNodeData>> = useCallback(
        (_ev, _node, nodes) => {
            const positions: { id: string; x: number; y: number }[] = [];

            for (const draggedNode of nodes) {
                for (const nodeInfo of draggedNode.data.nodeInfos ?? []) {
                    if (!nodeInfo.uniqueTitle) {
                        continue;
                    }
                    positions.push({
                        id: nodeInfo.uniqueTitle ?? "<unknown>",
                        x: draggedNode.position.x,
                        y: draggedNode.position.y,
                    });
                }
            }

            if (positions.length > 0) {
                onNodesMoved(positions);
            }
        },
        [onNodesMoved],
    );

    const onSelectionChange: OnSelectionChangeFunc<GraphNode<YarnNodeData>> =
        useCallback(
            (params) => {
                setSelectedNodes(params.nodes.map((n) => n.id));
            },
            [setSelectedNodes],
        );

    const multipleNodesSelected = selectedNodes.length > 1;

    function alignSelectedNodes(
        alignment: "top" | "bottom" | "left" | "right",
    ) {
        const selectedGraphNodes = graphContents.contentNodes.filter(
            (n) => n.selected === true,
        );

        const min = selectedGraphNodes.reduce(
            (prev, curr) => ({
                x: Math.min(prev.x, curr.position.x),
                y: Math.min(prev.y, curr.position.y),
            }),
            { x: Infinity, y: Infinity },
        );
        const max = selectedGraphNodes.reduce(
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

        const graphNodeMovements: { id: string; x: number; y: number }[] = [];

        for (const node of selectedGraphNodes) {
            const newPosition = { ...node.position, ...update };
            flow.updateNode(node.id, {
                position: newPosition,
            });

            graphNodeMovements.push({ id: node.id, ...newPosition });

            for (const nodeInfo of node.data.nodeInfos ?? []) {
                if (!nodeInfo.uniqueTitle) {
                    continue;
                }

                nodeMovements.push({
                    id: nodeInfo.uniqueTitle,
                    x: newPosition.x,
                    y: newPosition.y,
                });
            }
        }

        // Update all groups
        updateGroupRects(
            flow,
            graphNodeMovements.map((move) => ({
                id: move.id,
                position: { ...move },
            })),
        );

        props.onNodesMoved(nodeMovements);
    }

    const autolayout = async (direction: "RIGHT" | "DOWN") => {
        const layoutedNodes = await autoLayoutNodes(
            { nodes: graphContents.contentNodes, edges: graphContents.edges },
            direction,
        );

        const nodeMovements: { id: string; x: number; y: number }[] = [];

        for (const node of layoutedNodes) {
            flow.updateNode(node.id, { position: node.position });
            for (const nodeInfo of node.data.nodeInfos ?? []) {
                if (!nodeInfo.uniqueTitle) {
                    continue;
                }
                nodeMovements.push({
                    id: nodeInfo.uniqueTitle,
                    ...node.position,
                });
            }
        }

        // Update all groups
        updateGroupRects(flow, layoutedNodes);

        props.onNodesMoved(nodeMovements);
        void flow.fitView({
            nodes: layoutedNodes,
            padding: "20px",
        });
    };

    function updateGroupRects(
        flow: ReactFlowInstance<GraphNode<YarnNodeData>>,
        graphNodes: { id: string; position: XYPosition }[],
    ) {
        const groups = new Map<string, XYPosition[]>();

        for (const graphNode of graphNodes) {
            const nodeInfos = graphContents.contentNodes.find(
                (n) => n.id === graphNode.id,
            )?.data.nodeInfos;
            if (!nodeInfos) {
                continue;
            }
            for (const nodeInfo of nodeInfos) {
                const groupName = getGroupForNode(nodeInfo);
                if (groupName) {
                    const members = groups.get(groupName) ?? [];
                    if (!groups.has(groupName)) {
                        groups.set(groupName, members);
                    }
                    members.push(graphNode.position);
                }
            }
        }

        for (const [groupName, groupMembers] of groups.entries()) {
            const rect = getGroupRect(
                groupMembers.map((p) => ({ position: p })),
            );
            flow.updateNode(getGraphIdForGroup(groupName), { ...rect });
        }
    }

    const getViewCenterInFlow = (offset?: XYPosition): XYPosition => {
        if (!containerRef.current) {
            return { x: 0, y: 0 };
        }
        const clientRect = containerRef.current.getBoundingClientRect();
        const flowCenter = flow.screenToFlowPosition({
            x: clientRect.x + clientRect.width / 2,
            y: clientRect.y + clientRect.height / 2,
        });

        if (offset) {
            flowCenter.x += offset.x;
            flowCenter.y += offset.y;
        }
        return flowCenter;
    };

    const MaxZoom = 2;
    const MinZoom = 0.1;

    return (
        <>
            <div className="size-full" ref={containerRef}>
                {currentNodeGroup && (
                    <NodeGroupView
                        currentNodeGroup={currentNodeGroup}
                        graphContents={graphContents}
                        onClose={() => setCurrentNodeGroup(null)}
                        selectedNodeGroupMember={selectedNodes[0]}
                        onNodeOpened={props.onNodeOpened}
                        onNodeDeleted={props.onNodeDeleted}
                        onNodeHeadersUpdated={props.onNodeHeadersUpdated}
                        onSelectionChanged={(s) =>
                            setSelectedNodes(s !== null ? [s] : [])
                        }
                    />
                )}
                <ReactFlow
                    nodes={[
                        ...graphContents.groupNodes,
                        ...graphContents.contentNodes,
                    ]}
                    edges={graphContents.edges}
                    nodeTypes={nodeTypes}
                    minZoom={MinZoom}
                    maxZoom={MaxZoom}
                    edgesFocusable={false}
                    nodesConnectable={false}
                    onNodeDrag={onNodeDrag}
                    onNodeDragStop={onNodeDragStop}
                    selectNodesOnDrag={true}
                    selectionKeyCode={"Shift"}
                    nodesDraggable={interactive}
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
                    <Panel position="bottom-left">
                        <ButtonGroup direction="vertical">
                            <FlowControls
                                interactive={interactive}
                                onInteractiveChanged={setInteractive}
                                maxZoom={MaxZoom}
                                minZoom={MinZoom}
                            />
                        </ButtonGroup>
                    </Panel>
                    <MiniMap
                        pannable
                        draggable
                        bgColor="var(--color-minimap-background)"
                        maskColor="var(--color-minimap-mask)"
                        className="bg-editor-background border border-editor-foreground/50 rounded-sm"
                    />
                    <Panel position="top-right" className="flex flex-col gap-1">
                        <VSCodeButton
                            onClick={() =>
                                // Insert a new node in the center of the view
                                props.onNodeAdded(
                                    getViewCenterInFlow({
                                        x: -NodeSize.width / 2,
                                        y: -NodeSize.height / 2,
                                    }),
                                )
                            }
                        >
                            Add Node
                        </VSCodeButton>
                        <VSCodeButton
                            onClick={() =>
                                // Insert a new sticky note in the center of the
                                // view
                                props.onStickyNoteAdded(
                                    getViewCenterInFlow({
                                        x: -NodeSize.width / 2,
                                        y: -NodeSize.height / 2,
                                    }),
                                )
                            }
                        >
                            Add Sticky Note
                        </VSCodeButton>
                    </Panel>
                    <Panel position="bottom-center" className="flex gap-2">
                        <ButtonGroup direction="horizontal">
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
                        </ButtonGroup>
                        <ButtonGroup direction="horizontal">
                            <IconButton
                                icon={IconAutoLayoutVertical}
                                title="Auto Layout Vertically"
                                enabled={interactive}
                                onClick={() => void autolayout("DOWN")}
                            />
                            <IconButton
                                icon={IconAutoLayoutHorizontal}
                                title="Auto Layout Horizontally"
                                enabled={interactive}
                                onClick={() => void autolayout("RIGHT")}
                            />
                        </ButtonGroup>
                    </Panel>
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
