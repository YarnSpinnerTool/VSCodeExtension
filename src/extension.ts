import { ExtensionContext } from "vscode";
import { unlink, FSWatcher } from "fs";

import StartYarnEditorCommand from "./StartYarnEditorCommand";
import YarnEditorProvider from "./YarnEditorProvider";

/**
 * If a node is opened in the VSCode text editor, we actually write it to a temporary file
 * that node watches. This list is to keep track of files we created so we can clean up after ourselves.
 */
const createdTemporaryFiles: { path: string; watcher: FSWatcher }[] = [];

/** Function called to track temporary files that are created */
const trackTemporaryFile = (path: string, watcher: FSWatcher) =>
  createdTemporaryFiles.push({ path, watcher });

/**
 * This is called when then extension is activated.
 * It will register "subscriptions" in the context that listen for
 * opening specific file types and commands.
 */
export const activate = (context: ExtensionContext) => {
  context.subscriptions.push(
    StartYarnEditorCommand(context, trackTemporaryFile),
    YarnEditorProvider.register(context, trackTemporaryFile)
  );
};

/**
 * The is called when the extension is de-activated.
 */
export const deactivate = () => {
  // un-watch and delete all of our temporary files
  for (const f of createdTemporaryFiles) {
    f.watcher.close();
    unlink(f.path, console.error);
  }
};
