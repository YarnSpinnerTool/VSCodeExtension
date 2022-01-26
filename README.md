# Yarn Spinner for Visual Studio Code

[Yarn Spinner](https://yarnspinner.dev) helps you build branching narrative and dialogue in games. It's easy for writers to use, and has powerful features for integrating your content straight into your game.

You can install this extension for Visual Studio Code from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=SecretLab.yarn-spinner).

This extension adds language support for Yarn Spinner code, and a visual editor for creating Yarn scripts.

Features include:

* Workspace and Document symbol outlines
* Goto definition / references for symbols
* Hover tooltip for commands, functions, and variables
* Semantic token highlighting
* Warning and error diagnostics
* Signature Help for commands and functions

To learn more about Yarn Spinner, or find out how to use and install this extension, head to the [official site](https://yarnspinner.dev) and the [documentation](https://docs.yarnspinner.dev)!

## Importing / Overriding via JSON
If you want to import command and function definitions for a language other than C#, or you want to override information that the language server parses from C#, add a JSON file with the extension ".ysls.json" to your project's folder using the [ysls.json schema](/LanguageServer/LanguageServer/src/Server/Documentation/ysls.schema.json). 

For examples, take a look at this [import example](/LanguageServer/LanguageServer/ImportExample.ysls.json) or the [yarn spinner built in Commands and Functions file](/LanguageServer/LanguageServer/src/Server/Documentation/BuiltInFunctionsAndCommands.ysls.json). 

## Demo
<img src="https://user-images.githubusercontent.com/408888/133907128-ab3fe7a3-b2cf-4ce6-98d7-65f048fbae1f.gif" alt="Demonstration of hover tooltip, Go to references, and Go to definition" />

<img src="https://user-images.githubusercontent.com/408888/133907396-9cabe05b-bdf8-44d3-a8df-6e44e55fab98.gif" alt="Demonstration of command suggestions, signature help, and parameter count checking" />
