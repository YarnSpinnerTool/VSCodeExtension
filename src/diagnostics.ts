import * as vscode from 'vscode';
import { parse } from './parsing';

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func: Function, wait: number, immediate: boolean = false) : Function {
	var timeout: NodeJS.Timeout | undefined;

	return function (this: any) {
		var context = this;
		var args = arguments;

		var later = function () {
			timeout = undefined;
			if (!immediate) func.apply(context, args);
		}

		var callNow = immediate && !timeout;

		if (timeout) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(later, wait);

		if (callNow) {
			func.apply(context, args);
		}
	};
};

export function subscribeToDocumentChanges(context: vscode.ExtensionContext, yarnSpinnerDiagnostics: vscode.DiagnosticCollection) {

	if (vscode.window.activeTextEditor) {
		refreshDiagnostics(vscode.window.activeTextEditor.document, yarnSpinnerDiagnostics);
	}

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				refreshDiagnostics(editor.document, yarnSpinnerDiagnostics);
			}
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document, yarnSpinnerDiagnostics), 100)
	);

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument(doc => yarnSpinnerDiagnostics.delete(doc.uri))
	);

}

export function refreshDiagnostics(doc: vscode.TextDocument, yarnSpinnerDiagnostics: vscode.DiagnosticCollection): void {

	if (doc.languageId !== "yarnspinner") {
		return;
	}

	const diagnostics: vscode.Diagnostic[] = [];

	var results = parse(doc.getText());

	for (const error of results.errors) {
		const range = new vscode.Range(error.line - 1, error.column, error.line - 1, error.column + error.length);
		const diagnostic = new vscode.Diagnostic(range, error.message, vscode.DiagnosticSeverity.Error);

		diagnostics.push(diagnostic);
	}

	yarnSpinnerDiagnostics.set(doc.uri, diagnostics);
}