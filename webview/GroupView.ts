import { NodeView } from "./NodeView";
import { Position, Size } from "./util";

const groupViewPadding: number = 20;
const groupViewHeaderSize: number = 20;

export class GroupView {
	public element: HTMLElement;

    private _nodeViews: NodeView[] = []

    private _nameNode: Text;
	
    constructor() {
        this.element = GroupView.createElement();
        this._nameNode = document.createTextNode("Group");
        this.element.prepend(this._nameNode);
    }

    public get nodeViews() { return this._nodeViews };

    public set nodeViews(value: NodeView[]) {
        this._nodeViews = value;
        
        this.refreshSize();
    }

    private static createElement(): HTMLElement {
        const element = document.createElement("div");
        element.classList.add("group");
        
        const background = document.createElement("div");
        background.classList.add("group-background");
        element.appendChild(background);


        return element;
    }

    public refreshSize() {
        if (this._nodeViews.length == 0) {
            this.element.style.display = "none";
            return;
        } else {
            this.element.style.display = "block";
        }

        let left = this._nodeViews.reduce<number>(((value, node) => node.left < value ? node.left : value), Number.POSITIVE_INFINITY);
        let top = this._nodeViews.reduce<number>(((value, node) => node.top < value ? node.top : value), Number.POSITIVE_INFINITY);
        let right = this._nodeViews.reduce<number>(((value, node) => node.right > value ? node.right : value), Number.NEGATIVE_INFINITY);
        let bottom = this._nodeViews.reduce<number>(((value, node) => node.bottom > value ? node.bottom : value), Number.NEGATIVE_INFINITY);

        left -= groupViewPadding;
        right += groupViewPadding;
        top -= (groupViewPadding + groupViewHeaderSize);
        bottom += groupViewPadding;

        const width = right - left;
        const height = bottom - top;

        if (width <= 0 || height <= 0) {
            // Invalid rect! Stop here.
            this.element.style.display = "none";
            return;
        }
        
        this.position = { x: left, y: top };
        this.size = { width: width, height: height };
    }

    public set position(position: Position) {
        this.element.style.transform = `translate(${position.x}px, ${position.y}px)`;
    }

    public set size(size: Size) {
        this.element.style.width = `${size.width.toString()}px`;
        this.element.style.height = `${size.height.toString()}px`;
    }

    public set name(name: string) {
        this._nameNode.textContent = name;
    }

    public get name() {
        return this._nameNode.textContent ?? "";
    };
}