# Yarn Spinner for Visual Studio Code

[Yarn Spinner](https://yarnspinner.dev) helps you build branching narrative and dialogue in games. It's easy for writers to use, and has powerful features for integrating your content straight into your game.

You can install this extension for Visual Studio Code from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=SecretLab.yarn-spinner).

This extension adds syntax highlighting support for Yarn Spinner code and an embedded [Yarn Editor](https://github.com/YarnSpinnerTool/YarnEditor) to make it easier to write Yarn scripts alongside your game.

To learn more about Yarn Spinner, head to the [official site](https://yarnspinner.dev)!

## Activating the extension

When installed, clicking on a `.yarn` file in your file explorer will open it in the Yarn Editor.

There is also a "Yarn Spinner: Start Yarn Editor" command that can be run via the command pallette (<kbd>F1</kbd>) to open an editor that will then let you open files outside of your workspace.

## FAQ

### How do I change my editor settings?

Editor settings can be configured via Visual Studio Code's [built-in settings mechanisms](https://code.visualstudio.com/docs/getstarted/settings).

_Note:_ The editor started with the "Start Yarn Spinner" command will allow you to open the Yarn Editor's built-in settings modal. Changes here will _not_ be persisted to your Visual Studio Code settings.

### How do I switch to editing in a text editor?

Click the "More Actions..." `...` in the top-right corner of the editor and select "Reopen With..." to switch between the Yarn Editor and the text editor.

---

## Contributing

### Getting started

Clone this repo and open it in Visual Studio Code.
Clone with the `--recurse-submodules` flag to automatically clone the `YarnEditor` submodule as well!

First, you'll need to run:

```sh
git submodule init && git submodule update && npm install && npm run yarneditor:build
```

This will check out the `YarnEditor` git submodule, build it, and copy its built files to the `out/dist` folder in this repo.

**Note:** When making changes to the `YarnEditor` folder, `npm run yarneditor:build` must be run for them to be pulled into the extension.

Then, in Visual Studio Code's "Run/Debug" window, click the play button next to "Run Extension" or just hit <kbd>F5</kbd>. This will open another instance of Visual Studio Code with the extension loaded.

### Helpful resources

This extension is done using a [webview](https://code.visualstudio.com/api/extension-guides/webview) with the [custom editor API](https://code.visualstudio.com/api/extension-guides/custom-editors). The VSCode docs are a great starting point before diving into this extension!

Particularly helpful when debugging is being able to [open the devtools for the webview](https://code.visualstudio.com/api/extension-guides/webview#inspecting-and-debugging-webviews).

### Releasing

#### Updating YarnEditor

YarnEditor is included via a [Git Submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules) that links to the [YarnEditor repo](https://github.com/YarnSpinnerTool/YarnEditor) repo.

To pull in the latest version of YarnEditor, run:

```sh
git submodule update --remote
```

This will point the git submodule to the latest commit in the YarnEditor repo (as defined in the `.gitmodules` file).

Pulling the submodule will also mark its reference as changed; the updated reference will need to be committed for this update to stick.

#### Cutting a release

- Bump up the `version` field in `package.json`
- Add a note to [`CHANGELOG.md`](./CHANGELOG.md) detailing the changes. This will show up in the extension's page.
- Commit your changes
- The [vsce tool](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) can be used to bundle and publish a release of the extension. YarnEditor will be built along with the extension via the `vscode:prepublish` script in `package.json`.

### Project Layout

#### `YarnEditor`

This is a [Git Submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules) that links to the [YarnEditor repo](https://github.com/YarnSpinnerTool/YarnEditor) repo.

When building the extension, YarnEditor is built first and its `dist` folder is copied into the `out` folder (which the extension is built from). This is done by the `npm run yarneditor:build` command.

#### [`syntaxes/yarnspinner.tmLanguage.json`](./syntaxes/yarnspinner.tmLanguage.json) and [`language-configuration.json`](./language-configuration.json)

These two files define the syntax highlighting for the Yarn Spinner language for the text editor.

These are referenced in `contributions.languages` and `contributions.grammars` in the [`package.json`](./package.json) file.

#### [`src/extension.ts`](./src/extension.ts)

This is the main entry point for the extension.

The `activate` function is called when the extension is activated; this is triggered by the `activationEvents` listed in the [`package.json`](./package.json) file. Specific activation events are listed below.

#### [`src/StartYarnEditorCommand.ts`](./src/StartYarnEditorCommand.ts) (`onCommand:yarnEditor.start` activation event)

This file exports a function that is used in [`extension.ts`](./src/extension.ts)'s `activate` function to register the `yarnSpinner.start` command.

`yarnSpinner.start` is defined in the `contibutes.commands` section of [`package.json`](./package.json) and is also listed in the `activationEvents` as an event that activates the extension (`onCommand:yarnSpinner.start`)

This is triggered when the user runs the "Start Yarn Spinner" command via the command palette (<kbd>Ctrl </kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> or <kbd>F1</kbd>).

When run, this opens up a webview with the YarnEditor in it. From there, the YarnEditor can be used to open, edit, export, etc. yarn files (this is basically the equivalent of the Electron app).

#### [`src/YarnEditorProvider`](./src/YarnEditorProvider.ts) (`onCustomEditor:yarnSpinner.editor` activation event)

This file exports a class that implements the `CustomTextEditorProvider` interface. It provides a [custom text editor](https://code.visualstudio.com/api/extension-guides/custom-editors) that can open yarn files that are in the current VSCode workspace in the YarnEditor.

This class has a static `register` function that is used in [`extension.ts`](./src/extension.ts) to register the `yarnSpinner.editor` view type. This view type is used in the `contributes.customEditors` section of [`package.json`](./package.json) and tied to `*.yarn` and `*.yarn.txt` files.

The `resolveCustomTextEditor` function in this class comes from the `CustomTextEditorProvider` interface and is called when opening a yarn file.

#### [`src/YarnEditorWebviewPanel`](./src/YarnEditorWebviewPanel.ts)

This is where the magic happens.

This file exports a function that, given a `WebviewPanel`, will render the YarnEditor.

If this is also passed a `TextDocument` (when opening a file using the `YarnEditorProvider`) it will also load the file into the editor, and disable/enable certain controls.

Loading the webview is done by reading in the `index.html` file from the YarnEditor and just shoving it onto the webview.

You'll notice that this also jumps through a lot of hoops to get the editor working properly; this is mainly because VSCode's webviews are _very_ limited in the resources they are able to access. See also the ["Loading local content"](https://code.visualstudio.com/api/extension-guides/webview#loading-local-content) section of the webview extension documentation. This basically has to change it so that anything grabbing resources from the `public` folder have to hit a special URI in the webview to work. It does this by doing a lot of crazy find-and-replaces in the HTML string.

See comments in the file for more information.

**Things this puts on `window`:**

- `window.editingVsCodeFile`: This will be `true` if we're editing a file that's in the VSCode workspace. If we're running via the "Start Yarn Editor" command, this will be `false`. In normal operation (i.e. the webapp) this will be `undefined`.
- `window.vsCodeApi`: This is an object acquired by calling `acquireVsCodeApi();` (which is a magic function added by the webview). This is used to call `window.vsCodeApi.postMessage({ type: "Whatever", payload: "Some Data"});` to pass messages from the editor to the extension. The main use for this is letting the extension know that the document that's being edited has changed.
- `window.getPublicVsCodeWebviewUri`: This is a function that can be passed a path and it will return a fully-qualified URI for a file that lives in the `YarnEditor/src/public` folder. This is needed in the editor to get fully-qualified paths.

#### [`src/YarnEditorMessageListener.ts`](./src/YarnEditorMessageListener.ts)

This file registers a message listener on the webview. The `YarnEditorWebviewPanel` will place a `window.vsCodeApi` object into the webview that can be used to send messages to the extension.

This is used mainly to let the extension know of changes to the currently open yarn file.
