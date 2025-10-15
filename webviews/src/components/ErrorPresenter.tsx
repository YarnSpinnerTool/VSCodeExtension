import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import type { FallbackProps } from "react-error-boundary";

export function ErrorPresenter({ error, resetErrorBoundary }: FallbackProps) {
    console.log("Error render");
    // Call resetErrorBoundary() to reset the error boundary and retry the render.
    return (
        <div role="alert">
            <p>Something went wrong:</p>
            <div style={{ color: "red" }}>{(error as Error).message}</div>
            <pre style={{ overflowX: "auto", color: "red" }}>
                {(error as Error).stack}
            </pre>
            <p>
                <VSCodeButton onClick={resetErrorBoundary}>Retry</VSCodeButton>
            </p>
        </div>
    );
}
