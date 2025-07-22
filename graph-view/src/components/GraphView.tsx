import {
    applyNodeChanges,
    Background,
    BackgroundVariant,
    Controls,
    Edge as GraphEdge,
    Node as GraphNode,
    MiniMap,
    NodeChange,
    OnNodeDrag,
    OnNodesChange,
    OnSelectionChangeFunc,
    Panel,
    ReactFlow,
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
import { getGroupNodes } from "../utilities/getGroupNodes";
import { getGroupRect } from "../utilities/getGroupRect";
import { YarnNodeData } from "../utilities/nodeData";

export type NodeEventHandlers = {
    onNodeOpened?: (id: string) => void;
    onNodeDeleted?: (id: string) => void;
    onNodeHeadersUpdated?: (
        id: string,
        headers: Record<string, string | null>,
    ) => void;
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
} & NodeEventHandlers;

export type GraphViewStateRef = {
    position: XYPosition;
};

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

    type GraphUpdate =
        | {
              type: "replace-graph";
              graphContents: NodeInfo[];
          }
        | { type: "nodes-moved"; changes: { id: string; position: XYPosition } }
        | { type: "nodes-updated"; changes: NodeChange[] }
        | { type: "selection-changed"; selection: string[] };

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

    const autolayout = async (direction: "RIGHT" | "DOWN") => {
        const layoutedNodes = await autoLayoutNodes(
            { nodes: graphContents.contentNodes, edges: graphContents.edges },
            direction,
        );

        const nodeMovements: { id: string; x: number; y: number }[] = [];
        for (const node of layoutedNodes) {
            flow.updateNode(node.id, { position: node.position });
            nodeMovements.push({
                id: node.id,
                ...node.position,
            });
        }

        props.onNodesMoved(nodeMovements);
        flow.fitView({
            nodes: layoutedNodes,
            padding: "20px",
        });
    };

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
                        <div className="flex gap-2 p-1 bg-editor-background shadow-md shadow-widget-shadow rounded-sm shrink-0">
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
                        <div className="flex gap-2 p-1 bg-editor-background shadow-md shadow-widget-shadow rounded-sm shrink-0">
                            <IconButton
                                icon={IconAutoLayoutVertical}
                                title="Auto Layout Vertically"
                                enabled={interactive}
                                onClick={() => autolayout("DOWN")}
                            />
                            <IconButton
                                icon={IconAutoLayoutHorizontal}
                                title="Auto Layout Horizontally"
                                enabled={interactive}
                                onClick={() => autolayout("RIGHT")}
                            />
                        </div>
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
