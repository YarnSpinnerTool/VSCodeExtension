import { vscode } from "./utilities/vscode";
import "./App.css";
import GraphView from "./components/GraphView";
import type { WebViewEvent } from "../../src/editor";
import { useEffect, useState } from "react";
import { GraphViewContext, GraphViewState } from "./context";

function App() {
    function handleHowdyClick() {
        vscode.postMessage({
            command: "hello",
            text: "Hey there partner! 🤠",
        });
    }

    const [state, setState] = useState<GraphViewState>({ nodes: [] });

    useEffect(() => {
        const messageHandler = (event: MessageEvent<any>): void => {
            const message = event.data as WebViewEvent;
            if (message.type === "update") {
                setState({ ...state, nodes: message.nodes });
            }
        };
        window.addEventListener("message", messageHandler);

        return () => {
            window.removeEventListener("message", messageHandler);
        };
    });

    return (
        <GraphViewContext.Provider value={state}>
            <GraphView />
        </GraphViewContext.Provider>
    );
}

export default App;
