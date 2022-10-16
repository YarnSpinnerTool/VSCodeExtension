import { Uri } from "vscode";
import { NotificationHandler, ProtocolNotificationType } from "vscode-languageclient";
export interface NodeInfo {
    title: string;
    bodyStartLine: number;
    headerStartLine: number;
    headers: NodeHeader[];
    jumps: NodeJump[];
    previewText: string;
}
export interface NodeHeader {
    key: string;
    value: string;
}
export interface NodeJump {
    destinationTitle: string;
}
export declare namespace DidChangeNodesNotification {
    const type: ProtocolNotificationType<DidChangeNodesParams, void>;
    type HandlerSignature = NotificationHandler<DidChangeNodesParams>;
    type MiddlewareSignature = (params: DidChangeNodesParams, next: HandlerSignature) => void;
}
export interface DidChangeNodesParams {
    uri: Uri;
    nodes: NodeInfo[];
}
export interface CompilerOutput {
    data: Uint8Array;
    stringTable: {
        [key: string]: string;
    };
    errors: string[];
}
export interface VOStringExport {
    file: Uint8Array;
    errors: string[];
}
