import type {
    Edge,
    EdgeChange,
    Node as GraphNode,
    NodeChange,
    OnEdgesChange,
    OnNodesChange,
    Viewport,
    XYPosition,
} from "@xyflow/react";
import { applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { NodeInfo } from "@/extension/nodes";

import { NodeSize } from "@/utilities/constants";
import { getContentNodes } from "@/utilities/getContentNodes";
import { getEdges } from "@/utilities/getEdges";
import type { YarnNodeData } from "@/utilities/nodeData";
import { vscode } from "@/utilities/vscode";

function assertDocumentURIValid(
    uri: string | null | undefined,
): asserts uri is string {
    if (!uri) {
        throw new Error("Attempted to modify document but URI was not set");
    }
}

type Store = {
    uri: string | null;
    nodeData: NodeInfo[];

    nodes: GraphNode<YarnNodeData>[];
    edges: Edge[];

    updateState: (state: { uri: string | null; nodeData: NodeInfo[] }) => void;

    applyNodeChanges: (
        changes: NodeChange<GraphNode<YarnNodeData>>[],
        notifyMoves?: boolean,
    ) => void;
    applyEdgeChanges: OnEdgesChange;
    addNode: (position: XYPosition) => void;

    addStickyNote: (position: XYPosition) => void;

    selectedNodeIDs: string[];

    updatePositions: (nodePositions: [string, XYPosition][]) => void;

    openNodeInTextEditor: (id: string | null) => void;

    currentNodeGroup: string | null;
    setCurrentNodeGroup: (id: string | null) => void;

    viewport: Viewport;
    setViewport: (viewport: Viewport) => void;

    updateNodeHeaders: (
        id: string,
        headers: Record<string, string | null>,
    ) => void;
};

export const useGraphViewState = create<Store>()(
    persist(
        (set, get) => {
            return {
                nodes: [],
                edges: [],
                nodeData: [],
                selectedNodeIDs: [],
                uri: null,
                viewport: { x: 0, y: 0, zoom: 1 },

                currentNodeGroup: null,

                updateState: (state: {
                    uri: string | null;
                    nodeData: NodeInfo[];
                }) => {
                    const { selectedNodeIDs } = get();

                    const nodes = getContentNodes(
                        state.nodeData,
                        selectedNodeIDs,
                    );

                    const edges = getEdges(state.nodeData);

                    set({
                        ...state,
                        nodes,
                        edges,
                    });
                },

                updatePositions: (nodePositions: [string, XYPosition][]) => {
                    const { nodes, uri } = get();
                    assertDocumentURIValid(uri);

                    const positions: Record<string, XYPosition> = {};

                    for (const [graphID, position] of nodePositions) {
                        const graphNode = nodes.find((n) => n.id == graphID);
                        if (!graphNode) {
                            continue;
                        }

                        for (const yarnNode of graphNode.data.nodeInfos) {
                            if (yarnNode.uniqueTitle) {
                                positions[yarnNode.uniqueTitle] = position;
                            }
                        }
                    }

                    vscode.postMessage({
                        type: "move",
                        documentUri: uri,
                        positions: positions,
                    });
                },

                applyNodeChanges: ((
                    changes: NodeChange<GraphNode<YarnNodeData>>[],
                ) => {
                    const { nodes, uri } = get();
                    assertDocumentURIValid(uri);
                    const updatedNodes = applyNodeChanges(changes, nodes);
                    set({ nodes: updatedNodes });

                    let anySelectionChanges = false;

                    for (const change of changes) {
                        // Always notify the extension when a node is removed
                        if (change.type == "remove") {
                            vscode.postMessage({
                                type: "delete",
                                documentUri: uri,
                                node: change.id,
                            });

                            // Assume that nodes that are deleted were selected
                            anySelectionChanges = true;
                        }

                        if (change.type == "select") {
                            anySelectionChanges = true;
                        }
                    }

                    if (anySelectionChanges) {
                        const selection = new Set<string>();

                        for (const node of updatedNodes) {
                            if (node.selected) {
                                for (const nodeInfo of node.data.nodeInfos) {
                                    if (nodeInfo.uniqueTitle) {
                                        selection.add(nodeInfo.uniqueTitle);
                                    }
                                }
                            }
                        }
                        set({ selectedNodeIDs: Array.from(selection) });
                    }
                }) satisfies OnNodesChange<GraphNode<YarnNodeData>>,

                applyEdgeChanges: (changes: EdgeChange[]) => {
                    const { edges } = get();
                    set({ edges: applyEdgeChanges(changes, edges) });
                },

                addNode: (position: XYPosition) => {
                    const documentUri = get().uri;
                    assertDocumentURIValid(documentUri);

                    vscode.postMessage({
                        type: "add",
                        documentUri: documentUri,
                        position,
                        headers: {},
                        body: "New node",
                    });

                    set((curr) => ({
                        nodes: [
                            ...curr.nodes,
                            {
                                id: "Temporary-Created-Node",
                                type: "yarnNode",
                                ...NodeSize,
                                position,
                                data: {
                                    isNodeGroup: false,
                                    nodeInfos: [
                                        {
                                            sourceTitle: "Node",
                                            previewText: "New node",
                                        },
                                    ],
                                },
                            } satisfies GraphNode<YarnNodeData>,
                        ],
                    }));
                },

                addStickyNote: (position: XYPosition) => {
                    const documentUri = get().uri;
                    assertDocumentURIValid(documentUri);
                    vscode.postMessage({
                        type: "add",
                        documentUri,
                        position,
                        headers: { style: "note" },
                        body: "NOTE: ",
                    });
                    set((curr) => ({
                        nodes: [
                            ...curr.nodes,
                            {
                                id: "Temporary-Created-Node",
                                type: "yarnNode",
                                ...NodeSize,
                                position,
                                data: {
                                    isNodeGroup: false,
                                    nodeInfos: [
                                        {
                                            headers: [
                                                { key: "style", value: "note" },
                                            ],
                                            previewText: "NOTE: ",
                                        },
                                    ],
                                },
                            } satisfies GraphNode<YarnNodeData>,
                        ],
                    }));
                },

                openNodeInTextEditor: (id: string | null): void => {
                    if (!id) {
                        return;
                    }
                    const documentUri = get().uri;
                    assertDocumentURIValid(documentUri);
                    vscode.postMessage({
                        type: "open",
                        documentUri,
                        node: id,
                    });
                },

                updateNodeHeaders: (
                    id: string,
                    headers: Record<string, string | null>,
                ): void => {
                    const { uri, nodes } = get();
                    assertDocumentURIValid(uri);
                    vscode.postMessage({
                        type: "update-headers",
                        documentUri: uri,
                        node: id,
                        headers: headers,
                    });

                    const graphNode = structuredClone(
                        nodes.find((n) =>
                            n.data.nodeInfos.some((i) => i.uniqueTitle == id),
                        ),
                    );

                    const info = graphNode?.data.nodeInfos.find(
                        (i) => i.uniqueTitle == id,
                    );
                    if (graphNode && info) {
                        const headerObj = Object.fromEntries(
                            info.headers?.map((kv) => [kv.key, kv.value]) ?? [],
                        );

                        for (const [
                            newHeaderKey,
                            newHeaderValue,
                        ] of Object.entries(headers)) {
                            if (newHeaderValue == null) {
                                delete headerObj[newHeaderKey];
                            } else {
                                headerObj[newHeaderKey] = newHeaderValue;
                            }
                        }

                        info.headers = Object.entries(headerObj).map(
                            ([k, v]) => ({ key: k, value: v }),
                        );
                        set({
                            nodes: nodes.map((n) => {
                                if (n.id != id) {
                                    return n;
                                }
                                return graphNode;
                            }),
                        });
                    }
                },

                setCurrentNodeGroup: (group) => {
                    set({
                        currentNodeGroup: group,
                        selectedNodeIDs: group !== null ? [] : undefined,
                    });
                },

                setViewport: (viewport) => {
                    set({ viewport });
                },
            };
        },
        {
            name: "yarn-graph-view-storage",
            storage: {
                getItem() {
                    return {
                        state: vscode.getState() as Store | null | undefined,
                    };
                },
                setItem(name, value) {
                    console.log("Update state", value);
                    vscode.setState(value.state);
                },
                removeItem() {
                    vscode.setState(undefined);
                },
            },
        },
    ),
);
