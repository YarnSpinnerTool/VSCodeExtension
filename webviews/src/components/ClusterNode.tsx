import { NodeProps, Handle, Position } from "@xyflow/react";
import { YarnNodeData } from "../utilities/nodeData";
import { Node as GraphNode } from "@xyflow/react";

export function ClusterNode(props: {} & NodeProps<GraphNode<YarnNodeData>>) {
    return (
        <div
            style={{
                width: props.width,
                height: props.height,
                position: "absolute",
                top: 0,
                left: 0,
            }}
            className="nodrag bg-green/5 border border-green  rounded-lg p-2 text-green font-bold"
        >
            {props.data.clusterName}
            <Handle type="target" position={Position.Top} />
        </div>
    );
}
