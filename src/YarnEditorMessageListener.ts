import {
  TextDocument,
  WebviewPanel,
  workspace,
  window,
  WorkspaceEdit,
  Range,
} from "vscode";
import { writeFile } from "fs";

/**
 * This will attach an event listener to the given webview that can receive
 * events sent to it via `window.vsCodeApi.postMessage` (which is created in YarnEditorWebviewPanel.ts)
 *
 * @param webviewPanel Panel to attach event listener to
 * @param document Document that webview is currently showing (undefined if showing an editor that's not looking at a document)
 */
export default (webviewPanel: WebviewPanel, document?: TextDocument) =>
  webviewPanel.webview.onDidReceiveMessage((message) => {
    switch (message.command) {
      case "documentEdit":
        console.log("documentEdit", message.data);
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

        workspace.applyEdit(edit);
        break;

      // we override `window.alert` to send messages here in YarnEditorWebviewPanel
      case "alert":
        window.showWarningMessage(message.data);
        break;

      case "changeSetting":
        // triggered whenever the user changes a setting in the YarnEditor's settings window
        const { option, newValue } = message.data;

        const yarnSpinnerSettings = workspace.getConfiguration("yarnSpinner");

        // if "overrideDarkThemeNightMode" is not true, we ignore saving "nightModeEnabled"
        if (
          yarnSpinnerSettings.get("overrideDarkThemeNightMode") === false &&
          option === "nightModeEnabled"
        ) {
          break;
        }

        // these always come back as strings, but sometimes we want a boolean or a number...
        // we try to parse it as JSON to get the proper data type and if that fails, we just use the value (since it's probably a string)
        let parsedValue;
        try {
          parsedValue = JSON.parse(newValue);
        } catch (e) {
          parsedValue = newValue;
        }

        // if the value has changed, save it
        if (yarnSpinnerSettings.get(option) !== parsedValue) {
          yarnSpinnerSettings.update(option, parsedValue);
        }

        break;
      default:
        break;
    }
  });
