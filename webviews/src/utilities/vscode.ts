import type { WebviewApi } from "vscode-webview";
import type { ZodType } from "zod";
import { z } from "zod";

import type { DocumentState } from "@/extension/editor";
import type { NodeHeader, NodeInfo, NodeJump } from "@/extension/nodes";
import type { WebviewMessage } from "@/extension/panels/YarnSpinnerGraphView";
import type { PreviewWebViewMessage } from "@/extension/panels/YarnSpinnerPreviewPanel";

const NodeHeaderSchema = z.object({
    key: z.string(),
    value: z.string(),
}) satisfies ZodType<NodeHeader>;

const NodeJumpSchema = z.object({
    destinationFileUri: z.string(),
    type: z.enum(["Jump", "Detour"]),
    destinationTitle: z.string(),
}) satisfies ZodType<NodeJump>;

const NodeInfoSchema = z.object({
    uniqueTitle: z.string().nullish(),
    sourceTitle: z.string().nullish(),
    subtitle: z.string().nullish(),
    nodeGroup: z.string().nullish(),
    bodyStartLine: z.number().default(0),
    headerStartLine: z.number().default(0),
    headers: z.array(NodeHeaderSchema).default([]),
    jumps: z.array(NodeJumpSchema).default([]),
    previewText: z.string().default(""),
    containsExternalJumps: z.boolean().default(false),
    nodeGroupComplexity: z.number().default(0),
}) satisfies ZodType<NodeInfo>;

const DocumentStateSchema = z.object({
    state: z.enum([
        "Unknown",
        "NotFound",
        "InvalidUri",
        "ContainsErrors",
        "Valid",
    ]),
    nodes: z.array(NodeInfoSchema).optional(),
    uri: z.string().optional(),
}) satisfies z.ZodType<DocumentState>;

/**
 * A utility wrapper around the acquireVsCodeApi() function, which enables
 * message passing and state management between the webview and extension
 * contexts.
 *
 * This utility also enables webview code to be run in a web browser-based
 * dev server by using native web browser features that mock the functionality
 * enabled by acquireVsCodeApi.
 */
class VSCodeAPIWrapper {
    private readonly vsCodeApi: WebviewApi<unknown> | undefined;

    constructor() {
        // Check if the acquireVsCodeApi function exists in the current development
        // context (i.e. VS Code development window or web browser)
        if (typeof acquireVsCodeApi === "function") {
            this.vsCodeApi = acquireVsCodeApi();
        }
    }

    /**
     * Post a message (i.e. send arbitrary data) to the owner of the webview.
     *
     * @remarks When running webview code inside a web browser, postMessage will instead
     * log the given message to the console.
     *
     * @param message Abitrary data (must be JSON serializable) to send to the extension context.
     */
    public postMessage(message: WebviewMessage | PreviewWebViewMessage) {
        if (this.vsCodeApi) {
            this.vsCodeApi.postMessage(message);
        } else {
            console.log(message);
        }
    }

    /**
     * Get the persistent state stored for this webview.
     *
     * @remarks When running webview source code inside a web browser, getState will retrieve state
     * from local storage (https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
     *
     * @return The current state or `undefined` if no state has been set.
     */
    public getGraphViewState(): DocumentState | undefined {
        let loadedContent: unknown;

        if (this.vsCodeApi) {
            loadedContent = this.vsCodeApi.getState();
        } else {
            loadedContent = localStorage.getItem("vscodeState");
        }

        const state = DocumentStateSchema.safeParse(loadedContent);

        if (state.success) {
            return state.data;
        } else {
            return undefined;
        }
    }

    public getState(): unknown {
        return this.vsCodeApi?.getState();
    }
    public setState(data: unknown) {
        this.vsCodeApi?.setState(data);
    }

    /**
     * Set the persistent state stored for this webview.
     *
     * @remarks When running webview source code inside a web browser, setState will set the given
     * state using local storage (https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
     *
     * @param newState New persisted state. This must be a JSON serializable object. Can be retrieved
     * using {@link getState}.
     *
     * @return The new state.
     */
    public setGraphViewState(newState: DocumentState): DocumentState {
        if (this.vsCodeApi) {
            return this.vsCodeApi.setState(newState);
        } else {
            localStorage.setItem("vscodeState", JSON.stringify(newState));
            return newState;
        }
    }
}

// Exports class singleton to prevent multiple invocations of acquireVsCodeApi.
export const vscode = new VSCodeAPIWrapper();
