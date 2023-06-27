// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import TelemetryReporter from '@vscode/extension-telemetry';

import * as languageClient from "vscode-languageclient/node";

import { Trace } from "vscode-jsonrpc/node";

import { YarnSpinnerEditorProvider } from './editor';
import * as fs from 'fs';
import { EventEmitter } from 'vscode';
import { CompilerOutput, DidChangeNodesNotification, DidRequestNodeInGraphViewParams } from './nodes';

import { DidChangeNodesParams, VOStringExport } from './nodes';
import { YarnPreviewPanel } from './preview';
import { LanguageClient } from 'vscode-languageclient/node';
import { ChildProcess, spawn } from 'child_process';

const isDebugMode = () => process.env.VSCODE_DEBUG_MODE === "true";

const languageServerPath = process.env.LANGUAGESERVER_DLL_PATH ?? "out/server/YarnLanguageServer.dll"

let reporter: TelemetryReporter;

let client: LanguageClient;
let server: ChildProcess;

export type YarnData = {
    stringTable: { [key: string]: string },
    programData: number[]
}

export function isStandaloneYarnSpinnerEditor() {
    if (vscode.env.appName === "Yarn Spinner") {
        return true;
    } else {
        return false;
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

    // Fetch the setting that indicates whether we should enable the language
    // server or not.
    var configs = vscode.workspace.getConfiguration("yarnspinner");
    const enableLanguageServer = configs.get("EnableLanguageServer");

    // Get necessary info about this version of the extension from our
    // package.json data
    let extensionID = `${context.extension.packageJSON.publisher}.${context.extension.packageJSON.name}`;
    let extensionVersion = `${context.extension.packageJSON.version}`;
    let telemetryKey = context.extension.packageJSON.telemetryKey;

    // Create a new TelemetryReporter, and register it to be disposed when the extension shuts down
    reporter = new TelemetryReporter(extensionID, extensionVersion, telemetryKey);
    context.subscriptions.push(reporter);

    // Notify that we've started the session!
    reporter.sendTelemetryEvent(
        "sessionStart",
        { "languageServerStatus": enableLanguageServer ? "enabled" : "disabled" }
    );

    const outputChannel = vscode.window.createOutputChannel("Yarn Spinner");

    if (enableLanguageServer) {
        // The language server is enabled. Launch it!
        launchLanguageServer(context, configs, outputChannel);        
    } else {
        // The language server is not enabled. 
        outputChannel.appendLine("Launching without language server enabled.");
        
        // Register an implementation for the 'show-graph' command that tells
        // the user that the feature is not available.

        // Create the command to open a new visual editor for the active document
        context.subscriptions.push(vscode.commands.registerCommand("yarnspinner.show-graph", () => {
            vscode.window.showWarningMessage("Yarn Spinner Language Server is not enabled. Turn it on in the settings to enable the Graph View.", "Show Settings").then(selection => {
                if (selection === undefined) {
                    // The message was dismissed; nothing to do
                    return;
                } else {
                    // The user clicked the only button, which was 'Show
                    // Settings'; show the settings for the extension
                    vscode.commands.executeCommand("workbench.action.openSettings", "@ext:secretlab.yarn-spinner");
                }
            })
        }));
    }
}

async function launchLanguageServer(context: vscode.ExtensionContext, configs: vscode.WorkspaceConfiguration, outputChannel: vscode.OutputChannel) {
    
    const waitForDebugger = false;
    
    let languageServerOptions: languageClient.ServerOptions =
    async (): Promise<ChildProcess> => {
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
        
            
        
            const languageServerExe = dotnetPath;
            const absoluteLanguageServerPath = path.resolve(context.asAbsolutePath(languageServerPath));
        
            if (fs.existsSync(absoluteLanguageServerPath) == false) {
                reporter.sendTelemetryErrorEvent("missingLanguageServer", { "path": languageServerPath }, {}, ["path"]);
                throw new Error(`Failed to launch language server: no file exists at ${languageServerPath}`);
            }
            server = spawn(languageServerExe, [
                absoluteLanguageServerPath,
                ...([isDebugMode() ? "--waitForDebugger" : ""])
            ]);
        
            if (isDebugMode()) {
                vscode.window.showInformationMessage(`Started language server: ${absoluteLanguageServerPath} - PID ${server.pid}`);
            }
            return server;
        }
    // {
    //     run: {
    //         command: languageServerExe,
    //         args: [languageServerPath],
    //         transport: languageClient.TransportKind.stdio,
    //     },
    //     debug: {
    //         command: languageServerExe,
    //         args: [languageServerPath, waitForDebugger ? "--waitForDebugger" : ""],
    //         transport: languageClient.TransportKind.stdio,
    //     },
    // };

    let languageClientOptions: languageClient.LanguageClientOptions = {
        initializationFailedHandler: (error) => {
            reporter.sendTelemetryErrorEvent("initializationFailed", error);
            // Do not attempt to reinitalise the server (we could cause an
            // infinite loop if we did.)
            vscode.window.showErrorMessage("Language server initialization failed");
            return false;
        },
        errorHandler: {
            error(error, message, count) {
                reporter.sendTelemetryException(error);
                vscode.window.showErrorMessage("Language server error");
                return { action: languageClient.ErrorAction.Continue };
            },
            closed: () => {
                reporter.sendTelemetryErrorEvent("serverConnectionClosed");
                if (isDebugMode()) {
                    return { action: languageClient.CloseAction.DoNotRestart };
                } else {
                    return { action: languageClient.CloseAction.Restart }
                }
            }
        },
        outputChannel: outputChannel,
        documentSelector: [
            {scheme: "file", language: "yarnspinner" }
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
    const onDidRequestNodeInGraphView = new EventEmitter<DidRequestNodeInGraphViewParams>();

    client = new languageClient.LanguageClient(
        "yarnspinner", // id
        "Yarn Spinner", // name
        languageServerOptions,
        languageClientOptions,
        true // force into debug mode
    );

    // Hook the handleFailedRequest method of our LanguageClient so that we can
    // fire off telemetry every time a request fails (which indicates an error
    // inside the language server.)
    // Get the original method..
    let defaultHandleFailedRequest = client.handleFailedRequest;

    // Wrap a call to it in a new method that also sends the telemetry
    function loggingHandleFailedRequest<T>(type: languageClient.MessageSignature, token : vscode.CancellationToken, error: any, defaultValue: T): T {
        reporter.sendTelemetryException(error, { "method": type.method });
        vscode.window.showErrorMessage("LSP Error: " + error);
        return defaultHandleFailedRequest(type, token, error, defaultValue);
    }

    // And patch the language client so that it calls our hooked version!
    client.handleFailedRequest = loggingHandleFailedRequest;

    client.setTrace(Trace.Verbose);

    
    
    await client.start().catch(error => {
        reporter.sendTelemetryErrorEvent("failedLaunchingLanguageServer", { "serverError": error }, {}, ["serverError"]);
        
        outputChannel.appendLine("Failed to launch the language server! " + JSON.stringify(error));
        vscode.window.showErrorMessage("Failed to launch the Yarn Spinner language server!", "Show Log").then(result => {
            if (result === undefined) {
                // Error was dismissed; nothing to do
            } else {
                // Show the log
                outputChannel.show(true);
            }
        });
    })
    context.subscriptions.push(client);

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
    context.subscriptions.push(YarnSpinnerEditorProvider.register(context, client, onDidChangeNodes.event, onDidRequestNodeInGraphView.event));

    // We have to use our own command in order to get the parameters parsed, before passing them into the built in showReferences command.
    async function yarnShowReferences(rawTokenPosition: vscode.Position, rawReferenceLocations: vscode.Location[]) {
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
    
    async function yarnShowNodeInGraphView(uri: string, nodeName: string) {

        // Ensure that a graph view is open with this URI before firing the
        // 'show the node' event

        if (isStandaloneYarnSpinnerEditor()) {
            // Work around a bug in the standalone editor's app shell where
            // opening a custom editor in a specific column puts it in a failing
            // state
            await vscode.commands.executeCommand("vscode.openWith", vscode.Uri.parse(uri), YarnSpinnerEditorProvider.viewType);
        } else {
            // Open the editor in the column beside us
            await vscode.commands.executeCommand("vscode.openWith", vscode.Uri.parse(uri), YarnSpinnerEditorProvider.viewType, vscode.ViewColumn.Beside);
        }

        // Fire the event and let the (possibly just-opened) editor that we want
        // to show the node
        onDidRequestNodeInGraphView.fire({ uri: uri, nodeName: nodeName });
    }

    context.subscriptions.push(vscode.commands.registerCommand('yarn.showNodeInGraphView', yarnShowNodeInGraphView));

    // Create the command to open a new visual editor for the active document
    context.subscriptions.push(vscode.commands.registerCommand("yarnspinner.show-graph", () => {
        vscode.commands.executeCommand("vscode.openWith", vscode.window.activeTextEditor?.document.uri, YarnSpinnerEditorProvider.viewType, vscode.ViewColumn.Beside);
    }));

    // recording strings extraction command
    context.subscriptions.push(vscode.commands.registerCommand("yarnspinner.extract", () => {

        var configs = vscode.workspace.getConfiguration("yarnspinner");
        let format = configs.get<string>("extract.format");
        let columns = configs.get<string[]>("extract.columns");
        let defaultName = configs.get<string>("extract.defaultCharacter");
        let useChars = configs.get<boolean>("extract.includeCharacters");

        const params: languageClient.ExecuteCommandParams = {
            command: "yarnspinner.extract-spreadsheet",
            arguments: [
                vscode.window.activeTextEditor?.document.uri,
                format,
                columns,
                defaultName,
                useChars
            ]
        };

        // doing some sanity checks and potentially bailing out before if needed
        // format can only be csv or xlsx
        if (!format)
        {
            vscode.window.showErrorMessage(`Unable to export sheet, no format is configured`);
            return;
        }
        if (!(format == "csv" || format == "xlsx"))
        {
            vscode.window.showErrorMessage(`Unable to export sheet, format must be either "csv" or "xlsx"`);
            return;
        }
        // columns must include a minimum of id and text
        if (!columns)
        {
            vscode.window.showErrorMessage(`Unable to export sheet, no columns are configured`);
            return;
        }
        if (!(columns.includes("id") && columns.includes("text")))
        {
            vscode.window.showErrorMessage(`Unable to export sheet, the columns must include at least "id" and "text"`);
            return;
        }

        let request: Promise<VOStringExport> = client.sendRequest(languageClient.ExecuteCommandRequest.type, params);
        request.then(result => {
            if (result.errors.length == 0)
            {
                // the LS base64 encodes the bytearray so we need to reverse
                // that before we can use it
                let dataString = result.file as any;
                let data = Buffer.from(dataString, "base64");

                let defaultURI = vscode.Uri.joinPath(getDefaultUri(), `lines.${format}`);

                vscode.window.showSaveDialog({
                    defaultUri: defaultURI
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
                                vscode.window.showInformationMessage(`Strings written to ${path}`);
                            }
                        });
                    }
                });
            }
            else
            {
                vscode.window.showErrorMessage(`Unable to compile your story, you have ${result.errors.length} errors.\nCheck the Problems for details.`);
            }
        }).catch(error =>{
            vscode.window.showErrorMessage("Error in the language server: " + error.toString());
        });
    }));

    // perform a compilation and preview the output in an interactive manner
    context.subscriptions.push(vscode.commands.registerCommand("yarnspinner.showPreview", () => {

        let compileResult: Promise<YarnData | null> = compileWorkspace(client);
        
        compileResult.then(result => {

            if (result) {
                YarnPreviewPanel.createOrShow(context.extensionUri, result);
            }
            else
            {
                vscode.window.showErrorMessage(`Unable to compile your story.\nCheck the Problems for details.`);
            }
        }).catch(error => {
            vscode.window.showErrorMessage("Error showing preview: " + error.toString());
        });
    }));

    // perform a compilation and save the output to a file
    context.subscriptions.push(vscode.commands.registerCommand("yarnspinner.exportPreview", () => {

        let compileResult: Promise<YarnData | null> = compileWorkspace(client);
        
        compileResult.then(result => {

            if (result) {
                var html = YarnPreviewPanel.generateHTML(result, context.extensionUri, false);
                YarnPreviewPanel.saveHTML(html);
            }
            else
            {
                vscode.window.showErrorMessage(`Unable to compile your story.\nCheck the Problems for details.`);
            }
        }).catch(error => {
            vscode.window.showErrorMessage("Error saving preview: " + error.toString());
        });
    }));

    // ask the LSP to make a graph file and then save that
    // recording strings extraction command
    context.subscriptions.push(vscode.commands.registerCommand("yarnspinner.graph", () => {

        var configs = vscode.workspace.getConfiguration("yarnspinner");
        let format = configs.get<string>("graph.format");
        let clustering = configs.get<boolean>("graph.clustering");

        if (!(format == "dot" || format == "mermaid"))
        {
            vscode.window.showErrorMessage(`Unable to export graph, no format is configured`);
            return;
        }
        if (clustering == undefined)
        {
            vscode.window.showErrorMessage(`Unable to export graph, no clustering rule is configured`);
            return;
        }

        const params: languageClient.ExecuteCommandParams = {
            command: "yarnspinner.create-graph",
            arguments: [
                vscode.window.activeTextEditor?.document.uri,
                format,
                clustering
            ]
        };

        let request: Promise<string> = client.sendRequest(languageClient.ExecuteCommandRequest.type, params);
        request.then(result => {

            let fileForamt = format == "dot" ? "dot" : "mmd";
            let defaultURI = vscode.Uri.joinPath(getDefaultUri(), `graph.${fileForamt}`);
            vscode.window.showSaveDialog({
                defaultUri: defaultURI
            }).then((uri: vscode.Uri | undefined) => {
                if (uri)
                {
                    const path = uri.fsPath;
                    fs.writeFile(path, result, (error) => {
                        if (error)
                        {
                            vscode.window.showErrorMessage(`Unable to write to file ${path}`, error.message);
                        }
                        else
                        {
                            vscode.window.showInformationMessage(`Graph file saved to ${path}`);
                        }
                    });
                }
            });
        }).catch(error =>{
            vscode.window.showErrorMessage("Error in the language server: " + error.toString());
        });
    }));
}

async function compileWorkspace(client: languageClient.LanguageClient): Promise<YarnData | null> {
    const params: languageClient.ExecuteCommandParams = {
        command: "yarnspinner.compile",
        arguments: [vscode.window.activeTextEditor?.document.uri.toString()]
    };

    let result: CompilerOutput = await client.sendRequest(languageClient.ExecuteCommandRequest.type, params);

    if (result.errors.length > 0) {
        return null;
    }
    
    let dataString = result.data as any; // turns out the server base64 encodes it

    let yarnData : YarnData = {
        programData: Buffer.from(dataString, "base64").toJSON().data,
        stringTable: result.stringTable
    };

    return yarnData;
}

export function getDefaultUri(): vscode.Uri {
    // Are any workspaces open?
    if (vscode.workspace.workspaceFolders) {
        // Yes, one at least one is. Choose the workspace that the currently
        // open document is in, if one is available.
        if (vscode.window.activeTextEditor) {
            let workspaceURI = vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri);

            if (workspaceURI) {
                return workspaceURI.uri;
            }
        } else {
            // We don't know the workspace of the currently active text editor.
            // Return the directory of the _first_ workspace instead.
            return vscode.workspace.workspaceFolders[0].uri;
        }
    }
    // As a fallback, return an empty Uri.
    return vscode.Uri.file('');
}

async function stopServer(): Promise<void> {
    await client.stop();
    server.kill();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
    return stopServer();
}
