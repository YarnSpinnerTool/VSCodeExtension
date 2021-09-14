import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker';
import * as vscode from 'vscode';
import * as parsing from './parsing';
import { HeaderContext, NodeContext, YarnSpinnerParser } from './YarnSpinnerParser';
import { YarnSpinnerParserListener } from './YarnSpinnerParserListener';

export class NodesUpdatedEvent {
    type = "update"
    nodes : parsing.NodeInfo[] = []
}

export class YarnSpinnerEditorProvider implements vscode.CustomTextEditorProvider {

    static readonly viewType = "yarnspinner.yarnNodes";

    resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void | Thenable<void> {

        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true,
        };
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

        function updateWebview(document : vscode.TextDocument) {
            var parseTree = parsing.parse(document.getText());
            var nodes = parsing.getNodeInfo(parseTree.parseContext);

            webviewPanel.webview.postMessage({
                type: 'update',
                nodes: nodes,
            });
        }

        // Hook up event handlers so that we can synchronize the webview with the text document.
		//
		// The text document acts as our model, so we have to sync change in the document to our
		// editor and sync changes in the editor back to the document.
		// 
		// Remember that a single text document can also be shared between multiple custom
		// editors (this happens for example when you split a custom editor)

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				updateWebview(e.document);
			}
		});

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
		});

        // Receive message from the webview.
		webviewPanel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
				case 'add':
					this.addNode(document);
					return;

				case 'delete':
					this.deleteNode(document, e.id);
					return;
                
                case 'move':
                    this.moveNode(document, e.id, e.position);
			}
		});

		updateWebview(document);
    }

    moveNode(document: vscode.TextDocument, id: string, position: {x: number, y: number}) {
        console.log(`Node ${id} moved to ${JSON.stringify(position)}`);

        var parseTree = parsing.parse(document.getText());

        class NodeHeaderFinder implements YarnSpinnerParserListener {
            constructor(targetNodeName : string, targetHeader:string) {
                this.targetNodeName = targetNodeName;
                this.targetHeader = targetHeader;
            }
            
            targetNodeName: string;
            targetHeader: string;
            
            insertionPoint : vscode.Position | undefined;
            replacementRange : vscode.Range | undefined;

            exitNode(ctx: NodeContext) {

                var candidateReplacementRange : vscode.Range | undefined;
                
                for (const header of ctx.header()) {
                    var headerKey = header._header_key.text;
                    var headerValue = header._header_value?.text ?? "";

                    if (headerKey === "title") {
                        if (headerValue != this.targetNodeName) {
                            // This isn't the node we're looking for! Exit here.
                            return;
                        }
                    }

                    if (headerKey == this.targetHeader) {
                        var start = header.start;
                        var stop = header.stop ?? header.start;

                        // this could be our target node's target header!
                        // record this as a candidate 
                        candidateReplacementRange = new vscode.Range(
                            start.line - 1, 
                            start.charPositionInLine, 
                            stop.line - 1, 
                            stop.charPositionInLine + (stop.text?.length ?? 0))
                    }
                }

                // If we've made it to here, then we know that we're in the
                // target node (else the title test would have returned).

                if (candidateReplacementRange) {
                    this.replacementRange = candidateReplacementRange;
                } else {
                    // We don't have a candidate replacement range for this
                    // header. It doesn't exist in the node. Instead,
                    // insert a new line at the 'BODY_START' token
                    this.insertionPoint = new vscode.Position(ctx.BODY_START()._symbol.line - 1, 0);
                }
            }
        }

        var listener = new NodeHeaderFinder(id, "position");

        ParseTreeWalker.DEFAULT.walk(listener as YarnSpinnerParserListener, parseTree.parseContext);
        
        const newPositionHeader = `position: ${Math.round(position.x)},${Math.round(position.y)}`;

        if (listener.replacementRange) {
            var edit = new vscode.WorkspaceEdit();
            edit.replace(document.uri,listener.replacementRange, newPositionHeader);
            vscode.workspace.applyEdit(edit);
        } else if (listener.insertionPoint) {
            var edit = new vscode.WorkspaceEdit();
            edit.insert(document.uri, listener.insertionPoint, newPositionHeader + "\n");
            vscode.workspace.applyEdit(edit);
        } else {
            console.error(`No node called ${id} exists in the document?`);
        }
        
    }
    deleteNode(document: vscode.TextDocument, id: string) {
        throw new Error('Method not implemented.');
    }
    addNode(document: vscode.TextDocument) {
        console.log("Adding a new node.");
    }

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new YarnSpinnerEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(YarnSpinnerEditorProvider.viewType, provider, {
            webviewOptions: {
                retainContextWhenHidden: true,
            },
            supportsMultipleEditorsPerDocument: true,
        });
        
        return providerRegistration;
    }

    constructor(
        private readonly context: vscode.ExtensionContext
    ) { }

    private static getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    /**
     * Get the static html used for the editor webviews.
     */
    private getHtmlForWebview(webview: vscode.Webview): string {
        // Local path to script and css for the webview
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'media', 'yarnspinner.js'));

        const interactScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'node_modules', 'interactjs', 'dist', 'interact.js'
        ))

        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'media', 'reset.css'));

        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'media', 'vscode.css'));

        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'media', 'yarnspinner.css'));

        // Use a nonce to allowlist which scripts can be run
        const nonce = YarnSpinnerEditorProvider.getNonce();

        return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
                <meta charset="UTF-8">
				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet" />
				<link href="${styleVSCodeUri}" rel="stylesheet" />
				<link href="${styleMainUri}" rel="stylesheet" />
				<title>Yarn Spinner</title>
			</head>
			<body>
				<div class="buttons">
						<button id="add-node">Add Node</button>
						<button id="delete-node">Delete Node</button>
					
				</div>
                <div class="nodes"></div>
                <script nonce="${nonce}" src="${interactScriptUri}"></script>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
    }
}