import { Webview, workspace, TextDocument, window, Uri } from "vscode";
import { join } from "path";
import { tmpdir } from "os";
import { createHash } from "crypto";
import {
  writeFileSync,
  watch,
  mkdirSync,
  FSWatcher,
  readFile,
  unlink,
} from "fs";
import sanitizeFileName from "sanitize-filename";

import type { Node } from "./Node";
import { createNodeText, parseNodeText } from "./Node";

export interface TemporaryFile {
  /** Full path to this temporary file */
  path: string;

  /** File watcher that's watching for changes (to send them back to the editor) */
  watcher: FSWatcher;

  /** If we have a yarn file open, this will be the file this node is in */
  document?: TextDocument;
}

/**
 * If a node is opened in the VSCode text editor, we write it to a temporary file that node.js watches.
 * This list is to keep track of files we created so we can clean up after ourselves.
 */
export let createdTemporaryFiles: TemporaryFile[] = [];

/** Function called to track temporary files that are created */
export const trackTemporaryFile = (temporaryFile: TemporaryFile) =>
  createdTemporaryFiles.push(temporaryFile);

/**
 * Delete all temporary files that were created between when the extension was activated and now.
 */
export const deleteAllTemporaryFiles = () =>
  // un-watch and delete all of our temporary files
  createdTemporaryFiles.forEach((tmpFile) => {
    tmpFile.watcher.close();
    unlink(tmpFile.path, console.error);
  });

/**
 * Un-watch any watchers that are tied to a specific text document.
 * This is used for when the text document is closed; we also delete the folder containing these.
 * @param document Document to un-watch
 */
export const unwatchTemporaryFilesForDocument = (document: TextDocument) => {
  createdTemporaryFiles.forEach((tmpFile) => {
    if (tmpFile.document === document) {
      tmpFile.watcher.close();
    }
  });

  // remove the temporary file from out tracked files, so that when the extension de-activates we don't try to delete it
  createdTemporaryFiles = createdTemporaryFiles.filter(
    (tmpFile) => tmpFile.document === document
  );
};

/**
 * Returns the temporary folder to use for node editing documents.
 * Node.js `fs.tmpdir` method is used to get the root temporary directory.
 *
 * This will look like: "{tmpdir}/yarnSpinner/{workspace name}/{MD5 hash of document URI}"
 * @param document Document to create hash for, if we have one
 */
export const getTemporaryFolderPath = (document?: TextDocument) => {
  const documentHash = document
    ? createHash("md5").update(document.uri.toString()).digest("hex")
    : "";
  const workspaceName = workspace.name ? sanitizeFileName(workspace.name) : "";

  return join(tmpdir(), "yarnSpinner", workspaceName, documentHash);
};

/**
 * Create a temporary file for a YarnEditor node.
 *
 * This will also add a file watcher to the temporary file that will send messages back to the yarn editor whenever the file changes.
 *
 * @param node Node to create temporary file for
 * @param webview Webview to post message to when temporary file changes
 * @param document Document to associate temporary file with, if we have one
 * @returns Object with the temporary file path and the file watcher
 */
export const createTemporaryFileForNode = (
  node: Node,
  webview: Webview,
  document?: TextDocument
): TemporaryFile => {
  const tmpFolder = getTemporaryFolderPath(document);

  try {
    // make sure our temp directory exists
    mkdirSync(tmpFolder, { recursive: true });

    const tmpFilePath = join(
      tmpFolder,
      `${sanitizeFileName(node.title)}${
        document ? "" : `.${new Date().getTime()}` // if we don't have a document, we add the current date in millis to guarantee a unique file name
      }.yarn.node` // .yarn.node files are syntax highlighted
    );

    writeFileSync(tmpFilePath, createNodeText(node));

    // watch the temporary file
    // whenever it changes, we send a message back to the editor...
    // ... which then sends a message back to the extension with the updated document ha
    const watcher = watchTemporaryFileAndUpdateEditorOnChanges(
      tmpFilePath,
      node,
      webview
    );

    const temporaryFile: TemporaryFile = {
      path: tmpFilePath,
      watcher,
      document,
    };

    trackTemporaryFile(temporaryFile);

    return temporaryFile;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/**
 * Watch a temporary file and send a message to the given webview whenever it changes.
 *
 * @param tmpFilePath Full path to temporary file
 * @param originalNodeTitle The original title of the node being edited, in case it changes
 * @param webview Webview to send message to when file changes
 */
const watchTemporaryFileAndUpdateEditorOnChanges = (
  tmpFilePath: string,
  originalNode: Node,
  webview: Webview
): FSWatcher =>
  watch(tmpFilePath, () =>
    readFile(tmpFilePath, "utf8", (error, data) => {
      if (error) {
        console.error(
          `Error reading temporary node file ${tmpFilePath}`,
          error
        );
      } else {
        const updatedNode = parseNodeText(data);

        // sometimes this will get triggered before writing the file
        if (updatedNode.title.trim().length > 0) {
          webview.postMessage({
            type: "UpdateNode",
            payload: {
              // the user could have potentially changed the title of the node in the editor
              // we send along the original title here so the editor knows which one to update
              originalNodeTitle: originalNode.title,
              ...updatedNode,
            },
          });

          // if the node's title has changed, update the original node's title so that
          // if the user makes another change, the editor changes the proper node
          if (originalNode.title !== updatedNode.title) {
            originalNode.title = updatedNode.title;
          }
        }
      }
    })
  );
