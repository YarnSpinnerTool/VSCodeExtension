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
import { join } from "path";
import { tmpdir } from "os";
import { writeFileSync, watch, readFileSync, mkdirSync, FSWatcher } from "fs";

import YarnEditorWebviewPanel from "./YarnEditorWebviewPanel";

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
  trackTemporaryFile: (path: string, watcher: FSWatcher) => void,
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
          const {
            nodeName,
            nodeText,
          }: { nodeName: string; nodeText: string } = payload;

          try {
            // create a temporary file and write it to disk
            mkdirSync(join(tmpdir(), "yarnSpinner"), { recursive: true }); // make sure tmp/yarnSpinner directory exists
            const tmpFilePath = join(
              tmpdir(),
              "yarnSpinner",
              `${nodeName}-${Date.now()}.yarn.node` // add the current date to ensure a unique file
            ); // .yarnNode files are syntax highlighted
            writeFileSync(tmpFilePath, nodeText);

            // watch the temporary file
            // whenever it changes, we send a message back to the editor...
            // ... which then sends a message back to the extension with the updated document
            const watcher = watch(tmpFilePath, () => {
              webviewPanel.webview.postMessage({
                type: "UpdateNode",
                payload: {
                  nodeName,
                  nodeText: readFileSync(tmpFilePath, "utf8"),
                },
              });
            });

            // this function is used to keep track of files that we create during this
            // extension's lifetime; these are cleaned up when the extension deactivates
            trackTemporaryFile(tmpFilePath, watcher);

            // and open it in the editor
            workspace
              .openTextDocument(tmpFilePath)
              .then(window.showTextDocument);
          } catch (e) {
            console.error(e);
          }

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
