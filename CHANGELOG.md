# Change Log

## [Unreleased]

### Added

- A command to export a spreadsheet of all dialogue for VO recording. Can be configured in settings to control the columns, export format and a few other bits and pieces.
- Added the ability to preview Yarn dialogue in the editor.
- Added the ability to save a self-contained HTML previewer of your Yarn dialogue.
- Added the ability to save a graphical representation of the Yarn dialogue.
- Added the ability to highlight a node with a colour.
  - To use this feature, add the `color` header to a node:

    ```
    title: MyNode
    color: red
    ---
    Lines here...
    ===
    ```

  - Valid colours are: `red`, `green`, `blue`, `orange`, `yellow`, and `purple`.
- Added the ability to preview the first few lines of a node in the graph view.
- The graph view now starts centered on the first node in the file.
- Clicking 'Add Node' multiple times will now position each new node offset a little from the last, making it easier to see when you've added multiple new nodes.
- Added the ability to zoom in and out of the graph view using the scroll wheel (two-finger scroll on trackpads).
- Replaced the graph view's line-drawing algorithm with one that should be more stable.

### Changed

- Adjusted the background color of the graph view to provide better contrast.
- Increased the width of the 'Jump to Node' dropdown to 200px.
- Fixed a bug where the graph view would not update when the Yarn file was changed on Windows.

### Removed

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

