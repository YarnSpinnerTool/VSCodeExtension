# Change Log

## [Unreleased]

### Added

- Arrows between nodes now always leave a node at the bottom or the right edge, and enter at the top or left edge, which makes it easier to read the graph as a left-to-right flow.
- Code completion has been re-written, and should now be much faster and more reliable.

### Changed

### Removed

## [2.2.106]

### Added

- Added the ability to jump to the graph view from a text view, by clicking "Show in Graph View" above a node's title.
- Added the ability to select multiple nodes in the graph view.
  - To select nodes, click and drag inside the graph view.
  - To pan the view, hold the Alt key (Option on macOS) and click and drag inside the graph view, or click and drag the mousewheel.
- Added the ability to move multiple nodes at once in the graph view.
- Yarn preview text now includes any comments present in the source code.
- Increased the size of node previews, and made them a fixed size of 250x125. Preview text now wraps, and if it goes off the end of the node, it fades out as it reaches the bottom.
- Added the ability to visually group nodes in the graph view.
  - To group nodes together, add a `group` header to one or more nodes:

    <pre>
    title: NodeA
    <b>group: Cool Nodes</b>
    ---
    Lines here...
    ===
    title: NodeB
    <b>group: Cool Nodes</b>
    ---
    Lines here...
    ===
    </pre>

  - You can have as many groups in a document as you like, but each node can only be in a single group at a time.

### Changed

### Removed

## [2.2.77] 2022-10-31

### Added

- Added the ability to export a spreadsheet of all dialogue for voice-over recording.
  - Voice-over spreadsheets can be exported in either Microsoft Excel or CSV format.
  - By default, the spreadsheet contains the line ID, character name (where detected), and line text. Additional columns can be added in Settings.
- Added the ability to preview Yarn dialogue in the editor.
  - To use this feature, press `Control-Shift-P` (`Command-Shift-P` on macOS), and type "Preview Dialogue".
- Added the ability to save a self-contained HTML previewer of your Yarn dialogue.
  - To use this feature, press `Control-Shift-P` (`Command-Shift-P` on macOS), and type "Export Dialogue as HTML".
- Added the ability to save a graphical representation of the Yarn dialogue.
  - To use this feature, press `Control-Shift-P` (`Command-Shift-P` on macOS), and type "Export Dialogue as Graph".
  - Graphs are exported in [GraphViz format](https://www.graphviz.org). You will need additional software to be able to view these graphs.
- Added the ability to highlight a node with a colour.
  - To use this feature, add the `color` header to a node:

    <pre>
    title: MyNode
    <b>color: red</b>
    ---
    Lines here...
    ===
    </pre>

  - Valid colours are: `red`, `green`, `blue`, `orange`, `yellow`, and `purple`.
- The first few lines of a node will now be shown as a preview in the graph view.
- The graph view now starts centered on the first node in the file.
- Clicking 'Add Node' multiple times will now position each new node offset a little from the last, making it easier to see when you've added multiple new nodes.
- Added the ability to zoom in and out of the graph view using the scroll wheel (two-finger scroll on trackpads).
- Replaced the graph view's line-drawing algorithm with one that should be more stable.
- Nodes that don't have a `position` header set will appear stacked up in the graph view, which prevents a problem where it's unclear how many nodes you have in your document.

### Changed

- Adjusted the background color of the graph view to provide better contrast.
- Increased the width of the 'Jump to Node' dropdown to 200px.
- Fixed a bug where the graph view would not update when the Yarn file was changed on Windows.

## 2.2.15

### Added

- Added a setting that controls whether the language server is enabled or not. This feature was added for users who aren't using Yarn Spinner 2.0, but want features like syntax highlighting to work.
- Fixed an issue that caused the graph view and the language server to not load files correctly on Windows.

## 2.2.1

### Changed

- No code changes in this release from v2.2.0; this release exists only to update the readme on the VS Code page.

## 2.2.0

### Added

- Added a Language Server implementation for Yarn Spinner, which adds semantic highlighting, syntax and semantic error detection, code actions, go-to-refence, command detection, and other language features.
- This release of Yarn Spinner for Visual Studio Code adds telemetry that reports on errors that the extension encounters. For more information on what we collect, and how to turn it off, please see README.md.

## 2.0.0

### Added

- Support for detecting syntax errors in Yarn Spinner 2.0 source.
- A visual editor for creating, managing and deleting nodes.

## 1.1.0

### Added

- Support for highlighting Yarn Spinner v1.1's inline expressions and format functions.

## 1.0.0

- Initial release of this extension.

