import clsx from "clsx";
import { ColourClassMap, KnownColours } from "../utilities/nodeColours";
import { NoColour } from "./ContentNode";

export function ColourPicker(props: {
    nodeColour: string | null;
    availableClasses: ColourClassMap;
    onColourSelected: (colour: string | null) => void;
}) {
    const { nodeColour, availableClasses } = props;
    return (
        <div className="flex bg-editor-background shadow-widget-shadow shadow-lg rounded-full p-2 gap-1">
            {KnownColours.map((colour) => {
                return (
                    <div
                        key={"colour" + (colour ?? "none")}
                        className={clsx(
                            "rounded-full w-4 h-4 cursor-pointer",
                            {
                                "border-2 border-selected":
                                    colour === nodeColour,
                                "border border-editor-foreground/25":
                                    colour !== nodeColour,
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
