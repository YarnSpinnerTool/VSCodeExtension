import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

import type { DocumentState, WebViewEvent } from "@/extension/editor";

import { ErrorPresenter } from "@/components/ErrorPresenter";
import { StoryPreview } from "@/components/preview/StoryPreview";

import { vscode } from "@/utilities/vscode";

import "@/App.css";

// Attempt to restore state when we start up.
const restoredState = vscode.getState();

export default function App() {
    const [, setViewState] = useState<DocumentState>(
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

    return (
        <ErrorBoundary fallbackRender={ErrorPresenter}>
            <StoryPreview />
        </ErrorBoundary>
    );
}
