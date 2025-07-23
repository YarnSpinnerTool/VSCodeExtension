import { vscode } from "./utilities/vscode";
import "./App.css";
import GraphView from "./components/GraphView";
import type { WebViewEvent } from "../../src/editor";
import { useCallback, useEffect, useState } from "react";
import { GraphViewContext, GraphViewState } from "./context";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

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

    const addNode = useCallback(() => {
        assertDocumentURIValid(documentUri);

        vscode.postMessage({
            type: "add",
            documentUri,
            position: { x: 0, y: 0 },
            headers: {},
        });
    }, [documentUri]);

    const addStickyNote = useCallback(() => {
        assertDocumentURIValid(documentUri);
        vscode.postMessage({
            type: "add",
            documentUri,
            position: { x: 0, y: 0 },
            headers: { style: "note" },
        });
    }, [documentUri]);

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
            {/* <div className="absolute top-2 left-2">
                {state.documentUri ?? "No document"}
            </div> */}
            <div className="absolute right-2 top-2 z-10 flex flex-col gap-1">
                <VSCodeButton onClick={addNode}>Add Node</VSCodeButton>
                <VSCodeButton onClick={addStickyNote}>
                    Add Sticky Note
                </VSCodeButton>
            </div>
            <GraphView
                onNodesMoved={onNodesMoved}
                onNodeOpened={onNodeOpened}
                onNodeDeleted={onNodeDeleted}
                onNodeHeadersUpdated={onNodeHeadersUpdated}
            />
        </GraphViewContext.Provider>
    );
}

export default App;
