import * as constants from "./constants";
import { NodeView } from "./NodeView";
import {
    decomposeTransformMatrix,
    getWindowCenter,
    Position,
    Size,
} from "./util";
import { NodeInfo } from "./nodes";
import { getLinesSVGForNodes } from "./svg";
import { arrayDiff } from "vscode-languageclient/lib/common/workspaceFolder";
import { GroupType, GroupView } from "./GroupView";

export enum Alignment {
    Left = "LEFT",
    Center = "CENTER",
    Right = "RIGHT",
    Top = "TOP",
    Middle = "MIDDLE",
    Bottom = "BOTTOM",
}

enum MouseGestureType {
    Unknown,
    Select,
    Pan,
}

export class ViewState {
    /** Enables the view-state debugging display. */
    static readonly DEBUG = false;

    // Debugging variables
    private centerDebug: HTMLElement | null = null;

    private debugMousePosition: Position = { x: 0, y: 0 };

    /** The transform matrix used for translating and scaling the node view. */
    private matrix: DOMMatrix = new DOMMatrix();

    /** The number of nodes that have been created since the last time the
     * viewport was moved. */
    private nodesSinceLastMove = 0;

    /** The node views currently displayed in this view. */
    public nodeViews: Map<string, NodeView>;

    /** The group views currently displayed in this view. */
    public groupViews: Map<string, GroupView>;

    /** The nodes views that are currently selected. A subset of nodeViews. */
    private selectedNodeViews: Set<NodeView>;

    public onNodeEdit: (nodeName: string) => void = () => {};
    public onNodeDelete: (nodeName: string) => void = () => {};
    public onNodesMoved: (positions: Record<string, Position>) => void =
        () => {};

    public onSelectionChanged: (selectedNodes: string[]) => void = () => {};

    private lines: SVGElement;

    private nodesContainer: HTMLElement;

    /** Updates the transform of the nodes container based on the transform
     * matrix. */
    private updateView() {
        const matrix = this.matrix;
        // nodesContainer.style.transform = `translate(${-this.viewPosition.x}px, ${-this.viewPosition.y}px) scale(${this.zoomScale})`;
        this.nodesContainer.style.transform = `matrix(${matrix.a}, ${matrix.b}, ${matrix.c}, ${matrix.d}, ${matrix.e}, ${matrix.f})`;

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
            this.centerDebug = document.createElement("div");
            this.centerDebug.style.position = "absolute";
            this.centerDebug.style.top = "0";
            this.centerDebug.style.left = "0";
            this.centerDebug.style.width = "8px";
            this.centerDebug.style.height = "8px";
            this.centerDebug.style.background = "red";
            this.centerDebug.style.opacity = "0.5";
            nodesContainer.appendChild(this.centerDebug);

            // The origin debug element is always at (0,0)
            let originDebug = document.createElement("div");
            originDebug.style.position = "absolute";
            originDebug.style.top = "0";
            originDebug.style.left = "0";
            originDebug.style.width = "8px";
            originDebug.style.height = "8px";
            originDebug.style.background = "green";
            originDebug.style.opacity = "0.5";
            nodesContainer.appendChild(originDebug);

            window.addEventListener("mousemove", (e) => {
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

        this.nodesContainer = nodesContainer;

        this.lines = getLinesSVGForNodes([]);
        nodesContainer.appendChild(this.lines);

        this.nodeViews = new Map();

        this.groupViews = new Map();

        this.selectedNodeViews = new Set<NodeView>();

        // When the mousewheel is scrolled (or a two-finger scroll gesture is
        // performed), zoom where the mouse cursor is.
        this.setupZoom(zoomContainer);

        this.setupPan(zoomContainer);

        this.setupBoxSelect(zoomContainer);
    }

    private setupBoxSelect(zoomContainer: HTMLElement) {
        const boxElement = document.createElement("div");
        boxElement.className = "box-select";
        boxElement.style.top = "100px";
        boxElement.style.left = "100px";
        boxElement.style.width = "100px";
        boxElement.style.height = "100px";

        // The client-space position where we started dragging from.
        let dragStartPosition: Position = { x: 0, y: 0 };

        const dragBegin = (e: MouseEvent) => {
            // Only take action if this is a select.
            if (getGestureType(e) != MouseGestureType.Select) {
                return;
            }

            // Make the box visible by adding it to the DOM.
            zoomContainer.appendChild(boxElement);

            // Record where we started dragging from.
            dragStartPosition = { x: e.clientX, y: e.clientY };

            // Clear the node selection immediately.
            for (const selectedNode of this.selectedNodeViews) {
                selectedNode.element.classList.remove("selected");
            }
            this.selectedNodeViews.clear();

            this.onSelectionChanged([]);

            boxElement.style.left = `${dragStartPosition.x}px`;
            boxElement.style.top = `${dragStartPosition.y}px`;
            boxElement.style.width = `0px`;
            boxElement.style.height = `0px`;

            window.addEventListener("mousemove", dragMove);
            window.addEventListener("mouseup", dragEnd);
            window.addEventListener("mouseleave", dragEnd);
        };

        const dragMove = (e: MouseEvent) => {
            const currentPosition = { x: e.clientX, y: e.clientY };

            const topLeft = {
                x: Math.min(dragStartPosition.x, currentPosition.x),
                y: Math.min(dragStartPosition.y, currentPosition.y),
            };

            const bottomRight = {
                x: Math.max(dragStartPosition.x, currentPosition.x),
                y: Math.max(dragStartPosition.y, currentPosition.y),
            };

            const size: Size = {
                width: bottomRight.x - topLeft.x,
                height: bottomRight.y - topLeft.y,
            };

            boxElement.style.left = `${topLeft.x}px`;
            boxElement.style.top = `${topLeft.y}px`;
            boxElement.style.width = `${size.width}px`;
            boxElement.style.height = `${size.height}px`;

            // Find whichever nodes intersect this rectangle, and make them the
            // selection.
            //
            // TODO: this is possibly an expensive operation; maybe debounce
            // this?
            let selectionRect = new DOMRect(
                topLeft.x,
                topLeft.y,
                size.width,
                size.height,
            );

            const intersects = (r1: DOMRect, r2: DOMRect) => {
                return !(
                    r2.left > r1.right ||
                    r2.right < r1.left ||
                    r2.top > r1.bottom ||
                    r2.bottom < r1.top
                );
            };

            this.selectedNodeViews.clear();

            for (const entry of this.nodeViews) {
                const nodeView = entry[1];
                if (nodeView) {
                    if (
                        intersects(
                            nodeView.element.getBoundingClientRect(),
                            selectionRect,
                        )
                    ) {
                        this.selectedNodeViews.add(nodeView);
                        nodeView.element.classList.add("selected");
                    } else {
                        nodeView.element.classList.remove("selected");
                    }
                }
            }
            this.onSelectionChanged(this.selectedNodes);
        };

        const dragEnd = (e: MouseEvent) => {
            zoomContainer.removeChild(boxElement);
            window.removeEventListener("mousemove", dragMove);
            window.removeEventListener("mouseup", dragEnd);
            window.removeEventListener("mouseleave", dragEnd);
        };

        zoomContainer.addEventListener("mousedown", dragBegin);
    }

    private setupPan(zoomContainer: HTMLElement) {
        // Stores the last position that our mouse cursor was at during a drag,
        // in client space.
        let backgroundDragClientSpace: Position = { x: 0, y: 0 };

        // When we start dragging the background, start tracking mouseup,
        // mousemove, and mouseleave to apply the drag gesture.
        const onBackgroundDragStart = (e: MouseEvent) => {
            // Only take action if this is a pan.
            if (getGestureType(e) != MouseGestureType.Pan) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();
            zoomContainer.classList.add("pan");
            backgroundDragClientSpace = { x: e.clientX, y: e.clientY };

            window.addEventListener("mousemove", onBackgroundDragMove);
            window.addEventListener("mouseup", onBackgroundDragEnd);
            window.addEventListener("mouseleave", onBackgroundDragEnd);
        };

        // When the mouse moves during a drag, calculate how much the cursor has
        // moved in view-space, and apply that translation.
        const onBackgroundDragMove = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const lastPositionViewSpace = this.convertToViewSpace(
                backgroundDragClientSpace,
            );
            const thisPositionViewSpace = this.convertToViewSpace({
                x: e.clientX,
                y: e.clientY,
            });
            const deltaViewSpace = {
                x: thisPositionViewSpace.x - lastPositionViewSpace.x,
                y: thisPositionViewSpace.y - lastPositionViewSpace.y,
            };

            backgroundDragClientSpace = { x: e.clientX, y: e.clientY };

            this.matrix.translateSelf(deltaViewSpace.x, deltaViewSpace.y);

            this.updateView();
        };

        // When the mouse stops dragging, remove the handlers that track the
        // drag.
        function onBackgroundDragEnd(e: MouseEvent) {
            zoomContainer.classList.remove("pan");
            window.removeEventListener("mousemove", onBackgroundDragMove);
            window.removeEventListener("mouseup", onBackgroundDragEnd);
            window.removeEventListener("mouseleave", onBackgroundDragEnd);
        }

        // Finally, install the mouse-down event handler so that we know to
        // start tracking drags.
        zoomContainer.addEventListener("mousedown", onBackgroundDragStart);
    }

    private setupZoom(zoomContainer: HTMLElement) {
        zoomContainer.addEventListener("wheel", (e) => {
            const delta = e.deltaY / constants.zoomSpeed;
            let nextScale = 1 - delta * constants.factor;

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
            if (originalScale * nextScale > constants.zoomMaxScale) {
                nextScale *=
                    constants.zoomMaxScale / (originalScale * nextScale);
            } else if (originalScale * nextScale < constants.zoomMinScale) {
                nextScale *=
                    constants.zoomMinScale / (originalScale * nextScale);
            }

            // Finally, apply our adjustment to the matrix and update the view.
            this.matrix.scaleSelf(
                nextScale,
                nextScale,
                1,
                zoomPositionViewSpace.x,
                zoomPositionViewSpace.y,
                0,
            );

            this.updateView();
        });
    }

    private updateDebugView() {
        if (!ViewState.DEBUG) {
            return;
        }

        const centerWindowSpace = getWindowCenter();
        const centerViewSpace = this.convertToViewSpace(centerWindowSpace);

        const { translation, scale } = decomposeTransformMatrix(this.matrix);

        function position(p: Position): string {
            return `(${Math.floor(p.x)},${Math.floor(p.y)})`;
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
            this.centerDebug.style.transform = `translate(${newNodePosition.x}px, ${newNodePosition.y}px)`;
        }
    }

    public getPositionForNewNode(incrementNodeCount = true) {
        let nodePosition = getWindowCenter();
        nodePosition = this.convertToViewSpace(nodePosition);

        nodePosition.x -= constants.NodeSize.width / 2;
        nodePosition.y -= constants.NodeSize.height / 2;

        nodePosition.x += constants.newNodeOffset * this.nodesSinceLastMove;
        nodePosition.y += constants.newNodeOffset * this.nodesSinceLastMove;

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
            x:
                node.position.x +
                constants.NodeSize.width / 2 -
                centerViewSpace.x,
            y:
                node.position.y +
                constants.NodeSize.height / 2 -
                centerViewSpace.y,
        };
        this.matrix.translateSelf(-centerDelta.x, -centerDelta.y);

        this.updateView();
    }

    public set nodes(nodeList: NodeInfo[]) {
        var isFirstNodeSet = this.nodeViews.size == 0;

        this.updateNodeViews(nodeList);

        this.updateGroupViews(Array.from(this.nodeViews.values()));

        // update all node connections
        for (const node of nodeList) {
            if (!node.uniqueTitle) {
                continue;
            }

            const nodeView = this.nodeViews.get(node.uniqueTitle);

            if (!nodeView) {
                continue;
            }

            nodeView.outgoingConnections = [];

            for (const destination of node.jumps) {
                const destinationElement = this.nodeViews.get(
                    destination.destinationTitle,
                );

                if (!destinationElement) {
                    console.warn(
                        `Node ${node.uniqueTitle} has destination ${destinationElement}, but no element for this destination exists!`,
                    );
                    continue;
                }

                nodeView.outgoingConnections.push({
                    nodeView: destinationElement,
                    type: destination.type,
                });
            }
        }

        this.refreshLines();

        // If we didn't have nodes before but we have nodes now, focus on the
        // first one in the list
        if (isFirstNodeSet && nodeList.length > 0) {
            for (const node of nodeList) {
                if (!node.uniqueTitle) {
                    continue;
                }

                const firstNodeView = this.nodeViews.get(node.uniqueTitle);
                if (firstNodeView) {
                    this.focusOnNode(firstNodeView);
                }
                break;
            }
        }

        this.onSelectionChanged(this.selectedNodes);
    }

    private updateGroupViews(nodeViews: NodeView[]) {
        type GroupCollection = Record<
            string,
            { nodeViews: NodeView[]; type: GroupType }
        >;

        // find the groups that the nodes are in
        const groupedNodes = Array.from(
            nodeViews.values(),
        ).reduce<GroupCollection>((group, nodeView) => {
            const taggedGroupNames = nodeView.taggedGroups;

            for (const groupName of taggedGroupNames) {
                group[groupName] = group[groupName] ?? {
                    nodeViews: [],
                    type: GroupType.TaggedGroup,
                };
                group[groupName].nodeViews.push(nodeView);
            }

            if (nodeView.nodeGroup) {
                const nodeGroup = nodeView.nodeGroup;
                group[nodeGroup] = group[nodeGroup] ?? {
                    nodeViews: [],
                    type: GroupType.NodeGroup,
                };
                group[nodeGroup].nodeViews.push(nodeView);
            }
            return group;
        }, {});

        const currentGroupNames = Array.from(this.groupViews.keys());
        const newGroupNames = Object.keys(groupedNodes);

        const createdGroups = newGroupNames.filter(
            (name) => !currentGroupNames.find((n) => n == name),
        );
        const updatedGroups = newGroupNames.filter((name) =>
            currentGroupNames.find((n) => n == name),
        );
        const deletedGroups = currentGroupNames.filter(
            (name) => !newGroupNames.find((n) => n == name),
        );

        for (const createdGroupName of createdGroups) {
            const groupInfo = groupedNodes[createdGroupName];

            const newGroup = new GroupView(groupInfo.type);
            newGroup.name = createdGroupName;
            newGroup.nodeViews = groupInfo.nodeViews;

            this.groupViews.set(createdGroupName, newGroup);
            this.nodesContainer.appendChild(newGroup.element);
        }

        for (const updatedGroupName of updatedGroups) {
            const updatedGroup = this.groupViews.get(updatedGroupName)!;
            updatedGroup.nodeViews = groupedNodes[updatedGroupName].nodeViews;
        }

        for (const deletedGroupName of deletedGroups) {
            const deletedGroup = this.groupViews.get(deletedGroupName)!;
            this.nodesContainer.removeChild(deletedGroup.element);
            this.groupViews.delete(deletedGroupName);
        }
    }

    private updateNodeViews(nodeList: NodeInfo[]) {
        const currentNodeNames = Array.from(this.nodeViews.keys());

        // Get the collection of nodes that we have a view for, but do not
        // appear in the node list
        const missingNodeNames = currentNodeNames.filter(
            (existingNode) =>
                !nodeList.find((n) => n.uniqueTitle == existingNode),
        );

        // Get the collection of nodes that we do NOT have a view for
        const newNodes = nodeList.filter(
            (n) =>
                n.uniqueTitle &&
                currentNodeNames.includes(n.uniqueTitle) == false,
        );

        // Get the collection of nodes that we DO have a view for
        const updatedNodes = nodeList.filter(
            (n) =>
                n.uniqueTitle &&
                currentNodeNames.includes(n.uniqueTitle) == true,
        );

        for (const nodeToRemove of missingNodeNames) {
            this.nodeViews.get(nodeToRemove)?.element.remove();
            this.nodeViews.delete(nodeToRemove);
        }

        for (const nodeToAdd of newNodes) {
            if (!nodeToAdd.uniqueTitle) {
                continue;
            }

            const newNodeView = new NodeView(nodeToAdd);
            newNodeView.onNodeEditClicked = (n) => this.onNodeEdit(n.nodeName);
            newNodeView.onNodeDeleteClicked = (n) =>
                this.onNodeDelete(n.nodeName);

            newNodeView.onNodeDragStart = (nodeView) => {
                if (this.selectedNodeViews.has(nodeView) == false) {
                    // We started dragging a node view that wasn't selected.
                    // Clear the selection state and replace it with just this
                    // selection.
                    this.selectedNodeViews.forEach((nv) =>
                        nv.element.classList.remove("selected"),
                    );
                    this.selectedNodeViews.clear();
                    this.selectedNodeViews.add(nodeView);
                    nodeView.element.classList.add("selected");
                    this.onSelectionChanged(this.selectedNodes);
                }
            };

            newNodeView.onNodeDragMove = (
                nodeView,
                startPosition,
                currentPosition,
            ) => {
                const startViewSpace = this.convertToViewSpace(startPosition);
                const currentViewSpace =
                    this.convertToViewSpace(currentPosition);

                const dragDeltaViewSpace = {
                    x: currentViewSpace.x - startViewSpace.x,
                    y: currentViewSpace.y - startViewSpace.y,
                };

                this.selectedNodeViews.forEach((nv) => {
                    nv.translate(dragDeltaViewSpace);
                });

                this.refreshLines();

                var groupViews = Array.from(this.groupViews.values()).filter(
                    (gv) => gv.nodeViews.includes(nodeView),
                );

                for (const groupView of groupViews) {
                    groupView.refreshSize();
                }
            };

            newNodeView.onNodeDragEnd = (nodeView) => {
                var positions: Record<string, Position> = {};

                this.selectedNodeViews.forEach((v) => {
                    positions[v.nodeName] = v.position;
                });
                this.onNodesMoved(positions);
            };

            this.nodeViews.set(nodeToAdd.uniqueTitle, newNodeView);

            this.nodesContainer.appendChild(newNodeView.element);
        }

        for (const nodeToUpdate of updatedNodes) {
            if (!nodeToUpdate.uniqueTitle) {
                continue;
            }

            const nodeView = this.nodeViews.get(nodeToUpdate.uniqueTitle);

            if (nodeView) {
                nodeView.nodeInfo = nodeToUpdate;
            }
        }
    }

    private refreshLines() {
        this.nodesContainer.removeChild(this.lines);
        this.lines = getLinesSVGForNodes(this.nodeViews.values());
        this.nodesContainer.appendChild(this.lines);
    }

    getNodeView(nodeName: string): NodeView | undefined {
        return this.nodeViews.get(nodeName);
    }

    alignSelectedNodes(alignment: Alignment) {
        const selected = Array.from(this.selectedNodeViews.values());

        if (selected.length <= 1) {
            // Do nothing if we don't have enough nodes to align
            return;
        }

        switch (alignment) {
            case Alignment.Left:
                const minLeft = Math.min(...selected.map((nv) => nv.left));
                selected.forEach((nv) => (nv.left = minLeft));
                break;

            case Alignment.Right:
                const maxRight = Math.max(...selected.map((nv) => nv.right));
                selected.forEach((nv) => (nv.right = maxRight));
                break;

            case Alignment.Top:
                const minTop = Math.min(...selected.map((nv) => nv.top));
                selected.forEach((nv) => (nv.top = minTop));
                break;

            case Alignment.Bottom:
                const maxBottom = Math.max(...selected.map((nv) => nv.bottom));
                selected.forEach((nv) => (nv.bottom = maxBottom));
                break;

            default:
                throw new Error("alignemnt " + alignment + " not implemented");
        }

        this.refreshLines();

        let nodesMoves: Record<string, Position> = {};
        selected.forEach((nv) => (nodesMoves[nv.nodeName] = nv.position));
        this.onNodesMoved(nodesMoves);
    }

    public get selectedNodes(): string[] {
        return Array.from(this.selectedNodeViews.values()).map(
            (nv) => nv.nodeName,
        );
    }
}

function getGestureType(mouseEvent: MouseEvent): MouseGestureType {
    if (mouseEvent.button == 1 || mouseEvent.altKey) {
        // If we're holding Alt or using the auxiliary (e.g. middle) mouse
        // button, then this is a pan.
        return MouseGestureType.Pan;
    }
    if (mouseEvent.button == 0) {
        // If we're using the primary (e.g. left) mouse button, then this is a
        // select.
        return MouseGestureType.Select;
    } else {
        // We don't know what this is.
        return MouseGestureType.Unknown;
    }
}
