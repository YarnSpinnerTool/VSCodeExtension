import {
    CancellationToken,
    commands,
    Disposable,
    Event,
    ExtensionContext,
    RelativePattern,
    Uri,
    Range,
    Webview,
    WebviewView,
    WebviewViewProvider,
    WebviewViewResolveContext,
    window,
    workspace,
    WorkspaceEdit,
} from "vscode";
import { getNonce } from "../utilities/getNonce";
import { getWebviewUri } from "../utilities/getWebviewUri";
import { DidChangeNodesParams, NodeInfo } from "../nodes";
import { Commands, type NodesUpdatedEvent } from "../editor";

import {
    ExecuteCommandRequest,
    type ExecuteCommandParams,
    type LanguageClient,
    type TextDocumentEdit,
} from "vscode-languageclient/node";

const stylesAssetPath = ["graph-view", "build", "assets", "index.css"];
const scriptAssetPath = ["graph-view", "build", "assets", "index.js"];

type XYPosition = { x: number; y: number };

export type WebviewMessage =
    | {
          type: "move";
          documentUri: string;
          positions: Record<string, XYPosition>;
      }
    | {
          type: "add";
          documentUri: string;
          position: XYPosition;
          headers: Record<string, string>;
      }
    | {
          type: "delete";
          documentUri: string;
          node: string;
      };

/*
 switch (e.type) {
                case "add":
                    this.addNode(document, e.position, e.headers);
                    return;

                case "delete":
                    this.deleteNode(document, e.id);
                    return;

                case "move":
                    this.moveNode(document, e.positions);
                    return;

                case "open":
                    this.openNode(document, e.id);
                    return;

                case "update-header":
                    this.updateNodeHeader(document, e.nodeName, e.key, e.value);
            }*/

export class YarnSpinnerGraphViewProvider implements WebviewViewProvider {
    private _extensionContext: ExtensionContext;

    public static readonly viewType = "yarnspinner.graph-view";
    private _currentPanel?: YarnSpinnerGraphView;
    private _onDidChangeNodes: Event<DidChangeNodesParams>;
    private _languageClient: LanguageClient;

    constructor(
        extensionContext: ExtensionContext,
        languageClient: LanguageClient,
        onDidChangeNodes: Event<DidChangeNodesParams>,
    ) {
        this._extensionContext = extensionContext;
        this._languageClient = languageClient;
        this._onDidChangeNodes = onDidChangeNodes;
    }

    resolveWebviewView(
        webviewView: WebviewView,
        context: WebviewViewResolveContext,
        token: CancellationToken,
    ): Thenable<void> | void {
        this._currentPanel = new YarnSpinnerGraphView(
            webviewView,
            this._extensionContext,
            this._languageClient,
            this._onDidChangeNodes,
        );
    }
}

/**
 * This class manages the state and behavior of HelloWorld webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering HelloWorld webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
export class YarnSpinnerGraphView {
    public static currentPanel: YarnSpinnerGraphView | undefined;
    private readonly _view?: WebviewView;
    private readonly _webview: Webview;
    private _disposables: Disposable[] = [];

    private static _documentNodes: Map<string, NodeInfo[]> = new Map();
    private _languageClient: LanguageClient;

    /**
     * The HelloWorldPanel class private constructor (called only from the render method).
     *
     * @param panel A reference to the webview panel
     * @param extensionUri The URI of the directory containing the extension
     */
    constructor(
        panel: WebviewView,
        context: ExtensionContext,
        languageClient: LanguageClient,
        onDidChangeNodes: Event<DidChangeNodesParams>,
    ) {
        this._view = panel;
        this._languageClient = languageClient;

        const extensionUri = context.extensionUri;

        // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
        // the panel or when the panel is closed programmatically)
        this._view.onDidDispose(() => this.dispose(), null, this._disposables);

        this._webview = panel.webview;

        this._webview.options = {
            // Enable JavaScript in the webview
            enableScripts: true,
            // Restrict the webview to only load resources from the `out` and `graph-view/build` directories
            localResourceRoots: [
                Uri.joinPath(extensionUri, "out"),
                Uri.joinPath(extensionUri, "graph-view/build"),
            ],
        };

        // Set the HTML content for the webview panel
        this._view.webview.html = this._getWebviewContent(
            this._view.webview,
            extensionUri,
        );

        // Set an event listener to listen for messages passed from the webview context
        this._setWebviewMessageListener(this._view.webview);

        // Watch the dist directory for changes; if any do, we reload all webviews
        const watcher = workspace.createFileSystemWatcher(
            new RelativePattern(extensionUri, "graph-view/build/*"),
        );
        commands.executeCommand("workbench.action.webview.reloadWebviewAction");
        const reloadWebViews = async () => {
            await commands.executeCommand(
                "workbench.action.webview.reloadWebviewAction",
            );

            var delayPromise = new Promise<void>((resolve) => {
                setTimeout(resolve, 500);
            });

            await delayPromise;

            const editor = window.activeTextEditor;
            const nodes =
                editor !== undefined
                    ? (YarnSpinnerGraphView._documentNodes.get(
                          editor.document.uri.toString(),
                      ) ?? [])
                    : [];

            this._webview.postMessage({
                type: "update",
                nodes: nodes,
                documentUri: editor?.document.uri.toString() ?? null,
            } satisfies NodesUpdatedEvent);
        };

        // React to changes in the dist directory
        watcher.onDidChange(reloadWebViews);
        watcher.onDidCreate(reloadWebViews);
        watcher.onDidDelete(reloadWebViews);
        this._disposables.push(watcher);

        const onNodesChanged = onDidChangeNodes((n) => {
            try {
                // Update our cached nodes for this uri
                const documentUri = Uri.parse(n.uri, false);
                YarnSpinnerGraphView._documentNodes.set(
                    documentUri.toString(),
                    n.nodes,
                );
            } catch {}
            const uriString = window.activeTextEditor?.document.uri.toString();
            if (n.uri === uriString) {
                this._webview.postMessage({
                    type: "update",
                    nodes: n.nodes,
                    documentUri: uriString,
                } satisfies NodesUpdatedEvent);
            }
        });

        this._disposables.push(onNodesChanged);

        const onDocumentChanged = window.onDidChangeActiveTextEditor(
            (editor) => {
                const nodes =
                    editor !== undefined
                        ? (YarnSpinnerGraphView._documentNodes.get(
                              editor.document.uri.toString(),
                          ) ?? [])
                        : [];

                // TODO: if we don't have any cached nodes for this document, request them from the Language Client

                this._webview.postMessage({
                    type: "update",
                    nodes: nodes,
                    documentUri: editor?.document.uri.toString() ?? null,
                } satisfies NodesUpdatedEvent);
            },
        );
        this._disposables.push(onDocumentChanged);
    }

    /**
     * Cleans up and disposes of webview resources when the webview panel is closed.
     */
    public dispose() {
        YarnSpinnerGraphView.currentPanel = undefined;

        // Dispose of all disposables (i.e. commands) for the current webview panel
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    /**
     * Defines and returns the HTML that should be rendered within the webview panel.
     *
     * @remarks This is also the place where references to the React webview build files
     * are created and inserted into the webview HTML.
     *
     * @param webview A reference to the extension webview
     * @param extensionUri The URI of the directory containing the extension
     * @returns A template string literal containing the HTML that should be
     * rendered within the webview panel
     */
    private _getWebviewContent(webview: Webview, extensionUri: Uri) {
        // The CSS file from the React build output
        const stylesUri = getWebviewUri(webview, extensionUri, stylesAssetPath);
        // The JS file from the React build output
        const scriptUri = getWebviewUri(webview, extensionUri, scriptAssetPath);

        const nonce = getNonce();

        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Hello World</title>
        </head>
        <body>
          <div id="root" data-vscode-context='{"preventDefaultContextMenuItems": true}'></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
    }

    /**
     * Sets up an event listener to listen for messages passed from the webview context and
     * executes code based on the message that is recieved.
     *
     * @param webview A reference to the extension webview
     * @param context A reference to the extension context
     */
    private _setWebviewMessageListener(webview: Webview) {
        webview.onDidReceiveMessage(
            (message: WebviewMessage) => {
                switch (message.type) {
                    case "move":
                        this.moveNode(
                            Uri.parse(message.documentUri, true),
                            message.positions,
                        );
                        break;
                    case "add":
                        this.addNode(
                            Uri.parse(message.documentUri, true),
                            message.position,
                            message.headers,
                        );
                        break;
                    case "delete":
                        this.deleteNode(
                            Uri.parse(message.documentUri, true),
                            message.node,
                        );
                        break;
                }
            },
            undefined,
            this._disposables,
        );
    }
    private async addNode(
        uri: Uri,
        position: XYPosition,
        headers: Record<string, string>,
    ) {
        var nodeHeaders = {
            ...(headers ?? {}),
            position: `${Math.round(position.x)},${Math.round(position.y)}`,
        };

        var edit = await this.executeCommand<TextDocumentEdit>(
            Commands.AddNode,
            uri.fsPath,
            nodeHeaders,
        );

        await this.applyTextDocumentEdit(edit);
    }

    private async moveNode(
        uri: Uri,
        positions: Record<string, { x: number; y: number }>,
    ): Promise<void> {
        let computedEdit: TextDocumentEdit | undefined;

        // For each node in 'positions', update (or add) the 'position' header
        // for this node in the document. We'll accumulate all of the edits that
        // result, and apply it all at once.
        for (const nodeName in positions) {
            const position = positions[nodeName];

            // Send a request to the language server to change the 'position' header
            // for this node
            var documentEdit = await this.executeCommand<TextDocumentEdit>(
                Commands.UpdateNodeHeader,
                uri.fsPath,
                nodeName,
                "position",
                `${Math.round(position.x)},${Math.round(position.y)}`,
            );
            if (!computedEdit) {
                computedEdit = documentEdit;
            } else {
                computedEdit.edits.push(...documentEdit.edits);
            }
        }

        // We have an edit to apply that updates these positions
        if (computedEdit) {
            // Apply the document change that we received
            await this.applyTextDocumentEdit(computedEdit);
        }
    }

    async deleteNode(uri: Uri, id: string): Promise<void> {
        var deletionEdit = await this.executeCommand<TextDocumentEdit>(
            Commands.RemoveNode,
            uri.fsPath,
            id,
        );

        await this.applyTextDocumentEdit(deletionEdit);
    }

    async executeCommand<T>(
        command: string,
        ...commandArguments: any[]
    ): Promise<T> {
        const params: ExecuteCommandParams = {
            command: command,
            arguments: commandArguments,
        };
        return this._languageClient.sendRequest(
            ExecuteCommandRequest.type,
            params,
        );
    }

    /**
     * Applies the given TextDocumentEdit to the workspace.
     * @param documentEdit The edit to apply.
     * @returns A promise that resolves to whether the edit could be applied.
     */
    private async applyTextDocumentEdit(
        documentEdit: TextDocumentEdit,
    ): Promise<boolean> {
        // Construct a new workspace edit that modifies this specific document.

        var workspaceEdit = new WorkspaceEdit();
        for (const edit of documentEdit.edits) {
            // Parse the uri string into a vscode.Uri
            const documentUri = Uri.parse(documentEdit.textDocument.uri);

            // Convert the language server Range to a vscode.Range
            const editRange = new Range(
                edit.range.start.line,
                edit.range.start.character,
                edit.range.end.line,
                edit.range.end.character,
            );

            // Add the replacement
            workspaceEdit.replace(documentUri, editRange, edit.newText);
        }

        // Apply this new edit
        return workspace.applyEdit(workspaceEdit);
    }
}
