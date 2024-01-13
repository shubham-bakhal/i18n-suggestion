// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
const fs = require("fs");
const path = require("path");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

export function activate(context: vscode.ExtensionContext) {
  // text suggestion provider for the any language mode ex ts, js, tsx, jsx etc when user type in string ""

  function findFilePath(filePath: string, fileName = "package.json") {
    const rootPath = path.parse(filePath).root;

    while (filePath !== rootPath) {
      const packageJsonPath = path.join(filePath, fileName);

      if (fs.existsSync(packageJsonPath)) {
        return packageJsonPath;
      }

      filePath = path.dirname(filePath);
    }

    return null;
  }

  const getVersion = () => {
    const activeTextEditor = vscode.window.activeTextEditor;

    if (activeTextEditor) {
      const currentFilePath = activeTextEditor.document.uri.fsPath;
      const packageJsonPath = findFilePath(currentFilePath);

      try {
        const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
        const packageJson = JSON.parse(packageJsonContent);

        if (packageJson && packageJson.version) {
          const i18nPath = findFilePath(currentFilePath, packageJson.i18nPath);
          console.log("i18nPath", i18nPath);
          const i18nFile = fs.readFileSync(i18nPath, "utf-8");
          const i18nContain = JSON.parse(i18nFile);
          // get all the keys from i18n file
          const keys = Object.keys(i18nContain);
          return keys;
        } else {
          console.log("here, i18nPath not found");
        }
      } catch (error) {
        vscode.window.showErrorMessage("Error reading package.json: " + error);
      }
    } else {
      vscode.window.showInformationMessage("Open a file to get its version.");
    }
  };
  // text suggestion provider for the any language mode ex ts, js, tsx, jsx etc when user type in string ""

  const provider1 = vscode.languages.registerCompletionItemProvider(
    "*",
    {
      provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
      ) {
        const keys = getVersion();
        const linePrefix = document
          .lineAt(position)
          .text.substr(0, position.character);
        if (!linePrefix.endsWith('"')) {
          return undefined;
        }
        // return all the keys from i18n file
        return keys?.map((key) => {
          return new vscode.CompletionItem(key);
        });
      },
    },
    '"'
  );

  // text suggestion provider for the any language mode ex ts, js, tsx, jsx etc when user type in string id=""
  const provider2 = vscode.languages.registerCompletionItemProvider(
    "*",
    {
      provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
      ) {
        const keys = getVersion();
        const linePrefix = document
          .lineAt(position)
          .text.substr(0, position.character);
        if (!linePrefix.endsWith('id="')) {
          return undefined;
        }
        // return all the keys from i18n file
        return keys?.map((key) => {
          return new vscode.CompletionItem(key);
        });
      },
    },
    '"'
  );

  context.subscriptions.push(provider2);
}

// This method is called when your extension is deactivated
export function deactivate() {}
