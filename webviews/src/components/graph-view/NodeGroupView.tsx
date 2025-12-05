import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useCallback, useMemo } from "react";

import { NodeSize } from "@/utilities/constants";
import { getNodeColour } from "@/utilities/getNodeColour";
import { nodeTopBarClasses } from "@/utilities/nodeColours";
import { vscode } from "@/utilities/vscode";

import { ColourPicker } from "./ColourPicker";
import { GraphContentSingleNode } from "./ContentNode";
import { useGraphViewState } from "./useGraphViewState";

export function NodeGroupView(props: {
    currentNodeGroup: string;

    onClose: () => void;
}) {
    const { currentNodeGroup } = props;

    const {
        nodes,
        applyNodeChanges,
        selectedNodeIDs,
        updateNodeHeaders,
        openNodeInTextEditor,
        uri,
    } = useGraphViewState();

    const nodesInGroup = useMemo(
        () =>
            nodes
                .flatMap((n) => n.data.nodeInfos)
                .filter((n) => n.nodeGroup == currentNodeGroup),
        [currentNodeGroup, nodes],
    );

    const selectNode = useCallback(
        (id: string) => {
            applyNodeChanges([{ type: "select", id, selected: true }]);
        },
        [applyNodeChanges],
    );

    const deleteNode = useCallback(
        (id: string) => {
            if (uri) {
                vscode.postMessage({
                    type: "delete",
                    node: id,
                    documentUri: uri,
                });
            }
        },
        [uri],
    );

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
                        {nodesInGroup.map((n, i) => {
                            const color = getNodeColour(n);
                            const isSelected = selectedNodeIDs.some(
                                (id) => n.uniqueTitle == id,
                            );
                            return (
                                <div className="relative mt-8 cursor-default">
                                    <GraphContentSingleNode
                                        key={i}
                                        colour={color}
                                        nodeInfo={n}
                                        showTitle={false}
                                        height={NodeSize.height}
                                        width={NodeSize.width}
                                        selected={isSelected}
                                        onClick={() =>
                                            n.uniqueTitle &&
                                            selectNode(n.uniqueTitle)
                                        }
                                    >
                                        <div
                                            title="Complexity score"
                                            className="bg-editor-background shadow-widget-shadow absolute -top-2 -right-2 flex aspect-square min-w-8 items-center justify-center rounded-full p-1 font-bold shadow-sm"
                                        >
                                            {n.nodeGroupComplexity}
                                        </div>
                                        {isSelected && (
                                            <>
                                                {/* Top toolbar */}
                                                <div className="absolute -top-8 flex w-full justify-center">
                                                    <ColourPicker
                                                        nodeColour={color}
                                                        availableClasses={
                                                            nodeTopBarClasses
                                                        }
                                                        onColourSelected={(c) =>
                                                            n.uniqueTitle &&
                                                            updateNodeHeaders(
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
                                                            openNodeInTextEditor(
                                                                n.uniqueTitle,
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </VSCodeButton>
                                                    <VSCodeButton
                                                        onClick={() =>
                                                            n.uniqueTitle &&
                                                            deleteNode(
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
