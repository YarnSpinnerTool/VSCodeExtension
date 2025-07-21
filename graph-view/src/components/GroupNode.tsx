import { NodeProps, Handle, Position } from "@xyflow/react";

export function GroupNode(props: {} & NodeProps) {
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
            {props.id}
            <Handle type="target" position={Position.Top} />
        </div>
    );
}
