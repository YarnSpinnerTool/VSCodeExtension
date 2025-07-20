import { vscode } from "./utilities/vscode";
import "./App.css";
import GraphView from "./components/GraphView";
import type { WebViewEvent } from "../../src/editor";
import { useCallback, useEffect, useState } from "react";
import { GraphViewContext, GraphViewState } from "./context";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

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
        if (!state.documentUri) {
            console.warn(
                "Node added callback fired but webview has no document uri!",
            );
            return;
        }

        vscode.postMessage({
            type: "add",
            documentUri: state.documentUri,
            position: { x: 0, y: 0 },
            headers: {},
        });
    }, [state.documentUri]);

    const onNodesMoved = useCallback(
        (nodes: { id: string; x: number; y: number }[]): void => {
            if (!state.documentUri) {
                console.warn(
                    "Nodes moved callback fired but webview has no document uri!",
                );
                return;
            }
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
            if (!state.documentUri) {
                console.warn(
                    "Node deleted callback fired but webview has no document uri!",
                );
                return;
            }
            vscode.postMessage({
                type: "delete",
                documentUri: state.documentUri,
                node: id,
            });
        },
        [state.documentUri],
    );

    return (
        <GraphViewContext.Provider value={state}>
            {/* <div className="absolute top-2 left-2">
                {state.documentUri ?? "No document"}
            </div> */}
            <div className="absolute right-2 top-2 z-10">
                <VSCodeButton onClick={addNode}>Add Node</VSCodeButton>
            </div>
            <GraphView
                onNodesMoved={onNodesMoved}
                onNodeDeleted={onNodeDeleted}
            />
        </GraphViewContext.Provider>
    );
}

export default App;
