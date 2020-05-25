// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext } from "vscode";

import StartYarnEditorCommand from "./StartYarnEditorCommand";
import { YarnEditorProvider } from "./YarnEditorProvider";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export const activate = (context: ExtensionContext) => {
  context.subscriptions.push(
    StartYarnEditorCommand(context),
    YarnEditorProvider.register(context)
  );
};

// this method is called when your extension is deactivated
export const deactivate = () => {};
