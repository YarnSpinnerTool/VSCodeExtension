import {
  ExtensionContext,
  CustomTextEditorProvider,
  TextDocument,
  WebviewPanel,
  Disposable,
  window,
} from "vscode";
import type { FSWatcher } from "fs";

import YarnEditorPanel from "./YarnEditorWebviewPanel";
import YarnEditorMessageListener from "./YarnEditorMessageListener";

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
  public static register(
    context: ExtensionContext,
    trackTemporaryFile: (path: string, watcher: FSWatcher) => void
  ): Disposable {
    const provider = new YarnEditorProvider(context, trackTemporaryFile);
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

  trackTemporaryFile: (path: string, watcher: FSWatcher) => void;

  constructor(
    context: ExtensionContext,
    trackTemporaryFile: (path: string, watcher: FSWatcher) => void
  ) {
    this.context = context;
    this.trackTemporaryFile = trackTemporaryFile;
  }

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

    YarnEditorMessageListener(
      webviewPanel,
      this.context,
      this.trackTemporaryFile,
      document
    );
    YarnEditorPanel(webviewPanel, this.context.extensionPath, document);
  }
}
