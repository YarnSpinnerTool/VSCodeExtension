import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker';
import * as vscode from 'vscode';
import * as parsing from './parsing';
import { HeaderContext, NodeContext, YarnSpinnerParser } from './YarnSpinnerParser';
import { YarnSpinnerParserListener } from './YarnSpinnerParserListener';
import * as fs from 'fs';
import { Parser } from 'antlr4ts';

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
            // document.

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
                    return;
                
                case 'open':
                    this.openNode(document, e.id);
                    return;
			}
		});

		updateWebview(document);
    }
    openNode(document: vscode.TextDocument, id: string) {
        var parseTree = parsing.parse(document.getText());
        
        var nodeInfos = parsing.getNodeInfo(parseTree.parseContext).filter(n => n.title == id);

        if (nodeInfos.length > 0) {
            const nodeInfo = nodeInfos[0];
            var existingEditorColumn = vscode.window.visibleTextEditors.filter(editor => editor.document == document)[0]?.viewColumn;

            vscode.window.showTextDocument(document, existingEditorColumn).then(editor => {
                var startOfNode = new vscode.Range(nodeInfo.line - 1, 0, nodeInfo.line - 1, 0);
                editor.revealRange(startOfNode, vscode.TextEditorRevealType.AtTop);
                var startOfBody = new vscode.Range(nodeInfo.bodyLine - 1, 0, nodeInfo.bodyLine - 1, 0);
                editor.selection = new vscode.Selection(startOfBody.start, startOfBody.end);
            })
        }
        
    }

    moveNode(document: vscode.TextDocument, id: string, position: {x: number, y: number}) {
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
        var parseTree = parsing.parse(document.getText());
        var nodeInfos = parsing.getNodeInfo(parseTree.parseContext);

        const nodesWithTitle = nodeInfos.filter(n => n.title === id);
        if (nodesWithTitle.length > 1) {
            vscode.window.showErrorMessage(`Can't delete node: multiple nodes named ${id} exist in this document. Please modify the source code directly.`);
            return;
        } else if (nodesWithTitle.length == 0) {
            console.error(`Can't delete node called ${id}: it doesn't exist in the document`);
        }

        var selectedNode = nodesWithTitle[0];

        var range = new vscode.Range(
            new vscode.Position(selectedNode.start.line, selectedNode.start.character),
            new vscode.Position(selectedNode.end.line, selectedNode.end.character),
        )

        var edit = new vscode.WorkspaceEdit();
        edit.delete(document.uri, range);
        vscode.workspace.applyEdit(edit);
    }
    addNode(document: vscode.TextDocument) {
        
        var parseResult = parsing.parse(document.getText());
        var existingNodes = parsing.getNodeInfo(parseResult.parseContext);
        var existingNodeNames = existingNodes.map(n => n.title);

        var attemptCount = 0;
        var baseNodeName = "Node"
        var newNodeName = baseNodeName;
        
        while (existingNodeNames.indexOf(newNodeName) != -1) {
            attemptCount += 1;
            newNodeName = `${baseNodeName}${attemptCount.toString()}`;
        }
        
        // Find the end of the document and insert a new node
        var lastLine = document.lineAt(document.lineCount - 1);

        var insertionPoint = lastLine.range.end;

        var insertNewLine : boolean

        
        if (lastLine.isEmptyOrWhitespace) {
            insertNewLine = false;
        } else {
            insertNewLine = true;
        }
        
        var newNodeTemplatePath = vscode.Uri.joinPath(this.context.extensionUri, 'media', 'NewNodeTemplate.yarn').fsPath;
        
        
        var contents = fs.readFile(newNodeTemplatePath, null, (err, data) => {
            var contents = data.toString();

            contents = contents.replace("{NODE_NAME}", newNodeName);

            var edit = new vscode.WorkspaceEdit();

            if (insertNewLine) {
                contents = "\n" + contents;
            }
            
            edit.insert(document.uri, insertionPoint, contents);

            vscode.workspace.applyEdit(edit);
        });
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
        ));

        const leaderLineScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'node_modules', 'leader-line', 'leader-line.min.js'
        ));

        const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'
        ));

        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'media', 'reset.css'));

        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'media', 'vscode.css'));

        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'media', 'yarnspinner.css'));

        const toolkitUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 
            "node_modules",
            "@vscode",
            "webview-ui-toolkit",
            "dist",
            "toolkit.js",));

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
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${webview.cspSource}">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet" />
				<link href="${styleVSCodeUri}" rel="stylesheet" />
				<link href="${styleMainUri}" rel="stylesheet" />
                <link href="${codiconsUri}" rel="stylesheet" />
				<title>Yarn Spinner</title>
			</head>
			<body>
				<div class="nodes"></div>
                <div class="buttons">
						<vscode-button id="add-node">Add Node</vscode-button>
				</div>
                <div id="node-template" class="node">
                    <div class="title">Node Title</div>
                    <div class="node-buttons"><i class="codicon codicon-trash button-delete"></i></div>
                </div>
                <script nonce="${nonce}" src="${interactScriptUri}"></script>
                <script nonce="${nonce}" src="${leaderLineScriptUri}"></script>
				<script nonce="${nonce}" src="${scriptUri}"></script>
                <script nonce="${nonce}" type="module" src="${toolkitUri}"></script>
			</body>
			</html>`;
    }
}