import * as vscode from 'vscode';
import { YarnData } from './extension';
export declare class YarnPreviewPanel {
    static currentPanel: YarnPreviewPanel | null;
    static readonly viewType = "yarnPreview";
    private readonly _panel;
    private readonly _extensionUri;
    static createOrShow(extensionUri: vscode.Uri, yarnData: YarnData): void;
    static saveHTML(html: string): void;
    private static getWebviewOptions;
    private constructor();
    update(yarnData: YarnData): void;
    static generateHTML(yarnData: YarnData, extensionURI: vscode.Uri, includeSaveOption: boolean): string;
}
