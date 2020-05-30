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
import type { Node } from "./Node";
import {
  createTemporaryFileForNode,
  trackTemporaryFile,
} from "./TemporaryFiles";

/** Types of messages that can be sent from the editor to the extension */
export enum YarnEditorMessageTypes {
  /** Sent whenever the document changes; the entire document will be sent in the event */
  DocumentEdit = "DocumentEdit",

  /** We override `window.alert` to send messages to the extension's event listener */
  Alert = "Alert",

  /** Called when a node is being opened in a VSCode text editor */
  OpenNode = "OpenNode",
}

/** A message sent from the editor to the extension */
interface EditorMessage {
  /** The type of the message */
  type: YarnEditorMessageTypes;

  /** The payload of the message */
  payload: any;
}

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
  // messages sent with "window.vsCodeApi.postMessage({ type: string, payload: string });" from the editor will end up here
  webviewPanel.webview.onDidReceiveMessage(
    ({ type, payload }: EditorMessage) => {
      switch (type) {
        case YarnEditorMessageTypes.DocumentEdit:
          if (!document) {
            window.showErrorMessage("Tried to save without a document!");
            return;
          }

          // create a new edit that just replaces the whole document
          // this will mark the document as "dirty" in VSCode which will then handle saving etc.
          const edit = new WorkspaceEdit();
          edit.replace(
            document.uri,
            new Range(0, 0, payload.split("\n").length, 0),
            payload
          );
          workspace.applyEdit(edit);
          break;

        case YarnEditorMessageTypes.Alert:
          window.showWarningMessage(payload);
          break;

        case YarnEditorMessageTypes.OpenNode:
          // this will create a temporary file and add a file watcher on it
          // when the file changes, a message is sent back to the editor
          const temporaryFile = createTemporaryFileForNode(
            payload as Node,
            webviewPanel.webview,
            document
          );

          // and open it in the editor
          workspace
            .openTextDocument(temporaryFile.path)
            .then((doc) =>
              window.showTextDocument(doc, { preserveFocus: true })
            );

          break;
        default:
          break;
      }
    }
  );

  // listen to changes to the "yarnSpinner" configuration set
  // when this changes, we just reload the whole webview since that will set all the settings
  workspace.onDidChangeConfiguration((event: ConfigurationChangeEvent) => {
    if (event.affectsConfiguration("yarnSpinner")) {
      YarnEditorWebviewPanel(webviewPanel, context.extensionPath, document);
    }
  });
};
