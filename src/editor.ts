import * as vscode from "vscode";
import * as languageclient from "vscode-languageclient";
import {
    Event,
    ExecuteCommandParams,
    LanguageClient,
    TextDocumentEdit,
} from "vscode-languageclient/node";

import {
    DidChangeNodesParams,
    DidRequestNodeInGraphViewParams,
    NodeInfo,
} from "./nodes";

export interface StateUpdatedEvent {
    type: "updateState";
    state?: DocumentState;
    documentUri: string | null;
}

export interface NodesUpdatedEvent {
    type: "update";
    nodes: NodeInfo[];
    documentUri: string | null;
}

export interface ShowNodeEvent {
    type: "show-node";
    node: string;
}

export type WebViewEvent =
    | NodesUpdatedEvent
    | StateUpdatedEvent
    | ShowNodeEvent;

export enum Commands {
    AddNode = "yarnspinner.create-node",
    RemoveNode = "yarnspinner.remove-node",
    ListNodes = "yarnspinner.list-nodes",
    UpdateNodeHeader = "yarnspinner.update-node-header",
    CompileWorkspace = "yarnspinner.compile",
    ExtractString = "yarnspinner.extract-spreadsheet",
    GetDocumentState = "yarnspinner.getDocumentState",
}

type DocumentStateType =
    | "Unknown"
    | "NotFound"
    | "InvalidUri"
    | "ContainsErrors"
    | "Valid";

export type DocumentState = {
    uri?: string;
    nodes?: NodeInfo[];
    state: DocumentStateType;
};

export class YarnSpinnerLegacyNodeEditorProvider
    implements vscode.CustomTextEditorProvider
{
    static readonly viewType = "yarnspinner.yarnNodes";

    resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        token: vscode.CancellationToken,
    ): void | Thenable<void> {
        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true,
        };

        webviewPanel.webview.html = this.getHtmlForWebview(
            webviewPanel.webview,
        );

        const onNodesChangedSubscription = this.onDidChangeNodes((params) => {
            let uri = vscode.Uri.parse(params.uri);
            if (uri.fsPath == document.uri.fsPath) {
                updateWebView(params.nodes);
            }
        });

        const onRequestedNodeInGraphViewSubscription =
            this.onDidRequestNodeInGraphView((params) => {
                let uri = vscode.Uri.parse(params.uri);
                if (uri.fsPath == document.uri.fsPath) {
                    showNodeInGraphView(params.nodeName);
                }
            });

        webviewPanel.onDidDispose(() => {
            onNodesChangedSubscription.dispose();
            onRequestedNodeInGraphViewSubscription.dispose();
        });

        // Receive message from the webview.
        webviewPanel.webview.onDidReceiveMessage((e) => {
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
            }
        });

        this.executeCommand<NodeInfo[]>(
            Commands.ListNodes,
            document.uri.fsPath,
        ).then((result) => {
            updateWebView(result);
        });

        function updateWebView(nodes: NodeInfo[]) {
            postWebviewMessage({
                type: "update",
                nodes: nodes,
                documentUri: document.uri.toString(),
            });
        }

        function showNodeInGraphView(nodeName: string) {
            postWebviewMessage({
                type: "show-node",
                node: nodeName,
            });
        }

        async function postWebviewMessage(message: WebViewEvent) {
            return webviewPanel.webview.postMessage(message);
        }
        // updateWebview(document);
    }

    async executeCommand<T>(
        command: string,
        ...commandArguments: any[]
    ): Promise<T> {
        const params: ExecuteCommandParams = {
            command: command,
            arguments: commandArguments,
        };
        return this.languageClient.sendRequest(
            languageclient.ExecuteCommandRequest.type,
            params,
        );
    }

    async openNode(document: vscode.TextDocument, id: string) {
        var nodeInfos: NodeInfo[] =
            (await this.executeCommand(
                Commands.ListNodes,
                document.uri.fsPath,
            )) ?? [];

        // Filter to only include the node(s) that have this title. (Node names
        // must be unique, but the user may have entered invalid code, so we
        // handle this case.)
        nodeInfos = nodeInfos.filter((n) => n.uniqueTitle == id);

        if (nodeInfos.length > 0) {
            const nodeInfo = nodeInfos[0];

            // Figure out which view column an existing editor showing this
            // document has. If we can't find one, default to 'the column beside
            // the active one.'
            const existingEditor = vscode.window.visibleTextEditors.filter(
                (editor) => editor.document == document,
            );
            const existingEditorColumn =
                existingEditor[0]?.viewColumn ?? vscode.ViewColumn.Beside;

            const editor = await vscode.window.showTextDocument(
                document,
                existingEditorColumn,
            );

            // Scroll the editor so that the start of the node is at the top of the editor.
            const startOfNode = new vscode.Range(
                nodeInfo.headerStartLine ?? 0,
                0,
                nodeInfo.headerStartLine ?? 0,
                0,
            );

            editor.revealRange(startOfNode, vscode.TextEditorRevealType.AtTop);

            // Place the selection at the start of the body.
            const startOfBody = new vscode.Range(
                nodeInfo.bodyStartLine ?? 0,
                0,
                nodeInfo.bodyStartLine ?? 0,
                0,
            );

            editor.selection = new vscode.Selection(
                startOfBody.start,
                startOfBody.end,
            );
        }
    }

    async updateNodeHeader(
        document: vscode.TextDocument,
        nodeUniqueName: string,
        headerKey: string,
        headerValue: string | null,
    ) {
        var documentEdit = await this.executeCommand<TextDocumentEdit>(
            Commands.UpdateNodeHeader,
            document.uri.fsPath,
            nodeUniqueName,
            headerKey,
            headerValue,
        );
        await this.applyTextDocumentEdit(documentEdit);
    }

    async moveNode(
        document: vscode.TextDocument,
        positions: Record<string, { x: number; y: number }>,
    ) {
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
                document.uri.fsPath,
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

    async deleteNode(document: vscode.TextDocument, id: string) {
        var deletionEdit = await this.executeCommand<TextDocumentEdit>(
            Commands.RemoveNode,
            document.uri.fsPath,
            id,
        );

        await this.applyTextDocumentEdit(deletionEdit);
    }

    async addNode(
        document: vscode.TextDocument,
        position: { x: number; y: number },
        headers?: Record<string, string>,
    ) {
        var nodeHeaders = {
            ...(headers ?? {}),
            position: `${Math.round(position.x)},${Math.round(position.y)}`,
        };

        var edit = await this.executeCommand<TextDocumentEdit>(
            Commands.AddNode,
            document.uri.fsPath,
            nodeHeaders,
        );

        await this.applyTextDocumentEdit(edit);
    }

    public static register(
        context: vscode.ExtensionContext,
        languageClient: LanguageClient,
        onDidChangeNodes: Event<DidChangeNodesParams>,
        onDidRequestNodeInGraphView: Event<DidRequestNodeInGraphViewParams>,
    ): vscode.Disposable {
        const provider = new YarnSpinnerLegacyNodeEditorProvider(
            context,
            languageClient,
            onDidChangeNodes,
            onDidRequestNodeInGraphView,
        );
        const providerRegistration = vscode.window.registerCustomEditorProvider(
            YarnSpinnerLegacyNodeEditorProvider.viewType,
            provider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true,
                },
                supportsMultipleEditorsPerDocument: true,
            },
        );

        return providerRegistration;
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

        var workspaceEdit = new vscode.WorkspaceEdit();
        for (const edit of documentEdit.edits) {
            // Parse the uri string into a vscode.Uri
            const documentUri = vscode.Uri.parse(documentEdit.textDocument.uri);

            // Convert the language server Range to a vscode.Range
            const editRange = new vscode.Range(
                edit.range.start.line,
                edit.range.start.character,
                edit.range.end.line,
                edit.range.end.character,
            );

            // Add the replacement
            workspaceEdit.replace(documentUri, editRange, edit.newText);
        }

        // Apply this new edit
        return vscode.workspace.applyEdit(workspaceEdit);
    }

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly languageClient: LanguageClient,
        private readonly onDidChangeNodes: Event<DidChangeNodesParams>,
        private readonly onDidRequestNodeInGraphView: Event<DidRequestNodeInGraphViewParams>,
    ) {}

    private static getNonce() {
        let text = "";
        const possible =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(
                Math.floor(Math.random() * possible.length),
            );
        }
        return text;
    }

    /**
     * Get the static html used for the editor webviews.
     */
    private getHtmlForWebview(webview: vscode.Webview): string {
        // Local path to script and css for the webview
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.context.extensionUri,
                "media",
                "yarnspinner.js",
            ),
        );

        const codiconsUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.context.extensionUri,
                "node_modules",
                "@vscode/codicons",
                "dist",
                "codicon.css",
            ),
        );

        const styleResetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.context.extensionUri,
                "media",
                "reset.css",
            ),
        );

        const styleVSCodeUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.context.extensionUri,
                "media",
                "vscode.css",
            ),
        );

        const styleMainUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.context.extensionUri,
                "media",
                "yarnspinner.css",
            ),
        );

        const toolkitUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.context.extensionUri,
                "node_modules",
                "@vscode",
                "webview-ui-toolkit",
                "dist",
                "toolkit.js",
            ),
        );

        // Use a nonce to allowlist which scripts can be run
        const nonce = YarnSpinnerLegacyNodeEditorProvider.getNonce();

        // In development mode, webpack will generate scripts that use 'eval' to
        // execute (to support sourcemaps). This is insecure, so in production
        // mode, we require them to _not_ be done this way via a Content
        // Security Policy.
        //
        // TODO: use environment variables to control debug mode
        let csp: string;
        const debug = true;
        if (debug) {
            csp = "";
        } else {
            csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${webview.cspSource}">`;
        }

        return /* html */ `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
                -->
                ${csp}
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleResetUri}" rel="stylesheet" />
                <link href="${styleVSCodeUri}" rel="stylesheet" />
                <link href="${styleMainUri}" rel="stylesheet" />
                <link href="${codiconsUri}" rel="stylesheet" />
                <title>Yarn Spinner</title>
            </head>
            <body>
                <div id="graph-debug"></div>
                <div class="zoom-container">
                    <div class="nodes"></div>
                </div>
                <div id="nodes-header">
                    <div>
                        <vscode-button appearance="primary" id="add-node">Add Node</vscode-button>
                        <vscode-button appearance="secondary" id="add-stickynote">Add Sticky Note</vscode-button>
                    </div>
                    <div id="nodes-header-right">
                        <vscode-dropdown id="node-jump">
                            <span slot="indicator" id="icon" class="codicon codicon-compass"></span>
                            <vscode-option>Jump to Node</vscode-option>
                        </vscode-dropdown>
                    </div>
                </div>
                <div id="node-template" class="node">
                    <div class="content">
                        <div class="color-bar"></div>
                        <div class="title">Node Title</div>
                        <div class="subtitle">Node Subtitle</div>
                        <div class="preview">Node Preview</div>
                    </div>
                    <div class="node-buttons">
                        <vscode-button appearance="icon" aria-label="Edit" title>
                            <span class="codicon codicon-edit button-edit"></span>
                        </vscode-button>
                        <vscode-button appearance="icon" aria-label="Delete" title>
                            <span class="codicon codicon-trash button-delete"></span>
                        </vscode-button>
                    </div>
                    <div class="node-preview-fade"> </div>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
                <script nonce="${nonce}" type="module" src="${toolkitUri}"></script>
            </body>
            </html>`;
    }
}
