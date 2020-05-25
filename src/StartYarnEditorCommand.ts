import { ExtensionContext, commands, ViewColumn, window, Uri } from "vscode";
import * as path from "path";

import YarnEditorMessageListener from "./YarnEditorMessageListener";
import YarnEditorPanel from "./YarnEditorWebviewPanel";

/** Command to start a blank instance of the YarnEditor */
export default (context: ExtensionContext) =>
  // "yarnSpinner.start" here is mapped to this in package.json
  commands.registerCommand("yarnSpinner.start", () => {
    const panel = window.createWebviewPanel(
      "yarnSpinner",
      "Yarn Spinner",
      ViewColumn.One,
      {
        enableScripts: true, // enable javascript in the webview
        localResourceRoots: [
          Uri.file(path.join(context.extensionPath, "out/dist")),
        ],
      }
    );

    YarnEditorMessageListener(panel);
    YarnEditorPanel(panel, context.extensionPath);
  });
