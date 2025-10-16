import type { MetadataTable, StringTable } from "@yarnspinnertool/core";

export type CompiledYarnProgram = {
    programData: string;
    metadataTable: MetadataTable;
    stringTable: StringTable;
};

export default {
    programData:
        "EtkBCgVTdGFydBLPAQoFU3RhcnQyDgoFdGl0bGUSBVN0YXJ0OhEaDwoNbGluZTpkYjE5MjliYzoRGg8KDWxpbmU6NGQyOTJlY2I6ECIOCgx0ZXN0X2NvbW1hbmQ6EyoRCg1saW5lOmY3NzgyNzUyEAc6EyoRCg1saW5lOmMyZGQ0NGJiEAk6AjIAOgISADoRGg8KDWxpbmU6NjE0ODIwMjU6BAoCCAs6ERoPCg1saW5lOjU0ZWQ0M2NjOgQKAggLOgJaADoRGg8KDWxpbmU6ZWViYzRhNTU6A6IBAA==",
    metadataTable: {},
    stringTable: {
        "line:db1929bc": "Character: This is a test line.",
        "line:4d292ecb": "Character: And this is another.",
        "line:f7782752": "Player: Wow!",
        "line:61482025": "Player: I just an an option!",
        "line:c2dd44bb": "Player: Neat!",
        "line:54ed43cc": "Player: Cool, I can run options!",
        "line:eebc4a55": "Character: I know!",
    },
} satisfies CompiledYarnProgram;
