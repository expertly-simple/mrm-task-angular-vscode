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
  // Task options
  // mrm eslint --config:name pizza
  const { name, eslintPreset } = config
    .defaults({
      // Default value
      eslintPreset: "eslint:recommended"
    })
    // Required option
    .require("name")
    .values();

  // Use custom preset package from npm
  const packages = ["eslint"];
  if (eslintPreset !== "eslint:recommended") {
    packages.push(`eslint-config-${eslintPreset}`);
  }

  // Create or update .eslintignore
  lines(".eslintignore")
    .add(["node_modules/"])
    .save();

  // Read project’s package.json
  const pkg = packageJson();

  pkg
    // Add lint script
    .setScript("lint", "eslint . --cache --fix")
    // Add pretest script
    .prependScript("pretest", "npm run lint")
    .save();

  // Read .eslintrc if it exists
  const eslintrc = json(".eslintrc");

  // Use Babel parser if the project depends on Babel
  if (pkg.get("devDependencies.babel-core")) {
    const parser = "babel-eslint";
    packages.push(parser);
    eslintrc.merge({ parser });
  }

  // Set preset
  eslintrc.set("extends", eslintPreset).save();

  // Install npm dependencies
  install(packages);
}

task.description = "Configures VS Code for Angular projects";
module.exports = task;
