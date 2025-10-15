import { vscode } from "./utilities/vscode";
import "./App.css";
import type { DocumentState, WebViewEvent } from "@/extension/editor";
import { useEffect, useState } from "react";
import type { FallbackProps } from "react-error-boundary";
import { ErrorBoundary } from "react-error-boundary";

// Attempt to restore state when we start up.
const restoredState = vscode.getState();

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

    if (!viewState.uri) {
        return;
    }

    return (
        <ErrorBoundary fallbackRender={ErrorPresenter}>
            <div>Contents</div>
        </ErrorBoundary>
    );
}

function ErrorPresenter({ error, resetErrorBoundary }: FallbackProps) {
    console.log("Error render");
    // Call resetErrorBoundary() to reset the error boundary and retry the render.

    return (
        <div role="alert">
            <p>Something went wrong:</p>
            <pre style={{ color: "red" }}>{(error as Error).message}</pre>
            <pre style={{ color: "red" }}>{(error as Error).stack}</pre>
            <p>
                <button onClick={resetErrorBoundary}>Retry</button>
            </p>
        </div>
    );
}
