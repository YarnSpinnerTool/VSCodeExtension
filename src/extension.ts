// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { subscribeToDocumentChanges } from './diagnostics';
import { getNodeInfo, parse } from './parsing';
import { YarnSpinnerEditorProvider } from './editor';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const yarnSpinnerDiagnostics = vscode.languages.createDiagnosticCollection("yarn-spinner");
	context.subscriptions.push(yarnSpinnerDiagnostics);

	subscribeToDocumentChanges(context, yarnSpinnerDiagnostics);

	const symbolProvider = vscode.languages.registerDocumentSymbolProvider({ pattern: "**/*.{yarn,yarnproject,yarn.txt}" }, new YarnSpinnerSymbolProvider());
	context.subscriptions.push(symbolProvider);

	context.subscriptions.push(YarnSpinnerEditorProvider.register(context));

	context.subscriptions.push(vscode.commands.registerCommand("yarnspinner.show-graph", () => {
		vscode.commands.executeCommand("vscode.openWith", vscode.window.activeTextEditor?.document.uri, YarnSpinnerEditorProvider.viewType, vscode.ViewColumn.Beside);
	}))
}

class YarnSpinnerSymbolProvider implements vscode.DocumentSymbolProvider {
	provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {

		var parseTree = parse(document.getText());
		var nodeInfo = getNodeInfo(parseTree.parseContext);

		var nodes: vscode.SymbolInformation[] = [];

		for (var node of nodeInfo) {
			const range = new vscode.Range(node.line - 1, 0, node.line - 1, 1);
			var symbol = new vscode.SymbolInformation(node.title, vscode.SymbolKind.Key, "document", new vscode.Location(document.uri, range));

			nodes.push(symbol);
		}

		return nodes;
	}

}
