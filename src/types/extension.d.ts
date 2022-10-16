import * as vscode from 'vscode';
export declare type YarnData = {
    stringTable: {
        [key: string]: string;
    };
    programData: number[];
};
export declare function activate(context: vscode.ExtensionContext): Promise<void>;
export declare function getDefaultUri(): vscode.Uri;
export declare function deactivate(): Thenable<void> | undefined;
