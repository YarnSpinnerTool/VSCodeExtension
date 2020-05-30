/** Represents a node in the Yarn file */
export interface YarnNode {
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
export const createNodeText = ({ title, tags, body }: YarnNode): string =>
  `title: ${title}
tags: ${tags}
---
${body}
===`;

/**
 * Parse text back out into a node.
 * This is used when the node file being worked on changes.
 */
export const parseNodeText = (text: string): YarnNode => {
  const node: YarnNode = {
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
