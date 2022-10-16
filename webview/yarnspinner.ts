import type { NodesUpdatedEvent } from "../src/types/editor";

import interact from "interactjs";
import { NodeInfo } from "./nodes";

interface VSCode {
    postMessage(message: any): void;
}

class NodeView {
	nodeName: string;
	element: HTMLElement;

	outgoingConnections: NodeView[] = [];

	constructor(node: NodeInfo, element: HTMLElement) {
		this.nodeName = node.title;
		this.element = element;

		this.element.id = "node-" + node.title;
		this.element.dataset.nodeName = node.title;

		let position: Position;

		// Try and find a 'position' header in this node, and parse it; if
		// we can't find one, or can't parse it, default to (0,0). 
		const positionString = node.headers.find(h => h.key == "position")?.value;

		if (positionString) {
			try {
				const elements = positionString.split(",").map(i => parseInt(i));
				position = { x: elements[0], y: elements[1] };
			} catch (e) {
				position = { x: 0, y: 0 };
			}
		} else {
			position = { x: 0, y: 0 };
		}

		this.setPosition(position);
	}

	public setPosition(position: Position): void {
		const offsetPosition = {
			x: position.x + globalThis.offset.x,
			y: position.y + globalThis.offset.y,
		}

		this.element.style.transform = `translate(${offsetPosition.x}px, ${offsetPosition.y}px)`;

		this.element.dataset.positionX = position.x.toString();
		this.element.dataset.positionY = position.y.toString();

	}

	public getPosition(): Position {
		return {
			x: parseFloat(this.element.dataset.positionX ?? "0"),
			y: parseFloat(this.element.dataset.positionY ?? "0")
		}
	}
}

export { }

declare global {
	function acquireVsCodeApi(): VSCode;

	var offset: Position;

	var nodeViews: NodeView[];
}

let currentScale = 1;

let translateX = 0
let translateY = 0

const factor = 0.1
const zoomSpeed = 120

const zoomMinScale = 0.1
const zoomMaxScale = 2

let nodesContainer: HTMLElement;
let zoomContainer: HTMLElement;

zoomContainer = document.querySelector('.zoom-container') as HTMLElement;
nodesContainer = document.querySelector('.nodes') as HTMLElement;

if (!zoomContainer) {
	throw new Error("Failed to find zoom container");
}

if (!nodesContainer) {
	throw new Error("Failed to find nodes container");
}

var buttonsContainer = document.querySelector('#nodes-header');

if (!buttonsContainer) {
	throw new Error("Failed to find buttons container");
}

zoomContainer.addEventListener('wheel', e => {
	const delta = e.deltaY / zoomSpeed
	let nextScale = currentScale + delta * factor
	
	nextScale = Math.max(nextScale, zoomMinScale);
	nextScale = Math.min(nextScale, zoomMaxScale);

	zoom(nextScale, e)
});

const zoom = (nextScale : number, event : WheelEvent) => {

	const ratio = 1 - nextScale / currentScale
  
	const {
	  clientX,
	  clientY
	} = event
  
	translateX += (clientX - translateX) * ratio
	translateY += (clientY - translateY) * ratio
  
	nodesContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${nextScale})`
  
	currentScale = nextScale
  }
  
  

function getNodeView(name: string) : NodeView | undefined {
	return globalThis.nodeViews.filter(nv => nv.nodeName === name)[0];
}

const NodeSize = {
	width: 150,
	height: 75,
};

interface Position {
	x: number;
	y: number;
}

interface Size {
	width: number;
	height: number;
}

function getWindowSize(): Size {
	let viewport = window.visualViewport;
	if (viewport == null) {
		throw new Error("Failed to get window visual viewport");
		;
	}
	return {
		width: viewport.width,
		height: viewport.height
	}
}

// Script run within the webview itself.
(function () {
	
	// Get a reference to the VS Code webview api.
	// We use this API to post messages back to our extension.
	const vscode = acquireVsCodeApi();

	globalThis.nodeViews = [];

	
	/** The number of nodes that have been created since the last time the
	 * viewport was moved. */
	let nodesSinceLastMove = 0;

	/** How far from the last node each new node will be created */
	const newNodeOffset = 10;

	const addNodeButton = buttonsContainer.querySelector('#add-node');

	if (!addNodeButton) {
		throw new Error("Failed to find Add Node button");
	}

	addNodeButton.addEventListener('click', () => {
		let nodePosition = getWindowCenter();
		nodePosition.x -= NodeSize.width / 2;
		nodePosition.y -= NodeSize.height / 2;

		nodePosition.x += newNodeOffset * nodesSinceLastMove;
		nodePosition.y += newNodeOffset * nodesSinceLastMove;

		nodesSinceLastMove += 1;

		vscode.postMessage({
			type: 'add',
			position: nodePosition
		});
	});

	window.addEventListener('message', (e : any) => {
		const event = e.data;
		
		if (event.type == "update") {
			nodesUpdated(event);
		}
	});

	

	function updateBackgroundPosition(offset : Position) {
		document.body.style.backgroundPositionX = offset.x.toString() + "px";;
		document.body.style.backgroundPositionY = offset.y.toString() + "px";

		nodesSinceLastMove = 0;
	}

	/**
	 * Returns the coordinates of the center of the window.
	 * @returns {{x: number, y:number}}
	 */
	function getWindowCenter() {
		const size = getWindowSize();

		return {
			x: Math.round(size.height / 2 - globalThis.offset.x),
			y: Math.round(size.width / 2 - globalThis.offset.y),
		}
	}
	

	// The globalThis.offset that we have panned the entire canvas to. This starts globalThis.offset,
	// so that {0,0} is near the center of the window, and a node at {0,0} will
	// appear pleasingly centered.

	const size = getWindowSize();

	globalThis.offset = { x: size.width / 2 - NodeSize.width / 2, y: size.height / 2 - NodeSize.height / 2 };

	updateBackgroundPosition(globalThis.offset);


	/**
	 * @param {NodesUpdatedEvent} data 
	 */
	function updateDropdownList(data : NodesUpdatedEvent) {
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

			const element = globalThis.nodeViews.filter(n => n.nodeName === dropdown.value)[0].element;
			
			if (element !== undefined) {
				setViewPositionToElement(element);
			}

		}
		dropdown.selectedIndex = 0;
	});

	function setViewPositionToElement(element: HTMLElement) {
		const size = getWindowSize();
		var newOffset = {
			x: -parseFloat(element.dataset.positionX ?? "0") + size.width / 2 - NodeSize.width / 2,
			y: -parseFloat(element.dataset.positionY ?? "0") + size.height / 2 - NodeSize.height / 2,
		};

		globalThis.offset = newOffset;

		updateViewPosition();
	}

	function updateViewPosition() {
		for (const nodeView of globalThis.nodeViews) {
			nodeView.setPosition(nodeView.getPosition());
		}

		updateBackgroundPosition(globalThis.offset);
	}

	// Set up the canvas drag interaction: whenever the canvas itself is
	// dragged, update the canvas globalThis.offset, update the displayed position of
	// all nodes to reflect this globalThis.offset, and update all lines

	var zoomContainerInteraction = interact(zoomContainer);

	zoomContainerInteraction.draggable({
		onmove(event : any) {
			globalThis.offset.x += event.dx * (1 / currentScale);
			globalThis.offset.y += event.dy * (1 / currentScale);

			updateViewPosition();
		}
	});

	/**
	 * Called whenever the extension notifies us that the nodes in the
	 * document have changed.
	 * @param data {NodesUpdatedEvent} Information about the document's
	 * nodes.
	 */
	function nodesUpdated(data : NodesUpdatedEvent) {

		// Remove all node view elements
		if (nodesContainer) {
			nodesContainer.innerHTML = '';
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
		
		for (const node of data.nodes) {

			
			/** @type HTMLElement */
			const newNodeElement = template.cloneNode(true) as HTMLElement
			
			let newNodeView = new NodeView(node, newNodeElement)
			
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

		if (jumpToFirstNode && globalThis.nodeViews.length > 0) {
			setViewPositionToElement(globalThis.nodeViews[0].element)
		}

		for (const node of data.nodes) {

			const nodeView = getNodeView(node.title);

			if (!nodeView) {
				continue;
			}

			/* TODO: lines
			
			for (const destination of node.jumps) {
				const destinationElement = nodesToElements[destination.destinationTitle];

				if (!destinationElement) {
					console.warn(`Node ${node.title} has destination ${destinationElement}, but no element for this destination exists!`);
					continue;
				}

				var line : LeaderLine;

				if (element === destinationElement) {
					var sourcePointAnchor = LeaderLine.pointAnchor(element, {x:'25%', y:'100%'});
					var destinationPointAnchor = LeaderLine.pointAnchor(element, {x:'0%', y:'50%'});
					
					line = new LeaderLine({ start: sourcePointAnchor, end: destinationPointAnchor })
					
					
					line.setOptions({
						startSocketGravity: [-50, 50],
						endSocketGravity: [-50, 0]
					});
					
					
					
				} else {
					
					line = new LeaderLine({ start: element, end: destinationElement })
					
					line.setOptions({
						startSocketGravity: 50,
						endSocketGravity: 50,
					})
					
					if (nodesToLines[destination.destinationTitle]) {
						nodesToLines[destination.destinationTitle].push(line);
					} else {
						nodesToLines[destination.destinationTitle] = [line];
					}
				}
				
				if (nodesToLines[node.title]) {
					nodesToLines[node.title].push(line);
				} else {
					nodesToLines[node.title] = [line];
				}

				// Use the current theme's 'chart line' colour
				line.color = 'var(--vscode-charts-lines)';

				// Record this line so we can unregister it later when
				// nodes move
				globalThis.lines.push(line);
			}

			*/

			/** @type Interactable */
			//@ts-ignore
			const interactable = interact(nodeView.element);
		
			interactable.draggable({
				onstart(event) {
					// no-op
				},
				onmove(event) {
					// Move this node by (dx,dy) pixels
					var position = nodeView.getPosition();
					
					position.x += event.dx * (1 / currentScale);
					position.y += event.dy * (1 / currentScale);

					nodeView.setPosition(position);
					
					// TODO: lines
					// if (nodesToLines[node.title]) {
					// 	for (const line of nodesToLines[node.title]) {
					// 		// Update line position
					// 		line.position();
					// 	}
					// }
				},
				onend(event) {
					const position = nodeView.getPosition();
					const nodeID = node.title;

					// Notify the extension that our node finished moving
					vscode.postMessage({
						type: 'move',
						id: nodeID,
						position: position,
					});
				}
			
			}).on('doubletap', (event) => {
				// Notify the extension that our node should be opened
				vscode.postMessage({
					type: 'open',
					id: node.title
				});
			}).styleCursor(false);

		}
	}

}
)();
