import { GroupView } from "./GroupView";
import { NodeInfo } from "./nodes";
import { getPositionFromNodeInfo, Position, Size } from "./util";

type OutgoingConnection = {
    connectionType: "Jump" | "Detour";
} & (
    | {
          destinationType: "Node";
          nodeView: NodeView;
      }
    | { destinationType: "NodeGroup"; groupView: GroupView }
);

export class NodeView {
    nodeName: string = "";
    element: HTMLElement;

    /** The names of the tagged groups that this node view is in. */
    taggedGroups: string[] = [];

    /** The names of the node groups that the node view is in. */
    nodeGroup: string | null = null;

    private _position: Position = { x: 0, y: 0 };

    private _color: string | null = null;

    private _containsExternalJumps = false;

    outgoingConnections: OutgoingConnection[] = [];

    public onNodeEditClicked: (node: NodeView) => void = () => {};
    public onNodeDeleteClicked: (node: NodeView) => void = () => {};
    public onNodeDragStart: (node: NodeView) => void = () => {};
    public onNodeDragMove: (
        node: NodeView,
        fromPosition: Position,
        currentPosition: Position,
    ) => void = () => {};
    public onNodeDragEnd: (node: NodeView) => void = () => {};
    public onColorBarClicked: (nodeView: NodeView) => void = () => {};

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

            window.addEventListener("mousemove", onNodeDragMove);
            window.addEventListener("mouseup", onNodeDragEnd);

            this.onNodeDragStart(this);
        };

        const onNodeDragMove = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const dragPosition = { x: e.clientX, y: e.clientY };

            this.onNodeDragMove(this, currentPosition, dragPosition);

            currentPosition = dragPosition;
        };

        const onNodeDragEnd = (e: MouseEvent) => {
            window.removeEventListener("mousemove", onNodeDragMove);
            window.removeEventListener("mouseup", onNodeDragEnd);

            this.onNodeDragEnd(this);
        };

        const onNodeDoubleClick = (e: MouseEvent) => {
            // Double-clicking a node is the same as clicking the 'Edit' button
            this.onNodeEditClicked(this);
        };

        this.element.addEventListener("mousedown", onNodeDragStart);
        this.element.addEventListener("dblclick", onNodeDoubleClick);
    }

    private createElement(): HTMLElement {
        const template = document.querySelector(
            "#node-template",
        ) as HTMLElement;
        if (!template) {
            throw new Error("Failed to find node view template");
        }
        const newElement = template.cloneNode(true) as HTMLElement;

        const deleteButton = newElement.querySelector(
            ".button-delete",
        ) as HTMLElement;
        const editButton = newElement.querySelector(
            ".button-edit",
        ) as HTMLElement;

        deleteButton.addEventListener("click", () =>
            this.onNodeDeleteClicked(this),
        );
        editButton.addEventListener("click", () =>
            this.onNodeEditClicked(this),
        );

        const colorBar = newElement.querySelector(".color-bar") as HTMLElement;

        colorBar.addEventListener("mousedown", (e) => {
            e.stopPropagation();
            this.onColorBarClicked(this);
        });

        return newElement;
    }

    public set nodeInfo(node: NodeInfo) {
        this.nodeName = node.uniqueTitle ?? "(Error: no title)";
        this.position = getPositionFromNodeInfo(node) ?? { x: 0, y: 0 };

        const isInNodeGroup = node.sourceTitle != node.uniqueTitle;

        this.element.id = "node-" + (node.uniqueTitle ?? "$error.unknown");
        this.element.dataset.nodeName = node.uniqueTitle ?? "$error.unknown";

        this.title = isInNodeGroup
            ? undefined
            : (node.sourceTitle ?? undefined);
        this.subtitle = node.subtitle ?? undefined;

        this.preview = node.previewText;

        // 'groups' is defined as an array, but here we only fetch a single
        // 'group' header, so it currently only ever has zero or one elements.
        // Once we have a defined way to say a node can be in multiple groups,
        // update this code to populate 'groups' with the right number of
        // elements.
        var groupHeaders = node.headers.filter(
            (header) => header.key == "group",
        )[0];
        this.taggedGroups = groupHeaders ? [groupHeaders.value] : [];
        this.nodeGroup = isInNodeGroup ? (node.sourceTitle ?? null) : null;

        var colorHeader = node.headers.filter(
            (header) => header.key == "color",
        )[0];
        if (colorHeader) {
            this.color = colorHeader.value;
        } else {
            this.color = null;
        }

        const isNote =
            node.headers.find(
                (h) => h.key === "style" && h.value === "note",
            ) !== undefined;
        this.isNote = isNote;

        this.containsExternalJumps = node.containsExternalJumps;
    }

    public set title(newTitle: string | undefined) {
        const titleElement = this.element.querySelector(
            ".title",
        ) as HTMLElement;
        this.element.classList.toggle("has-title", newTitle !== undefined);
        titleElement.innerText = newTitle ?? "";
    }

    public set subtitle(newTitle: string | undefined) {
        const subtitleElement = this.element.querySelector(
            ".subtitle",
        ) as HTMLElement;

        this.element.classList.toggle("has-subtitle", newTitle !== undefined);
        subtitleElement.innerText = newTitle ?? "";
    }

    public set preview(newPreview: string) {
        const title = this.element.querySelector(".preview") as HTMLElement;
        title.innerText = newPreview;
    }

    public set position(position: Position) {
        this.element.style.transform = `translate(${position.x}px, ${position.y}px)`;

        this._position = position;
    }

    public get position(): Position {
        return this._position;
    }

    public get color(): string | null {
        return this._color;
    }

    public set isNote(value: boolean) {
        this.element.classList.toggle("note", value);
    }

    public get containsExternalJumps(): boolean {
        return this._containsExternalJumps;
    }

    public set containsExternalJumps(value: boolean) {
        this._containsExternalJumps = value;
        this.element.classList.toggle("external-jumps", value);
    }

    public set color(colorName: string | null) {
        this._color = colorName;

        // Remove all classes that begin with 'color-'
        const existingColorClasses = Array.from(this.element.classList).filter(
            (v) => v.startsWith("color-"),
        );
        this.element.classList.remove(...existingColorClasses);
        this.element.classList.remove("color");

        if (colorName) {
            this.element.classList.add("color-" + colorName);
            this.element.classList.add("color");
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
        this.position = {
            x: this.position.x,
            y: newValue - this.element.offsetHeight,
        };
    }

    public get right(): number {
        return this.position.x + this.element.offsetWidth;
    }
    public set right(newValue) {
        this.position = {
            x: newValue - this.element.offsetWidth,
            y: this.position.y,
        };
    }

    public get size(): Size {
        const { width, height } = this;
        return { width, height };
    }

    public get width(): number {
        return this.element.offsetWidth;
    }
    public get height(): number {
        return this.element.offsetHeight;
    }
}
