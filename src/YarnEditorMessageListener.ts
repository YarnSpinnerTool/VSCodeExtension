import {
  TextDocument,
  WebviewPanel,
  workspace,
  window,
  WorkspaceEdit,
  Range,
  ExtensionContext,
  ConfigurationChangeEvent,
} from "vscode";

import YarnEditorWebviewPanel from "./YarnEditorWebviewPanel";

/**
 * This will attach an event listener to the given webview that can receive
 * events sent to it via `window.vsCodeApi.postMessage` (which is created in YarnEditorWebviewPanel.ts)
 *
 * @param webviewPanel Panel to attach event listener to
 * @param document Document that webview is currently showing (undefined if showing an editor that's not looking at a document)
 */
export default (
  webviewPanel: WebviewPanel,
  context: ExtensionContext,
  document?: TextDocument
) => {
  webviewPanel.webview.onDidReceiveMessage((message) => {
    switch (message.command) {
      //sent whenever the document changes; the entire document will be sent in the event
      case "documentEdit":
        if (!document) {
          window.showErrorMessage("Tried to save without a document!");
          return;
        }

        // create a new edit that just replaces the whole document
        const edit = new WorkspaceEdit();
        edit.replace(
          document.uri,
          new Range(0, 0, (message.data as string).split("\n").length, 0),
          message.data
        );

        // this will mark the document as "dirty" in VSCode which will then handle saving etc.
        workspace.applyEdit(edit);
        break;

      // we override `window.alert` to send messages here in YarnEditorWebviewPanel
      case "alert":
        window.showWarningMessage(message.data);
        break;
      default:
        break;
    }
  });

  // listen to changes to the "yarnSpinner" configuration set
  // when this changes, we just reload the whole webview since that will set all the settings
  workspace.onDidChangeConfiguration((event: ConfigurationChangeEvent) => {
    if (event.affectsConfiguration("yarnSpinner")) {
      YarnEditorWebviewPanel(webviewPanel, context.extensionPath, document);
    }
  });
};
