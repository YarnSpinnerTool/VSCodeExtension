import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

import { NodeSize } from "@/utilities/constants";
import { getNodeColour } from "@/utilities/getNodeColour";
import { nodeTopBarClasses } from "@/utilities/nodeColours";

import { ColourPicker } from "./ColourPicker";
import { GraphContentSingleNode } from "./ContentNode";
import type { GraphState, NodeEventHandlers } from "./GraphView";

export function NodeGroupView(
    props: {
        currentNodeGroup: string;
        selectedNodeGroupMember?: string;
        graphContents: GraphState;

        onSelectionChanged: (selection: string | null) => void;
        onClose: () => void;
    } & NodeEventHandlers,
) {
    const {
        currentNodeGroup,
        graphContents,
        selectedNodeGroupMember,
        onSelectionChanged,
    } = props;

    return (
        // Overlay
        <div className="absolute top-0 left-0 z-10 size-full bg-black/50 p-10">
            {/* Contents */}
            <div className="bg-editor-background shadow-widget-shadow relative flex size-full flex-col gap-1 rounded-2xl p-2 shadow-2xl">
                {/* Top Bar */}
                <div className="flex w-full justify-between">
                    <div className="font-bold">{currentNodeGroup}</div>
                    <div onClick={props.onClose} className="cursor-pointer">
                        Close
                    </div>
                </div>
                <div className="grow overflow-auto">
                    <div className="flex flex-wrap justify-around gap-4 p-4 align-top">
                        {graphContents.nodeData
                            .filter((n) => n.nodeGroup === currentNodeGroup)
                            .map((n, i) => {
                                const color = getNodeColour(n);
                                return (
                                    <div className="relative mt-8 cursor-default">
                                        <GraphContentSingleNode
                                            key={i}
                                            colour={color}
                                            nodeInfo={n}
                                            showTitle={false}
                                            height={NodeSize.height}
                                            width={NodeSize.width}
                                            selected={
                                                selectedNodeGroupMember ==
                                                n.uniqueTitle
                                            }
                                            onClick={() =>
                                                n.uniqueTitle &&
                                                onSelectionChanged(
                                                    n.uniqueTitle,
                                                )
                                            }
                                        >
                                            <div
                                                title="Complexity score"
                                                className="bg-editor-background shadow-widget-shadow absolute -top-2 -right-2 flex aspect-square min-w-8 items-center justify-center rounded-full p-1 font-bold shadow-sm"
                                            >
                                                {n.nodeGroupComplexity}
                                            </div>
                                            {selectedNodeGroupMember ==
                                                n.uniqueTitle && (
                                                <>
                                                    {/* Top toolbar */}
                                                    <div className="absolute -top-8 flex w-full justify-center">
                                                        <ColourPicker
                                                            nodeColour={color}
                                                            availableClasses={
                                                                nodeTopBarClasses
                                                            }
                                                            onColourSelected={(
                                                                c,
                                                            ) =>
                                                                n.uniqueTitle &&
                                                                props.onNodeHeadersUpdated &&
                                                                props.onNodeHeadersUpdated(
                                                                    n.uniqueTitle,
                                                                    {
                                                                        color: c,
                                                                    },
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    {/* Bottom toolbar */}
                                                    <div className="absolute -bottom-8 flex w-full justify-center gap-1">
                                                        <VSCodeButton
                                                            onClick={() =>
                                                                n.uniqueTitle &&
                                                                props.onNodeOpened &&
                                                                props.onNodeOpened(
                                                                    n.uniqueTitle,
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </VSCodeButton>
                                                        <VSCodeButton
                                                            onClick={() =>
                                                                n.uniqueTitle &&
                                                                props.onNodeDeleted &&
                                                                props.onNodeDeleted(
                                                                    n.uniqueTitle,
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </VSCodeButton>
                                                    </div>
                                                </>
                                            )}
                                        </GraphContentSingleNode>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>
        </div>
    );
}
