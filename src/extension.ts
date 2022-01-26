// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

import { ServerOptions, TransportKind, LanguageClient, LanguageClientOptions } from "vscode-languageclient/node";

import { Trace } from "vscode-jsonrpc";

import { YarnSpinnerEditorProvider } from './editor';
import * as fs from 'fs';

const isDebugMode = () => process.env.VSCODE_DEBUG_MODE === "true";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	
	// Ensure .net 6.0 is installed and available
    interface IDotnetAcquireResult {
        dotnetPath: string;
	}
	
	const dotnetAcquisition = await vscode.commands.executeCommand<IDotnetAcquireResult>('dotnet.acquire', { version: '6.0', requestingExtensionId: 'yarn-spinner' });
	
    const dotnetPath = dotnetAcquisition?.dotnetPath ?? null;
    if (!dotnetPath) {
		throw new Error('Can\'t load the language server: Failed to acquire.NET!');
    }

    const languageServerExe = dotnetPath;
    const languageServerPath =
        isDebugMode() ?
            path.resolve(context.asAbsolutePath("LanguageServer/LanguageServer/bin/Debug/net6.0/YarnLanguageServer.dll")) :
			path.resolve(context.asAbsolutePath("media/YarnLanguageServer.dll"));

	if (fs.existsSync(languageServerPath) == false) {
		throw new Error(`Failed to launch language server: no file exists at ${languageServerPath}`);
	}

    let languageServerOptions: ServerOptions = {
        run: {
            command: languageServerExe,
            args: [languageServerPath],
            transport: TransportKind.pipe,
        },
        debug: {
            command: languageServerExe,
            args: [languageServerPath, "--waitForDebugger"],
            transport: TransportKind.pipe,
            runtime: "",
        },
    };

    var configs = vscode.workspace.getConfiguration("yarnSpinner");
    let languageClientOptions: LanguageClientOptions = {
        documentSelector: [
            "**/*.yarn"
        ],
        initializationOptions: [
            configs,
        ],
        progressOnInitialization: true,
        synchronize: {
            // configurationSection is deprecated but means we can use the same code for vscode and visual studio (which doesn't support the newer workspace/configuration endpoint)
            configurationSection: 'yarnSpinner',
			fileEvents: [
				vscode.workspace.createFileSystemWatcher("**/*.yarn"),
				vscode.workspace.createFileSystemWatcher("**/*.cs"),
				vscode.workspace.createFileSystemWatcher("**/*.ysls.json")
			]

        },
    };

    const client = new LanguageClient("yarnSpinner", "Yarn Spinner", languageServerOptions, languageClientOptions);
    client.trace = Trace.Verbose;

    let disposableClient = client.start();
    // deactivate client on extension deactivation
    context.subscriptions.push(disposableClient);

	context.subscriptions.push(YarnSpinnerEditorProvider.register(context));

	context.subscriptions.push(vscode.commands.registerCommand("yarnspinner.show-graph", () => {
		vscode.commands.executeCommand("vscode.openWith", vscode.window.activeTextEditor?.document.uri, YarnSpinnerEditorProvider.viewType, vscode.ViewColumn.Beside);
	}))
}

