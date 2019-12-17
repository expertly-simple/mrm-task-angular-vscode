const {
  // JSON files
  json,
  // package.json
  packageJson,
  // New line separated text files
  lines,
  // Install npm packages
  install
} = require("mrm-core");

function task(config) {
  configureCommonNpmPackages();
  configureNpmScripts();
  configureImportSort();
  configureTsLint();
  configurePrettier();
  configureJsBeautify();
  configureAngular();
  configureAngularForVsCode();
}

function configureTsLint() {
  const tslintPackages = ["tslint", "tslint-etc"];
  install(tslintPackages);

  addArrayProperty("tslint.json", "extends", "tslint-etc");

  json("tslint.json")
    .set("rules.no-unused-declaration", true)
    .set("rules.max-line-length", [true, 90])
    .set("rules.quotemark", [true, "single", "avoid-escape"])
    .set("rules.semicolon", [true, "never"])
    .save();
}

function addArrayProperty(fileName, propertyName, element) {
  let extendsArray = json(fileName).get(propertyName);

  if (!Array.isArray(extendsArray)) {
    extendsArray = [extendsArray];
  }

  if (!extendsArray.includes(element)) {
    json(fileName)
      .set(propertyName, extendsArray.concat(element))
      .save();
  }
}

function configureJsBeautify() {
  const beautifyPackages = ["js-beautify"];
  install(beautifyPackages);

  json(".jsbeautifyrc")
    .merge({
      indent_size: 2,
      wrap_line_length: 90,
      end_with_newline: true,
      language: {
        html: ["html"]
      }
    })
    .save();
}

function configurePrettier() {
  const prettierPackages = ["prettier"];
  install(prettierPackages);

  lines(".prettierignore", ["**/*.html"]).save();

  json(".prettierrc")
    .merge({
      tabWidth: 2,
      useTabs: false,
      printWidth: 90,
      semi: false,
      singleQuote: true,
      trailingComma: "es5",
      jsxBracketSameLine: true
    })
    .save();

  const pkg = packageJson();

  if (pkg.get("devDependencies.tslint")) {
    const prettierTslintPackages = [
      "tslint-config-prettier",
      "tslint-plugin-prettier"
    ];
    install(prettierTslintPackages);

    addArrayProperty("tslint.json", "extends", "tslint-config-prettier");
    addArrayProperty("tslint.json", "extends", "tslint-plugin-prettier");

    json("tslint.json")
      .set("rules.prettier", true)
      .save();
  }
}

function configureNpmScripts() {
  const pkg = packageJson();

  pkg
    .setScript(
      "style",
      'import-sort -l "{src,tests,e2e}/**/*.ts" && prettier --check "{src,tests,e2e}/**/*.{*css,ts}"'
    )
    .save();

  pkg
    .setScript(
      "style:fix",
      'import-sort --write "{src,tests,e2e}/**/*.ts" && prettier --write "{src,tests,e2e}/**/*.{*css,ts}" && js-beautify "src/**/*.html"'
    )
    .save();

  pkg
    .setScript(
      "lint",
      'tslint --config tslint.json --project . -e "**/{test,polyfills}.ts"'
    )
    .save();

  pkg
    .setScript(
      "lint:fix",
      'tslint --config tslint.json --fix --project . -e "**/{test,polyfills}.ts"'
    )
    .save();
}

function configureImportSort() {
  const importSortPackages = [
    "import-sort",
    "import-sort-cli",
    "import-sort-parser-typescript",
    "import-sort-style-module"
  ];

  install(importSortPackages);

  const pkg = packageJson();

  pkg
    .set("importSort", {
      ".ts, .tsx": {
        parser: "typescript",
        style: "module",
        options: {}
      }
    })
    .save();
}

function configureAngular() {
  const angularDeps = ["angular-unit-test-helper"];
  install(angularDeps);
}

function configureCommonNpmPackages() {
  const commonNpm = ["cross-conf-env", "npm-run-all", "dev-norms"];
  install(commonNpm);
}

function configureAngularForVsCode() {
  json(".vscode/extensions.json")
    .merge({
      recommendations: [
        "johnpapa.angular-essentials",
        "PKief.material-icon-theme",
        "formulahendry.auto-close-tag",
        "ms-azuretools.vscode-docker",
        "eamodio.gitlens",
        "WallabyJs.quokka-vscode",
        "amatiasq.sort-imports",
        "DSKWRK.vscode-generate-getter-setter",
        "esbenp.prettier-vscode",
        "HookyQR.beautify",
        "expertly-simple.ng-evergreen",
        "msjsdiag.debugger-for-edge"
      ]
    })
    .save();

  json(".vscode/settings.json")
    .merge({
      "debug.openExplorerOnEnd": true,

      "editor.tabSize": 2,
      "editor.rulers": [90],
      "editor.autoIndent": "full",
      "editor.cursorBlinking": "solid",
      "editor.formatOnType": false,
      "editor.formatOnPaste": false,
      "editor.formatOnSave": true,
      "editor.minimap.enabled": false,
      "editor.codeActionsOnSave": {
        "source.organizeImports": false,
        "source.fixAll.tslint": true
      },

      "editor.defaultFormatter": "esbenp.prettier-vscode",
      "[html]": {
        "editor.defaultFormatter": "HookyQR.beautify"
      },

      "explorer.openEditors.visible": 0,

      "files.trimTrailingWhitespace": true,
      "files.autoSave": "onFocusChange",

      "git.confirmSync": false,
      "git.enableSmartCommit": true,

      "npm.enableScriptExplorer": true,

      "typescript.tsdk": "node_modules/typescript/lib",

      "workbench.iconTheme": "material-icon-theme",

      "auto-close-tag.SublimeText3Mode": true,
      "html.autoClosingTags": false,

      "gitlens.menus": {
        editorGroup: false
      },
      "ng-evergreen.upgradeChannel": "Latest"
    })
    .save();

  json(".vscode/launch.json")
    .merge({
      version: "0.2.0",
      configurations: [
        {
          name: "Debug npm start with Chrome",
          type: "chrome",
          request: "launch",
          url: "http://localhost:5000/#",
          webRoot: "${workspaceRoot}",
          runtimeArgs: ["--remote-debugging-port=9222"],
          sourceMaps: true,
          preLaunchTask: "npm: start"
        },
        {
          name: "Debug npm start with Edge",
          type: "edge",
          request: "launch",
          version: "dev",
          url: "http://localhost:5000/#",
          webRoot: "${workspaceRoot}",
          sourceMaps: true,
          preLaunchTask: "npm: start"
        },
        {
          name: "Debug npm test with Chrome",
          type: "chrome",
          request: "launch",
          url: "http://localhost:9876/debug.html",
          webRoot: "${workspaceRoot}",
          runtimeArgs: ["--remote-debugging-port=9222"],
          sourceMaps: true,
          preLaunchTask: "npm: test"
        },
        {
          name: "Debug npm test with Edge",
          type: "edge",
          request: "launch",
          version: "dev",
          url: "http://localhost:9876/debug.html",
          webRoot: "${workspaceRoot}",
          sourceMaps: true,
          preLaunchTask: "npm: test"
        },
        {
          name: "npm run e2e",
          type: "node",
          request: "launch",
          program: "${workspaceRoot}/node_modules/protractor/bin/protractor",
          protocol: "inspector",
          args: ["${workspaceRoot}/protractor.conf.js"]
        }
      ]
    })
    .save();
}

task.description = "Configures VS Code for Angular projects";
module.exports = task;
