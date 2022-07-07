import { Uri } from "vscode";
import { NotificationHandler, ProtocolNotificationType } from "vscode-languageclient";

export interface NodeInfo {
    title: string;
    bodyStartLine: number;
    headerStartLine: number;
    headers: NodeHeader[];
    jumps: NodeJump[];
}

export interface NodeHeader {
    key: string
    value: string
}

export interface NodeJump {
    destinationTitle: string
}

export namespace DidChangeNodesNotification {
	export const type = new ProtocolNotificationType<DidChangeNodesParams, void>('textDocument/yarnSpinner/didChangeNodes');
	export type HandlerSignature = NotificationHandler<DidChangeNodesParams>;
	export type MiddlewareSignature = (params: DidChangeNodesParams, next: HandlerSignature) => void;
}

export interface DidChangeNodesParams {
    uri: Uri
    nodes: NodeInfo[]
}

export interface VOStringExport {
    file: Uint8Array;
    errors: string[];
}
