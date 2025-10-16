import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import type { OptionItem, StringTable } from "@yarnspinnertool/core";
import { clsx } from "clsx";

import { getLineText } from "./getLineText";

export function OptionView(props: {
    option: OptionItem;
    stringTable: StringTable;
    onClick?: (option: OptionItem) => void;
    className?: string;
}) {
    const lineResult = getLineText(props.option.line, props.stringTable);
    return (
        <VSCodeButton
            className={clsx(props.className)}
            onClick={() => props.onClick?.(props.option)}
        >
            {"error" in lineResult
                ? "ERROR: " + lineResult.error
                : lineResult.lineTextWithoutName}
        </VSCodeButton>
    );
}
