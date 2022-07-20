import * as vscode from 'vscode';
import * as fs from 'fs';
import { YarnData, getDefaultUri } from './extension';

export class YarnPreviewPanel {
    public static currentPanel: YarnPreviewPanel | null;

    public static readonly viewType = 'yarnPreview';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;

    public static createOrShow(extensionUri: vscode.Uri, yarnData: YarnData) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        // If we already have a panel, show it.
        if (YarnPreviewPanel.currentPanel) {
            YarnPreviewPanel.currentPanel.update(yarnData);
            YarnPreviewPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(YarnPreviewPanel.viewType, 'Dialogue Preview', column || vscode.ViewColumn.One, YarnPreviewPanel.getWebviewOptions(extensionUri));

        panel.onDidDispose((e) => {
            // When the panel is disposed, clear our reference to it (so we
            // don't attempt to update a disposed panel.)
            YarnPreviewPanel.currentPanel = null;
        });

        panel.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case "save-story":
                    {
                        YarnPreviewPanel.saveHTML(YarnPreviewPanel.generateHTML(yarnData, extensionUri, false));
                        break;
                    }
            }
        });

        YarnPreviewPanel.currentPanel = new YarnPreviewPanel(panel, extensionUri, yarnData);
    }

    public static saveHTML(html: string) {

        let defaultURI = vscode.Uri.joinPath( getDefaultUri(), `story.html`);

        vscode.window.showSaveDialog({
            defaultUri: defaultURI
        }).then((uri: vscode.Uri | undefined) => {
            if (uri) {
                const path = uri.fsPath;
                fs.writeFile(path, html, (error) => {
                    if (error) {
                        vscode.window.showErrorMessage(`Unable to write to file ${path}`, error.message);
                    }

                    else {
                        vscode.window.showInformationMessage(`Story written to ${path}`);
                    }
                });
            }
        });
    }

    private static getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
        return {
            // Enable javascript in the webview
            enableScripts: true,
            // And restrict the webview to only loading content from our extension's `media` directory.
            // localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
        };
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, yarnData: YarnData) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set the webview's initial html content
        this.update(yarnData);
    }

    public update(yarnData: YarnData) {
        let html = YarnPreviewPanel.generateHTML(yarnData, this._extensionUri, true);

        this._panel.webview.html = html;
    }

    public static generateHTML(yarnData: YarnData, extensionURI: vscode.Uri, includeSaveOption: boolean): string {
        const scriptPathOnDisk = vscode.Uri.joinPath(extensionURI, 'src', 'runner.html');
        let contents = fs.readFileSync(scriptPathOnDisk.fsPath, 'utf-8');

        let saveButton: string;
        if (includeSaveOption) {
            saveButton = `
            window.addEventListener("yarnLoaded", () => {
                window.addButton("Export", ["mx-2", "btn-outline-secondary"], () => {
                    const vscode = acquireVsCodeApi();
                    vscode.postMessage({
                        command: 'save-story'
                    });
                });
            });
            `;
        } else {
            saveButton = "";
        }

        let injectedYarnProgramScript = `
        <script>
        window.yarnData = {
            programData : Uint8Array.from(${JSON.stringify(yarnData.programData)}),
            stringTable : ${JSON.stringify(yarnData.stringTable)}
        };
        ${saveButton}
        </script>
        `;

        let replacementMarker = '<script id="injected-yarn-program"></script>';

        var html = contents.replace(replacementMarker, injectedYarnProgramScript);

        return html;
    }
}
