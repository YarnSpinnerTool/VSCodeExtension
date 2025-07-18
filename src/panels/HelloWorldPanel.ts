import {
    Disposable,
    Webview,
    WebviewPanel,
    window,
    Uri,
    ViewColumn,
    workspace,
    RelativePattern,
    commands,
    WebviewViewProvider,
    CancellationToken,
    WebviewView,
    WebviewViewResolveContext,
} from "vscode";
import { getNonce } from "../utilities/getNonce";
import { getWebviewUri } from "../utilities/getWebviewUri";

const stylesAssetPath = ["graph-view", "build", "assets", "index.css"];
const scriptAssetPath = ["graph-view", "build", "assets", "index.js"];

export class HelloWorldWebviewViewProvider implements WebviewViewProvider {
    private _extensionUri: Uri;

    public static readonly viewType = "yarnspinner.graph-view";

    constructor(extensionUri: Uri) {
        this._extensionUri = extensionUri;
    }

    resolveWebviewView(
        webviewView: WebviewView,
        context: WebviewViewResolveContext,
        token: CancellationToken,
    ): Thenable<void> | void {
        const panel = new HelloWorldPanel(webviewView, this._extensionUri);
    }
}

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
export class HelloWorldPanel {
    public static currentPanel: HelloWorldPanel | undefined;
    private readonly _view?: WebviewView;
    private readonly _webview?: Webview;
    private _disposables: Disposable[] = [];

    /**
     * The HelloWorldPanel class private constructor (called only from the render method).
     *
     * @param panel A reference to the webview panel
     * @param extensionUri The URI of the directory containing the extension
     */
    constructor(panel: WebviewView, extensionUri: Uri) {
        this._view = panel;

        // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
        // the panel or when the panel is closed programmatically)
        this._view.onDidDispose(() => this.dispose(), null, this._disposables);

        this._webview = panel.webview;

        this._webview.options = {
            // Enable JavaScript in the webview
            enableScripts: true,
            // Restrict the webview to only load resources from the `out` and `graph-view/build` directories
            localResourceRoots: [
                Uri.joinPath(extensionUri, "out"),
                Uri.joinPath(extensionUri, "graph-view/build"),
            ],
        };

        // Set the HTML content for the webview panel
        this._view.webview.html = this._getWebviewContent(
            this._view.webview,
            extensionUri,
        );

        // Set an event listener to listen for messages passed from the webview context
        this._setWebviewMessageListener(this._view.webview);

        // Watch the dist directory for changes; if any do, we reload all webviews
        const watcher = workspace.createFileSystemWatcher(
            new RelativePattern(extensionUri, "graph-view/build/*"),
        );
        commands.executeCommand("workbench.action.webview.reloadWebviewAction");
        const reloadWebViews = () =>
            commands.executeCommand(
                "workbench.action.webview.reloadWebviewAction",
            );

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
        HelloWorldPanel.currentPanel = undefined;

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
          <title>Hello World</title>
        </head>
        <body>
          <div id="root"></div>
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
        webview.onDidReceiveMessage(
            (message: any) => {
                const command = message.command;
                const text = message.text;

                switch (command) {
                    case "hello":
                        // Code that should run in response to the hello message command
                        window.showInformationMessage(text);
                        return;
                    // Add more switch case statements here as more webview message commands
                    // are created within the webview context (i.e. inside media/main.js)
                }
            },
            undefined,
            this._disposables,
        );
    }
}
