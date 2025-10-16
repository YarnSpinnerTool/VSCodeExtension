// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import TelemetryReporter from "@vscode/extension-telemetry";
import { ChildProcess, spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { unescape } from "querystring";
import * as vscode from "vscode";
import { EventEmitter } from "vscode";
import { Trace } from "vscode-jsonrpc/node";
import * as languageClient from "vscode-languageclient/node";
import { LanguageClient } from "vscode-languageclient/node";

import { YarnSpinnerEditorProvider } from "./editor";
import {
    CompilerOutput,
    DidChangeNodesNotification,
    DidRequestNodeInGraphViewParams,
    MetadataEntry,
} from "./nodes";
import { DidChangeNodesParams, VOStringExport } from "./nodes";
import { YarnSpinnerGraphViewProvider } from "./panels/YarnSpinnerGraphView";
import { YarnSpinnerPreviewPanel } from "./panels/YarnSpinnerPreviewPanel";
import { YarnPreviewPanel } from "./preview";

const isDebugMode = () => process.env.VSCODE_DEBUG_MODE === "true";

const languageServerPath =
    process.env.LANGUAGESERVER_DLL_PATH ?? "out/server/YarnLanguageServer.dll";

let reporter: TelemetryReporter;

let client: LanguageClient;
let server: ChildProcess;

export type YarnData = {
    programData: string;
    stringTable: Record<string, string>;
    metadata: Record<string, MetadataEntry>;
};

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
    reporter = new TelemetryReporter(
        extensionID,
        extensionVersion,
        telemetryKey,
    );
    context.subscriptions.push(reporter);

    // Notify that we've started the session!
    reporter.sendTelemetryEvent("sessionStart", {
        languageServerStatus: enableLanguageServer ? "enabled" : "disabled",
    });

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
        context.subscriptions.push(
            vscode.commands.registerCommand("yarnspinner.show-graph", () => {
                vscode.window
                    .showWarningMessage(
                        "Yarn Spinner Language Server is not enabled. Turn it on in the settings to enable the Graph View.",
                        "Show Settings",
                    )
                    .then((selection) => {
                        if (selection === undefined) {
                            // The message was dismissed; nothing to do
                            return;
                        } else {
                            // The user clicked the only button, which was 'Show
                            // Settings'; show the settings for the extension
                            vscode.commands.executeCommand(
                                "workbench.action.openSettings",
                                "@ext:secretlab.yarn-spinner",
                            );
                        }
                    });
            }),
        );
    }
}

async function launchLanguageServer(
    context: vscode.ExtensionContext,
    configs: vscode.WorkspaceConfiguration,
    outputChannel: vscode.OutputChannel,
) {
    const waitForDebugger = false;

    let languageServerOptions: languageClient.ServerOptions =
        async (): Promise<ChildProcess> => {
            // Ensure .net 9.0 is installed and available
            interface IDotnetAcquireResult {
                dotnetPath: string;
            }

            let dotnetAcquisition: IDotnetAcquireResult;

            try {
                dotnetAcquisition =
                    await vscode.commands.executeCommand<IDotnetAcquireResult>(
                        "dotnet.acquire",
                        {
                            version: "9.0",
                            requestingExtensionId: "yarn-spinner",
                        },
                    );
            } catch (err) {
                vscode.window.showErrorMessage(
                    "Error acquiring .NET: " + (err as any).toString(),
                );
                throw err;
            }

            const dotnetPath = dotnetAcquisition?.dotnetPath ?? null;
            if (!dotnetPath) {
                reporter.sendTelemetryErrorEvent("cantAcquireDotNet");
                throw new Error(
                    "Can't load the language server: Failed to acquire .NET!",
                );
            }
            const languageServerExe = dotnetPath;
            const absoluteLanguageServerPath = path.resolve(
                context.asAbsolutePath(languageServerPath),
            );

            if (fs.existsSync(absoluteLanguageServerPath) == false) {
                reporter.sendTelemetryErrorEvent(
                    "missingLanguageServer",
                    { path: languageServerPath },
                    {},
                    ["path"],
                );
                throw new Error(
                    `Failed to launch language server: no file exists at ${languageServerPath}`,
                );
            }
            server = spawn(languageServerExe, [
                absoluteLanguageServerPath,
                ...[isDebugMode() ? "--waitForDebugger" : ""],
                "--launched-from-extension",
            ]);

            const launchMessage = `Started language server: ${absoluteLanguageServerPath} - PID ${server.pid}`;
            if (isDebugMode()) {
                vscode.window.showInformationMessage(launchMessage);
            } else {
                outputChannel.appendLine(launchMessage);
            }
            return server;
        };
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
            vscode.window.showErrorMessage(
                "Language server initialization failed",
            );
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
                    return { action: languageClient.CloseAction.Restart };
                }
            },
        },
        outputChannel: outputChannel,
        documentSelector: [{ scheme: "file", language: "yarnspinner" }],
        initializationOptions: [configs],
        traceOutputChannel: outputChannel,
        progressOnInitialization: true,
        synchronize: {
            // configurationSection is deprecated but means we can use the same
            // code for vscode and visual studio (which doesn't support the
            // newer workspace/configuration endpoint)
            configurationSection: "yarnspinner",
            fileEvents: [
                vscode.workspace.createFileSystemWatcher("**/*.yarn"),
                vscode.workspace.createFileSystemWatcher("**/*.cs"),
                vscode.workspace.createFileSystemWatcher("**/*.ysls.json"),
                vscode.workspace.createFileSystemWatcher("**/*.yarnproject"),
            ],
        },
    };

    const onDidChangeNodes = new EventEmitter<DidChangeNodesParams>();
    const onDidRequestNodeInGraphView =
        new EventEmitter<DidRequestNodeInGraphViewParams>();

    client = new languageClient.LanguageClient(
        "yarnspinner", // id
        "Yarn Spinner", // name
        languageServerOptions,
        languageClientOptions,
        true, // force into debug mode
    );

    // Hook the handleFailedRequest method of our LanguageClient so that we can
    // fire off telemetry every time a request fails (which indicates an error
    // inside the language server.)
    // Get the original method..
    let defaultHandleFailedRequest = client.handleFailedRequest;

    // Wrap a call to it in a new method that also sends the telemetry
    function loggingHandleFailedRequest<T>(
        type: languageClient.MessageSignature,
        token: vscode.CancellationToken,
        error: any,
        defaultValue: T,
    ): T {
        reporter.sendTelemetryException(error, { method: type.method });
        vscode.window.showErrorMessage("LSP Error: " + error);
        return defaultHandleFailedRequest(type, token, error, defaultValue);
    }

    // And patch the language client so that it calls our hooked version!
    client.handleFailedRequest = loggingHandleFailedRequest;

    client.setTrace(Trace.Verbose);

    await client.start().catch((error) => {
        reporter.sendTelemetryErrorEvent(
            "failedLaunchingLanguageServer",
            { serverError: error },
            {},
            ["serverError"],
        );

        outputChannel.appendLine(
            "Failed to launch the language server! " + JSON.stringify(error),
        );
        vscode.window
            .showErrorMessage(
                "Failed to launch the Yarn Spinner language server!",
                "Show Log",
            )
            .then((result) => {
                if (result === undefined) {
                    // Error was dismissed; nothing to do
                } else {
                    // Show the log
                    outputChannel.show(true);
                }
            });
    });
    context.subscriptions.push(client);

    // The language server is ready.

    // Register to be notified when the server reports that nodes have
    // changed in a file. We'll use that to notify all visual editors.
    const onNodesChangedSubscription = client.onNotification(
        DidChangeNodesNotification.type,
        (params) => {
            onDidChangeNodes.fire(params);
        },
    );
    context.subscriptions.push(onNodesChangedSubscription);

    // Register our visual editor provider. We do this after waiting to hear
    // that the server is ready so that editors know that they're ok to
    // communicate with the server.
    context.subscriptions.push(
        YarnSpinnerEditorProvider.register(
            context,
            client,
            onDidChangeNodes.event,
            onDidRequestNodeInGraphView.event,
        ),
    );

    // Register our graph view provider.
    const graphViewProvider = new YarnSpinnerGraphViewProvider(
        context,
        client,
        onDidChangeNodes.event,
    );
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            YarnSpinnerGraphViewProvider.viewType,
            graphViewProvider,
        ),
    );

    // We have to use our own command in order to get the parameters parsed, before passing them into the built in showReferences command.
    async function yarnShowReferences(
        rawTokenPosition: vscode.Position,
        rawReferenceLocations: vscode.Location[],
    ) {
        var tokenPosition = new vscode.Position(
            rawTokenPosition.line,
            rawTokenPosition.character,
        );
        var referenceLocations = rawReferenceLocations.map((rawLocation) => {
            return new vscode.Location(
                vscode.Uri.parse(rawLocation.uri.toString()),
                new vscode.Range(
                    new vscode.Position(
                        rawLocation.range.start.line,
                        rawLocation.range.start.character,
                    ),
                    new vscode.Position(
                        rawLocation.range.end.line,
                        rawLocation.range.end.character,
                    ),
                ),
            );
        });

        const activeTextEditor = vscode.window.activeTextEditor;

        if (activeTextEditor) {
            vscode.commands.executeCommand(
                "editor.action.showReferences",
                activeTextEditor.document.uri,
                tokenPosition,
                referenceLocations,
            );
        }
    }

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "yarn.showReferences",
            yarnShowReferences,
        ),
    );

    async function yarnShowNodeInGraphView(uri: string, nodeName: string) {
        // Ensure that a graph view is open with this URI before firing the
        // 'show the node' event

        if (isStandaloneYarnSpinnerEditor()) {
            // Work around a bug in the standalone editor's app shell where
            // opening a custom editor in a specific column puts it in a failing
            // state
            await vscode.commands.executeCommand(
                "vscode.openWith",
                vscode.Uri.parse(uri),
                YarnSpinnerEditorProvider.viewType,
            );
        } else {
            // Open the editor in the column beside us
            await vscode.commands.executeCommand(
                "vscode.openWith",
                vscode.Uri.parse(uri),
                YarnSpinnerEditorProvider.viewType,
                vscode.ViewColumn.Beside,
            );
        }

        // Fire the event and let the (possibly just-opened) editor that we want
        // to show the node
        onDidRequestNodeInGraphView.fire({ uri: uri, nodeName: nodeName });
    }

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "yarn.showNodeInGraphView",
            yarnShowNodeInGraphView,
        ),
    );

    // Create the command to open a new visual editor for the active document
    context.subscriptions.push(
        vscode.commands.registerCommand("yarnspinner.show-graph", () => {
            vscode.commands.executeCommand(
                "vscode.openWith",
                vscode.window.activeTextEditor?.document.uri,
                YarnSpinnerEditorProvider.viewType,
                vscode.ViewColumn.Beside,
            );
        }),
    );

    // recording strings extraction command
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "yarnspinner.export-spreadsheet",
            async () => {
                var configs = vscode.workspace.getConfiguration("yarnspinner");
                let format = configs.get<string>("extract.format");
                let columns = configs.get<string[]>("extract.columns");
                let defaultName = configs.get<string>(
                    "extract.defaultCharacter",
                );
                let useChars = configs.get<boolean>(
                    "extract.includeCharacters",
                );

                const uri = await getOrChooseProjectUri();
                if (!uri) {
                    return;
                }

                const params: languageClient.ExecuteCommandParams = {
                    command: "yarnspinner.extract-spreadsheet",
                    arguments: [
                        uri.toString(),
                        format,
                        columns,
                        defaultName,
                        useChars,
                    ],
                };

                // doing some sanity checks and potentially bailing out before if needed
                // format can only be csv or xlsx
                if (!format) {
                    vscode.window.showErrorMessage(
                        `Unable to export sheet, no format is configured`,
                    );
                    return;
                }
                if (!(format == "csv" || format == "xlsx")) {
                    vscode.window.showErrorMessage(
                        `Unable to export sheet, format must be either "csv" or "xlsx"`,
                    );
                    return;
                }
                // columns must include a minimum of id and text
                if (!columns) {
                    vscode.window.showErrorMessage(
                        `Unable to export sheet, no columns are configured`,
                    );
                    return;
                }
                if (!(columns.includes("id") && columns.includes("text"))) {
                    vscode.window.showErrorMessage(
                        `Unable to export sheet, the columns must include at least "id" and "text"`,
                    );
                    return;
                }

                let request: Promise<VOStringExport> = client.sendRequest(
                    languageClient.ExecuteCommandRequest.type,
                    params,
                );
                request
                    .then((result) => {
                        if (result.errors.length == 0) {
                            // the LS base64 encodes the bytearray so we need to reverse
                            // that before we can use it
                            let dataString = result.file as any;
                            let data = Buffer.from(dataString, "base64");

                            const workspaceURI = getActiveWorkspaceUri();

                            let defaultDestinationURI: vscode.Uri | undefined;
                            if (workspaceURI) {
                                defaultDestinationURI = vscode.Uri.joinPath(
                                    workspaceURI,
                                    `lines.${format}`,
                                );
                            }

                            vscode.window
                                .showSaveDialog({
                                    defaultUri: defaultDestinationURI,
                                })
                                .then((uri: vscode.Uri | undefined) => {
                                    if (uri) {
                                        const path = uri.fsPath;
                                        fs.writeFile(path, data, (error) => {
                                            if (error) {
                                                vscode.window.showErrorMessage(
                                                    `Unable to write to file ${path}`,
                                                    error.message,
                                                );
                                            } else {
                                                vscode.window.showInformationMessage(
                                                    `Strings written to ${path}`,
                                                );
                                            }
                                        });
                                    }
                                });
                        } else {
                            vscode.window.showErrorMessage(
                                `Unable to compile your story, you have ${result.errors.length} errors.\nCheck the Problems for details.`,
                            );
                        }
                    })
                    .catch((error) => {
                        vscode.window.showErrorMessage(
                            "Error in the language server: " + error.toString(),
                        );
                    });
            },
        ),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("yarnspinner.showPreview2", () => {
            YarnSpinnerPreviewPanel.createOrShow(context, () =>
                // Provide a function that the panel can use to request an
                // updated compilation result
                compileWorkspace(client),
            );
        }),
    );

    // perform a compilation and preview the output in an interactive manner
    context.subscriptions.push(
        vscode.commands.registerCommand("yarnspinner.showPreview", () => {
            let compileResult = compileWorkspace(client);

            compileResult
                .then((result) => {
                    if (!("errors" in result)) {
                        YarnPreviewPanel.createOrShow(
                            context.extensionUri,
                            result,
                        );
                    } else {
                        vscode.window.showErrorMessage(
                            `Unable to compile your story.\nCheck the Problems for details.`,
                        );
                    }
                })
                .catch((error) => {
                    vscode.window.showErrorMessage(
                        "Error showing preview: " + error.toString(),
                    );
                });
        }),
    );

    // perform a compilation and save the output to a file
    context.subscriptions.push(
        vscode.commands.registerCommand("yarnspinner.exportPreview", () => {
            let compileResult = compileWorkspace(client);

            compileResult
                .then((result) => {
                    if (!("errors" in result)) {
                        var html = YarnPreviewPanel.generateHTML(
                            result,
                            context.extensionUri,
                            false,
                        );
                        YarnPreviewPanel.saveHTML(html);
                    } else {
                        vscode.window.showErrorMessage(
                            `Unable to compile your story.\nCheck the Problems for details.`,
                        );
                    }
                })
                .catch((error) => {
                    vscode.window.showErrorMessage(
                        "Error saving preview: " + error.toString(),
                    );
                });
        }),
    );

    // ask the LSP to make a graph file and then save that
    // recording strings extraction command
    context.subscriptions.push(
        vscode.commands.registerCommand("yarnspinner.graph", async () => {
            var configs = vscode.workspace.getConfiguration("yarnspinner");
            let format = configs.get<string>("graph.format");
            let clustering = configs.get<boolean>("graph.clustering");

            if (!(format == "dot" || format == "mermaid")) {
                vscode.window.showErrorMessage(
                    `Unable to export graph, no format is configured`,
                );
                return;
            }
            if (clustering == undefined) {
                vscode.window.showErrorMessage(
                    `Unable to export graph, no clustering rule is configured`,
                );
                return;
            }

            let uri: vscode.Uri | undefined;

            uri = await getOrChooseProjectUri();

            if (!uri) {
                // No available uri, or user cancelled.
                return;
            }

            const params: languageClient.ExecuteCommandParams = {
                command: "yarnspinner.create-graph",
                arguments: [uri.toString(), format, clustering],
            };

            let request: Promise<string> = client.sendRequest(
                languageClient.ExecuteCommandRequest.type,
                params,
            );
            request
                .then((result) => {
                    let fileForamt = format == "dot" ? "dot" : "mmd";

                    const workspaceURI = getActiveWorkspaceUri();

                    let defaultURI: vscode.Uri | undefined;
                    if (workspaceURI) {
                        defaultURI = vscode.Uri.joinPath(
                            workspaceURI,
                            `graph.${fileForamt}`,
                        );
                    }

                    vscode.window
                        .showSaveDialog({
                            defaultUri: defaultURI,
                        })
                        .then((uri: vscode.Uri | undefined) => {
                            if (uri) {
                                const path = uri.fsPath;
                                fs.writeFile(path, result, (error) => {
                                    if (error) {
                                        vscode.window.showErrorMessage(
                                            `Unable to write to file ${path}`,
                                            error.message,
                                        );
                                    } else {
                                        vscode.window.showInformationMessage(
                                            `Graph file saved to ${path}`,
                                        );
                                    }
                                });
                            }
                        });
                })
                .catch((error) => {
                    vscode.window.showErrorMessage(
                        "Error in the language server: " + error.toString(),
                    );
                });
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("yarnspinner.exportDebugOutput", () => {
            getDebugOutput(client).then((debugOutput) => {
                for (const item of debugOutput) {
                    var outputFile = vscode.Uri.parse(
                        item.sourceProjectUri + ".debuginfo.json",
                    );

                    fs.writeFile(
                        outputFile.fsPath,
                        JSON.stringify(item),
                        () => {},
                    );
                }
            });
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "yarnspinner.createProject",
            async () => {
                // Create a new Yarn Project.

                const workspaceURI = getActiveWorkspaceUri();

                let defaultDestinationURI: vscode.Uri | undefined;
                if (workspaceURI) {
                    defaultDestinationURI = vscode.Uri.joinPath(
                        workspaceURI,
                        `Project.yarnproject`,
                    );
                }

                const destinationUri = await vscode.window.showSaveDialog({
                    defaultUri: defaultDestinationURI,
                });

                if (!destinationUri) {
                    return;
                }

                const params: languageClient.ExecuteCommandParams = {
                    command: "yarnspinner.getEmptyYarnProjectJSON",
                    arguments: [],
                };

                let json = await client.sendRequest(
                    languageClient.ExecuteCommandRequest.type,
                    params,
                );
                fs.writeFileSync(destinationUri.fsPath, json);

                vscode.commands.executeCommand(
                    "revealInExplorer",
                    destinationUri,
                );
            },
        ),
    );

    // Enable commands that depend upon the language server being online and the above commands being registered
    vscode.commands.executeCommand(
        "setContext",
        "yarnspinner.languageServerLaunched",
        true,
    );
}

async function compileWorkspace(
    client: languageClient.LanguageClient,
): Promise<YarnData | { errors: string[] }> {
    const uri = await getOrChooseProjectUri();

    if (!uri) {
        return { errors: ["No project available to compile."] };
    }

    const params: languageClient.ExecuteCommandParams = {
        command: "yarnspinner.compile",
        arguments: [uri.toString()],
    };

    let result: CompilerOutput = await client.sendRequest(
        languageClient.ExecuteCommandRequest.type,
        params,
    );

    if (result.errors.length > 0) {
        return { errors: result.errors };
    }

    let yarnData: YarnData = {
        programData: result.data,
        stringTable: result.stringTable,
        metadata: result.metadataTable,
    };

    return yarnData;
}

type DebugOutputResponse = {
    sourceProjectUri: languageClient.DocumentUri;
    variables: any[];
}[];

async function getDebugOutput(
    client: languageClient.LanguageClient,
): Promise<DebugOutputResponse> {
    const params: languageClient.ExecuteCommandParams = {
        command: "yarnspinner.generateDebugOutput",
        arguments: [],
    };

    let result: DebugOutputResponse = await client.sendRequest(
        languageClient.ExecuteCommandRequest.type,
        params,
    );

    return result;
}

type ProjectInfo = {
    uri: languageClient.DocumentUri;
    files: languageClient.DocumentUri[];
    isImplicitProject: boolean;
};

async function listProjects(
    client: languageClient.LanguageClient,
): Promise<Array<ProjectInfo>> {
    const params: languageClient.ExecuteCommandParams = {
        command: "yarnspinner.listProjects",
        arguments: [],
    };

    let result = await client.sendRequest(
        languageClient.ExecuteCommandRequest.type,
        params,
    );

    return result;
}

async function getOrChooseProjectUri(): Promise<vscode.Uri | undefined> {
    const projects = await listProjects(client);

    // Is there a currently open text editor? We'll try to use that to figure
    // out which project the user wants to work with.
    const activeDocumentUri = vscode.window.activeTextEditor?.document.uri;
    if (activeDocumentUri) {
        let candidateProjects = new Set<ProjectInfo>();

        // Search the projects to see if any of them claim it. If one (and only
        // one) does, then that must be the project we should use. Otherwise,
        // fall back to other behaviour.

        for (const project of projects) {
            for (const fileString of project.files) {
                const fileURI = vscode.Uri.parse(fileString, true);
                if (fileURI.toString() === activeDocumentUri.toString()) {
                    // This project owns this file.
                    candidateProjects.add(project);
                    break;
                }
            }
        }

        if (candidateProjects.size === 1) {
            // Precisely one project owns this file. Return its URI.
            return vscode.Uri.parse(
                Array.from(candidateProjects.values())[0].uri,
                true,
            );
        }

        // Otherwise, either zero or >1 projects own this file.
    }

    if (projects.length === 1) {
        if (projects[0].uri) {
            return vscode.Uri.parse(projects[0].uri, true);
            ``;
        } else {
            // The project doesn't have a URI, so we can't return it.
            vscode.window.showErrorMessage(
                "Internal error: the current project has no URI.",
            );
            return undefined;
        }
    } else if (projects.length === 0) {
        // No projects in current workspace.
        vscode.window.showErrorMessage("There are are no Yarn Projects open.");
        return undefined;
    } else {
        // Multiple projects to choose from.
        // Ask the user.

        const getWorkspaceFolder = (p: ProjectInfo) => {
            if (p.isImplicitProject || !p.uri) {
                return undefined;
            }
            return vscode.workspace.getWorkspaceFolder(
                vscode.Uri.parse(p.uri, true),
            )?.uri;
        };

        const workspaceFolders = new Set<vscode.Uri | undefined>(
            projects.map((p) => getWorkspaceFolder(p)),
        );

        const getLabel = (project: ProjectInfo): string => {
            // Attempt to fetch the URI for the project. If there isn't
            // one, handle that.
            const uriString = project.uri;
            if (!uriString) {
                if (project.isImplicitProject) {
                    return "Implicit project";
                } else {
                    return "(unknown)";
                }
            }

            // Figure out the workspace folder for this project.
            const uri = vscode.Uri.parse(uriString, true);
            const folder = vscode.workspace.getWorkspaceFolder(uri);

            // If we have the folder, and this is the only workspace
            // folder, remove that from the label. TODO: maybe instead
            // we should visually group projects by workspace in the
            // quickpick?
            if (folder && workspaceFolders.size == 1) {
                return unescape(
                    uri
                        .toString()
                        .replace(folder.uri.toString() + "/", "")
                        .split("/")
                        .join(path.sep),
                );
            } else {
                if (uri.scheme === "file") {
                    return uri.fsPath;
                } else {
                    return unescape(uri.toString());
                }
            }
        };

        const quickPickItems = projects.map((p) => ({
            label: getLabel(p),
            uri: vscode.Uri.parse(p.uri),
        }));
        const selected = await vscode.window.showQuickPick(quickPickItems, {
            title: "Select a project:",
        });

        if (selected === undefined) {
            // User cancelled.
            return undefined;
        } else {
            return selected.uri;
        }
    }
}

export function getActiveWorkspaceUri(): vscode.Uri | undefined {
    // Are any workspaces open?
    if (vscode.workspace.workspaceFolders) {
        // Yes, one at least one is. Choose the workspace that the currently
        // open document is in, if one is available.
        if (vscode.window.activeTextEditor) {
            let workspaceURI = vscode.workspace.getWorkspaceFolder(
                vscode.window.activeTextEditor.document.uri,
            );

            if (workspaceURI) {
                return workspaceURI.uri;
            }
        } else {
            // We don't know the workspace of the currently active text editor.
            // Return the directory of the _first_ workspace instead.
            return vscode.workspace.workspaceFolders[0].uri;
        }
    }

    return undefined;
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
