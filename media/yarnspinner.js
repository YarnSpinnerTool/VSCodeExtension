
// @ts-check

/** @typedef { import ("../node_modules/@interactjs/types").Interactable } Interactable */

/** @typedef { import('../src/editor').NodesUpdatedEvent } NodesUpdatedEvent */

// Script run within the webview itself.
(function () {
	
	// Get a reference to the VS Code webview api.
	// We use this API to post messages back to our extension.
	
	// @ts-ignore
	const vscode = acquireVsCodeApi();

	/** @type HTMLElement */
	var nodesContainer = document.querySelector('.nodes');

	/** @type HTMLElement */
	var buttonsContainer = document.querySelector('.buttons');

	buttonsContainer.querySelector('#add-node').addEventListener('click', () => {
		vscode.postMessage({
			type: 'add'
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

	globalThis.lines = [];
	globalThis.nodeElements = [];

	// The offset that we have panned the entire canvas to. This starts
	// slightly offset, so that new nodes, and nodes that do not have a
	// 'position' header, are positioned somewhere slightly nicer than the
	// absolute top-left.
	globalThis.offset = { x: 50, y: 50 };

	// Set up the canvas drag interaction: whenever the canvas itself is
	// dragged, update the canvas offset, update the displayed position of
	// all nodes to reflect this offset, and update all lines

	// @ts-expect-error
	var nodesContainerInteraction = interact(nodesContainer);

	nodesContainerInteraction.draggable({
		onmove(event) {
			globalThis.offset.x += event.dx;
			globalThis.offset.y += event.dy;

			for (const element of globalThis.nodeElements) {
				setNodeViewPosition(element, getNodeViewPosition(element));
			}

			for (const line of globalThis.lines) {
				line.position();
			}
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

		globalThis.nodeElements = [];

		// Remove and unregister all line views
		for (const line of globalThis.lines) {
			line.remove();
		}

		globalThis.lines = [];
		

		/** Maps node titles to their corresponding HTML elements.
		* @type Object.<string, HTMLElement> */
		var nodesToElements = {}

		/** Maps node titles to a collection of LeaderLine objects.
		 * These lines will update when a node of this title moves.
		 *  @type Object.<string, any[]> */
		var nodesToLines = {}

		/** @type HTMLElement */
		const template = document.querySelector('#node-template');
		
		
		for (const node of data.nodes) {

			/** @type HTMLElement */
			// @ts-expect-error
			const newNodeElement = template.cloneNode(true)
			
			newNodeElement.id = null;
			
			/** @type HTMLElement */
			const title = newNodeElement.querySelector('.title');
			title.innerText = node.title;

			/** @type HTMLElement */
			const deleteButton = newNodeElement.querySelector('.button-delete');
			deleteButton.addEventListener('click', (evt) => {
				var ID = node.title;
				vscode.postMessage({
					type: 'delete',
					id: ID
				});
			});

			nodesToElements[node.title] = newNodeElement;

			setNodeViewPosition(newNodeElement, node.position);
			nodesContainer.appendChild(newNodeElement);

			globalThis.nodeElements.push(newNodeElement);
		}

		for (const node of data.nodes) {

			const element = nodesToElements[node.title];
			
			for (const destination of node.destinations) {
				const destinationElement = nodesToElements[destination];

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
					
					if (nodesToLines[destination]) {
						nodesToLines[destination].push(line);
					} else {
						nodesToLines[destination] = [line];
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

