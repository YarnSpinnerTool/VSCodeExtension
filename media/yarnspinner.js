
// @ts-check

/** @typedef { import ("../node_modules/@interactjs/types").Interactable } Interactable */

/** @typedef { import('../src/editor').NodesUpdatedEvent } NodesUpdatedEvent */

const NodeSize = {
	width: 150,
	height: 75,
};

// Script run within the webview itself.
(function () {
	
	// Get a reference to the VS Code webview api.
	// We use this API to post messages back to our extension.
	
	// @ts-ignore
	const vscode = acquireVsCodeApi();

	/** @type HTMLElement */
	var nodesContainer = document.querySelector('.nodes');

	/** @type HTMLElement */
	var buttonsContainer = document.querySelector('#nodes-header');

	buttonsContainer.querySelector('#add-node').addEventListener('click', () => {
		let nodePosition = getWindowCenter();
		nodePosition.x -= NodeSize.width / 2;
		nodePosition.y -= NodeSize.height / 2;

		vscode.postMessage({
			type: 'add',
			position: nodePosition
		});
	});

	window.addEventListener('message', (/** @type any */ e) => {
		const event = e.data;
		
		if (event.type == "update") {
			nodesUpdated(event);
		}
	});

	/**
	 * @param {HTMLElement} element
	 * @param {{x: number;y: number;}} position
	 */
	function setNodeViewPosition(element, position) {
		const offsetPosition = {
			x: position.x + globalThis.offset.x,
			y: position.y + globalThis.offset.y,
		}

		element.style.transform = `translate(${offsetPosition.x}px, ${offsetPosition.y}px)`;
		
		element.dataset.positionX = position.x.toString();
		element.dataset.positionY = position.y.toString();
	}

	/** 
	 * @param {HTMLElement} element  
	 * @returns {{x : number, y:number}} 
	 */
	function getNodeViewPosition(element) {
		return {
			x: parseFloat(element.dataset.positionX), 
			y: parseFloat(element.dataset.positionY)
		}
	}

	/**
	 * @param {{x : number, y:number}} offset 
	 */
	function updateBackgroundPosition(offset) {
		document.body.style.backgroundPositionX = offset.x.toString() + "px";;
		document.body.style.backgroundPositionY = offset.y.toString() + "px";
	}

	/**
	 * Returns the coordinates of the center of the window.
	 * @returns {{x: number, y:number}}
	 */
	function getWindowCenter() {
		return {
			x: Math.round(window.visualViewport.width / 2 - globalThis.offset.x),
			y: Math.round(window.visualViewport.height / 2 - globalThis.offset.y),
		}
	}
	

	globalThis.lines = [];
	globalThis.nodeElements = [];

	// The offset that we have panned the entire canvas to. This starts offset,
	// so that {0,0} is near the center of the window, and a node at {0,0} will
	// appear pleasingly centered.

	globalThis.offset = { x: window.visualViewport.width / 2 - NodeSize.width / 2, y: window.visualViewport.height / 2 - NodeSize.height / 2 };

	updateBackgroundPosition(globalThis.offset);


	/**
	 * @param {NodesUpdatedEvent} data 
	 */
	function updateDropdownList(data) {
		const dropdown = document.querySelector("#node-jump");
		
		const icon = dropdown.querySelector("#icon");

		
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

	/** @type {HTMLSelectElement} */
	const dropdown = document.querySelector("#node-jump");

	dropdown.addEventListener("change", (/** @type any */ evt) => {
		if (dropdown.selectedIndex > 0) {
			// We selected a node.
			console.log(`Jumping to ${dropdown.value}`);
			
			/** @type {HTMLElement[]} */
			var elements = globalThis.nodeElements.filter(n => n.dataset.nodeName === dropdown.value);
			var element = elements[0];

			if (element !== undefined) {
				setViewPositionToElement(element);
			}

		}
		dropdown.selectedIndex = 0;
	});

	function setViewPositionToElement(element) {
		var newOffset = {
			x: -parseFloat(element.dataset.positionX) + window.visualViewport.width / 2 - NodeSize.width / 2,
			y: -parseFloat(element.dataset.positionY) + window.visualViewport.height / 2 - NodeSize.height / 2,
		};

		globalThis.offset = newOffset;

		updateViewPosition();
	}

	function updateViewPosition() {
		for (const element of globalThis.nodeElements) {
			setNodeViewPosition(element, getNodeViewPosition(element));
		}

		for (const line of globalThis.lines) {
			line.position();
		}

		updateBackgroundPosition(globalThis.offset);
	}

	// Set up the canvas drag interaction: whenever the canvas itself is
	// dragged, update the canvas offset, update the displayed position of
	// all nodes to reflect this offset, and update all lines

	// @ts-expect-error
	var nodesContainerInteraction = interact(nodesContainer);

	nodesContainerInteraction.draggable({
		onmove(event) {
			globalThis.offset.x += event.dx;
			globalThis.offset.y += event.dy;

			updateViewPosition();
		}
	});

	/**
	 * Called whenever the extension notifies us that the nodes in the
	 * document have changed.
	 * @param data {NodesUpdatedEvent} Information about the document's
	 * nodes.
	 */
	function nodesUpdated(data) {

		// Remove all node views
		nodesContainer.innerHTML = '';

		var jumpToFirstNode = false;

		if (!globalThis.nodeElements || globalThis.nodeElements.length == 0) {
			// We don't have any nodes. Note that we want to snap our view to
			// the first one in the list, if any.
			jumpToFirstNode = true;
		}

		globalThis.nodeElements = [];

		// Remove and unregister all line views
		for (const line of globalThis.lines) {
			line.remove();
		}

		globalThis.lines = [];
		
		updateDropdownList(data);

		/** Maps node titles to their corresponding HTML elements.
		* @type Object.<string, HTMLElement> */
		var nodesToElements = {}

		/** Maps node titles to a collection of LeaderLine objects.
		 * These lines will update when a node of this title moves.
		 *  @type Object.<string, any[]> */
		var nodesToLines = {}

		/** @type HTMLElement | null */
		const template = document.querySelector('#node-template');
		if (!template) {
			console.error("Failed to find node view template");
			return;
		}
		
		for (const node of data.nodes) {

			/** @type HTMLElement */
			// @ts-expect-error
			const newNodeElement = template.cloneNode(true)
			
			newNodeElement.id = "node-" + node.title;

			newNodeElement.dataset.nodeName = node.title;
			
			/** @type HTMLElement | null */
			const title = newNodeElement.querySelector('.title');
			if (title) {
				title.innerText = node.title;
			}

			/** @type HTMLElement | null */
			const preview = newNodeElement.querySelector('.preview');
			if (preview) {
				preview.innerText = node.previewText;
			}

			/** @type HTMLElement | null */
			const deleteButton = newNodeElement.querySelector('.button-delete');
			if (deleteButton) {
				deleteButton.addEventListener('click', (evt) => {
					var ID = node.title;
					vscode.postMessage({
						type: 'delete',
						id: ID
					});
				});
			}

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
			

			nodesToElements[node.title] = newNodeElement;

			let position;

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

			setNodeViewPosition(newNodeElement, position);
			
			nodesContainer.appendChild(newNodeElement);

			globalThis.nodeElements.push(newNodeElement);
		}

		if (jumpToFirstNode && globalThis.nodeElements.length > 0) {
			setViewPositionToElement(globalThis.nodeElements[0])
		}

		for (const node of data.nodes) {

			const element = nodesToElements[node.title];
			
			for (const destination of node.jumps) {
				const destinationElement = nodesToElements[destination.destinationTitle];

				if (!destinationElement) {
					console.warn(`Node ${node.title} has destination ${destinationElement}, but no element for this destination exists!`);
					continue;
				}

				var line;

				if (element === destinationElement) {
					// @ts-expect-error
					var sourcePointAnchor = LeaderLine.pointAnchor(element, {x:'25%', y:'100%'});
					// @ts-expect-error
					var destinationPointAnchor = LeaderLine.pointAnchor(element, {x:'0%', y:'50%'});

					// @ts-expect-error
					line = new LeaderLine({ start: sourcePointAnchor, end: destinationPointAnchor })

					
					line.setOptions({
						startSocketGravity: [-50, 50],
						endSocketGravity: [-50, 0]
					});

					
					
				} else {

					// @ts-expect-error
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

			/** @type Interactable */
			//@ts-ignore
			const interactable = interact(element);
		
			interactable.draggable({
				onstart(event) {
					// no-op
				},
				onmove(event) {
					// Move this node by (dx,dy) pixels
					var position = getNodeViewPosition(event.target);
					
					position.x += event.dx;
					position.y += event.dy;
					
					setNodeViewPosition(event.target, position);

					if (nodesToLines[node.title]) {
						for (const line of nodesToLines[node.title]) {
							// Update line position
							line.position();
						}
					}
				},
				onend(event) {
					const position = getNodeViewPosition(event.target);
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


