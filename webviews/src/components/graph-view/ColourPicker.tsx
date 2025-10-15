import clsx from "clsx";

import type { ColourClassMap } from "@/utilities/nodeColours";
import { KnownColours } from "@/utilities/nodeColours";

import { NoColour } from "./ContentNode";

export function ColourPicker(props: {
    nodeColour: string | null;
    availableClasses: ColourClassMap;
    onColourSelected: (colour: string | null) => void;
}) {
    const { nodeColour, availableClasses } = props;
    return (
        <div className="bg-editor-background shadow-widget-shadow flex gap-2 rounded-full p-2 shadow-lg">
            {KnownColours.map((colour) => {
                return (
                    <div
                        key={"colour" + (colour ?? "none")}
                        className={clsx(
                            "h-4 w-4 cursor-pointer rounded-full",
                            {
                                "outline-selected outline-2 outline-offset-2":
                                    colour === nodeColour,
                            },
                            availableClasses[colour ?? NoColour],
                        )}
                        onClick={() => props.onColourSelected(colour)}
                    ></div>
                );
            })}
        </div>
    );
}
