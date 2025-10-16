import type { Line, StringTable } from "@yarnspinnertool/core";

const characterNameRegex = /^([^:]+):\s*(.*)$/;
export function getLineText(
    line: Line,
    stringTable: StringTable | undefined,
):
    | {
          lineText: string;
          characterName: string | null;
          lineTextWithoutName: string;
      }
    | { error: string } {
    if (!stringTable) {
        return { error: `${line.id} (no string table)` };
    }
    const stringInfo = stringTable[line.id];
    if (!stringInfo) {
        return { error: `${line.id} (no entry found)` };
    }

    const lineText = line.substitutions.reduce<string>(
        (curr, item, idx) => curr.replace("{" + idx + "}", item.toString()),
        stringInfo,
    );

    const nameMatch = lineText.match(characterNameRegex);

    return {
        lineText,
        characterName: nameMatch != null ? nameMatch[1] : null,
        lineTextWithoutName: nameMatch != null ? nameMatch[2] : lineText,
    };
}
