import type { Line, StringTable } from "@yarnspinnertool/core";
import { clsx } from "clsx";

import { getLineText } from "./getLineText";

export function LineView(props: {
    line: Line;
    isCurrent?: boolean;
    stringTable: StringTable;
    className?: string;
}) {
    const lineResult = getLineText(props.line, props.stringTable);
    return (
        <div
            title={props.line.id}
            className={clsx(
                "mx-8 box-content transition-opacity duration-200 select-text",
                {
                    "ps-3 opacity-50": !props.isCurrent,
                    "border-s-selected border-s-4 ps-2": props.isCurrent,
                },
                props.className,
            )}
        >
            <div>
                {"error" in lineResult ? (
                    lineResult.error
                ) : lineResult.characterName ? (
                    <>
                        <span className="font-bold after:content-[':_']">
                            {lineResult.characterName}
                        </span>
                        {lineResult.lineTextWithoutName}
                    </>
                ) : (
                    lineResult.lineText
                )}
            </div>
        </div>
    );
}
