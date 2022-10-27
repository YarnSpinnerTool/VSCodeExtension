import { NodeInfo } from "./nodes";
import { Position } from "./util";


export class NodeView {
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
		};
	}
}
