import { NodesUpdatedEvent } from "../src/types/editor";

import { ViewState } from "./ViewState";
import { NodeView } from "./NodeView";
import { getLinesSVGForNodes } from "./svg";
import { getPositionFromNodeInfo } from "./util";

import { MessageTypes, WebViewEvent } from '../src/types/editor';
import { newNodeOffset } from "./constants";

interface VSCode {
	postMessage(message: any): void;
}

export { }

declare global {
	function acquireVsCodeApi(): VSCode;
}

const vscode = acquireVsCodeApi();

let nodesContainer: HTMLElement;
let zoomContainer: HTMLElement;

zoomContainer = document.querySelector('.zoom-container') as HTMLElement;
nodesContainer = document.querySelector('.nodes') as HTMLElement;

let viewState = new ViewState(zoomContainer, nodesContainer);

viewState.onNodeDelete = (name) => {
	var ID = name;
	vscode.postMessage({
		type: 'delete',
		id: ID
	});
}

viewState.onNodeEdit = (name) => {
	var ID = name;
	vscode.postMessage({
		type: 'open',
		id: ID
	});
}

viewState.onNodesMoved = (positions) => {
	vscode.postMessage({
		type: 'move',
		positions: positions,
	});
}

var buttonsContainer = document.querySelector('#nodes-header');

if (!buttonsContainer) {
	throw new Error("Failed to find buttons container");
}

// Script run within the webview itself.
(function () {

	// Get a reference to the VS Code webview api.
	// We use this API to post messages back to our extension.
	
	const addNodeButton = buttonsContainer.querySelector('#add-node');

	if (!addNodeButton) {
		throw new Error("Failed to find Add Node button");
	}

	addNodeButton.addEventListener('click', () => {
		let nodePosition = viewState.getPositionForNewNode();

		vscode.postMessage({
			type: 'add',
			position: nodePosition
		});
	});

	window.addEventListener('message', (e: any) => {
		const event = e.data as WebViewEvent;

		if (event.type == "update") {
			nodesUpdated(event);
		} else if (event.type == "show-node") {
			showNode(event.node)
		}
	});

	/**
	 * @param {NodesUpdatedEvent} data 
	 */
	function updateDropdownList(data: NodesUpdatedEvent) {
		const dropdown = document.querySelector("#node-jump");

		if (dropdown == null) {
			throw new Error("Failed to find node dropdown");
		}

		const icon = dropdown.querySelector("#icon");

		if (!icon) {
			throw new Error("Failed to find icon");
		}


		let placeholderOption = document.createElement("vscode-option");
		placeholderOption.innerText = "Jump to Node";


		let nodeOptions = data.nodes.map(node => {

			let option = document.createElement("vscode-option");
			option.nodeValue = node.title;
			option.innerText = node.title;
			return option;
		})

		dropdown.replaceChildren(icon, placeholderOption, ...nodeOptions);

	}

	const dropdown = document.querySelector("#node-jump") as HTMLSelectElement;

	if (!dropdown) {
		throw new Error("Failed to find node list dropdown");
	}

	dropdown.addEventListener("change", (evt) => {
		if (dropdown.selectedIndex > 0) {
			// We selected a node.
			console.log(`Jumping to ${dropdown.value}`);

			showNode(dropdown.value);
		}
		dropdown.selectedIndex = 0;
	});

	function showNode(nodeName: string) {
		
		const node = viewState.getNodeView(nodeName);
		if (node) {
			viewState.focusOnNode(node);
		}
	}	

	/**
	 * Called whenever the extension notifies us that the nodes in the
	 * document have changed.
	 * @param data {NodesUpdatedEvent} Information about the document's
	 * nodes.
	 */
	function nodesUpdated(data: NodesUpdatedEvent) {

		let nodesWithDefaultPosition = 0;
		
		for (let nodeInfo of data.nodes) {
			let position = getPositionFromNodeInfo(nodeInfo);

			if (!position) {
				const position = {
					x: newNodeOffset * nodesWithDefaultPosition,
                    y: newNodeOffset * nodesWithDefaultPosition,
                }
				nodeInfo.headers.push({ key: "position", value: `${position.x},${position.y}` });
                nodesWithDefaultPosition += 1;
            }
		}

		viewState.nodes = data.nodes;

		updateDropdownList(data);
	}
}
)();
