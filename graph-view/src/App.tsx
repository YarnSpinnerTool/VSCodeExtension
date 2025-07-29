import { vscode } from "./utilities/vscode";
import "./App.css";
import GraphView from "./components/GraphView";
import type { WebViewEvent } from "../../src/editor";
import { useCallback, useEffect, useState } from "react";
import { GraphViewContext, GraphViewState } from "./context";
import { XYPosition } from "@xyflow/react";

// Attempt to restore state when we start up.
const restoredState = vscode.getState();

function assertDocumentURIValid(uri?: string | null): asserts uri is string {
    if (uri === null) {
        throw new Error("Graph view has no document uri!");
    }
}

function App() {
    const [state, setState] = useState<GraphViewState>(
        restoredState ?? {
            nodes: [],
            documentUri: null,
        },
    );

    useEffect(() => {
        const messageHandler = (event: MessageEvent<unknown>): void => {
            const message = event.data as WebViewEvent;
            if (message.type === "update") {
                const newState = {
                    ...state,
                    nodes: message.nodes,
                    documentUri: message.documentUri,
                };
                // Persist this state in case the webview is hidden
                vscode.setState(newState);
                setState(newState);
            }
        };
        window.addEventListener("message", messageHandler);

        return () => {
            window.removeEventListener("message", messageHandler);
        };
    });

    const documentUri = state.documentUri;

    const addNode = useCallback(
        (position: XYPosition) => {
            assertDocumentURIValid(documentUri);

            vscode.postMessage({
                type: "add",
                documentUri,
                position,
                headers: {},
                body: "New node",
            });
        },
        [documentUri],
    );

    const addStickyNote = useCallback(
        (position: XYPosition) => {
            assertDocumentURIValid(documentUri);
            vscode.postMessage({
                type: "add",
                documentUri,
                position,
                headers: { style: "note" },
                body: "NOTE: ",
            });
        },
        [documentUri],
    );

    const onNodesMoved = useCallback(
        (nodes: { id: string; x: number; y: number }[]): void => {
            assertDocumentURIValid(documentUri);
            vscode.postMessage({
                type: "move",
                documentUri,
                positions: Object.fromEntries(
                    nodes.map((n) => [n.id, { x: n.x, y: n.y }]),
                ),
            });
        },
        [documentUri],
    );

    const onNodeDeleted = useCallback(
        (id: string): void => {
            assertDocumentURIValid(documentUri);
            vscode.postMessage({
                type: "delete",
                documentUri,
                node: id,
            });
        },
        [documentUri],
    );

    const onNodeOpened = useCallback(
        (id: string): void => {
            assertDocumentURIValid(documentUri);
            vscode.postMessage({
                type: "open",
                documentUri,
                node: id,
            });
        },
        [documentUri],
    );

    const onNodeHeadersUpdated = useCallback(
        (id: string, headers: Record<string, string | null>): void => {
            assertDocumentURIValid(documentUri);
            vscode.postMessage({
                type: "update-headers",
                documentUri,
                node: id,
                headers: headers,
            });
        },
        [documentUri],
    );

    return (
        <GraphViewContext.Provider value={state}>
            {state.documentUri?.endsWith(".yarn") ? (
                <GraphView
                    key={documentUri}
                    onStickyNoteAdded={(position) => addStickyNote(position)}
                    onNodeAdded={(position) => addNode(position)}
                    onNodesMoved={onNodesMoved}
                    onNodeOpened={onNodeOpened}
                    onNodeDeleted={onNodeDeleted}
                    onNodeHeadersUpdated={onNodeHeadersUpdated}
                />
            ) : (
                <div className="size-full flex flex-col justify-center text-center items-center select-none p-4 gap-2">
                    <div>
                        Select a Yarn Spinner script to show the graph view.
                    </div>
                    <div>
                        See the{" "}
                        <a href="https://docs.yarnspinner.dev/write-yarn-scripts/yarn-spinner-editor">
                            Yarn Spinner docs
                        </a>{" "}
                        for more information.
                    </div>
                </div>
            )}
        </GraphViewContext.Provider>
    );
}

export default App;
