import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import {
    NodeProps,
    Node as GraphNode,
    NodeToolbar,
    Position,
    Handle,
    useStore,
    ReactFlowState,
} from "@xyflow/react";
import clsx from "clsx";
import {
    stickyNoteBackgroundClasses,
    stickyNoteTopBarClasses,
    nodeTopBarClasses,
    KnownColours,
    ColourClassMap,
} from "../utilities/nodeColours";
import { YarnNodeData } from "../utilities/nodeData";
import { NodeInfo } from "../../../src/nodes";
import { NodeSize } from "../utilities/constants";
import { MouseEventHandler, PropsWithChildren } from "react";
import { getNodeColour } from "./getNodeColour";

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

const NoColour = "__default";

export function ColourPicker(props: {
    nodeColour: string | null;
    availableClasses: ColourClassMap;
    onColourSelected: (colour: string | null) => void;
}) {
    const { nodeColour, availableClasses } = props;
    return (
        <div className="flex bg-editor-background shadow-widget-shadow shadow-lg rounded-full p-2 gap-1">
            {KnownColours.map((colour) => {
                return (
                    <div
                        key={"colour" + (colour ?? "none")}
                        className={clsx(
                            "rounded-full w-4 h-4 cursor-pointer",
                            {
                                "border-2 border-selected":
                                    colour === nodeColour,
                                "border border-editor-foreground/25":
                                    colour !== nodeColour,
                            },
                            availableClasses[colour ?? NoColour],
                        )}
                        onClick={() => props.onColourSelected(colour)}
                    ></div>
                );
            })}
        </div>
    );
}

export function ContentNode(props: NodeProps<GraphNode<YarnNodeData>>) {
    const isNote =
        isSingleNode(props.data) &&
        props.data.nodeInfos[0].headers.find(
            (h) => h.key === "style" && h.value === "note",
        ) !== undefined;

    const nodeColour = isSingleNode(props.data)
        ? getNodeColour(props.data.nodeInfos[0])
        : null;

    const thisNodeTopbarClasses = isNote
        ? stickyNoteTopBarClasses
        : nodeTopBarClasses;

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
                </>
            )}
            {isNodeGroup(props.data) && (
                <NodeToolbar
                    className="flex flex-col bg-editor-background shadow-widget-shadow shadow-lg rounded-md p-2 gap-2"
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
                />
            )}
            {!isNote && isSingleNode(props.data) && (
                <GraphContentSingleNode
                    nodeInfo={props.data.nodeInfos[0]}
                    colour={nodeColour}
                    width={props.width ?? NodeSize.width}
                    height={props.height ?? NodeSize.height}
                    selected={props.selected}
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
        </>
    );
}

function GraphStickyNote(props: {
    width: number;
    height: number;
    colour: string | null | undefined;
    selected: boolean;
    data: YarnNodeData;
}) {
    const backgroundClass =
        stickyNoteBackgroundClasses[props.colour ?? "__default"];
    return (
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
            {isSingleNode(props.data) && props.data.nodeInfos[0].previewText}
        </div>
    );
}

const zoomSelector = (s: ReactFlowState) => s.transform[2] >= 0.5;

export function GraphContentSingleNode(
    props: {
        colour: string | null | undefined;
        selected: boolean;
        showTitle?: boolean;
        width: number;
        height: number;
        nodeInfo: NodeInfo;
        onClick?: MouseEventHandler;
    } & PropsWithChildren,
) {
    const topBarClass = nodeTopBarClasses[props.colour ?? "__default"];

    const showTitle = props.showTitle ?? true;
    const showPreview = useStore(zoomSelector);

    return (
        <>
            <div
                className={clsx(
                    "text-[13px] flex flex-col overflow-clip box-border border-2 rounded-sm shadow-md shadow-widget-shadow bg-editor-background",
                    {
                        "border-transparent": !props.selected,
                        "border-selected": props.selected,
                    },
                )}
                style={{ width: props.width, height: props.height }}
                onClick={props.onClick}
            >
                {props.colour !== undefined && (
                    <div
                        className={clsx(
                            "h-1 shrink-0",
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
    const topBarClass = nodeTopBarClasses[props.colour ?? "__default"];

    const nodeGroupName = props.nodeInfos[0].nodeGroup ?? "(unknown)";
    const nodeCount = props.nodeInfos.length;

    return (
        <>
            {/* Stacking context */}
            <div className="relative" onDoubleClick={props.onDoubleClick}>
                {/* Top layer */}
                <div
                    className={clsx(
                        "text-[13px] flex flex-col overflow-clip box-border border-2 rounded-sm shadow-md shadow-widget-shadow bg-editor-background",
                        {
                            "border-transparent": !props.selected,
                            "border-selected": props.selected,
                        },
                    )}
                    style={{ width: props.width, height: props.height }}
                >
                    {props.colour !== undefined && (
                        <div
                            className={clsx(
                                "h-1 shrink-0",
                                ...topBarClass,
                                "w-full",
                            )}
                        ></div>
                    )}
                    <div className="p-2 flex flex-col justify-center items-center grow gap-2">
                        <div className="font-bold text-2xl">
                            {nodeGroupName}
                        </div>
                        <div className="font-bold text-lg">
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
                                "bg-editor-background shadow-md absolute rounded-sm shadow-widget-shadow",
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
