import type { NodesUpdatedEvent } from "../src/types/editor";

import { NodeInfo } from "./nodes";
import * as CurvedArrows from 'curved-arrows';


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
	let nextScale = currentScale - delta * factor
	
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
  
	translateX += (clientX - translateX) * ratio;
	translateY += (clientY - translateY) * ratio;
  
	nodesContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${nextScale})`;
  
	currentScale = nextScale;

	// updateBackgroundPosition(globalThis.offset);
  }
  

function updateBackgroundPosition(offset : Position) {
	document.body.style.backgroundPositionX = (offset.x * (currentScale)).toString() + "px";;
	document.body.style.backgroundPositionY = (offset.y * (currentScale)).toString() + "px";
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

		nodesSinceLastMove = 0;

		let linesSVG = document.getElementById("lines") as unknown as SVGElement;

		if (linesSVG) {
			nodesContainer.removeChild(linesSVG);
			linesSVG = getLinesSVGForNodes(nodeViews);
			nodesContainer.appendChild(linesSVG);
		}
	}

	// Set up the canvas drag interaction: whenever the canvas itself is
	// dragged, update the canvas globalThis.offset, update the displayed position of
	// all nodes to reflect this globalThis.offset, and update all lines

	let backgroundDrag: [x: number, y: number] = [0, 0];

	function makeDraggable(element : HTMLElement) {
				
		element.addEventListener('mousedown', onNodeDragStart);
		
		function onNodeDragStart(e: MouseEvent) {
			e.preventDefault();
			e.stopPropagation();
			backgroundDrag = [e.clientX, e.clientY];
			
			window.addEventListener('mousemove', onNodeDragMove);
			window.addEventListener('mouseup', onNodeDragEnd);
		}

		function onNodeDragMove(e: MouseEvent) {
			e.preventDefault();
			e.stopPropagation();

			// Move this node by (dx,dy) pixels, scaled by our scaling factor
			const deltaX = backgroundDrag[0] - e.clientX;
			const deltaY = backgroundDrag[1] - e.clientY;
			backgroundDrag = [e.clientX, e.clientY]

			globalThis.offset.x -= deltaX * (1 / currentScale);
			globalThis.offset.y -= deltaY * (1 / currentScale);

			updateViewPosition();
		}

		function onNodeDragEnd(e: MouseEvent) {
			window.removeEventListener('mousemove', onNodeDragMove);
			window.removeEventListener('mouseup', onNodeDragEnd);	
		}
	}

	makeDraggable(zoomContainer);

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

			for (const destination of node.jumps) {
				const destinationElement = getNodeView(destination.destinationTitle);

				if (!destinationElement) {
					console.warn(`Node ${node.title} has destination ${destinationElement}, but no element for this destination exists!`);
					continue;
				}

				nodeView.outgoingConnections.push(destinationElement);
			}

			let positionX : number, positionY : number;

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

					// Move this node by (dx,dy) pixels, scaled by our scaling factor
					const deltaX = positionX - e.clientX;
					const deltaY = positionY - e.clientY;
					positionX = e.clientX;
					positionY = e.clientY;

					var position = nodeView.getPosition();
					
					position.x -= deltaX * (1 / currentScale);
					position.y -= deltaY * (1 / currentScale);

					nodeView.setPosition(position);

					
					// Recalculate our lines
					nodesContainer.removeChild(linesSVG);
					linesSVG = getLinesSVGForNodes(nodeViews);
					nodesContainer.appendChild(linesSVG);

					console.log(`Drag move ${nodeView.nodeName}`);
				}

				function onNodeDragEnd(e: MouseEvent) {
					const position = nodeView.getPosition();
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

/**
 * Creates an SVG element that contains lines connecting the indicated nodes.
 * @param nodes The nodes to draw lines between.
 * @returns An SVGElement containing lines between the provided nodes.
 */
function getLinesSVGForNodes(nodes: NodeView[]) : SVGElement {
	const arrowHeadSize = 9;
	const lineThickness = 2;
	const color = 'var(--vscode-charts-lines)';

	type ArrowDescriptor = [
		sx	: number,	 /** The x position of the (padded) starting point. */
		sy	: number,	 /** The y position of the (padded) starting point. */
		c1x	: number,	 /** The x position of the control point of the starting point. */
		c1y	: number,	 /** The y position of the control point of the starting point. */
		c2x	: number,	 /** The x position of the control point of the ending point. */
		c2y	: number,	 /** The y position of the control point of the ending point. */
		ex	: number,	 /** The x position of the (padded) ending point. */
		ey	: number,	 /** The y position of the (padded) ending point. */
		ae	: number,	 /** The angle (in degree) for an ending arrowhead. */
		as	: number,	 /** The angle (in degree) for a starting arrowhead. */
	]

	let arrowDescriptors: ArrowDescriptor[] = [];

	for (const fromNode of nodes) {
		for (const toNode of fromNode.outgoingConnections) {
			let fromPosition = fromNode.getPosition();
			let toPosition = toNode.getPosition();
			let fromSize = fromNode.element.getBoundingClientRect();
			let toSize = toNode.element.getBoundingClientRect();

			const arrow = CurvedArrows.getBoxToBoxArrow(
				fromPosition.x + globalThis.offset.x,
				fromPosition.y + globalThis.offset.y,
				fromSize.width * (1 / currentScale),
				fromSize.height * (1 / currentScale),

				toPosition.x + globalThis.offset.x,
				toPosition.y + globalThis.offset.y,
				toSize.width * (1 / currentScale),
				toSize.height * (1 / currentScale),

				{padEnd: arrowHeadSize}
			) as ArrowDescriptor;

			arrowDescriptors.push(arrow);
		}
	}

	let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute("width", "100%");
	svg.setAttribute("height", "100%");
	svg.style.overflow = "visible";
	svg.style.zIndex = "-1";
	svg.id = "lines";
	
	for (const arrow of arrowDescriptors) {
		let [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = arrow;

		let line = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		line.setAttribute("d", `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`);
		line.setAttribute("stroke", color);
		line.setAttribute("stroke-width", lineThickness.toString());
		line.setAttribute("fill", "none");

		svg.appendChild(line);
		
		let arrowHead = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
		
		arrowHead.setAttribute('points', `0,${-arrowHeadSize} ${arrowHeadSize *
			2},0, 0,${arrowHeadSize}`);
		arrowHead.setAttribute('transform', `translate(${ex}, ${ey}) rotate(${ae})`);
		arrowHead.setAttribute('fill', color);
			
		svg.appendChild(arrowHead);
	}

	return svg;
}
