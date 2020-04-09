import { install, json, packageJson } from 'mrm-core'

import { BaseVsCodeExtensions } from '../shared/baseVsCodeExtensions'
import { BaseVsCodeSettings } from '../shared/baseVsCodeSettings'
import {
  configureCommonNpmPackages,
  configureImportSort,
  configureInitEnv,
  configurePRTemplate,
  configurePrettier,
  configureTsLint,
} from '../shared/commonTasks'
import { setScripts } from '../shared/helpers'

function task() {
  configureCommonNpmPackages()
  configureNpmScripts()
  configureImportSort()
  configureTsLint()
  configurePrettier()
  configureJsBeautify()
  configureAngular()
  configureVsCodeForAngular()
  configureInitEnv()
  configurePRTemplate()
}

function configureJsBeautify() {
  const beautifyPackages = ['js-beautify']
  install(beautifyPackages)

  json('.jsbeautifyrc')
    .merge({
      indent_size: 2,
      wrap_line_length: 90,
      end_with_newline: true,
      language: {
        html: ['html'],
      },
    })
    .save()
}

function configureNpmScripts() {
  const pkg = packageJson()

  setScripts(pkg, {
    style:
      'import-sort -l "**/{src,tests,e2e}/**/*.ts" && prettier --check "**/{src,tests,e2e}/**/*.{*css,ts}"',
    'style:fix':
      'import-sort --write "**/{src,tests,e2e}/**/*.ts" && prettier --write "**/{src,tests,e2e}/**/*.{*css,ts}" && js-beautify "**/src/**/*.html"',
    lint: 'run-p lint:ts lint:tsc',
    'lint:fix': 'run-p lint:ts:fix lint:tsc',
    'lint:ts': 'tslint --config tslint.json --project . -e "**/{test,polyfills}.ts"',
    'lint:ts:fix':
      'tslint --config tslint.json --fix --project . -e "**/{test,polyfills}.ts"',
    'lint:tsc': 'tsc --noEmit --skipLibCheck',
  })
}

function configureAngular() {
  const angularDeps = ['angular-unit-test-helper']
  install(angularDeps)
}

function configureVsCodeForAngular() {
  json('.vscode/extensions.json')
    .merge({
      recommendations: BaseVsCodeExtensions.concat([
        'expertly-simple.ng-evergreen',
        'formulahendry.auto-close-tag',
        'HookyQR.beautify',
        'johnpapa.angular-essentials',
        'msjsdiag.debugger-for-edge',
      ]),
    })
    .save()

  json('.vscode/settings.json')
    .merge(
      Object.assign(BaseVsCodeSettings, {
        'ng-evergreen.upgradeChannel': 'Latest',
      })
    )
    .save()

  json('.vscode/launch.json')
    .merge({
      version: '0.2.0',
      configurations: [
        {
          name: 'Debug npm start with Chrome',
          type: 'chrome',
          request: 'launch',
          url: 'http://localhost:5000/#',
          webRoot: '${workspaceRoot}',
          runtimeArgs: ['--remote-debugging-port=9222'],
          sourceMaps: true,
          preLaunchTask: 'npm: start',
        },
        {
          name: 'Debug npm start with Edge',
          type: 'edge',
          request: 'launch',
          url: 'http://localhost:5000/#',
          webRoot: '${workspaceRoot}',
          sourceMaps: true,
          preLaunchTask: 'npm: start',
        },
        {
          name: 'Debug npm test with Chrome',
          type: 'chrome',
          request: 'launch',
          url: 'http://localhost:9876/debug.html',
          webRoot: '${workspaceRoot}',
          runtimeArgs: ['--remote-debugging-port=9222'],
          sourceMaps: true,
          preLaunchTask: 'npm: test',
        },
        {
          name: 'Debug npm test with Edge',
          type: 'edge',
          request: 'launch',
          url: 'http://localhost:9876/debug.html',
          webRoot: '${workspaceRoot}',
          sourceMaps: true,
          preLaunchTask: 'npm: test',
        },
        {
          name: 'npm run e2e',
          type: 'node',
          request: 'launch',
          program: '${workspaceRoot}/node_modules/protractor/bin/protractor',
          protocol: 'inspector',
          args: ['${workspaceRoot}/protractor.conf.js'],
        },
      ],
    })
    .save()
}

task.description = 'Configures VS Code for Angular projects'
module.exports = task
