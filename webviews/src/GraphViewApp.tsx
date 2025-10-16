import type { XYPosition } from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

import type { DocumentState, WebViewEvent } from "@/extension/editor";

import { ErrorPresenter } from "@/components/ErrorPresenter";

import "./App.css";
import GraphView from "./components/graph-view/GraphView";
import { GraphViewContext } from "./context";
import { vscode } from "./utilities/vscode";

// Attempt to restore state when we start up.
const restoredState = vscode.getGraphViewState();

function assertDocumentURIValid(uri?: string | null): asserts uri is string {
    if (uri === null) {
        throw new Error("Graph view has no document uri!");
    }
}

export default function App() {
    const [viewState, setViewState] = useState<DocumentState>(
        restoredState ?? {
            state: "Unknown",
        },
    );

    useEffect(() => {
        const messageHandler = (event: MessageEvent<unknown>): void => {
            const message = event.data as WebViewEvent;
            if (message.type === "updateState") {
                // Persist this state in case the webview is hidden
                vscode.setState(message.state ?? { state: "Unknown" });
                setViewState(message.state ?? { state: "Unknown" });
            }
        };
        window.addEventListener("message", messageHandler);

        return () => {
            window.removeEventListener("message", messageHandler);
        };
    });

    const documentUri = viewState.uri;

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

    if (!viewState.uri) {
        return;
    }

    return (
        <ErrorBoundary fallbackRender={ErrorPresenter}>
            <GraphViewContext.Provider value={viewState}>
                {viewState.uri?.endsWith(".yarn") ? (
                    <GraphView
                        key={documentUri}
                        onStickyNoteAdded={(position) =>
                            addStickyNote(position)
                        }
                        onNodeAdded={(position) => addNode(position)}
                        onNodesMoved={onNodesMoved}
                        onNodeOpened={onNodeOpened}
                        onNodeDeleted={onNodeDeleted}
                        onNodeHeadersUpdated={onNodeHeadersUpdated}
                    />
                ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center select-none">
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
        </ErrorBoundary>
    );
}
