# Tree-cmd

This is a Visual Studio code extension. Useful for listing all your customised terminal commands in a tree-view mode.

![Screenshot1](https://github.com/captainspeed/tree-cmd/blob/main/media/screenshot1.png)

![Screenshot2](https://github.com/captainspeed/tree-cmd/blob/main/media/screenshot2.png)

## How to use

-   Install the extension "tree-cmd" from vscode extensions.
-   Create a "config.js" file.
-   Example:

```js
const config = {
    // Your Extension title
	title: "Build Services",
    // This function should return list of commands in object - nested objects is supported aswell
    // i.e tree-view-items
    getTree() {
		return {
            "develop": {
                "ide-server": {},
                "test-file": {},
                "watch": {},
                "scan-folder": {}
            },
            "build": {
                "do-check": {},
                "build-file1": {},
                "copy-files": {}
            }
    },
    /**
     * Event that is fired when the selection has changed
     * @param {object} res - {key, parent}, where "key" is the clicked item name in string
     * And the "parent" is the parent node - if any in string
     *
     * @param {function} createTerminal - createTerminal(options: TerminalOptions): Terminal
     * Creates seperate terminal.
     * Terminal API: Create Terminal: Create a terminal
     * Terminal API: Hide: Hides the most recently created terminal
     * Terminal API: Show: Shows the most recently created terminal
     * Terminal API: Send Text: Sends echo "Hello World!" to the terminal
     * Terminal API: Send Text (no implied \n): Sends echo "Hello World!" to the terminal explicitly indicating to * * not add a \n to the end of the text
     * Terminal API: Dispose: Disposes the most recently created terminal
     * See vscode extension API for detail
     * https://code.visualstudio.com/api/references/vscode-api
     *
     *
     * @param {object} showMessage - fire message on vscode window
     * showMessage API::
     * const showMessage = {
     *       information( message ) {
     *           return vscode.window.showInformationMessage(message);
     *      },
     *       warning( message ) {
     *           return vscode.window.showWarningMessage(message);
     *       },
     *      error( message ) {
     *           return vscode.window.showErrorMessage(message);
     *       },
     *       status( message ) {
     *           return vscode.window.setStatusBarMessage(message);
     *       }
     *  };
     *
     *
     * }
     */
	onClickItem(res, createTerminal, showMessage) {
        // Do your logic here
        // Example:
		if (res && res.parent) {
			const label = `${res.parent} ` + res.key;

			if (res.parent === "build") {
				showMessage.warning(`Is doing build!`);
            }
            // It creates and opens a separate terminal window
            const terminal = createTerminal({ name: label });
            showMessage.information(label);
            // commands to run in the terminal
			terminal.sendText(`cd c:`);
            terminal.sendText(`do-check ${res.key} -v`);
            // display the terminal window
			terminal.show();
		}
	}
};
// export
module.exports.config = config;
```

-   Open tre-cmd setting and point the "config.js" file path.
-   If you change any text in "config.js" hit the refresh button on tree-cmd top panel.

## Extension Settings

-   Tree-cmd > Settings: Config -> Configuration ".js" file path to be use in tree-cmd.
-   Tree-cmd > Settings: Title -> Tree view title ( can be configured inside config file ).
