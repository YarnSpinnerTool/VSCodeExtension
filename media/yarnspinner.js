
// @ts-check

/** @typedef { import ("../node_modules/@interactjs/types").Interactable } Interactable */

//interact

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
		console.log(e);
		const event = e.data;
		
		if (event.type == "update") {
			nodesUpdated(event);
		}
	});

	/**
	 * @param {HTMLDivElement} element
	 * @param {{x: number;y: number;}} position
	 */
	function setNodeViewPosition(element, position) {
		element.style.transform = `translate(${position.x}px, ${position.y}px)`;

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


    
	function nodesUpdated(/** @type import('../src/editor').NodesUpdatedEvent */ data) {
		nodesContainer.innerHTML = '';

		for (const node of data.nodes) {
			const element = document.createElement('div');
			element.className = 'node';

			
			const title = document.createElement('div');
			title.className = 'nodeName';
			title.innerText = node.title;

			element.appendChild(title);

			if (node.destinations.length > 0) {
				const list = document.createElement('ul');

				for (const destination of node.destinations) {
					const item = document.createElement('li');
					item.innerText = destination.title;
					list.appendChild(item);
				}

				element.appendChild(list);
			}

			setNodeViewPosition(element, node.position);

			nodesContainer.appendChild(element);

			
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
			
			})
		}
	}

}
)();

