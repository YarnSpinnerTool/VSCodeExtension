import { vscode } from "./utilities/vscode";
import "./App.css";
import GraphView from "./components/GraphView";
import type { WebViewEvent } from "../../src/editor";
import { useEffect, useState } from "react";
import { GraphViewContext, GraphViewState } from "./context";

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

    return (
        <GraphViewContext.Provider value={state}>
            <div className="absolute top-2 left-2">
                {state.documentUri ?? "No document"}
            </div>
            <GraphView
                onNodesMoved={(nodes) => {
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
                }}
            />
        </GraphViewContext.Provider>
    );
}

export default App;
