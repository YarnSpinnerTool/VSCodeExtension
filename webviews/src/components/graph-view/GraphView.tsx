import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import type {
    Node as GraphNode,
    NodePositionChange,
    OnNodeDrag,
    XYPosition,
} from "@xyflow/react";
import {
    Background,
    BackgroundVariant,
    MiniMap,
    Panel,
    ReactFlow,
    ReactFlowProvider,
    SelectionMode,
    ViewportPortal,
    useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import clsx from "clsx";
import { useMemo, useRef, useState } from "react";

import { autoLayoutNodes } from "@/utilities/autoLayout";
import { NodeSize } from "@/utilities/constants";
import { getBoundingBox, getClusterForNode } from "@/utilities/getClusterRect";
import type { YarnNodeData } from "@/utilities/nodeData";

import IconAlignBottom from "@/images/align-bottom.svg?react";
import IconAlignLeft from "@/images/align-left.svg?react";
import IconAlignRight from "@/images/align-right.svg?react";
import IconAlignTop from "@/images/align-top.svg?react";
import IconAutoLayoutHorizontal from "@/images/auto-layout-horizontal.svg?react";
import IconAutoLayoutVertical from "@/images/auto-layout-vertical.svg?react";
import IconYarnSpinnerLogo from "@/images/yarnspinner-logo.svg?react";

import { ButtonGroup } from "./ButtonGroup";
import { ContentNode } from "./ContentNode";
import { FlowControls } from "./FlowControls";
import { IconButton } from "./IconButton";
import { NodeGroupView } from "./NodeGroupView";
import { useGraphViewState } from "./useGraphViewState";

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
};

export function GraphViewInProvider() {
    const containerRef = useRef<HTMLDivElement>(null);

    const [interactive, setInteractive] = useState(true);

    const flow = useReactFlow<GraphNode<YarnNodeData>>();

    const {
        nodes,
        edges,
        currentNodeGroup,
        viewport,

        setCurrentNodeGroup,

        applyNodeChanges,
        addNode,
        addStickyNote,
        updatePositions,
        setViewport,
    } = useGraphViewState();

    const multipleNodesSelected = nodes.filter((n) => n.selected).length > 1;

    function alignSelectedNodes(
        alignment: "top" | "bottom" | "left" | "right",
    ) {
        const selectedGraphNodes = nodes.filter((n) => n.selected === true);

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

        const changes = selectedGraphNodes.map<NodePositionChange>((n) => ({
            type: "position",
            id: n.id,
            position: { ...n.position, ...update },
        }));
        applyNodeChanges(changes);
        updatePositions(
            changes.map((i) => [i.id, i.position ?? { x: 0, y: 0 }]),
        );
    }

    const autolayout = async (direction: "RIGHT" | "DOWN") => {
        const layoutedNodes = await autoLayoutNodes(
            {
                // TODO: Figure out how to auto-layout nodes in a node group
                nodes: nodes.filter(
                    (n) => n.data.nodeInfos.some((i) => i.nodeGroup) == false,
                ),
                edges: edges,
            },
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

        applyNodeChanges(
            nodeMovements.map<NodePositionChange>((m) => ({
                type: "position",
                id: m.id,
                position: { x: m.x, y: m.y },
            })),
        );

        updatePositions(nodeMovements.map((m) => [m.id, { x: m.x, y: m.y }]));

        void flow.fitView({
            nodes: layoutedNodes,
            padding: "20px",
        });
    };
    const onNodeDragStop: OnNodeDrag<GraphNode<YarnNodeData>> = (
        evt,
        node,
        nodes,
    ) => {
        updatePositions(nodes.map((n) => [n.id, n.position]));
    };

    const groups = useMemo(() => {
        const groups = new Map<string, GraphNode<YarnNodeData>[]>();
        for (const node of nodes) {
            for (const nodeInfo of node.data.nodeInfos ?? []) {
                const cluster = getClusterForNode(nodeInfo);

                if (!cluster) {
                    continue;
                }
                let mapGroup = groups.get(cluster);
                if (!mapGroup) {
                    mapGroup = [];
                    groups.set(cluster, mapGroup);
                }
                mapGroup.push(node);
            }
        }

        return groups;
    }, [nodes]);

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
            <div className="flex size-full flex-col" ref={containerRef}>
                <div className="bg-panel-background border-b-panel-border shadow-widget-shadow flex items-stretch gap-1 border-b p-1 shadow-sm">
                    <IconYarnSpinnerLogo className="fill-editor-foreground size-8 shrink-0" />
                    <div className="shrink grow text-lg font-bold text-ellipsis whitespace-nowrap">
                        Yarn Spinner
                    </div>

                    <VSCodeButton
                        onClick={() =>
                            // Insert a new node in the center of the view
                            addNode(
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
                            addStickyNote(
                                getViewCenterInFlow({
                                    x: -NodeSize.width / 2,
                                    y: -NodeSize.height / 2,
                                }),
                            )
                        }
                    >
                        Add Sticky Note
                    </VSCodeButton>
                </div>
                {currentNodeGroup && (
                    <NodeGroupView
                        currentNodeGroup={currentNodeGroup}
                        onClose={() => setCurrentNodeGroup(null)}
                    />
                )}
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    minZoom={MinZoom}
                    maxZoom={MaxZoom}
                    edgesFocusable={false}
                    nodesConnectable={false}
                    onNodeDragStop={onNodeDragStop}
                    selectNodesOnDrag={true}
                    selectionKeyCode={"Shift"}
                    multiSelectionKeyCode={"Shift"}
                    selectionMode={SelectionMode.Partial}
                    nodesDraggable={interactive}
                    onNodesChange={applyNodeChanges}
                    viewport={viewport}
                    onViewportChange={setViewport}
                    fitView
                    proOptions={{ hideAttribution: true }}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        size={3}
                        bgColor="var(--color-graph-bg)"
                        color="var(--color-graph-bg-pattern)"
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
                        style={{ width: 100, height: 100 }}
                        bgColor="var(--color-minimap-background)"
                        maskColor="var(--color-minimap-mask)"
                        className="bg-editor-background outline-editor-foreground/50 rounded-sm border border-none outline-1"
                    />
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
                    <ViewportPortal>
                        {[...groups.entries()].map(
                            ([groupID, memberNodes], i) => (
                                <GroupView
                                    key={i}
                                    groupID={groupID}
                                    memberNodes={memberNodes}
                                />
                            ),
                        )}
                    </ViewportPortal>
                </ReactFlow>
            </div>
        </>
    );
}

function GroupView(props: {
    groupID: string;
    memberNodes: GraphNode<YarnNodeData>[];
}) {
    const boundingBox = getBoundingBox(props.memberNodes, undefined, NodeSize);

    type DragState = {
        startPosition: XYPosition;
    } | null;

    const [dragState, setDragState] = useState<DragState>(null);

    const moverRef = useRef<HTMLDivElement>(null);

    const { screenToFlowPosition } = useReactFlow();

    const { updatePositions, applyNodeChanges } = useGraphViewState();

    return (
        <div
            style={{
                width: boundingBox.size.width,
                height: boundingBox.size.height,

                top: boundingBox.position.y,
                left: boundingBox.position.x,

                touchAction: "auto",
                pointerEvents: "all",
                zIndex: -1,
            }}
            className={clsx(
                "quest-group",
                "bg-grey-300/10 dark:border-grey-400 rounded-regular outline-grey-300 absolute cursor-pointer border-2 font-semibold backdrop-blur-[3px]",
            )}
        >
            <div
                className={clsx(
                    "nopan dark:bg-grey-300/10 bg-grey-600/10 p-2",
                    {
                        "cursor-grab": dragState == null,
                        "cursor-grabbing": dragState != null,
                    },
                )}
                onPointerDown={(e) => {
                    if (e.button !== 0) {
                        // Only allow dragging with the primary button
                        return;
                    }
                    moverRef?.current?.setPointerCapture(e.pointerId);
                    const flowPos = screenToFlowPosition({
                        x: e.clientX,
                        y: e.clientY,
                    });
                    setDragState({ startPosition: flowPos });
                }}
                onPointerMove={(e) => {
                    if (dragState == null) {
                        return;
                    }
                    const newPosition = screenToFlowPosition({
                        x: e.clientX,
                        y: e.clientY,
                    });
                    const delta: XYPosition = {
                        x: newPosition.x - dragState.startPosition.x,
                        y: newPosition.y - dragState.startPosition.y,
                    };

                    // console.log(delta);
                    if (delta.x == 0 && delta.y == 0) {
                        return;
                    }

                    const moves = props.memberNodes.map<NodePositionChange>(
                        (n) => ({
                            type: "position",
                            id: n.id,
                            position: {
                                x: n.position.x + delta.x,
                                y: n.position.y + delta.y,
                            },
                            dragging: true,
                        }),
                    );
                    applyNodeChanges(moves);

                    setDragState({ startPosition: newPosition });
                }}
                onPointerUp={(e) => {
                    moverRef?.current?.releasePointerCapture(e.pointerId);
                    if (dragState) {
                        setDragState(null);
                        updatePositions(
                            props.memberNodes.map((n) => [n.id, n.position]),
                        );
                    }
                }}
                ref={moverRef}
            >
                {props.groupID}
            </div>
        </div>
    );
}

export default function GraphView() {
    return (
        <ReactFlowProvider>
            <GraphViewInProvider />
        </ReactFlowProvider>
    );
}
