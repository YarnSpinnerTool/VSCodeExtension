export type ColourClassMap = Record<string, string[]>;

export const KnownColours = [
    "red",
    "blue",
    "yellow",
    "orange",
    "green",
    "purple",
    null,
];

export const nodeBackgroundClasses: ColourClassMap = {
    red: ["bg-node-red-bg"],
    blue: ["bg-node-blue-bg"],
    yellow: ["bg-node-yellow-bg"],
    orange: ["bg-node-orange-bg"],
    green: ["bg-node-green-bg"],
    purple: ["bg-node-purple-bg"],
    __default: ["bg-editor-background"],
};
export const nodeTopBarClasses: ColourClassMap = {
    red: ["bg-red"],
    blue: ["bg-blue"],
    yellow: ["bg-yellow"],
    orange: ["bg-orange"],
    green: ["bg-green"],
    purple: ["bg-purple"],
    __default: ["bg-editor-background"],
};
export const stickyNoteTopBarClasses: ColourClassMap = {
    red: ["bg-stickynote-red"],
    blue: ["bg-stickynote-blue"],
    yellow: ["bg-stickynote-yellow"],
    orange: ["bg-stickynote-orange"],
    green: ["bg-stickynote-green"],
    purple: ["bg-stickynote-purple"],
    __default: ["bg-editor-background"],
};
export const stickyNoteBackgroundClasses: ColourClassMap = {
    red: ["bg-stickynote-red-bg"],
    blue: ["bg-stickynote-blue-bg"],
    yellow: ["bg-stickynote-yellow-bg"],
    orange: ["bg-stickynote-orange-bg"],
    green: ["bg-stickynote-green-bg"],
    purple: ["bg-stickynote-purple-bg"],
    __default: ["bg-stickynote-yellow-bg"],
};
