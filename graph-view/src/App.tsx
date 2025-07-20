import { vscode } from "./utilities/vscode";
import "./App.css";
import GraphView from "./components/GraphView";
import type { WebViewEvent } from "../../src/editor";
import { useCallback, useEffect, useState } from "react";
import { GraphViewContext, GraphViewState } from "./context";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

function assertStateHasDocument(
    state: GraphViewState,
): asserts state is GraphViewState & { documentUri: string } {
    if (state.documentUri === null) {
        throw new Error("Graph view has no document uri!");
    }
}

function App() {
    const [state, setState] = useState<GraphViewState>({
        nodes: [],
        documentUri: null,
    });

    useEffect(() => {
        const messageHandler = (event: MessageEvent<any>): void => {
            const message = event.data as WebViewEvent;
            if (message.type === "update") {
                setState({
                    ...state,
                    nodes: message.nodes,
                    documentUri: message.documentUri,
                });
            }
        };
        window.addEventListener("message", messageHandler);

        return () => {
            window.removeEventListener("message", messageHandler);
        };
    });

    const addNode = useCallback(() => {
        assertStateHasDocument(state);

        vscode.postMessage({
            type: "add",
            documentUri: state.documentUri,
            position: { x: 0, y: 0 },
            headers: {},
        });
    }, [state.documentUri]);

    const addStickyNote = useCallback(() => {
        assertStateHasDocument(state);
        vscode.postMessage({
            type: "add",
            documentUri: state.documentUri,
            position: { x: 0, y: 0 },
            headers: { style: "note" },
        });
    }, [state.documentUri]);

    const onNodesMoved = useCallback(
        (nodes: { id: string; x: number; y: number }[]): void => {
            assertStateHasDocument(state);
            vscode.postMessage({
                type: "move",
                documentUri: state.documentUri,
                positions: Object.fromEntries(
                    nodes.map((n) => [n.id, { x: n.x, y: n.y }]),
                ),
            });
        },
        [state.documentUri],
    );

    const onNodeDeleted = useCallback(
        (id: string): void => {
            assertStateHasDocument(state);
            vscode.postMessage({
                type: "delete",
                documentUri: state.documentUri,
                node: id,
            });
        },
        [state.documentUri],
    );

    const onNodeOpened = useCallback(
        (id: string): void => {
            assertStateHasDocument(state);
            vscode.postMessage({
                type: "open",
                documentUri: state.documentUri,
                node: id,
            });
        },
        [state.documentUri],
    );

    const onNodeHeadersUpdated = useCallback(
        (id: string, headers: Record<string, string | null>): void => {
            assertStateHasDocument(state);
            vscode.postMessage({
                type: "update-headers",
                documentUri: state.documentUri,
                node: id,
                headers: headers,
            });
        },
        [state.documentUri],
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
