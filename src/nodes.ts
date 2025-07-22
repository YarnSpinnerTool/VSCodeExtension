import { Uri } from "vscode";
import {
    NotificationHandler,
    ProtocolNotificationType,
} from "vscode-languageclient";

export interface NodeInfo {
    uniqueTitle?: string;
    sourceTitle?: string;
    subtitle?: string;
    nodeGroup?: string;
    bodyStartLine: number;
    headerStartLine: number;
    headers: NodeHeader[];
    jumps: NodeJump[];
    previewText: string;
    containsExternalJumps: boolean;
    nodeGroupComplexity?: number;
}

export interface NodeHeader {
    key: string;
    value: string;
}

export interface NodeJump {
    destinationTitle: string;
    type: "Jump" | "Detour";
    destinationFileUri: string;
}

export namespace DidChangeNodesNotification {
    export const type = new ProtocolNotificationType<
        DidChangeNodesParams,
        void
    >("textDocument/yarnSpinner/didChangeNodes");
    export type HandlerSignature = NotificationHandler<DidChangeNodesParams>;
    export type MiddlewareSignature = (
        params: DidChangeNodesParams,
        next: HandlerSignature,
    ) => void;
}

export interface DidChangeNodesParams {
    uri: string;
    nodes: NodeInfo[];
}

export interface DidRequestNodeInGraphViewParams {
    uri: string;
    nodeName: string;
}

export type MetadataEntry = {
    id: string;
    node: string;
    lineNumber: string;
    tags: string[];
    [key: string]: unknown;
};

export interface CompilerOutput {
    data: string;
    stringTable: Record<string, string>;
    metadataTable: Record<string, MetadataEntry>;
    errors: string[];
}
export interface VOStringExport {
    file: Uint8Array;
    errors: string[];
}
