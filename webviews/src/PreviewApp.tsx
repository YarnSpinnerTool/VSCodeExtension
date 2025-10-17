import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";

import type { PreviewExtensionMessage } from "@/extension/panels/YarnSpinnerPreviewPanel";

import { ErrorPresenter } from "@/components/ErrorPresenter";
import { StoryPreview } from "@/components/preview/StoryPreview";
import { useYarn } from "@/components/preview/useYarn";

import { vscode } from "@/utilities/vscode";

import "@/App.css";

export default function App() {
    const state = useYarn();

    useEffect(() => {
        const messageHandler = (event: MessageEvent<unknown>): void => {
            const message = event.data as PreviewExtensionMessage;

            switch (message.type) {
                case "program-updated":
                    state.startOrResumeProgram(message.data);
                    break;

                case "program-update-failed":
                    state.setErrors(message.errors);
                    break;
            }
        };

        // Register to receive messages from the extension
        window.addEventListener("message", messageHandler);

        // Let the extension know we're ready to receive the program
        vscode.postMessage({
            type: "ready",
        });

        return () => {
            // Clean up when we unmount
            window.removeEventListener("message", messageHandler);
        };
    }, [state]);

    return (
        <ErrorBoundary fallbackRender={ErrorPresenter}>
            <StoryPreview
                onRequestUpdate={() => {
                    vscode.postMessage({ type: "request-updated-program" });
                }}
                isLoading={state.compiledProgram == null}
                history={state.history}
                nextAction={state.currentAction}
                errors={state.compiledProgramErrors}
                stringTable={state.compiledProgram?.stringTable ?? null}
                settings={state.previewSettings}
                onRestart={() =>
                    state.compiledProgram &&
                    state.startOrResumeProgram(state.compiledProgram)
                }
                onUpdateSettings={state.updateSettings}
            />
        </ErrorBoundary>
    );
}
