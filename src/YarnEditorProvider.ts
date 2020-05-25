import {
  ExtensionContext,
  CancellationToken,
  CustomTextEditorProvider,
  TextDocument,
  WebviewPanel,
  Disposable,
  window,
} from "vscode";

import YarnEditorPanel from "./YarnEditorWebviewPanel";
import YarnEditorMessageListener from "./YarnEditorMessageListener";

/**
 * This is a custom text provider that will open up `.yarn` files in the Yarn Editor.
 */
export class YarnEditorProvider implements CustomTextEditorProvider {
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
   * This is from the CustomTextEditorProvider interface and will be called
   * whenever we're opening a .yarn (or other supported) file with the extension
   */
  public resolveCustomTextEditor(
    document: TextDocument,
    webviewPanel: WebviewPanel,
    token: CancellationToken
  ) {
    webviewPanel.webview.options = {
      enableScripts: true,
    };

    // this will listen for events from the editor
    YarnEditorMessageListener(webviewPanel, document);

    // this actually renders the editor
    YarnEditorPanel(webviewPanel, this.context.extensionPath, document);
  }
}
