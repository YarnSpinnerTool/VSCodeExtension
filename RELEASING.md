# Releasing the Visual Studio Code Extension

The GitHub Actions workflow, `main.yml`, will automatically build and package the extension on every commit. If the commit is a push to the `main` branch, the extension will be released to the Marketplace; unless the commit message contains the string `[release]`, the release will be a pre-release version.

Releases will not happen for a pull request, or for any commit that isn't on the `main` branch.
