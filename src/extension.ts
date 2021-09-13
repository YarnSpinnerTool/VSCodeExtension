// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { YarnSpinnerParser } from './YarnSpinnerParser';

import { subscribeToDocumentChanges } from './diagnostics';
import { getNodeInfo, parse } from './parsing';
import { Uri } from 'vscode';
import { symlink, watch } from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	const yarnSpinnerDiagnostics = vscode.languages.createDiagnosticCollection("yarn-spinner");
	context.subscriptions.push(yarnSpinnerDiagnostics);

	subscribeToDocumentChanges(context, yarnSpinnerDiagnostics);
	
}
