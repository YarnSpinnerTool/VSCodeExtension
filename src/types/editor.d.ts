import * as vscode from 'vscode';
import { Event, LanguageClient } from "vscode-languageclient/node";
import { DidChangeNodesParams, DidRequestNodeInGraphViewParams, NodeInfo } from './nodes';
export declare enum MessageTypes {
    Update = "update",
    ShowNode = "show-node"
}
export interface NodesUpdatedEvent {
    type: MessageTypes.Update;
    nodes: NodeInfo[];
}
export interface ShowNodeEvent {
    type: MessageTypes.ShowNode;
    node: string;
}
export declare type WebViewEvent = NodesUpdatedEvent | ShowNodeEvent;
export declare class YarnSpinnerEditorProvider implements vscode.CustomTextEditorProvider {
    private readonly context;
    private readonly languageClient;
    private readonly onDidChangeNodes;
    private readonly onDidRequestNodeInGraphView;
    static readonly viewType = "yarnspinner.yarnNodes";
    resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void | Thenable<void>;
    executeCommand<T>(command: string, ...commandArguments: any[]): Promise<T>;
    openNode(document: vscode.TextDocument, id: string): Promise<void>;
    moveNode(document: vscode.TextDocument, nodeTitle: string, position: {
        x: number;
        y: number;
    }): Promise<void>;
    deleteNode(document: vscode.TextDocument, id: string): Promise<void>;
    addNode(document: vscode.TextDocument, position: {
        x: number;
        y: number;
    }): Promise<void>;
    static register(context: vscode.ExtensionContext, languageClient: LanguageClient, onDidChangeNodes: Event<DidChangeNodesParams>, onDidRequestNodeInGraphView: Event<DidRequestNodeInGraphViewParams>): vscode.Disposable;
    /**
     * Applies the given TextDocumentEdit to the workspace.
     * @param documentEdit The edit to apply.
     * @returns A promise that resolves to whether the edit could be applied.
     */
    private applyTextDocumentEdit;
    constructor(context: vscode.ExtensionContext, languageClient: LanguageClient, onDidChangeNodes: Event<DidChangeNodesParams>, onDidRequestNodeInGraphView: Event<DidRequestNodeInGraphViewParams>);
    private static getNonce;
    /**
     * Get the static html used for the editor webviews.
     */
    private getHtmlForWebview;
}
