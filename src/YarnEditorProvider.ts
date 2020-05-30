import {
  ExtensionContext,
  CustomTextEditorProvider,
  TextDocument,
  WebviewPanel,
  Disposable,
  window,
  workspace,
} from "vscode";
import rimraf from "rimraf";

import YarnEditorPanel from "./YarnEditorWebviewPanel";
import YarnEditorMessageListener from "./YarnEditorMessageListener";
import {
  getTemporaryFolderPath,
  unwatchTemporaryFilesForDocument,
} from "./TemporaryFiles";

/**
 * This is a custom text editor provider that will open up `.yarn` files in the Yarn Editor.
 */
export default class YarnEditorProvider implements CustomTextEditorProvider {
  /**
   * This is used to trigger calling this on certain file types.
   * See package.json where this is used.
   */
  private static readonly viewType = "yarnSpinner.editor";

  /** Register a YarnEditor provider in the extension context. */
  public static register(context: ExtensionContext): Disposable {
    const provider = new YarnEditorProvider(context);
    const providerRegistration = window.registerCustomEditorProvider(
      YarnEditorProvider.viewType,
      provider,
      {
        webviewOptions: {
          // this makes it so that when the tab loses context, it doesn't re-create it
          retainContextWhenHidden: true,
        },
      }
    );
    return providerRegistration;
  }

  context: ExtensionContext;

  constructor(context: ExtensionContext) {
    this.context = context;
  }

  /**
   * Called when the given document is closed in the workspace
   */
  onDocumentClosed = (document: TextDocument) => {
    // first, close any file watchers we have open for this document
    unwatchTemporaryFilesForDocument(document);

    // delete the temporary folder that we created to edit nodes
    // this folder isn't guaranteed to actually exist
    const temporaryFolderPath = getTemporaryFolderPath(document);
    rimraf(temporaryFolderPath, (e) => {
      if (e) {
        console.error(
          `Error cleaning up temporary directory ${temporaryFolderPath} when closing ${document.uri.toString()}`,
          e
        );
      }
    });
  };

  /**
   * This is from the CustomTextEditorProvider interface and will be called
   * whenever we're opening a .yarn (or other supported) file with the extension
   */
  public resolveCustomTextEditor(
    document: TextDocument,
    webviewPanel: WebviewPanel
  ) {
    webviewPanel.webview.options = {
      enableScripts: true,
    };

    // track when the document that we're editing is closed
    workspace.onDidCloseTextDocument((e) => {
      if (e.uri === document.uri) {
        this.onDocumentClosed(document);
      }
    });

    YarnEditorMessageListener(webviewPanel, this.context, document);
    YarnEditorPanel(webviewPanel, this.context.extensionPath, document);
  }
}
