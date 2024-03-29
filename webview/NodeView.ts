import { NodeInfo } from "./nodes";
import { getPositionFromNodeInfo, Position } from "./util";

export class NodeView {
	nodeName: string = "";
	element: HTMLElement;

	/** The names of the groups that this node view is in. */
	groups: string[] = [];
	private _position: Position = { x: 0, y: 0 };

	outgoingConnections: NodeView[] = [];

	public onNodeEditClicked: (node: NodeView) => void = () => { };
	public onNodeDeleteClicked: (node: NodeView) => void = () => { };
	public onNodeDragStart: (node: NodeView) => void = () => { };
	public onNodeDragMove: (node: NodeView, fromPosition: Position, currentPosition: Position) => void = () => { };
	public onNodeDragEnd: (node: NodeView) => void = () => { };

	constructor(node: NodeInfo) {
		this.element = this.createElement();

		this.nodeInfo = node;

		this.makeDraggable();
	}

	private makeDraggable() {

		/** The current position of the drag, in client space. */
		let currentPosition: Position = { x: 0, y: 0 };

		const onNodeDragStart = (e: MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			currentPosition = { x: e.clientX, y: e.clientY };

			window.addEventListener('mousemove', onNodeDragMove);
			window.addEventListener('mouseup', onNodeDragEnd);

			this.onNodeDragStart(this);
		}

		const onNodeDragMove = (e: MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			const dragPosition = { x: e.clientX, y: e.clientY };

			this.onNodeDragMove(this, currentPosition, dragPosition);

			currentPosition = dragPosition;
		}

		const onNodeDragEnd = (e: MouseEvent) => {
			window.removeEventListener('mousemove', onNodeDragMove);
			window.removeEventListener('mouseup', onNodeDragEnd);

			this.onNodeDragEnd(this);
		}

		const onNodeDoubleClick = (e: MouseEvent) => {
			// Double-clicking a node is the same as clicking the 'Edit' button
			this.onNodeEditClicked(this);
		}

		this.element.addEventListener('mousedown', onNodeDragStart);
		this.element.addEventListener('dblclick', onNodeDoubleClick);
	}

	private createElement(): HTMLElement {
		const template = document.querySelector('#node-template') as HTMLElement;
		if (!template) {
			throw new Error("Failed to find node view template");
		}
		const newElement = template.cloneNode(true) as HTMLElement;

		const deleteButton = newElement.querySelector('.button-delete') as HTMLElement;
		const editButton = newElement.querySelector('.button-edit') as HTMLElement;

		deleteButton.addEventListener('click', () => this.onNodeDeleteClicked(this));
		editButton.addEventListener('click', () => this.onNodeEditClicked(this));

		return newElement;
	}

	public set nodeInfo(node: NodeInfo) {
		this.nodeName = node.title;
		this.position = getPositionFromNodeInfo(node) ?? { x: 0, y: 0 };
		this.title = node.title;
		this.preview = node.previewText;
		
		// 'groups' is defined as an array, but here we only fetch a single
		// 'group' header, so it currently only ever has zero or one elements.
		// Once we have a defined way to say a node can be in multiple groups,
		// update this code to populate 'groups' with the right number of
		// elements.
		var groupHeader = node.headers.filter((header) => header.key == "group")[0];		
		this.groups = groupHeader ? [groupHeader.value] : [];

		var colorHeader = node.headers.filter((header) => header.key == "color")[0];
		if (colorHeader) {
			this.color = colorHeader.value;
		}
	}

	public set title(newTitle: string) {
		const title = this.element.querySelector('.title') as HTMLElement;
		title.innerText = newTitle;

		this.element.id = "node-" + newTitle;
		this.element.dataset.nodeName = newTitle;
	}

	public set preview(newPreview: string) {
		const title = this.element.querySelector('.preview') as HTMLElement;
		title.innerText = newPreview;
	}

	public set position(position: Position) {
		this.element.style.transform = `translate(${position.x}px, ${position.y}px)`;

		this._position = position;
	}

	public get position(): Position {
		return this._position;
	}

	public set color(colorName: string) {
		// Remove all classes that begin with 'color-'
		const existingColorClasses = Array.from(this.element.classList).filter(v => v.startsWith("color-"));
		this.element.classList.remove(...existingColorClasses)

		if (colorName) {
			this.element.classList.add("color-" + colorName);
		}
	}

	translate(dragDeltaViewSpace: Position) {
		var newPosition = this.position;
		newPosition.x += dragDeltaViewSpace.x;
		newPosition.y += dragDeltaViewSpace.y;
		this.position = newPosition;
	}

	public get top(): number {
		return this.position.y;
	}
	public set top(newValue: number) {
		this.position = { x: this.position.x, y: newValue };
	}

	public get left(): number {
		return this.position.x;
	}

	public set left(newValue: number) {
		this.position = { x: newValue, y: this.position.y };
	}

	public get bottom(): number {
		return this.position.y + this.element.offsetHeight;
	}
	public set bottom(newValue: number) {
		this.position = { x: this.position.x, y: newValue - this.element.offsetHeight };
	}

	public get right(): number {
		return this.position.x + this.element.offsetWidth;
	}
	public set right(newValue) {
		this.position = { x: newValue - this.element.offsetWidth, y: this.position.y };
	}
}
