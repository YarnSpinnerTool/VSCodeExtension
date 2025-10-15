import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import type {
    Node as GraphNode,
    NodeProps,
    ReactFlowState,
} from "@xyflow/react";
import { Handle, NodeToolbar, Position, useStore } from "@xyflow/react";
import clsx from "clsx";
import type { MouseEventHandler, PropsWithChildren } from "react";

import type { NodeInfo } from "@/extension/nodes";

import { NodeSize } from "@/utilities/constants";
import { getNodeColour } from "@/utilities/getNodeColour";
import {
    nodeTopBarClasses,
    stickyNoteBackgroundClasses,
    stickyNoteTopBarClasses,
} from "@/utilities/nodeColours";
import type { YarnNodeData } from "@/utilities/nodeData";

import IconExternalFileJump from "@/images/external-file-jump.svg?react";

import { ColourPicker } from "./ColourPicker";

function isSingleNode(
    data: YarnNodeData,
): data is { nodeInfos: [NodeInfo]; isNodeGroup: false } {
    return data.isNodeGroup == false && data.nodeInfos?.length === 1;
}

function isNodeGroup(
    data: YarnNodeData,
): data is { nodeInfos: NodeInfo[]; isNodeGroup: true } {
    return (
        data.isNodeGroup == true &&
        !!data.nodeInfos &&
        data.nodeInfos.length >= 1
    );
}

export const NoColour = "__default";

const zoomSelector = (s: ReactFlowState) => s.transform[2] <= 0.5;

export function ContentNode(props: NodeProps<GraphNode<YarnNodeData>>) {
    const isNote =
        isSingleNode(props.data) &&
        props.data.nodeInfos[0].headers?.find(
            (h) => h.key === "style" && h.value === "note",
        ) !== undefined;

    const nodeColour = isSingleNode(props.data)
        ? getNodeColour(props.data.nodeInfos[0])
        : null;

    const thisNodeTopbarClasses = isNote
        ? stickyNoteTopBarClasses
        : nodeTopBarClasses;

    const isZoomedOut = useStore(zoomSelector);

    return (
        <>
            {isSingleNode(props.data) && (
                <>
                    <NodeToolbar position={Position.Top}>
                        <ColourPicker
                            availableClasses={thisNodeTopbarClasses}
                            nodeColour={nodeColour}
                            onColourSelected={(colour) =>
                                props.data.onNodeHeadersUpdated &&
                                props.data.onNodeHeadersUpdated(props.id, {
                                    color: colour,
                                })
                            }
                        />
                    </NodeToolbar>
                    <NodeToolbar
                        className="bg-editor-background shadow-widget-shadow flex flex-col gap-2 rounded-md p-2 shadow-lg"
                        position={Position.Right}
                    >
                        <VSCodeButton
                            onClick={() =>
                                props.data.onNodeDeleted &&
                                props.data.onNodeDeleted(props.id)
                            }
                        >
                            Delete
                        </VSCodeButton>
                    </NodeToolbar>
                </>
            )}
            {isNodeGroup(props.data) && (
                <NodeToolbar
                    className="bg-editor-background shadow-widget-shadow flex flex-col gap-2 rounded-md p-2 shadow-lg"
                    position={Position.Right}
                >
                    <VSCodeButton
                        onClick={() =>
                            props.data.nodeInfos &&
                            props.data.nodeInfos[0].nodeGroup &&
                            props.data.onNodeGroupExpanded &&
                            props.data.onNodeGroupExpanded(
                                props.data.nodeInfos[0].nodeGroup,
                            )
                        }
                    >
                        Expand
                    </VSCodeButton>
                </NodeToolbar>
            )}
            {isNote && (
                <GraphStickyNote
                    data={props.data}
                    colour={nodeColour}
                    width={props.width ?? NodeSize.width}
                    height={props.height ?? NodeSize.height}
                    selected={props.selected}
                    onClick={() =>
                        props.data.onNodeOpened &&
                        props.data.onNodeOpened(props.id)
                    }
                />
            )}
            {!isNote && isSingleNode(props.data) && (
                <GraphContentSingleNode
                    nodeInfo={props.data.nodeInfos[0]}
                    colour={nodeColour}
                    showPreview={!isZoomedOut}
                    width={props.width ?? NodeSize.width}
                    height={props.height ?? NodeSize.height}
                    selected={props.selected}
                    onClick={() =>
                        props.data.onNodeOpened &&
                        props.data.onNodeOpened(props.id)
                    }
                />
            )}
            {!isNote && isNodeGroup(props.data) && (
                <GraphContentNodeGroup
                    nodeInfos={props.data.nodeInfos}
                    colour={nodeColour}
                    onDoubleClick={() =>
                        props.data.nodeInfos &&
                        props.data.onNodeGroupExpanded &&
                        props.data.onNodeGroupExpanded(
                            props.data.nodeInfos[0].nodeGroup ?? "",
                        )
                    }
                    width={props.width ?? NodeSize.width}
                    height={props.height ?? NodeSize.height}
                    selected={props.selected}
                />
            )}
            {props.data.nodeInfos &&
                props.data.nodeInfos.find((n) => n.containsExternalJumps) && (
                    <div
                        title="Contains a jump to a node in another file."
                        className="fill-graph-edge absolute top-[50%] -right-[48px] w-[48px]"
                    >
                        <IconExternalFileJump />
                    </div>
                )}
        </>
    );
}

function GraphStickyNote(props: {
    width: number;
    height: number;
    colour: string | null | undefined;
    selected: boolean;
    data: YarnNodeData;
    onClick?: MouseEventHandler;
}) {
    const backgroundClass =
        stickyNoteBackgroundClasses[props.colour ?? "__default"];
    return (
        <div
            onClick={props.onClick}
            className={clsx(
                "size-full rotate-3 overflow-clip rounded-md border-2 p-2 text-2xl font-bold whitespace-pre-line shadow-lg",
                ...backgroundClass,
                {
                    "border-transparent": !props.selected,
                    "border-note-orange": props.selected,
                },
            )}
        >
            {isSingleNode(props.data) && props.data.nodeInfos[0].previewText}
        </div>
    );
}

export function GraphContentSingleNode(
    props: {
        colour: string | null | undefined;
        selected: boolean;
        showTitle?: boolean;
        showPreview?: boolean;
        width: number;
        height: number;
        nodeInfo: NodeInfo;
        onClick?: MouseEventHandler;
    } & PropsWithChildren,
) {
    const topBarClass = nodeTopBarClasses[props.colour ?? "__default"] ?? [
        "bg-editor-background",
    ];

    const showTitle = props.showTitle ?? true;
    const showPreview = props.showPreview ?? true;

    return (
        <>
            <div
                className={clsx(
                    "border-editor-foreground/50 shadow-widget-shadow bg-single-node-background box-border flex flex-col overflow-clip rounded-sm border-1 text-[13px] shadow-md",
                    {
                        "outline-selected outline-2": props.selected,
                    },
                )}
                style={{ width: props.width, height: props.height }}
                onClick={props.onClick}
            >
                {props.colour !== undefined && (
                    <div
                        className={clsx(
                            {
                                "h-2": showPreview,
                                "h-4": !showPreview,
                            },
                            "shrink-0",
                            ...topBarClass,
                            "w-full",
                        )}
                    ></div>
                )}
                <div className="p-2">
                    {showTitle && (
                        <div className="font-bold">
                            {props.nodeInfo.sourceTitle}
                        </div>
                    )}
                    {showPreview && (
                        <div className="whitespace-pre-line">
                            {props.nodeInfo.previewText}
                        </div>
                    )}
                    {!showPreview && (
                        <div className="flex flex-col justify-stretch gap-2 py-2">
                            <div
                                className="bg-editor-foreground/20 h-4 grow rounded-sm"
                                key={0}
                            />
                            <div
                                className="bg-editor-foreground/20 h-4 grow rounded-sm"
                                key={1}
                            />
                            <div
                                className="bg-editor-foreground/20 h-4 grow rounded-sm"
                                key={2}
                            />
                        </div>
                    )}
                </div>
                {props.children}
            </div>
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </>
    );
}

function GraphContentNodeGroup(props: {
    colour: string | null | undefined;
    selected: boolean;
    width: number;
    height: number;
    nodeInfos: NodeInfo[];
    onDoubleClick: MouseEventHandler<HTMLDivElement>;
}) {
    const nodeGroupName = props.nodeInfos[0].nodeGroup ?? "(unknown)";
    const nodeCount = props.nodeInfos.length;

    return (
        <>
            {/* Stacking context */}
            <div className="relative" onDoubleClick={props.onDoubleClick}>
                {/* Top layer */}
                <div
                    className={clsx(
                        "shadow-widget-shadow bg-node-group-background box-border flex flex-col overflow-clip rounded-sm border-4 text-[13px] shadow-md",
                        {
                            "border-purple/50": props.selected,
                            "border-purple": !props.selected,
                            "outline-selected outline-2": props.selected,
                        },
                    )}
                    style={{ width: props.width, height: props.height }}
                >
                    <div className="flex grow flex-col items-center justify-center gap-2 p-2">
                        <div className="text-2xl font-bold">
                            {nodeGroupName}
                        </div>
                        <div className="text-lg font-bold">
                            {nodeCount} {nodeCount == 1 ? "node" : "nodes"}
                        </div>
                    </div>
                </div>
                {/* Bottom layers */}
                {[1, 2].map((i) => {
                    return (
                        <div
                            key={i}
                            style={{
                                zIndex: -i * 10,
                                width: props.width,
                                height: props.height,
                                top: i * 5,
                                left: i * 5,
                            }}
                            className={clsx(
                                "shadow-widget-shadow bg-node-group-background absolute rounded-sm shadow-md",
                                {
                                    "border-purple/50": props.selected,
                                    "border-purple": !props.selected,
                                },
                            )}
                        ></div>
                    );
                })}
            </div>
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </>
    );
}
