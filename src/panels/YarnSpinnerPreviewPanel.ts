import { YarnData } from "../extension";
import { getNonce } from "../utilities/getNonce";
import { getWebviewUri } from "../utilities/getWebviewUri";
import {
    Disposable,
    ExtensionContext,
    RelativePattern,
    Uri,
    Webview,
    commands,
    workspace,
} from "vscode";
import * as vscode from "vscode";

import { GraphWebviewMessage } from "./YarnSpinnerGraphView";

const stylesAssetPath = ["webviews", "build", "preview", "assets", "main.css"];
const scriptAssetPath = ["webviews", "build", "preview", "assets", "main.js"];

export type PreviewWebViewMessage =
    | { type: "ready" }
    | { type: "request-updated-program" };

export type PreviewExtensionMessage =
    | {
          type: "program-updated";
          data: YarnData;
      }
    | {
          type: "program-update-failed";
          errors: string[];
      };

/**
 * This class manages the state and behavior of HelloWorld webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering HelloWorld webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
export class YarnSpinnerPreviewPanel {
    public static currentPanel: YarnSpinnerPreviewPanel | undefined;
    private readonly _webview: Webview;
    private _disposables: Disposable[] = [];

    private readonly _panel: vscode.WebviewPanel;

    public static readonly viewType = "yarnSpinnerPreview";

    private static getWebviewOptions(
        extensionUri: vscode.Uri,
    ): vscode.WebviewOptions {
        return {
            // Enable javascript in the webview
            enableScripts: true,
            // And restrict the webview to only loading content from our extension's `media` directory.
            // localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
        };
    }

    public static async createOrShow(
        context: ExtensionContext,
        getCompiledProgram: () => Promise<YarnData | { errors: string[] }>,
    ): Promise<YarnSpinnerPreviewPanel> {
        console.log("Create preview panel");
        // If we already have a panel, show it.
        if (YarnSpinnerPreviewPanel.currentPanel) {
            // YarnSpinnerPreviewPanel.currentPanel.update(yarnData);
            YarnSpinnerPreviewPanel.currentPanel._panel.reveal(
                YarnSpinnerPreviewPanel.currentPanel._panel.viewColumn,
            );
            return YarnSpinnerPreviewPanel.currentPanel;
        }

        // Otherwise, create a new panel besides the current one.
        const panel = vscode.window.createWebviewPanel(
            YarnSpinnerPreviewPanel.viewType,
            "Dialogue Preview",
            vscode.ViewColumn.Beside,
            YarnSpinnerPreviewPanel.getWebviewOptions(context.extensionUri),
        );

        panel.onDidDispose((e) => {
            // When the panel is disposed, clear our reference to it (so we
            // don't attempt to update a disposed panel.)
            YarnSpinnerPreviewPanel.currentPanel = undefined;
        });

        const waitForReadyPromise = new Promise<void>((resolve) => {
            const messageReceiveDisposer = panel.webview.onDidReceiveMessage(
                (message: PreviewWebViewMessage) => {
                    console.log("Received message", message);
                    if (message.type == "ready") {
                        messageReceiveDisposer.dispose();
                        resolve();
                    }
                },
            );
        });

        const newPanel = new YarnSpinnerPreviewPanel(panel, context);
        await waitForReadyPromise;
        YarnSpinnerPreviewPanel.currentPanel = newPanel;

        const program = await getCompiledProgram();
        newPanel.updateProgram(
            program ?? { error: "Failed to compile program" },
        );

        const messageReceiver = panel.webview.onDidReceiveMessage(
            async (message: PreviewWebViewMessage) => {
                if (message.type == "request-updated-program") {
                    const result = await getCompiledProgram();
                    newPanel.updateProgram(result);
                }
            },
        );
        newPanel._disposables.push(messageReceiver);

        return newPanel;
    }

    public updateProgram(program: YarnData | { errors: string[] }) {
        if (!this._webview) {
            // No webview available.
            console.error(
                "Tried to update program in the preview panel, but no webview was available!",
            );
            return;
        }
        if ("errors" in program) {
            console.log("Post program-update-failed");
            this._webview.postMessage({
                type: "program-update-failed",
                errors: program.errors,
            } satisfies PreviewExtensionMessage);
        } else {
            console.log("Post program-updated");
            this._webview.postMessage({
                type: "program-updated",
                data: program,
            } satisfies PreviewExtensionMessage);
        }
    }

    /**
     * The HelloWorldPanel class private constructor (called only from the render method).
     *
     * @param panel A reference to the webview panel
     * @param extensionUri The URI of the directory containing the extension
     */
    constructor(panel: vscode.WebviewPanel, context: ExtensionContext) {
        this._panel = panel;

        const extensionUri = context.extensionUri;

        // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
        // the panel or when the panel is closed programmatically)
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._webview = panel.webview;

        this._webview.options = {
            // Enable JavaScript in the webview
            enableScripts: true,
            // Restrict the webview to only load resources from the `out` and `webviews/build/preview` directories
            localResourceRoots: [
                Uri.joinPath(extensionUri, "out/"),
                Uri.joinPath(extensionUri, "webviews/build/preview"),
            ],
        };

        // Set the HTML content for the webview panel
        this._panel.webview.html = this._getWebviewContent(
            this._panel.webview,
            extensionUri,
        );

        // Set an event listener to listen for messages passed from the webview context
        this._setWebviewMessageListener(this._panel.webview);

        // Watch the dist directory for changes; if any do, we reload all webviews
        const watcher = workspace.createFileSystemWatcher(
            new RelativePattern(extensionUri, "webviews/build/preview/*"),
        );
        const reloadWebViews = async () => {
            await commands.executeCommand(
                "workbench.action.webview.reloadWebviewAction",
            );

            var delayPromise = new Promise<void>((resolve) => {
                setTimeout(resolve, 500);
            });

            await delayPromise;
        };

        // React to changes in the dist directory
        watcher.onDidChange(reloadWebViews);
        watcher.onDidCreate(reloadWebViews);
        watcher.onDidDelete(reloadWebViews);
        this._disposables.push(watcher);
    }

    /**
     * Cleans up and disposes of webview resources when the webview panel is closed.
     */
    public dispose() {
        YarnSpinnerPreviewPanel.currentPanel = undefined;

        // Dispose of all disposables (i.e. commands) for the current webview panel
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    /**
     * Defines and returns the HTML that should be rendered within the webview panel.
     *
     * @remarks This is also the place where references to the React webview build files
     * are created and inserted into the webview HTML.
     *
     * @param webview A reference to the extension webview
     * @param extensionUri The URI of the directory containing the extension
     * @returns A template string literal containing the HTML that should be
     * rendered within the webview panel
     */
    private _getWebviewContent(webview: Webview, extensionUri: Uri) {
        // The CSS file from the React build output
        const stylesUri = getWebviewUri(webview, extensionUri, stylesAssetPath);
        // The JS file from the React build output
        const scriptUri = getWebviewUri(webview, extensionUri, scriptAssetPath);

        const nonce = getNonce();

        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Yarn Spinner Preview</title>
        </head>
        <body>
          <div id="root" data-vscode-context='{"preventDefaultContextMenuItems": true}'></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
    }

    /**
     * Sets up an event listener to listen for messages passed from the webview context and
     * executes code based on the message that is recieved.
     *
     * @param webview A reference to the extension webview
     * @param context A reference to the extension context
     */
    private _setWebviewMessageListener(webview: Webview) {
        webview.onDidReceiveMessage(() => {}, undefined, this._disposables);
    }
}
