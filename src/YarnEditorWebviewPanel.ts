import { WebviewPanel, Uri, TextDocument, workspace } from "vscode";
import { readFileSync, readdirSync } from "fs";
import { join as joinPath } from "path";

/**
 * Sets the HTML of the given webview panel to be the yarn editor.
 *
 * This wil also replace many file paths with generated URIs.
 * See also https://code.visualstudio.com/api/extension-guides/webview#loading-local-content
 *
 * @param document Document that is being opened. If this is undefined, it's assumed that we're opening a blank editor.
 * @param extensionPath Path that extension lives at; this comes from the context passed to the extension on creation.
 * @param document Text document that is being opened. Undefined if not opening a document.
 */
export default (
  panel: WebviewPanel,
  extensionPath: string,
  document?: TextDocument
) => {
  // load the built HTML file from YarnEditor
  let html = readFileSync(
    joinPath(extensionPath, "out", "dist", "index.html"),
    "utf8"
  );

  // patch JS and CSS paths to resolve properly for the extension
  html = replaceDistFiles(extensionPath, panel, html, "js");
  html = replaceDistFiles(extensionPath, panel, html, "css");

  // URI that points to public resources folder
  const publicResourceUri = panel.webview.asWebviewUri(
    Uri.file(joinPath(extensionPath, "out", "dist", "public"))
  );

  // replace any images, etc. that are pointing to "./public/" to point to our special URI
  html = html.replace(/\.\/public\//g, `${publicResourceUri.toString(true)}/`);

  // grab the yarnSpinner settings from VSCode
  // possible setting values are defined in the package.json file
  // these map to the same settings in YarnEditor/src/js/classes/settings.js
  // and are set in the inline script below
  const yarnSpinnerSettings = workspace.getConfiguration("yarnSpinner");

  // if "overrideDarkThemeNightMode" is set to true, then we use the "nightModeEnabled" value
  // otherwise, we automatically switch to night mode if the user has a "dark" VSCode theme
  const nightModeSetting = yarnSpinnerSettings.get("overrideDarkThemeNightMode")
    ? `e.app.settings.nightModeEnabled(${yarnSpinnerSettings.get(
        "nightModeEnabled"
      )});`
    : // If the user has a dark VSCode theme, the "body" of the iframe we're in will have this ".vscode-dark" class.
      `if ($('.vscode-dark').length) {
        e.app.settings.nightModeEnabled(true);
      }`;

  // Here, we add basic functions and changes that are always needed by YarnEditor
  // in order for it to run in the webview.
  // This is done by "replacing" the <head> tag with the <head> tag + a <script>.
  // This ensures that these scripts are run _before_ the editor is loaded.
  html = html.replace(
    "<head>",
    `<head>
      <script>
        // YarnEditor will send events to "window.parent" but that is undefined
        // in the VSCode webview; by default, browsers will usually set window.parent to window
        window.parent = window;

        // this lets the editor know we're in the VSCode extension and opening a file...
        // this is to get around a bug with the editor adding the "Start" node which was
        // breaking things (because of race conditions)
        window.openingVsCodeFile = ${!!document};

        // shove the VSCode API onto the window so it can be used to send events back to the extension
        // the "acquireVsCodeApi" function is magically injected into the page by the webview, and can only be called ONCE
        window.vsCodeApi = acquireVsCodeApi();

        // since the webview doesn't do anything when "alert" is called, we override it here to
        // send a message back to the extension; this is listened to in YarnEditorMessageListener
        window.alert = function(message) {
          window.vsCodeApi.postMessage({
            command: 'alert',
            data: message
          });
        };

        // used by YarnEditor to get paths to public resources
        // see also YarnEditor/src/js/classes/utils.js "getPublicPath" function
        window.getPublicVsCodeWebviewUri = function(path) {
          if (path) {
            return "${publicResourceUri}/" + path;
          } else {
            return "${publicResourceUri}";
          }
        }

        // when the editor is ready, we apply all of the settings from the VSCode extension settings
        window.addEventListener("yarnReady", function(e) {
          // note that strings are quoted, and booleans/numbers are not
          e.app.settings.theme("${yarnSpinnerSettings.get("theme")}");
          e.app.settings.language("${yarnSpinnerSettings.get("language")}");
          e.app.settings.redrawThrottle(${yarnSpinnerSettings.get(
            "redrawThrottle"
          )});
          e.app.settings.spellcheckEnabled(${yarnSpinnerSettings.get(
            "spellcheckEnabled"
          )});
          e.app.settings.completeTagsEnabled(${yarnSpinnerSettings.get(
            "completeTagsEnabled"
          )});
          e.app.settings.completeWordsEnabled(${yarnSpinnerSettings.get(
            "completeWordsEnabled"
          )});
          e.app.settings.createNodesEnabled(${yarnSpinnerSettings.get(
            "createNodesEnabled"
          )});
          e.app.settings.markupLanguage("${yarnSpinnerSettings.get(
            "markupLanguage"
          )}");

          ${nightModeSetting}

          e.app.settings.apply();
        });
      </script>`
  );

  // If we have a document, we change some UI elements and load the document into the editor when it's done loading
  // This is triggered by the `yarnReady` event that it sends out once loaded.
  if (document) {
    // TODO detect .json, .twee, etc. ???
    html = html.replace(
      "<head>",
      `<head>
      <script>
      window.addEventListener("yarnReady", function(e) {
        // since we're editing a specific file, don't show the main menu
        // VSCode handles opening, saving, settings, etc.
        $(".app-menu").empty();

        // this all mimic's the YarnEditor's 'data.openFile' function
        e.data.editingName("${document.fileName}");
        e.data.editingType("yarn");

        // this is a trick to safely load the code from the file...
        // first, we URI encode it (so that i.e. " turns into %22)
        // and then we URI decode it on the other side.
        e.data.loadData(decodeURIComponent("${encodeURIComponent(
          document.getText()
        )}"), "yarn", true);
        e.app.refreshWindowTitle("${document.fileName}");
      });
      </script>`
    );
  }

  // and finally, actually set the webview HTML to be our munged HTML
  panel.webview.html = html;
};

/**
 * Replaces the source of tags in the HTML with generated URIs from the webview.
 * This needs to be done since the webview can only load resources with the proper URI scheme.
 * See https://code.visualstudio.com/api/extension-guides/webview#loading-local-content for more info.
 *
 * @param extensionPath Extension path, from context
 * @param panel Webview panel, sued to get webview URIs
 * @param html HTML string to replace
 * @param fileType File type to replace with new URIs. This will look in `out/dist/${fileType}`.
 *  This also assumes that in the HTML, the file type is prefixed with this fileType (i.e. "css/0.css" in the HTML will be replaced)
 * @returns HTML with dist files replaced
 */
const replaceDistFiles = (
  extensionPath: string,
  panel: WebviewPanel,
  html: string,
  fileType: string
): string => {
  let newHtml = html;

  readdirSync(joinPath(extensionPath, "out", "dist", fileType)).forEach(
    (file) => {
      // this will have a file scheme of "vscode-resource:"
      const uri = panel.webview.asWebviewUri(
        Uri.file(joinPath(extensionPath, "out", "dist", fileType, file))
      );

      newHtml = newHtml.replace(
        new RegExp(`${fileType}/${file}`, "g"),
        uri.toString(true) // the "true" here tells this not to encode the URI (which turns i.e. "C:" into "C%3A" which breaks things)
      );
    }
  );

  return newHtml;
};
