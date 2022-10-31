import { NodesUpdatedEvent } from "../src/types/editor";

import { ViewState } from "./ViewState";
import { NodeView } from "./NodeView";
import { getLinesSVGForNodes } from "./svg";
import { getPositionFromNodeInfo } from "./util";

import { MessageTypes, WebViewEvent } from '../src/types/editor';

interface VSCode {
	postMessage(message: any): void;
}

export { }

declare global {
	function acquireVsCodeApi(): VSCode;

	var nodeViews: NodeView[];
}

export const factor = 0.1
export const zoomSpeed = 120

export const zoomMinScale = 0.1
export const zoomMaxScale = 2

/** How far from the last node each new node will be created */
export const newNodeOffset = 10;


export const NodeSize = {
	width: 150,
	height: 75,
};

export let nodesContainer: HTMLElement;
let zoomContainer: HTMLElement;

zoomContainer = document.querySelector('.zoom-container') as HTMLElement;
nodesContainer = document.querySelector('.nodes') as HTMLElement;

let viewState = new ViewState(zoomContainer, nodesContainer);

var buttonsContainer = document.querySelector('#nodes-header');

if (!buttonsContainer) {
	throw new Error("Failed to find buttons container");
}

function getNodeView(name: string): NodeView | undefined {
	return globalThis.nodeViews.filter(nv => nv.nodeName === name)[0];
}




// Script run within the webview itself.
(function () {

	// Get a reference to the VS Code webview api.
	// We use this API to post messages back to our extension.
	const vscode = acquireVsCodeApi();

	globalThis.nodeViews = [];

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
		
		const node = globalThis.nodeViews.filter(n => n.nodeName === nodeName)[0]

		if (node !== undefined) {
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

		// Remove all node view elements
		if (nodesContainer) {
			const nodeElements = nodesContainer.querySelectorAll('.node');
			nodeElements.forEach(e =>
				nodesContainer.removeChild(e)
			)
			const lineElement = nodesContainer.querySelector('#lines');
			if (lineElement) {
				nodesContainer.removeChild(lineElement);
			}
		}

		var jumpToFirstNode = false;

		if (!globalThis.nodeViews || globalThis.nodeViews.length == 0) {
			// We don't have any nodes. Note that we want to snap our view to
			// the first one in the list, if any.
			jumpToFirstNode = true;
		}

		globalThis.nodeViews = [];

		updateDropdownList(data);

		/** @type HTMLElement | null */
		const template = document.querySelector('#node-template');
		if (!template) {
			console.error("Failed to find node view template");
			return;
        }
        
        let nodesWithDefaultPosition = 0;

		for (const node of data.nodes) {
			/** @type HTMLElement */
			const newNodeElement = template.cloneNode(true) as HTMLElement

            let newNodeView = new NodeView(node, newNodeElement)
            
            let position = getPositionFromNodeInfo(node);

            if (position) {
                newNodeView.position = position;
            } else {
                newNodeView.position = {
                    x: newNodeOffset * nodesWithDefaultPosition,
                    y: newNodeOffset * nodesWithDefaultPosition,
                }
                nodesWithDefaultPosition += 1;
            }

			const title = newNodeElement.querySelector('.title') as HTMLElement;
			title.innerText = node.title;

			const preview = newNodeElement.querySelector('.preview') as HTMLElement;
			preview.innerText = node.previewText;

			const deleteButton = newNodeElement.querySelector('.button-delete') as HTMLElement;
			deleteButton.addEventListener('click', (evt) => {
				var ID = node.title;
				vscode.postMessage({
					type: 'delete',
					id: ID
				});
			});

			var colorHeader = node.headers.filter((header) => header.key == "color")[0];

			if (colorHeader) {
				newNodeElement.classList.add("color-" + colorHeader.value);
			}

			/** @type HTMLElement | null */
			const editButton = newNodeElement.querySelector('.button-edit');
			if (editButton) {
				editButton.addEventListener('click', (evt) => {
					var ID = node.title;
					vscode.postMessage({
						type: 'open',
						id: ID
					});
				});
			}

			nodesContainer?.appendChild(newNodeElement);
			globalThis.nodeViews.push(newNodeView);
		}

		if (jumpToFirstNode && nodeViews.length > 0) {
			viewState.focusOnNode(nodeViews[0]);
		}

		for (const node of data.nodes) {

			const nodeView = getNodeView(node.title);

			if (!nodeView) {
				continue;
			}

			for (const destination of node.jumps) {
				const destinationElement = getNodeView(destination.destinationTitle);

				if (!destinationElement) {
					console.warn(`Node ${node.title} has destination ${destinationElement}, but no element for this destination exists!`);
					continue;
				}

				nodeView.outgoingConnections.push(destinationElement);
			}

			let positionX: number, positionY: number;

			function makeDraggable(nodeView: NodeView) {

				nodeView.element.addEventListener('mousedown', onNodeDragStart);
				nodeView.element.addEventListener('dblclick', onNodeDoubleClick);

				function onNodeDragStart(e: MouseEvent) {
					e.preventDefault();
					e.stopPropagation();
					positionX = e.clientX;
					positionY = e.clientY;
					window.addEventListener('mousemove', onNodeDragMove);
					window.addEventListener('mouseup', onNodeDragEnd);

					linesSVG = document.getElementById("lines") as unknown as SVGElement;

					console.log(`Drag start ${nodeView.nodeName}`);
				}

				function onNodeDragMove(e: MouseEvent) {
					e.preventDefault();
					e.stopPropagation();

					let previousPositionViewSpace = viewState.convertToViewSpace({
						x: positionX,
						y: positionY,
					});
					let newPositionViewSpace = viewState.convertToViewSpace({
						x: e.clientX,
						y: e.clientY,
					});
					let deltaPositionViewSpace = {
						x: newPositionViewSpace.x - previousPositionViewSpace.x,
						y: newPositionViewSpace.y - previousPositionViewSpace.y,
					}

					// Move this node by (dx,dy) pixels in view-space
					positionX = e.clientX;
					positionY = e.clientY;

					var position = nodeView.position;

					position.x += deltaPositionViewSpace.x;
					position.y += deltaPositionViewSpace.y;

					nodeView.position = position;

					// Recalculate our lines
					nodesContainer.removeChild(linesSVG);
					linesSVG = getLinesSVGForNodes(nodeViews);
					nodesContainer.appendChild(linesSVG);

					console.log(`Drag move ${nodeView.nodeName}`);
				}

				function onNodeDragEnd(e: MouseEvent) {
					const position = nodeView.position;
					const nodeID = node.title;

					// Notify the extension that our node finished moving
					vscode.postMessage({
						type: 'move',
						id: nodeID,
						position: position,
					});

					window.removeEventListener('mousemove', onNodeDragMove);
					window.removeEventListener('mouseup', onNodeDragEnd);

					console.log(`Drag end ${nodeView.nodeName}`);
				}

				function onNodeDoubleClick(e: MouseEvent) {
					// Notify the extension that our node should be opened
					vscode.postMessage({
						type: 'open',
						id: node.title
					});
				}

			}

			makeDraggable(nodeView);
		}

		let linesSVG = getLinesSVGForNodes(nodeViews);

		nodesContainer.appendChild(linesSVG);
	}
}
)();



