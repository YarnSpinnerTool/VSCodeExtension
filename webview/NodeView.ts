import { NodeInfo } from "./nodes";
import { Position } from "./util";


export class NodeView {
	nodeName: string;
	element: HTMLElement;
	private _position: Position = {x: 0, y: 0};

	outgoingConnections: NodeView[] = [];

	constructor(node: NodeInfo, element: HTMLElement) {
		this.nodeName = node.title;
		this.element = element;

		this.element.id = "node-" + node.title;
		this.element.dataset.nodeName = node.title;
	}

	public set position(position: Position) {
		this.element.style.transform = `translate(${position.x}px, ${position.y}px)`;

		this._position = position;
	}

	public get position(): Position {
		return this._position;
	}
}
