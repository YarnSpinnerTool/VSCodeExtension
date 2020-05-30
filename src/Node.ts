import { Webview, window } from "vscode";
import { join } from "path";
import { tmpdir } from "os";
import {
  writeFileSync,
  watch,
  mkdirSync,
  FSWatcher,
  readFile,
} from "fs";
import sanitizeFileName from "sanitize-filename";

/** Represents a node in the Yarn file */
export interface Node {
  /**
   * The title of the node
   * Note that this is also the primary identifier for the node.
   */
  title: string;

  /** Space-separated list of tags for the node */
  tags: string;

  /** Actual text of the node */
  body: string;
}

/**
 * Create text to display in a text editor for one specific node.
 * This is used in the case of opening a node in the VSCode text editor.
 * 
 * The --- and === are required for the node to be considered valid.
 */
const createNodeText = ({ title, tags, body }: Node): string =>
  `title: ${title}
tags: ${tags}
---
${body}
===`;

/**
 * Parse text back out into a node.
 * This is used when the node file being worked on changes.
 */
const parseNodeText = (text: string): Node => {
  const node: Node = {
    title: "",
    tags: "",
    body: "",
  };

  let readingBody = false;

  const lines = text.split("\n");

  // this is essentially a copy-pasta of what's in YarnEditor's data.js loadData function
  for (let i = 0; i < lines.length; i++) {
    if (readingBody && lines[i] !== "===") {
      node.body += `${lines[i]}\n`;
    } else {
      if (lines[i].indexOf("title:") > -1) {
        node.title = lines[i].substr(7, lines[i].length - 7);
      } else if (lines[i].indexOf("tags:") > -1) {
        node.tags = lines[i].substr(6, lines[i].length - 6);
      } else if (lines[i].trim() == "---") {
        readingBody = true;
      }
    }
  }

  node.body = node.body.trim();

  return node;
};

/**
 * Create a temporary file for a YarnEditor node.
 * This will create the file at {tmpdir}/yarnSpinner/{node.title}-{date}.yarn.node
 *
 * This will also add a file watcher to the temporary file that will send messages back to the yarn editor whenever the file changes.
 *
 * @param node Node to create temporary file for
 * @param webview Webview to post message to when temporary file changes
 * @returns Object with the temporary file path and the file watcher
 */
export const createTemporaryFileForNode = (
  node: Node,
  webview: Webview
): { path: string; watcher: FSWatcher } => {
  try {
    // make sure tmp/yarnSpinner directory exists
    mkdirSync(join(tmpdir(), "yarnSpinner"), { recursive: true });

    const tmpFilePath = join(
      tmpdir(),
      "yarnSpinner",
      `${sanitizeFileName(node.title)}.${Date.now()}.yarn.node` // add the current date to ensure a unique file
    ); // .yarnNode files are syntax highlighted

    writeFileSync(tmpFilePath, createNodeText(node));

    // watch the temporary file
    // whenever it changes, we send a message back to the editor...
    // ... which then sends a message back to the extension with the updated document ha
    const watcher = watchTemporaryFileAndUpdateEditorOnChanges(
      tmpFilePath,
      node,
      webview
    );

    return {
      path: tmpFilePath,
      watcher,
    };
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
        window.showErrorMessage(
          `Error reading temporary node file\n${error.message}`
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
