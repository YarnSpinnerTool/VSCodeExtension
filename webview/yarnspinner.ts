import { NodesUpdatedEvent } from "../src/types/editor";

import { NodeInfo } from "./nodes";
import * as CurvedArrows from 'curved-arrows';

interface VSCode {
	postMessage(message: any): void;
}

/** Decomposes a DOMMatrix into its translation, rotation, scale and skew (where possible).
 * @param mat: The matrix to decompose.
 */
function decomposeTransformMatrix(mat: DOMMatrix) {
	var a = mat.a;
	var b = mat.b;
	var c = mat.c;
	var d = mat.d;
	var e = mat.e;
	var f = mat.f;

	var delta = a * d - b * c;

	let result = {
		translation: { x: e, y: f },
		rotation: 0,
		scale: { x: 0, y: 0 },
		skew: { x: 0, y: 0 },
	};

	// Apply QR-like decomposition of the 2D matrix.
	if (a != 0 || b != 0) {
		var r = Math.sqrt(a * a + b * b);
		result.rotation = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
		result.scale = { x: r, y: delta / r };
		result.skew = { x: Math.atan((a * c + b * d) / (r * r)), y: 0 };
	} else if (c != 0 || d != 0) {
		var s = Math.sqrt(c * c + d * d);
		result.rotation =
			Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
		result.scale = { x: delta / s, y: s };
		result.skew = { x: 0, y: Math.atan((a * c + b * d) / (s * s)) };
	} else {
		// a = b = c = d = 0
	}

	return result;
}

class ViewState {

	/** Enables the view-state debugging display. */
	static readonly DEBUG = false;

	// Debugging variables
	private centerDebug: HTMLElement | null = null;

	private debugMousePosition: Position = { x: 0, y: 0 };

	/** The transform matrix used for translating and scaling the node view. */
	private matrix: DOMMatrix = new DOMMatrix()

	/** The number of nodes that have been created since the last time the
	* viewport was moved. */
	private nodesSinceLastMove = 0;

	/** Updates the transform of the nodes container based on the transform
	 * matrix. */
	private updateView() {
		const matrix = this.matrix;
		// nodesContainer.style.transform = `translate(${-this.viewPosition.x}px, ${-this.viewPosition.y}px) scale(${this.zoomScale})`;
		nodesContainer.style.transform = `matrix(${matrix.a}, ${matrix.b}, ${matrix.c}, ${matrix.d}, ${matrix.e}, ${matrix.f})`;

		this.nodesSinceLastMove = 0;
		this.updateDebugView();
	}

	/**
	 * Converts a position from view-space to client-space.
	 * @param viewSpacePosition The position to convert, in view-space coordinates.
	 * @returns The position in client-space coordinates.
	 */
	public convertToClientSpace(viewSpacePosition: Position): Position {
		let point = new DOMPoint(viewSpacePosition.x, viewSpacePosition.y);
		let { x, y } = point.matrixTransform(this.matrix);
		return { x, y };
	}

	/**
	 * Converts a position from client-space to view-space.
	 * @param clientSpacePosition The position to convert, in client-space coordinates.
	 * @returns The position in view-space coordinates.
	 */
	public convertToViewSpace(clientSpacePosition: Position): Position {
		let point = new DOMPoint(clientSpacePosition.x, clientSpacePosition.y);
		let { x, y } = point.matrixTransform(this.matrix.inverse());
		return { x, y };
	}

	constructor(zoomContainer: HTMLElement, nodesContainer: HTMLElement) {

		if (ViewState.DEBUG) {
			// The center debug element is kept in the middle of the window, but
			// positioned in view-space
			this.centerDebug = document.createElement('div');
			this.centerDebug.style.position = 'absolute';
			this.centerDebug.style.top = '0';
			this.centerDebug.style.left = '0';
			this.centerDebug.style.width = '8px';
			this.centerDebug.style.height = '8px';
			this.centerDebug.style.background = 'red';
			this.centerDebug.style.opacity = '0.5';
			nodesContainer.appendChild(this.centerDebug);

			// The origin debug element is always at (0,0)
			let originDebug = document.createElement('div');
			originDebug.style.position = 'absolute';
			originDebug.style.top = '0';
			originDebug.style.left = '0';
			originDebug.style.width = '8px';
			originDebug.style.height = '8px';
			originDebug.style.background = 'green';
			originDebug.style.opacity = '0.5';
			nodesContainer.appendChild(originDebug);

			window.addEventListener('mousemove', e => {
				let zoomRect = zoomContainer.getBoundingClientRect();
				let clientPosition = { x: e.clientX, y: e.clientY };
				this.debugMousePosition = {
					x: clientPosition.x - zoomRect.left,
					y: clientPosition.y - zoomRect.top,
				};
				this.updateDebugView();
			});
		} else {
			document.getElementById("graph-debug")?.remove();
		}

		// When the mousewheel is scrolled (or a two-finger scroll gesture is
		// performed), zoom where the mouse cursor is.
		zoomContainer.addEventListener('wheel', e => {
			const delta = e.deltaY / zoomSpeed
			let nextScale = 1 - delta * factor;

			// We want to zoom in on where the cursor is. To do this, we need to
			// convert from client-space coordinates to view-space coordinates,
			// so that we can zoom in on that point in space.

			let zoomPositionViewSpace = this.convertToViewSpace({
				x: e.clientX,
				y: e.clientY,
			});

			// We also want to detect if scaling by 'nextScale' will cause us to
			// exceed our limits. To do that, we need to know what our current
			// scale factor is, so we can compute what our resulting scale
			// factor would be.
			let originalScale = decomposeTransformMatrix(this.matrix).scale.x;

			// If it's outside our limits, adjust the scaling factor so that it
			// doesn't go over the limit.
			if ((originalScale * nextScale) > zoomMaxScale) {
				nextScale *= zoomMaxScale / (originalScale * nextScale);
			} else if ((originalScale * nextScale) < zoomMinScale) {
				nextScale *= zoomMinScale / (originalScale * nextScale);
			}

			// Finally, apply our adjustment to the matrix and update the view.
			this.matrix.scaleSelf(nextScale, nextScale, 1, zoomPositionViewSpace.x, zoomPositionViewSpace.y, 0);

			this.updateView();
		});

		// Stores the last position that our mouse cursor was at during a drag,
		// in client space.
		let backgroundDragClientSpace: Position = { x: 0, y: 0 };

		// When we start dragging the background, start tracking mouseup,
		// mousemove, and mouseleave to apply the drag gesture.
		const onBackgroundDragStart = (e: MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			backgroundDragClientSpace = { x: e.clientX, y: e.clientY };

			window.addEventListener('mousemove', onBackgroundDragMove);
			window.addEventListener('mouseup', onBackgroundDragEnd);
			window.addEventListener('mouseleave', onBackgroundDragEnd);
		}

		// When the mouse moves during a drag, calculate how much the cursor has
		// moved in view-space, and apply that translation.
		const onBackgroundDragMove = (e: MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			const lastPositionViewSpace = this.convertToViewSpace(backgroundDragClientSpace);
			const thisPositionViewSpace = this.convertToViewSpace({ x: e.clientX, y: e.clientY });
			const deltaViewSpace = {
				x: thisPositionViewSpace.x - lastPositionViewSpace.x,
				y: thisPositionViewSpace.y - lastPositionViewSpace.y,
			}

			backgroundDragClientSpace = { x: e.clientX, y: e.clientY };

			this.matrix.translateSelf(deltaViewSpace.x, deltaViewSpace.y);

			this.updateView();
		}

		// When the mouse stops dragging, remove the handlers that track the
		// drag.
		function onBackgroundDragEnd(e: MouseEvent) {
			window.removeEventListener('mousemove', onBackgroundDragMove);
			window.removeEventListener('mouseup', onBackgroundDragEnd);
			window.removeEventListener('mouseleave', onBackgroundDragEnd);
		}

		// Finally, install the mouse-down event handler so that we know to
		// start tracking drags.
		zoomContainer.addEventListener('mousedown', onBackgroundDragStart);
	}

	private updateDebugView() {
		if (!ViewState.DEBUG) {
			return;
		}

		const centerWindowSpace = getWindowCenter();
		const centerViewSpace = this.convertToViewSpace(centerWindowSpace);

		const { translation, scale } = decomposeTransformMatrix(this.matrix);

		function position(p: Position): string {
			return `(${Math.floor(p.x)},${Math.floor(p.y)})`
		}

		document.getElementById("graph-debug")!.innerHTML = `
		<p>Scale: ${scale.x}</p>
		<p>View Position (view space): ${position(translation)}</p>
		<p>Center (window space)  ${position(centerWindowSpace)}</p>
		<p>Center (view space): ${position(centerViewSpace)}</p>
		<p>Mouse (window space): ${position(this.debugMousePosition)}</p>
		<p>Mouse (view space): ${position(this.convertToViewSpace(this.debugMousePosition))}</p>
		`;


		let newNodePosition = this.convertToViewSpace(getWindowCenter());

		if (this.centerDebug) {
			this.centerDebug.style.transform = `translate(${newNodePosition.x}px, ${newNodePosition.y}px)`
		}
	}

	public getPositionForNewNode(incrementNodeCount = true) {
		let nodePosition = getWindowCenter();
		nodePosition = this.convertToViewSpace(nodePosition);

		nodePosition.x -= NodeSize.width / 2;
		nodePosition.y -= NodeSize.height / 2;

		nodePosition.x += newNodeOffset * this.nodesSinceLastMove;
		nodePosition.y += newNodeOffset * this.nodesSinceLastMove;

		if (incrementNodeCount) {
			this.nodesSinceLastMove += 1;
		}

		return nodePosition;
	}

	public focusOnNode(node: NodeView) {
		let { scale } = decomposeTransformMatrix(this.matrix);

		this.matrix = new DOMMatrix()
			.translate(-node.position.x, -node.position.y, 0)
			.scale(scale.x, scale.y, 1, node.position.x, node.position.y, 0);

		const centerViewSpace = this.convertToViewSpace(getWindowCenter());
		const centerDelta = {
			x: (node.position.x + NodeSize.width / 2) - centerViewSpace.x,
			y: (node.position.y + NodeSize.height / 2) - centerViewSpace.y,
		}
		this.matrix.translateSelf(-centerDelta.x, -centerDelta.y);


		this.updateView();
	}
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
				this.position = { x: elements[0], y: elements[1] };
			} catch (e) {
				this.position = { x: 0, y: 0 };
			}
		} else {
			this.position = { x: 0, y: 0 };
		}
	}

	public set position(position: Position) {
		this.element.style.transform = `translate(${position.x}px, ${position.y}px)`;

		this.element.dataset.positionX = position.x.toString();
		this.element.dataset.positionY = position.y.toString();

	}

	public get position(): Position {
		return {
			x: parseFloat(this.element.dataset.positionX ?? "0"),
			y: parseFloat(this.element.dataset.positionY ?? "0")
		}
	}
}

export { }

declare global {
	function acquireVsCodeApi(): VSCode;

	var nodeViews: NodeView[];
}

const factor = 0.1
const zoomSpeed = 120

const zoomMinScale = 0.1
const zoomMaxScale = 2

/** How far from the last node each new node will be created */
const newNodeOffset = 10;


const NodeSize = {
	width: 150,
	height: 75,
};

let nodesContainer: HTMLElement;
let zoomContainer: HTMLElement;

zoomContainer = document.querySelector('.zoom-container') as HTMLElement;
nodesContainer = document.querySelector('.nodes') as HTMLElement;

let viewState = new ViewState(zoomContainer, nodesContainer);

var buttonsContainer = document.querySelector('#nodes-header');

if (!buttonsContainer) {
	throw new Error("Failed to find buttons container");
}

function updateBackgroundPosition() {
	console.log("update background position");
	// document.body.style.backgroundPositionX = (offset.x * (currentScale)).toString() + "px";;
	// document.body.style.backgroundPositionY = (offset.y * (currentScale)).toString() + "px";

	// updateDebugView();
}

function getNodeView(name: string): NodeView | undefined {
	return globalThis.nodeViews.filter(nv => nv.nodeName === name)[0];
}

interface Position {
	x: number;
	y: number;
}

function scale(position: Position, factor: number): Position {
	return {
		x: position.x * factor,
		y: position.y * factor,
	}
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

/**
 * Returns the coordinates of the center of the window.
 * @returns The center of the window.
 */
function getWindowCenter(): Position {
	const size = getWindowSize();

	return {
		x: Math.round(size.width / 2),
		y: Math.round(size.height / 2),
	}
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
		const event = e.data;

		if (event.type == "update") {
			nodesUpdated(event);
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

			const node = globalThis.nodeViews.filter(n => n.nodeName === dropdown.value)[0]



			if (node !== undefined) {
				viewState.focusOnNode(node);
			}

		}
		dropdown.selectedIndex = 0;
	});

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

/**
 * Creates an SVG element that contains lines connecting the indicated nodes.
 * @param nodes The nodes to draw lines between.
 * @returns An SVGElement containing lines between the provided nodes.
 */
function getLinesSVGForNodes(nodes: NodeView[]): SVGElement {
	const arrowHeadSize = 9;
	const lineThickness = 2;
	const color = 'var(--vscode-charts-lines)';

	type ArrowDescriptor = [
		sx: number,	 /** The x position of the (padded) starting point. */
		sy: number,	 /** The y position of the (padded) starting point. */
		c1x: number,	 /** The x position of the control point of the starting point. */
		c1y: number,	 /** The y position of the control point of the starting point. */
		c2x: number,	 /** The x position of the control point of the ending point. */
		c2y: number,	 /** The y position of the control point of the ending point. */
		ex: number,	 /** The x position of the (padded) ending point. */
		ey: number,	 /** The y position of the (padded) ending point. */
		ae: number,	 /** The angle (in degree) for an ending arrowhead. */
		as: number,	 /** The angle (in degree) for a starting arrowhead. */
	]

	let arrowDescriptors: ArrowDescriptor[] = [];

	for (const fromNode of nodes) {
		for (const toNode of fromNode.outgoingConnections) {
			let fromPosition = fromNode.position;
			let toPosition = toNode.position;
			let fromSize = NodeSize;
			let toSize = NodeSize;

			const arrow = CurvedArrows.getBoxToBoxArrow(
				fromPosition.x,
				fromPosition.y,
				fromSize.width,
				fromSize.height,

				toPosition.x,
				toPosition.y,
				toSize.width,
				toSize.height,

				{ padEnd: arrowHeadSize }
			) as ArrowDescriptor;

			arrowDescriptors.push(arrow);
		}
	}

	let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.style.position = 'absolute';
	svg.style.left = '0';
	svg.style.top = '0';
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
