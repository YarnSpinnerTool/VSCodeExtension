import { NodeProps, Handle, Position } from "@xyflow/react";
import { YarnNodeData } from "../utilities/nodeData";
import { Node as GraphNode } from "@xyflow/react";

export function GroupNode(props: {} & NodeProps<GraphNode<YarnNodeData>>) {
    return (
        <div
            style={{
                width: props.width,
                height: props.height,
                position: "absolute",
                top: 0,
                left: 0,
            }}
            className="nodrag"
        >
            {props.data.groupName}
            <Handle type="target" position={Position.Top} />
        </div>
    );
}
