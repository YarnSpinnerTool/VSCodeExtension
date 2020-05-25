# Yarn Spinner for Visual Studio Code

[Yarn Spinner](https://yarnspinner.dev) helps you build branching narrative and dialogue in games. It's easy for writers to use, and has powerful features for integrating your content straight into your game.

You can install this extension for Visual Studio Code from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=SecretLab.yarn-spinner).

This extension adds syntax highlighting support for Yarn Spinner code.

To learn more about Yarn Spinner, head to the [official site](https://yarnspinner.dev)!

This extension also has an embedded [YarnEditor](https://github.com/YarnSpinnerTool/YarnEditor) to make it easier to write Yarn scripts alongside your game.

When installed, clicking on a `.yarn` file in your file explorer will open it in the Yarn Editor.

This is done using a [webview](https://code.visualstudio.com/api/extension-guides/webview) with the [custom editor API](https://code.visualstudio.com/api/extension-guides/custom-editors).

## Activating the extension

If you open a `.yarn` file, it should automatically open in the editor. Saving in the editor will also save your `.yarn` file.

There is also a "Yarn Spinner: Start Yarn Editor" command that can be run via the command pallette (<kbd>F1</kbd>) to open an editor that will then let you open files outside of your workspace.

## FAQ

### I change my night mode setting but it gets reset when I open a new editor

By default, the Yarn Editor will pick up your Visual Studio Code theme and, if it's dark, enable night mode.

To override this, you'll have to set the "Yarn Spinner: Override Dark Theme Night Mode" (`yarnSpinner.overrideDarkThemeNightMode`) option to true for the extension.

This can be done by going to File -> Preferences -> Settings (or pressing <kbd>Ctrl</kbd> + <kbd>,</kbd>) and changing the setting for the extension.

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

### Project Layout

#### `YarnEditor`

This is a [Git Submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules) that links to the [YarnEditor repo](https://github.com/YarnSpinnerTool/YarnEditor).

When building the extension, YarnEditor is build first and its `dist` copied into the `out` folder (which the extension is built from). This is done by the `npm run yarneditor:build` command.

#### [`yarn-icon-theme.json`](./yarn-icon-theme.json)

This defines the "icon theme" that adds the Yarn logo to `.yarn` and `.yarn.txt` files.

This is referenced in the `contributes.iconThemes` section of [`package.json`](./package.json).

#### [`syntaxes/yarnspinner.tmLanguage.json`](./syntaxes/yarnspinner.tmLanguage.json) and [`language-configuration.json`](./language-configuration.json)

These two files define the syntax highlighting for the Yarn Spinner language.

These are referenced in `contributions.languages` and `contributions.grammars` in the [`package.json`](./package.json) file.

#### [`src/extension.ts`](./src/extension.ts)

This is the main entry point for the extension.

The `activate` function is called when the extension is activated; this is triggered by the `activationEvents` listed in the [`package.json`](./package.json) file. Specific activation events are listed below.

#### [`src/StartYarnEditorCommand.ts`](./src/StartYarnEditorCommand.ts) (`onCommand:yarnEditor.start` activation event)

This file exports a function that is used in [`extension.ts`](./src/extension.ts)'s `activate` function to register the `yarnSpinner.start` command.

`yarnSpinner.start` is defined in the `contibutes.commands` section of [`package.json`](./package.json) and is also listed in the `activationEvents` as an event that activates the extension (`onCommand:yarnSpinner.start`)

This is triggered when the user runs the "Start Yarn Spinner" command via the command palette (<kbd>Ctrl + Shift + P</kbd> or <kbd>F1</kbd>).

When run, this just opens up a webview with the YarnEditor in it. From there, the YarnEditor can be used to open, edit, export, etc. yarn files (this is basically the equivalent of the Electron app).

#### [`src/YarnEditorProvider`](./src/YarnEditorProvider.ts) (`onCustomEditor:yarnSpinner.editor` activation event)

This file exports a class that implements the `CustomTextEditorProvider` interface. It provides a [custom text editor](https://code.visualstudio.com/api/extension-guides/custom-editors) that can open yarn files in the VSCode workspace in the YarnEditor.

This class has a static `register` function that is used in [`extension.ts`](./src/extension.ts) to register the `yarnSpinner.editor` view type. This is defined in the `contributes.customEditors` section of [`package.json`](./package.json) and tied to `*.yarn` and `*.yarn.txt` files.

The `resolveCustomTextEditor` function in this class comes from the `CustomTextEditorProvider` interface and is called when opening a yarn file.

#### [`src/YarnEditorWebviewPanel`](./src/YarnEditorWebviewPanel.ts)

This is where the magic happens.

This file exports a function that, given a `WebviewPanel`, will render the YarnEditor.

If this is also passed a `TextDocument` (when opening a file using the `YarnEditorProvider`) it will also load the file into the editor, and disable/enable certain controls.

Loading the webview is done by reading in the `index.html` file from the YarnEditor and just shoving it onto the webview.

You'll notice that this also jumps through a lot of hoops to get the editor working properly; this is mainly because VSCode's webviews are _very_ limited in the resources they are able to access. See also the ["Loading local content"](https://code.visualstudio.com/api/extension-guides/webview#loading-local-content) section of the webview extension documentation. This basically has to change it so that anything grabbing resources from the `public` folder have to hit a special URI in the webview to work. It does this by doing a lot of crazy find-and-replaces in the HTML string. In theory that sounds awful but in practice it's fine.

See comments in the file for more information.
