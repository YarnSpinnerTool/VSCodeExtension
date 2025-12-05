import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";

import type { GraphViewExtensionMessage } from "@/extension/panels/YarnSpinnerGraphView";

import { ErrorPresenter } from "@/components/ErrorPresenter";
import GraphView from "@/components/graph-view/GraphView";
import { useGraphViewState } from "@/components/graph-view/useGraphViewState";

import { vscode } from "@/utilities/vscode";

import "./App.css";

export default function App() {
    const { updateState } = useGraphViewState();

    useEffect(() => {
        const messageHandler = (event: MessageEvent<unknown>): void => {
            const message = event.data as GraphViewExtensionMessage;
            console.log("Message received:", message);
            if (message.type === "updateState") {
                updateState({
                    nodeData: message.nodes ?? [],
                    uri: message.documentUri,
                });
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
    });

    // const documentUri = viewState.uri;

    // const addNode = useCallback(
    //     (position: XYPosition) => {
    //         assertDocumentURIValid(documentUri);

    //         vscode.postMessage({
    //             type: "add",
    //             documentUri,
    //             position,
    //             headers: {},
    //             body: "New node",
    //         });
    //     },
    //     [documentUri],
    // );

    // const addStickyNote = useCallback(
    //     (position: XYPosition) => {
    //         assertDocumentURIValid(documentUri);
    //         vscode.postMessage({
    //             type: "add",
    //             documentUri,
    //             position,
    //             headers: { style: "note" },
    //             body: "NOTE: ",
    //         });
    //     },
    //     [documentUri],
    // );

    // const onNodesMoved = useCallback(
    //     (nodes: { id: string; x: number; y: number }[]): void => {
    //         assertDocumentURIValid(documentUri);
    //         vscode.postMessage({
    //             type: "move",
    //             documentUri,
    //             positions: Object.fromEntries(
    //                 nodes.map((n) => [n.id, { x: n.x, y: n.y }]),
    //             ),
    //         });
    //     },
    //     [documentUri],
    // );

    // const onNodeDeleted = useCallback(
    //     (id: string): void => {
    //         assertDocumentURIValid(documentUri);
    //         vscode.postMessage({
    //             type: "delete",
    //             documentUri,
    //             node: id,
    //         });
    //     },
    //     [documentUri],
    // );

    // const onNodeOpened = useCallback(
    //     (id: string): void => {
    //         assertDocumentURIValid(documentUri);
    //         vscode.postMessage({
    //             type: "open",
    //             documentUri,
    //             node: id,
    //         });
    //     },
    //     [documentUri],
    // );

    // const onNodeHeadersUpdated = useCallback(
    //     (id: string, headers: Record<string, string | null>): void => {
    //         assertDocumentURIValid(documentUri);
    //         vscode.postMessage({
    //             type: "update-headers",
    //             documentUri,
    //             node: id,
    //             headers: headers,
    //         });
    //     },
    //     [documentUri],
    // );

    return (
        <ErrorBoundary fallbackRender={ErrorPresenter}>
            <GraphView />
            {/*                 
                    <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center select-none">
                        <div>
                            Select a Yarn Spinner script to show the graph view.
                        </div>
                        <div>
                            See the{" "}
                            <a href="https://docs.yarnspinner.dev/write-yarn-scripts/yarn-spinner-editor">
                                Yarn Spinner docs
                            </a>{" "}
                            for more information.
                        </div>
                    </div> */}
        </ErrorBoundary>
    );
}
