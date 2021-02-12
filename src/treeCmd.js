"use strict";
const vscode = require("vscode");
var config = getConfig();
var tree = getTreeList();
var nodes = {};
var treeItemIconPath;

const showMessage = {
	information(message) {
		return vscode.window.showInformationMessage(message);
	},
	warning(message) {
		return vscode.window.showWarningMessage(message);
	},
	error(message) {
		return vscode.window.showErrorMessage(message);
	},
	status(message) {
		return vscode.window.setStatusBarMessage(message);
	}
};

class TreeCmd {
	constructor(context) {
		this.context = context;
		this.view = null;

		setTreeItemIconPath(context.asAbsolutePath("resources/icons/terminal.svg"));
		this.createTreeView();
		this.changeTitle();

		vscode.commands.registerCommand("tree-cmd.refresh", (res) =>
			this.refresh()
		);

		vscode.commands.registerCommand("tree-cmd.clickItem", (res) => {
			this.onClickItem(res);
		});

		vscode.workspace.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration("tree-cmd.settings.config")) {
				showMessage.information('Tree-cmd config updated');
				this.refresh();
			}
			if (e.affectsConfiguration("tree-cmd.settings.title")) {
				showMessage.information(`Tree-cmd view title updated to "${getSettings("title")}"`);
				this.changeTitle();
			}
		});

	}

	createTreeView() {
		const treeDataProvider = aNodeWithIdTreeDataProvider();
		this.view = vscode.window.createTreeView("tree-cmd", {
			treeDataProvider,
		});
		this.context.subscriptions.length = 0;
		this.context.subscriptions.push(this.view);
	}

	onClickItem(selection) {
		if (this.view && config) {
			config.onClickItem(selection, this.createTerminal, showMessage);
		}
	}

	changeTitle() {
		if (getSettings("title")) {
			this.view.title = getSettings("title");
		}
	}

	refresh() {
		this.view.dispose();
		reRequireConfig();
		updateTreeList();
		destroyNodes();
		this.changeTitle();
		this.createTreeView();
		showMessage.information('Tree-cmd -> refresh done!');
	}

	createTerminal(options) {
		return vscode.window.createTerminal(options);
	}

}

function aNodeWithIdTreeDataProvider() {
	return {
		getChildren: (element) => {
			let parent =
				element !== undefined && typeof element === "object" ?
				element.key :
				null;
			let children = getChildren(
				element ? element.key : undefined
			).map((key) => getNode(key, parent));
			return children;
		},
		getTreeItem: (element) => {
			const treeItemDetails = getTreeItem(element.key);
			// const treeItem = getTreeItem(element.key); // Using a proposed API
			const treeItem = new vscode.TreeItem(treeItemDetails.label, treeItemDetails.collapsibleState);
			treeItem.iconPath = !element.parent ? vscode.ThemeIcon.File : getTreeItemIconPath();
			treeItem.tooltip = element.parent ? `[ ${element.parent} ] ${element.key}` : element.key;
			treeItem.command = treeItem.collapsibleState ? undefined : {
				command: 'tree-cmd.clickItem',
				title: "Click Item",
				arguments: [element],
			};

			return treeItem;
		},
		getParent: ({
			key
		}) => {
			const parentKey = key;
			return parentKey ? new Key(parentKey) : void 0;
		},
	};
}

function updateTreeList() {
	tree = getTreeList();
}

function destroyNodes() {
	nodes = null;
	nodes = {};
}

function reRequireConfig() {
	delete require.cache[require.resolve(getSettings("config"))];
	config = getConfig();
}

// ### getter ### //
function getChildren(key) {
	if (!key) {
		return Object.keys(tree);
	}
	const treeElement = getTreeElement(key);
	if (treeElement) {
		return Object.keys(treeElement);
	}
	return [];
}

function getTreeItem(key) {
	const treeElement = getTreeElement(key);
	return {
		// label: { label: key }, // Using a proposed API
		label: key,
		collapsibleState: treeElement && Object.keys(treeElement).length ?
			vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
	};
}

function getTreeElement(element) {
	let parent = tree;
	parent = parent[element];
	if (!parent) {
		return null;
	}
	return parent;
}

function getNode(key, parent) {
	if (!nodes[key] || (nodes[key] && nodes[key]["parent"] !== parent)) {
		nodes[key] = new Key(key);
		nodes[key]["parent"] = parent;
	}
	return nodes[key];
}

function getConfig() {
	if (getSettings("config")) {
		const rawConfig = require(getSettings("config"));
		return rawConfig.config;
	}

	return null;
}

function getTreeList() {
	return config ? config.getTree() : {}
}

function getTreeItemIconPath() {
	return treeItemIconPath;
}

function getSettings(name) {
	return vscode.workspace.getConfiguration("tree-cmd.settings").get(name);
}

// ### setter ### //
function setTreeItemIconPath(path) {
	treeItemIconPath = path;
}

class Key {
	constructor(key) {
		this.key = key;
	}
}

module.exports = {
	TreeCmd
};