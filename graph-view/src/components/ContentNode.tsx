import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import {
    NodeProps,
    Node as GraphNode,
    NodeToolbar,
    Position,
    Handle,
} from "@xyflow/react";
import clsx from "clsx";
import { YarnNodeData } from "./GraphView";
import {
    stickyNoteBackgroundClasses,
    nodeBackgroundClasses,
    stickyNoteTopBarClasses,
    nodeTopBarClasses,
    KnownColours,
} from "../utilities/nodeColours";

export function ContentNode(props: {} & NodeProps<GraphNode<YarnNodeData>>) {
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
                        "text-[13px] flex flex-col overflow-clip box-border border-2 rounded-sm shadow-md shadow-widget-shadow",
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
