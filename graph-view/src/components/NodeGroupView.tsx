import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { NodeSize } from "../utilities/constants";
import { nodeTopBarClasses } from "../utilities/nodeColours";
import { GraphContentSingleNode, ColourPicker } from "./ContentNode";
import { getNodeColour } from "../utilities/getNodeColour";
import { GraphState, NodeEventHandlers } from "./GraphView";

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
        <div className="size-full p-10 z-10  absolute top-0 left-0 bg-black/50">
            {/* Contents */}
            <div className="bg-editor-background relative size-full p-2 rounded-2xl shadow-2xl shadow-widget-shadow flex flex-col gap-1">
                {/* Top Bar */}
                <div className="w-full flex justify-between">
                    <div className="font-bold">{currentNodeGroup}</div>
                    <div onClick={props.onClose} className="cursor-pointer">
                        Close
                    </div>
                </div>
                <div className="grow overflow-auto">
                    <div className="flex flex-wrap  justify-around gap-4 align-top p-4">
                        {graphContents.nodeData
                            .filter((n) => n.nodeGroup === currentNodeGroup)
                            .map((n, i) => {
                                const color = getNodeColour(n);
                                return (
                                    <div className="relative cursor-default mt-8">
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
                                                className="bg-editor-background absolute  min-w-8 flex justify-center items-center font-bold -top-2 -right-2 p-1 aspect-square rounded-full shadow-widget-shadow shadow-sm"
                                            >
                                                {n.nodeGroupComplexity}
                                            </div>
                                            {selectedNodeGroupMember ==
                                                n.uniqueTitle && (
                                                <>
                                                    {/* Top toolbar */}
                                                    <div className="absolute -top-8  flex justify-center w-full">
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
                                                    <div className="absolute -bottom-8 flex gap-1 justify-center w-full">
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
