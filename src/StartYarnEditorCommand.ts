import { ExtensionContext, commands, ViewColumn, window } from "vscode";
import { FSWatcher } from "fs";

import YarnEditorMessageListener from "./YarnEditorMessageListener";
import YarnEditorPanel from "./YarnEditorWebviewPanel";

/** Command to start a blank instance of the YarnEditor */
export default (
  context: ExtensionContext,
  trackTemporaryFile: (path: string, watcher: FSWatcher) => void
) =>
  // "yarnSpinner.start" here is mapped to this in package.json
  commands.registerCommand("yarnSpinner.start", () => {
    const panel = window.createWebviewPanel(
      "yarnSpinner",
      "Yarn Spinner",
      ViewColumn.One,
      {
        enableScripts: true, // enable javascript in the webview
        retainContextWhenHidden: true, // don't kill the editor when switching tabs
      }
    );

    YarnEditorMessageListener(panel, context, trackTemporaryFile);
    YarnEditorPanel(panel, context.extensionPath);
  });
