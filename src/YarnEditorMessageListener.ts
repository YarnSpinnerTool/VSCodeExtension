import { TextDocument, WebviewPanel, workspace, window } from "vscode";
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
      // this gets sent by "trySaveCurrent" in YarnEditor's data.js
      case "save":
        if (!document) {
          window.showErrorMessage("Tried to save without a document!");
          return;
        }

        writeFile(document.fileName, message.data, (e) => {
          if (e) {
            window.showErrorMessage(
              `Error writing ${document.fileName}\n${e.message}`
            );
          } else {
            window.showInformationMessage(`Saved ${document.fileName}`);
          }
        });
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
