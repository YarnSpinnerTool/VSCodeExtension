import {
  ExtensionContext,
  CancellationToken,
  CustomTextEditorProvider,
  TextDocument,
  WebviewPanel,
  Disposable,
  window,
  workspace,
} from "vscode";

import YarnEditorPanel from "./YarnEditorWebviewPanel";
import { writeFile } from "fs";

export class YarnEditorProvider implements CustomTextEditorProvider {
  /**
   * This is used to trigger calling this on certain file types.
   * See package.json where this is used.
   */
  private static readonly viewType = "yarnSpinner.editor";

  /** Register a YarnEditor provider in the extension context. */
  public static register(context: ExtensionContext): Disposable {
    const provider = new YarnEditorProvider(context);
    const providerRegistration = window.registerCustomEditorProvider(
      YarnEditorProvider.viewType,
      provider,
      {
        webviewOptions: {
          // this makes it so that when the tab loses context, it doesn't re-create it
          retainContextWhenHidden: true,
        },
      }
    );
    return providerRegistration;
  }

  context: ExtensionContext;

  constructor(context: ExtensionContext) {
    this.context = context;
  }

  /**
   * This is from the CustomTextEditorProvider interface and will be called
   * whenever we're opening a .yarn (or other supported) file with the extension
   */
  public resolveCustomTextEditor(
    document: TextDocument,
    webviewPanel: WebviewPanel,
    token: CancellationToken
  ) {
    webviewPanel.webview.options = {
      enableScripts: true,
    };

    webviewPanel.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        // this gets sent by "trySaveCurrent" in YarnEditor's data.js
        case "save":
          writeFile(document.fileName, message.data, (e) => {
            if (e) {
              window.showErrorMessage(`Error writing ${document.fileName}\n${e.message}`);
            } else {
              window.showInformationMessage(`Saved ${document.fileName}`);
            }
          });
          break;

        // we override `window.alert` to send messages here in YarnEditorWebviewPanel
        case "alert":
          window.showWarningMessage(message.data);
          break;

        case "changeSetting":
          // triggered whenever the user changes a setting in the YarnEditor's settings window
          const { option, newValue } = message.data;

          const yarnSpinnerSettings = workspace.getConfiguration("yarnSpinner");

          // if "overrideDarkThemeNightMode" is not true, we ignore saving "nightModeEnabled"
          if (yarnSpinnerSettings.get("overrideDarkThemeNightMode") === false && option === "nightModeEnabled") {
            break;
          }

          // these always come back as strings, but sometimes we want a boolean or a number...
          // we try to parse it as JSON to get the proper data type and if that fails, we just use the value (since it's probably a string)
          let parsedValue;
          try {
            parsedValue = JSON.parse(newValue);
          } catch (e) {
            parsedValue = newValue;
          }

          // if the value has changed, save it
          if (yarnSpinnerSettings.get(option) !== parsedValue) {
            yarnSpinnerSettings.update(option, parsedValue);          
          }

          break;
        default:
          break;
      }
    });

    YarnEditorPanel(webviewPanel, this.context.extensionPath, document);
  }
}
