// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import TelemetryReporter from '@vscode/extension-telemetry';

import * as languageClient from "vscode-languageclient/node";

import { Trace } from "vscode-jsonrpc";

import { YarnSpinnerEditorProvider } from './editor';
import * as fs from 'fs';
import { EventEmitter } from 'vscode';
import { CompilerOutput, DidChangeNodesNotification } from './nodes';

import { DidChangeNodesParams } from './nodes';

const isDebugMode = () => process.env.VSCODE_DEBUG_MODE === "true";

let reporter: TelemetryReporter;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

    // Get necessary info about this version of the extension from our
    // package.json data
    let extensionID = `${context.extension.packageJSON.publisher}.${context.extension.packageJSON.name}`;
    let extensionVersion = `${context.extension.packageJSON.version}`;
    let telemetryKey = context.extension.packageJSON.telemetryKey;

    // Create a new TelemetryReporter, and register it to be disposed when the extension shuts down
    reporter = new TelemetryReporter(extensionID, extensionVersion, telemetryKey);
    context.subscriptions.push(reporter);

    // Notify that we've started the session!
    reporter.sendTelemetryEvent("sessionStart");
	
	// Ensure .net 6.0 is installed and available
    interface IDotnetAcquireResult {
        dotnetPath: string;
	}
	
	const dotnetAcquisition = await vscode.commands.executeCommand<IDotnetAcquireResult>('dotnet.acquire', { version: '6.0', requestingExtensionId: 'yarn-spinner' });
	
    const dotnetPath = dotnetAcquisition?.dotnetPath ?? null;
    if (!dotnetPath) {
        reporter.sendTelemetryErrorEvent("cantAcquireDotNet");
		throw new Error('Can\'t load the language server: Failed to acquire .NET!');
    }

    const outputChannel = vscode.window.createOutputChannel("Yarn Spinner");
    

    const languageServerExe = dotnetPath;
    const languageServerPath =
        isDebugMode() ?
            path.resolve(context.asAbsolutePath("LanguageServer/LanguageServer/bin/Debug/net6.0/YarnLanguageServer.dll")) :
			path.resolve(context.asAbsolutePath("out/server/YarnLanguageServer.dll"));

    if (fs.existsSync(languageServerPath) == false) {
        reporter.sendTelemetryErrorEvent("missingLanguageServer", { "path": languageServerPath }, {}, ["path"]);
		throw new Error(`Failed to launch language server: no file exists at ${languageServerPath}`);
    }
    
    const waitForDebugger = false

    let languageServerOptions: languageClient.ServerOptions = {
        run: {
            command: languageServerExe,
            args: [languageServerPath],
            transport: languageClient.TransportKind.pipe,
        },
        debug: {
            command: languageServerExe,
            args: [languageServerPath, waitForDebugger ? "--waitForDebugger" : ""],
            transport: languageClient.TransportKind.pipe,
            runtime: "",
        },
    };

    var configs = vscode.workspace.getConfiguration("yarnspinner");
    let languageClientOptions: languageClient.LanguageClientOptions = {
        initializationFailedHandler: (error) => {
            reporter.sendTelemetryErrorEvent("initializationFailed", error);
            // Do not attempt to reinitalise the server (we could cause an
            // infinite loop if we did.)
            return false;
        },
        errorHandler: {
            error: (error, _message, _count) => {
                reporter.sendTelemetryException(error);
                return languageClient.ErrorAction.Continue;
            },
            closed: () => {
                reporter.sendTelemetryErrorEvent("serverConnectionClosed");
                return languageClient.CloseAction.Restart;
            }
        },
        outputChannel: outputChannel,
        documentSelector: [
            "**/*.yarn"
        ],
        initializationOptions: [
            configs,
        ],
        traceOutputChannel: outputChannel,
        progressOnInitialization: true,
        synchronize: {
            // configurationSection is deprecated but means we can use the same
            // code for vscode and visual studio (which doesn't support the
            // newer workspace/configuration endpoint)
            
            configurationSection: 'yarnspinner',
			fileEvents: [
				vscode.workspace.createFileSystemWatcher("**/*.yarn"),
				vscode.workspace.createFileSystemWatcher("**/*.cs"),
				vscode.workspace.createFileSystemWatcher("**/*.ysls.json")
			],
        },
    };

    const onDidChangeNodes = new EventEmitter<DidChangeNodesParams>();

    const client = new languageClient.LanguageClient("yarnspinner", "Yarn Spinner", languageServerOptions, languageClientOptions);

    // Hook the handleFailedRequest method of our LanguageClient so that we can
    // fire off telemetry every time a request fails (which indicates an error
    // inside the language server.)

    // Get the original method..
    let defaultHandleFailedRequest = client.handleFailedRequest;

    // Wrap a call to it in a new method that also sends the telemetry
    function loggingHandleFailedRequest<T>(type: languageClient.MessageSignature, error: any, defaultValue: T): T {
        reporter.sendTelemetryException(error, { "method": type.method });
        return defaultHandleFailedRequest(type, error, defaultValue);
    }

    // And patch the language client so that it calls our hooked version!
    client.handleFailedRequest = loggingHandleFailedRequest;

    client.trace = Trace.Verbose;
    
    client.onReady().then(() => {

        // The language server is ready.

        // Register to be notified when the server reports that nodes have
        // changed in a file. We'll use that to notify all visual editors.
        const onNodesChangedSubscription = client.onNotification(DidChangeNodesNotification.type, (params) => {
            onDidChangeNodes.fire(params);
        });
        context.subscriptions.push(onNodesChangedSubscription);

        // Register our visual editor provider. We do this after waiting to hear
        // that the server is ready so that editors know that they're ok to
        // communicate with the server.
        context.subscriptions.push(YarnSpinnerEditorProvider.register(context, client, onDidChangeNodes.event));
    }).catch((error) => {

        reporter.sendTelemetryErrorEvent("failedLaunchingLanguageServer", { "serverError": error }, {}, ["serverError"]);

        outputChannel.appendLine("Failed to launch the language server! " + JSON.stringify(error))
        vscode.window.showErrorMessage("Failed to launch the Yarn Spinner language server!", "Show Log").then(result => {
            if (result === undefined) {
                // Error was dismissed; nothing to do
            } else {
                // Show the log
                outputChannel.show(true);
            }
        })
    });

    let disposableClient = client.start();
    // deactivate client on extension deactivation
    context.subscriptions.push(disposableClient);

    // We have to use our own command in order to get the parameters parsed, before passing them into the built in showReferences command.
    async function yarnShowReferences(rawTokenPosition : vscode.Position, rawReferenceLocations : vscode.Location[]) {
        var tokenPosition = new vscode.Position(rawTokenPosition.line, rawTokenPosition.character);
        var referenceLocations = rawReferenceLocations.map(rawLocation => {
            return new vscode.Location(
                vscode.Uri.parse(rawLocation.uri.toString()),
                new vscode.Range(
                    new vscode.Position(
                        rawLocation.range.start.line,
                        rawLocation.range.start.character),
                    new vscode.Position(
                        rawLocation.range.end.line,
                        rawLocation.range.end.character)));
        });

        

        const activeTextEditor = vscode.window.activeTextEditor;

        if (activeTextEditor) {
            vscode.commands.executeCommand('editor.action.showReferences', activeTextEditor.document.uri, tokenPosition, referenceLocations);
        }
    }

    context.subscriptions.push(vscode.commands.registerCommand('yarn.showReferences', yarnShowReferences));

    // Create the command to open a new visual editor for the active document
    context.subscriptions.push(vscode.commands.registerCommand("yarnspinner.show-graph", () => {
        vscode.commands.executeCommand("vscode.openWith", vscode.window.activeTextEditor?.document.uri, YarnSpinnerEditorProvider.viewType, vscode.ViewColumn.Beside);
    }));
    
    context.subscriptions.push(vscode.commands.registerCommand("yarnspinner.compile", () => {
        const params: ExecuteCommandParams = {
            command: "yarnspinner.compile",
            arguments: [vscode.window.activeTextEditor?.document.uri.toString()]
        };
    
        let compileRequest: Promise<CompilerOutput> = client.sendRequest(ExecuteCommandRequest.type, params);
        compileRequest.then(result => {
            if (result.errors.length == 0)
            {
                let dataString = result.data as any; // turns out the server base64 encodes it
                let array = JSON.stringify(Buffer.from(dataString, "base64").toJSON().data);
                let strings = JSON.stringify(result.stringTable);
                YarnPreviewPanel.createOrShow(context.extensionUri, strings, array);
            }
            else
            {
                vscode.window.showErrorMessage(`Unable to compile your story, you have ${result.errors.length} errors.\nCheck the Problems for details.`);
            }
        }).catch(error => {
            vscode.window.showErrorMessage("Error in the language server", error);
        });
    }));
}

class YarnPreviewPanel {
    public static currentPanel: YarnPreviewPanel | undefined;

    public static readonly viewType = 'yarnPreview';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;

    public static createOrShow(extensionUri: vscode.Uri, stringsTable: string, program: string) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        // If we already have a panel, show it.
        if (YarnPreviewPanel.currentPanel) {
            YarnPreviewPanel.currentPanel.update(program, stringsTable);
            YarnPreviewPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(YarnPreviewPanel.viewType, 'Dialogue Preview', column || vscode.ViewColumn.One, YarnPreviewPanel.getWebviewOptions(extensionUri),);
        
        panel.webview.onDidReceiveMessage((message) => { // this is currently an any, bind it to something later Tim!
            switch (message.command)
            {
                case "save-story":
                {
                    YarnPreviewPanel.saveHTML(YarnPreviewPanel.generateHTML(program, stringsTable, extensionUri, false));
                    break;
                }
            }
        });

        YarnPreviewPanel.currentPanel = new YarnPreviewPanel(panel, extensionUri, stringsTable, program);
    }

    private static saveHTML(data: string)
    {
        vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file("story.html")
        }).then((uri: vscode.Uri | undefined) => {
            if (uri)
            {
                const path = uri.fsPath;
                fs.writeFile(path, data, (error) => {
                    if (error)
                    {
                        vscode.window.showErrorMessage(`Unable to write to file ${path}`, error.message);
                    }
                    else
                    {
                        vscode.window.showInformationMessage(`Story written to ${path}`);
                    }
                });
            }
        });
    }
     
    private static getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions
    {
        return {
            // Enable javascript in the webview
            enableScripts: true,
    
            // And restrict the webview to only loading content from our extension's `media` directory.
            // localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
        };
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, stringsTable: string, program: string)
    {
		this._panel = panel;
        this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this.update(program, stringsTable);
	}

    public update(program: string, table: string)
    {
        let html = YarnPreviewPanel.generateHTML(program, table, this._extensionUri, true);

        this._panel.webview.html = html;
    }
    
    private static generateHTML(program: string, table: string, extensionURI: vscode.Uri, includeSaveOption: boolean): string
    {
        const scriptPathOnDisk = vscode.Uri.joinPath(extensionURI, 'src', 'webview.txt');
        let contents = fs.readFileSync(scriptPathOnDisk.fsPath, 'utf-8');

        let saveButton = '<button onclick="save()">Export Story</button>\n';

        var html = contents.replace("TABLEMARKER", table);
        html = html.replace("DATAMARKER", program);
        html = html.replace("SAVEMARKER", includeSaveOption == true ? saveButton : "");
        // if we are in the vscode preview don't do this because it appears anyways for some reason
        html = html.replace("JSTESTMARKER", includeSaveOption == false ? "<noscript>This story requires JS enabled to run, sorry.</noscript>" : "");
        return html;
    }
}
