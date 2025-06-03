# Reference

(From cli.md)

## CLI Reference

| Command                           | Alias  | Description                                                       |
|:---                               |:---    |:---                                                               |
| [`add`](cli/add)                  |        | Adds support for an external library to your project.             |
| [`analytics`](cli/analytics)      |        | Configures the gathering of Angular CLI usage metrics.            |
| [`build`](cli/build)              | `b`      | Compiles an Angular application or library into an output directory named dist/ at the given output path. |
| [`cache`](cli/cache)              |        | Configure persistent disk cache and retrieve cache statistics.    |
| [`completion`](cli/completion)    |        | Set up Angular CLI autocompletion for your terminal.              |
| [`config`](cli/config)            |        | Retrieves or sets Angular configuration values in the angular.json file for the workspace. |
| [`deploy`](cli/deploy)            |        | Invokes the deploy builder for a specified project or for the default project in the workspace. |
| [`e2e`](cli/e2e)                  | `e`      | Builds and serves an Angular application, then runs end-to-end tests. |
| [`extract-i18n`](cli/extract-i18n)|        | Extracts i18n messages from source code.                          |
| [`generate`](cli/generate)        | `g`      | Generates and/or modifies files based on a schematic.             |
| [`lint`](cli/lint)                |        | Runs linting tools on Angular application code in a given project folder. |
| [`new`](cli/new)                  | `n`      | Creates a new Angular workspace. |
| [`run`](cli/run)                  |        | Runs an Architect target with an optional custom builder configuration defined in your project. |
| [`serve`](cli/serve)              | `s`, `dev`      | Builds and serves your application, rebuilding on file changes. |
| [`test`](cli/test)                | `t`      | Runs unit tests in a project. |
| [`update`](cli/update)            |        | Updates your workspace and its dependencies. See https://angular.dev/update-guide/.             |
| [`version`](cli/version)          | `v`      | Outputs Angular CLI version. |

---


(From overview.md)

## Concepts

<docs-card-container>
  <docs-card title="NgModules" link="Learn more" href="guide/ngmodules">
    NgModules is a concept that commonly used in architecture v16 and earlier to help configure the injector and the compiler and help organize related things together.
  </docs-card>
</docs-card-container>

---


(From angular-compiler-options.md)

## Angular compiler options

When you use [ahead-of-time compilation (AOT)](tools/cli/aot-compiler), you can control how your application is compiled by specifying Angular compiler options in the [TypeScript configuration file](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).

The Angular options object, `angularCompilerOptions`, is a sibling to the `compilerOptions` object that supplies standard options to the TypeScript compiler.

<docs-code header="tsconfig.json" path="adev/src/content/examples/angular-compiler-options/tsconfig.json" visibleRegion="angular-compiler-options"/>

### Configuration inheritance with `extends`

Like the TypeScript compiler, the Angular AOT compiler also supports `extends` in the `angularCompilerOptions` section of the TypeScript configuration file.
The `extends` property is at the top level, parallel to `compilerOptions` and `angularCompilerOptions`.

A TypeScript configuration can inherit settings from another file using the `extends` property.
The configuration options from the base file are loaded first, then overridden by those in the inheriting configuration file.

For example:

<docs-code header="tsconfig.app.json" path="adev/src/content/examples/angular-compiler-options/tsconfig.app.json" visibleRegion="angular-compiler-options-app"/>

For more information, see the [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).

### Template options

The following options are available for configuring the Angular AOT compiler.

#### `annotationsAs`

Modifies how Angular-specific annotations are emitted to improve tree-shaking.
Non-Angular annotations are not affected.
One of `static fields` or `decorators`. The default value is `static fields`.

* By default, the compiler replaces decorators with a static field in the class, which allows advanced tree-shakers like [Closure compiler](https://github.com/google/closure-compiler) to remove unused classes
* The `decorators` value leaves the decorators in place, which makes compilation faster.
    TypeScript emits calls to the `__decorate` helper.
    Use `--emitDecoratorMetadata` for runtime reflection.

    HELPFUL: That the resulting code cannot tree-shake properly.

#### `annotateForClosureCompiler`

<!-- vale Angular.Angular_Spelling = NO -->

When `true`, use [Tsickle](https://github.com/angular/tsickle) to annotate the emitted JavaScript with [JSDoc](https://jsdoc.app) comments needed by the [Closure Compiler](https://github.com/google/closure-compiler).
Default is `false`.

<!-- vale Angular.Angular_Spelling = YES -->

#### `compilationMode`

Specifies the compilation mode to use.
The following modes are available:

| Modes       | Details |
|:---         |:---     |
| `'full'`    | Generates fully AOT-compiled code according to the version of Angular that is currently being used. |
| `'partial'` | Generates code in a stable, but intermediate form suitable for a published library.                 |

The default value is `'full'`.

For most applications, `'full'` is the correct compilation mode.

Use `'partial'` for independently published libraries, such as NPM packages.
`'partial'` compilations output a stable, intermediate format which better supports usage by applications built at different Angular versions from the library.
Libraries built at "HEAD" alongside their applications and using the same version of Angular such as in a mono-repository can use `'full'` since there is no risk of version skew.

#### `disableExpressionLowering`

When `true`, the default, transforms code that is or could be used in an annotation, to allow it to be imported from template factory modules.
See [metadata rewriting](tools/cli/aot-compiler#metadata-rewriting) for more information.

When `false`, disables this rewriting, requiring the rewriting to be done manually.

#### `disableTypeScriptVersionCheck`

When `true`, the compiler does not look at the TypeScript version and does not report an error when an unsupported version of TypeScript is used.
Not recommended, as unsupported versions of TypeScript might have undefined behavior.
Default is `false`.

#### `enableI18nLegacyMessageIdFormat`

Instructs the Angular template compiler to create legacy ids for messages that are tagged in templates by the `i18n` attribute.
See [Mark text for translations][GuideI18nCommonPrepareMarkTextInComponentTemplate] for more information about marking messages for localization.

Set this option to `false` unless your project relies upon translations that were created earlier using legacy IDs.
Default is `true`.

The pre-Ivy message extraction tooling created a variety of legacy formats for extracted message IDs.
These message formats have some issues, such as whitespace handling and reliance upon information inside the original HTML of a template.

The new message format is more resilient to whitespace changes, is the same across all translation file formats, and can be created directly from calls to `$localize`.
This allows `$localize` messages in application code to use the same ID as identical `i18n` messages in component templates.

#### `enableResourceInlining`

When `true`, replaces the `templateUrl` and `styleUrls` properties in all `@Component` decorators with inline content in the `template` and `styles` properties.

When enabled, the `.js` output of `ngc` does not include any lazy-loaded template or style URLs.

For library projects created with the Angular CLI, the development configuration default is `true`.

#### `enableLegacyTemplate`

When `true`, enables the deprecated `<template>` element in place of `<ng-template>`.
Default is `false`.
Might be required by some third-party Angular libraries.

#### `flatModuleId`

The module ID to use for importing a flat module \(when `flatModuleOutFile` is `true`\).
References created by the template compiler use this module name when importing symbols from the flat module.
Ignored if `flatModuleOutFile` is `false`.

#### `flatModuleOutFile`

When `true`, generates a flat module index of the given filename and the corresponding flat module metadata.
Use to create flat modules that are packaged similarly to `@angular/core` and `@angular/common`.
When this option is used, the `package.json` for the library should refer to the created flat module index instead of the library index file.

Produces only one `.metadata.json` file, which contains all the metadata necessary for symbols exported from the library index.
In the created `.ngfactory.js` files, the flat module index is used to import symbols. Symbols that include both the public API from the library index and shrouded internal symbols.

By default, the `.ts` file supplied in the `files` field is assumed to be the library index.
If more than one `.ts` file is specified, `libraryIndex` is used to select the file to use.
If more than one `.ts` file is supplied without a `libraryIndex`, an error is produced.

A flat module index `.d.ts` and `.js` is created with the given `flatModuleOutFile` name in the same location as the library index `.d.ts` file.

For example, if a library uses the `public_api.ts` file as the library index of the module, the `tsconfig.json` `files` field would be `["public_api.ts"]`.
The `flatModuleOutFile` option could then be set, for example, to `"index.js"`, which produces `index.d.ts` and `index.metadata.json` files.
The `module` field of the library's `package.json` would be `"index.js"` and the `typings` field would be `"index.d.ts"`.

#### `fullTemplateTypeCheck`

When `true`, the recommended value, enables the [binding expression validation](tools/cli/aot-compiler#binding-expression-validation) phase of the template compiler. This phase uses TypeScript to verify binding expressions.
For more information, see [Template type checking](tools/cli/template-typecheck).

Default is `false`, but when you use the Angular CLI command `ng new --strict`, it is set to `true` in the new project's configuration.

IMPORTANT: The `fullTemplateTypeCheck` option has been deprecated in Angular 13 in favor of the `strictTemplates` family of compiler options.

#### `generateCodeForLibraries`

When `true`, creates factory files \(`.ngfactory.js` and `.ngstyle.js`\) for `.d.ts` files with a corresponding `.metadata.json` file. The default value is `true`.

When `false`, factory files are created only for `.ts` files.
Do this when using factory summaries.

#### `preserveWhitespaces`

When `false`, the default, removes blank text nodes from compiled templates, which results in smaller emitted template factory modules.
Set to `true` to preserve blank text nodes.

HELPFUL: When using hydration, it is recommended that you use `preserveWhitespaces: false`, which is the default value. If you choose to enable preserving whitespaces by adding `preserveWhitespaces: true` to your tsconfig, it is possible you may encounter issues with hydration. This is not yet a fully supported configuration. Ensure this is also consistently set between the server and client tsconfig files. See the [hydration guide](guide/hydration#preserve-whitespaces) for more details.

#### `skipMetadataEmit`

When `true`, does not produce `.metadata.json` files.
Default is `false`.

The `.metadata.json` files contain information needed by the template compiler from a `.ts` file that is not included in the `.d.ts` file produced by the TypeScript compiler.
This information includes, for example, the content of annotations, such as a component's template, which TypeScript emits to the `.js` file but not to the `.d.ts` file.

You can set to `true` when using factory summaries, because the factory summaries include a copy of the information that is in the `.metadata.json` file.

Set to `true` if you are using TypeScript's `--outFile` option, because the metadata files are not valid for this style of TypeScript output.
The Angular community does not recommend using `--outFile` with Angular.
Use a bundler, such as [webpack](https://webpack.js.org), instead.

#### `skipTemplateCodegen`

When `true`, does not emit `.ngfactory.js` and `.ngstyle.js` files.
This turns off most of the template compiler and disables the reporting of template diagnostics.

Can be used to instruct the template compiler to produce `.metadata.json` files for distribution with an `npm` package. This avoids the production of `.ngfactory.js` and `.ngstyle.js` files that cannot be distributed to `npm`.

For library projects created with the Angular CLI, the development configuration default is `true`.

#### `strictMetadataEmit`

When `true`, reports an error to the `.metadata.json` file if `"skipMetadataEmit"` is `false`.
Default is `false`.
Use only when `"skipMetadataEmit"` is `false` and `"skipTemplateCodegen"` is `true`.

This option is intended to verify the `.metadata.json` files emitted for bundling with an `npm` package.
The validation is strict and can emit errors for metadata that would never produce an error when used by the template compiler.
You can choose to suppress the error emitted by this option for an exported symbol by including `@dynamic` in the comment documenting the symbol.

It is valid for `.metadata.json` files to contain errors.
The template compiler reports these errors if the metadata is used to determine the contents of an annotation.
The metadata collector cannot predict the symbols that are designed for use in an annotation. It preemptively includes error nodes in the metadata for the exported symbols.
The template compiler can then use the error nodes to report an error if these symbols are used.

If the client of a library intends to use a symbol in an annotation, the template compiler does not normally report this. It gets reported after the client actually uses the symbol.
This option allows detection of these errors during the build phase of the library and is used, for example, in producing Angular libraries themselves.

For library projects created with the Angular CLI, the development configuration default is `true`.

#### `strictInjectionParameters`

When `true`, reports an error for a supplied parameter whose injection type cannot be determined.
When `false`, constructor parameters of classes marked with `@Injectable` whose type cannot be resolved produce a warning.
The recommended value is `true`, but the default value is `false`.

When you use the Angular CLI command `ng new --strict`, it is set to `true` in the created project's configuration.

#### `strictTemplates`

When `true`, enables [strict template type checking](tools/cli/template-typecheck#strict-mode).

The strictness flags that this option enables allow you to turn on and off specific types of strict template type checking.
See [troubleshooting template errors](tools/cli/template-typecheck#troubleshooting-template-errors).

When you use the Angular CLI command `ng new --strict`, it is set to `true` in the new project's configuration.

#### `strictStandalone`

When `true`, reports an error if a component, directive, or pipe is not standalone.

#### `trace`

When `true`, prints extra information while compiling templates.
Default is `false`.

### Command line options

Most of the time, you interact with the Angular Compiler indirectly using [Angular CLI](reference/configs/angular-compiler-options). When debugging certain issues, you might find it useful to invoke the Angular Compiler directly.
You can use the `ngc` command provided by the `@angular/compiler-cli` npm package to call the compiler from the command line.

The `ngc` command is a wrapper around TypeScript's `tsc` compiler command. The Angular Compiler is primarily configured through `tsconfig.json` while Angular CLI is primarily configured through `angular.json`.

Besides the configuration file, you can also use [`tsc` command line options](https://www.typescriptlang.org/docs/handbook/compiler-options.html) to configure `ngc`.

[GuideI18nCommonPrepareMarkTextInComponentTemplate]: guide/i18n/prepare#mark-text-in-component-template "Mark text in component template - Prepare component for translation | Angular"

---


(From file-structure.md)

## Workspace and project file structure

You develop applications in the context of an Angular workspace.
A workspace contains the files for one or more projects.
A project is the set of files that comprise an application or a shareable library.

The Angular CLI `ng new` command creates a workspace.

<docs-code language="shell">

ng new my-project

</docs-code>

When you run this command, the CLI installs the necessary Angular npm packages and other dependencies in a new workspace, with a root-level application named *my-project*.

By default, `ng new` creates an initial skeleton application at the root level of the workspace, along with its end-to-end tests.
The skeleton is for a simple welcome application that is ready to run and easy to modify.
The root-level application has the same name as the workspace, and the source files reside in the `src/` subfolder of the workspace.

This default behavior is suitable for a typical "multi-repo" development style where each application resides in its own workspace.
Beginners and intermediate users are encouraged to use `ng new` to create a separate workspace for each application.

Angular also supports workspaces with [multiple projects](#multiple-projects).
This type of development environment is suitable for advanced users who are developing shareable libraries,
and for enterprises that use a "monorepo" development style, with a single repository and global configuration for all Angular projects.

To set up a monorepo workspace, you should skip creating the root application.
See [Setting up for a multi-project workspace](#multiple-projects) below.

### Workspace configuration files

All projects within a workspace share a [configuration](reference/configs/workspace-config).
The top level of the workspace contains workspace-wide configuration files, configuration files for the root-level application, and subfolders for the root-level application source and test files.

| Workspace configuration files | Purpose                                                                                                                                                                                                                                                                                                          |
|:---                           |:---                                                                                                                                                                                                                                                                                                              |
| `.editorconfig`               | Configuration for code editors. See [EditorConfig](https://editorconfig.org).                                                                                                                                                                                                                                    |
| `.gitignore`                  | Specifies intentionally untracked files that [Git](https://git-scm.com) should ignore.                                                                                                                                                                                                                           |
| `README.md`                   | Documentation for the workspace.                                                                                                                                                                                                                                                                                 |
| `angular.json`                | CLI configuration for all projects in the workspace, including configuration options for how to build, serve, and test each project. For details, see [Angular Workspace Configuration](reference/configs/workspace-config).                                                                                     |
| `package.json`                | Configures [npm package dependencies](reference/configs/npm-packages) that are available to all projects in the workspace. See [npm documentation](https://docs.npmjs.com/files/package.json) for the specific format and contents of this file.                                                                 |
| `package-lock.json`           | Provides version information for all packages installed into `node_modules` by the npm client. See [npm documentation](https://docs.npmjs.com/files/package-lock.json) for details.                                                                                                                              |
| `src/`                        | Source files for the root-level application project.                                                                                                                                                                                                                                                             |
| `public/`                     | Contains image and other asset files to be served as static files by the dev server and copied as-is when you build your application.                                                                                             |
| `node_modules/`               | Installed [npm packages](reference/configs/npm-packages) for the entire workspace. Workspace-wide `node_modules` dependencies are visible to all projects.                                                                                                                                                       |
| `tsconfig.json`               | The base [TypeScript](https://www.typescriptlang.org) configuration for projects in the workspace. All other configuration files inherit from this base file. For more information, see the [relevant TypeScript documentation](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#tsconfig-bases). |

### Application project files

By default, the CLI command `ng new my-app` creates a workspace folder named "my-app" and generates a new application skeleton in a `src/` folder at the top level of the workspace.
A newly generated application contains source files for a root module, with a root component and template.

When the workspace file structure is in place, you can use the `ng generate` command on the command line to add functionality and data to the application.
This initial root-level application is the *default app* for CLI commands (unless you change the default after creating [additional apps](#multiple-projects)).

For a single-application workspace, the `src` subfolder of the workspace contains the source files (application logic, data, and assets) for the root application.
For a multi-project workspace, additional projects in the `projects` folder contain a `project-name/src/` subfolder with the same structure.

#### Application source files

Files at the top level of `src/` support running your application.
Subfolders contain the application source and application-specific configuration.

| Application support files | Purpose                                                                                                                                                                                                                           |
|:---                       |:---                                                                                                                                                                                                                               |
| `app/`                    | Contains the component files in which your application logic and data are defined. See details [below](#app-src).                                                                                                                 |
| `favicon.ico`             | An icon to use for this application in the bookmark bar.                                                                                                                                                                          |
| `index.html`              | The main HTML page that is served when someone visits your site. The CLI automatically adds all JavaScript and CSS files when building your app, so you typically don't need to add any `<script>` or`<link>` tags here manually. |
| `main.ts`                 | The main entry point for your application.                                                                                                                                                                                        |
| `styles.css`              | Global CSS styles applied to the entire application.                                                                                                                                                                              |

Inside the `src` folder, the `app` folder contains your project's logic and data.
Angular components, templates, and styles go here.

| `src/app/` files        | Purpose                                                                                                                                                                                                                                                                            |
|:---                     |:---                                                                                                                                                                                                                                                                                |
| `app.config.ts`         | Defines the application configuration that tells Angular how to assemble the application. As you add more providers to the app, they should be declared here.<br><br>*Only generated when using the `--standalone` option.*                                                        |
| `app.component.ts`      | Defines the application's root component, named `AppComponent`. The view associated with this root component becomes the root of the view hierarchy as you add components and services to your application.                                                                        |
| `app.component.html`    | Defines the HTML template associated with `AppComponent`.                                                                                                                                                                                                                          |
| `app.component.css`     | Defines the CSS stylesheet for `AppComponent`.                                                                                                                                                                                                                                     |
| `app.component.spec.ts` | Defines a unit test for `AppComponent`.                                                                                                                                                                                                                                            |
| `app.module.ts`         | Defines the root module, named `AppModule`, that tells Angular how to assemble the application. Initially declares only the `AppComponent`. As you add more components to the app, they must be declared here.<br><br>*Only generated when using the `--standalone false` option.* |
| `app.routes.ts`         | Defines the application's routing configuration.                                                                                                                                                                                                                                   |

#### Application configuration files

Application-specific configuration files for the root application reside at the workspace root level.
For a multi-project workspace, project-specific configuration files are in the project root, under `projects/project-name/`.

Project-specific [TypeScript](https://www.typescriptlang.org) configuration files inherit from the workspace-wide `tsconfig.json`.

| Application-specific configuration files | Purpose                                                                                                                                                                                             |
|:---                                      |:---                                                                                                                                                                                                 |
| `tsconfig.app.json`                      | Application-specific [TypeScript configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html), including [Angular compiler options](reference/configs/angular-compiler-options). |
| `tsconfig.spec.json`                     | [TypeScript configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) for application tests.                                                                                  |

### Multiple projects

A multi-project workspace is suitable for an organization that uses a single repository and global configuration for multiple Angular projects (the "monorepo" model).
A multi-project workspace also supports library development.

#### Setting up for a multi-project workspace

If you intend to have multiple projects in a workspace, you can skip the initial application generation when you create the workspace, and give the workspace a unique name.
The following command creates a workspace with all of the workspace-wide configuration files, but no root-level application.

<docs-code language="shell">

ng new my-workspace --no-create-application

</docs-code>

You can then generate applications and libraries with names that are unique within the workspace.

<docs-code language="shell">

cd my-workspace
ng generate application my-app
ng generate library my-lib

</docs-code>

#### Multiple project file structure

The first explicitly generated application goes into the `projects` folder along with all other projects in the workspace.
Newly generated libraries are also added under `projects`.
When you create projects this way, the file structure of the workspace is entirely consistent with the structure of the [workspace configuration file](reference/configs/workspace-config), `angular.json`.

```markdown
my-workspace/
  ├── …                (workspace-wide configuration files)
  └── projects/        (applications and libraries)
      ├── my-app/      (an explicitly generated application)
      │   └── …        (application-specific code and configuration)
      └── my-lib/      (a generated library)
          └── …        (library-specific code and configuration)
```

### Library project files

When you generate a library using the CLI (with a command such as `ng generate library my-lib`), the generated files go into the `projects/` folder of the workspace.
For more information about creating your own libraries, see  [Creating Libraries](tools/libraries/creating-libraries).

Unlike an application, a library has its own `package.json` configuration file.

Under the `projects/` folder, the `my-lib` folder contains your library code.

| Library source files     | Purpose                                                                                                                                                                                         |
|:---                      |:---                                                                                                                                                                                             |
| `src/lib`                | Contains your library project's logic and data. Like an application project, a library project can contain components, services, modules, directives, and pipes.                                |
| `src/public-api.ts`      | Specifies all files that are exported from your library.                                                                                                                                        |
| `ng-package.json`        | Configuration file used by [ng-packagr](https://github.com/ng-packagr/ng-packagr) for building your library.                                                                                    |
| `package.json`           | Configures [npm package dependencies](reference/configs/npm-packages) that are required for this library.                                                                                       |
| `tsconfig.lib.json`      | Library-specific [TypeScript Configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html), including [Angular compiler options](reference/configs/angular-compiler-options). |
| `tsconfig.lib.prod.json` | Library-specific [TypeScript Configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) that is used when building the library in production mode.                         |
| `tsconfig.spec.json`     | [TypeScript Configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) for the library's unit tests.                                                                       |

---


(From npm-packages.md)

## Workspace npm dependencies

The Angular Framework, Angular CLI, and components used by Angular applications are packaged as [npm packages](https://docs.npmjs.com/getting-started/what-is-npm "What is npm?") and distributed using the [npm registry](https://docs.npmjs.com).

You can download and install these npm packages by using the [npm CLI client](https://docs.npmjs.com/cli/install).
By default, Angular CLI uses the npm client.

HELPFUL: See [Local Environment Setup](tools/cli/setup-local "Setting up for Local Development") for information about the required versions and installation of `Node.js` and `npm`.

If you already have projects running on your machine that use other versions of Node.js and npm, consider using [nvm](https://github.com/creationix/nvm) to manage the multiple versions of Node.js and npm.

### `package.json`

`npm` installs the packages identified in a [`package.json`](https://docs.npmjs.com/files/package.json) file.

The CLI command `ng new` creates a `package.json` file when it creates the new workspace.
This `package.json` is used by all projects in the workspace, including the initial application project that is created by the CLI when it creates the workspace.
Libraries created with `ng generate library` will include their own `package.json` file.

Initially, this `package.json` includes *a starter set of packages*, some of which are required by Angular and others that support common application scenarios.
You add packages to `package.json` as your application evolves.

### Default Dependencies

The following Angular packages are included as dependencies in the default `package.json` file for a new Angular workspace.
For a complete list of Angular packages, see the [API reference](api).

| Package name                                                              | Details                                                                                                                                                                                        |
|:---                                                                       |:---                                                                                                                                                                                            |
| [`@angular/animations`](api#animations)                                   | Angular's animations library makes it easy to define and apply animation effects such as page and list transitions. For more information, see the [Animations guide](guide/animations).        |
| [`@angular/common`](api#common)                                           | The commonly-needed services, pipes, and directives provided by the Angular team.                                                                                                              |
| `@angular/compiler`                                                       | Angular's template compiler. It understands Angular templates and can convert them to code that makes the application run.                                                                     |
| `@angular/compiler-cli`                                                   | Angular's compiler which is invoked by the Angular CLI's `ng build` and `ng serve` commands. It processes Angular templates with `@angular/compiler` inside a standard TypeScript compilation. |
| [`@angular/core`](api#core)                                               | Critical runtime parts of the framework that are needed by every application. Includes all metadata decorators such as `@Component`, dependency injection, and component lifecycle hooks.      |
| [`@angular/forms`](api#forms)                                             | Support for both [template-driven](guide/forms) and [reactive forms](guide/forms/reactive-forms). See [Introduction to forms](guide/forms).                                                    |
| [`@angular/platform-browser`](api#platform-browser)                       | Everything DOM and browser related, especially the pieces that help render into the DOM.                                                                                                       |
| [`@angular/platform-browser-dynamic`](api#platform-browser-dynamic)       | Includes [providers](api/core/Provider) and methods to compile and run the application on the client using the [JIT compiler](tools/cli/aot-compiler#choosing-a-compiler).                     |
| [`@angular/router`](api#router)                                           | The router module navigates among your application pages when the browser URL changes. For more information, see [Routing and Navigation](guide/routing).                                       |
| [`@angular/cli`](https://github.com/angular/angular-cli)                  | Contains the Angular CLI binary for running `ng` commands.                                                                                                                                     |
| [`@angular-devkit/build-angular`](https://github.com/angular/angular-cli) | Contains default CLI builders for bundling, testing, and serving Angular applications and libraries.                                                                                           |
| `rxjs`                                                                    | A library for reactive programming using `Observables`.                                                                                                                                        |
| [`zone.js`](https://github.com/angular/zone.js)                           | Angular relies on `zone.js`` to run Angular's change detection processes when native JavaScript operations raise events.                                                                       |
| [`typescript`](https://www.npmjs.com/package/typescript)                  | The TypeScript compiler, language server, and built-in type definitions.                                                                                                                       |

---


(From workspace-config.md)

## Angular workspace configuration

The `angular.json` file at the root level of an Angular workspace provides workspace-wide and project-specific configuration defaults. These are used for build and development tools provided by the Angular CLI.
Path values given in the configuration are relative to the root workspace directory.

### General JSON structure

At the top-level of `angular.json`, a few properties configure the workspace and a `projects` section contains the remaining per-project configuration options.
You can override Angular CLI defaults set at the workspace level through defaults set at the project level.
You can also override defaults set at the project level using the command line.

The following properties, at the top-level of the file, configure the workspace.

| Properties       | Details                                                                                                                                                                                        |
|:---              |:---                                                                                                                                                                                            |
| `version`        | The configuration-file version.                                                                                                                                                                |
| `newProjectRoot` | Path where new projects are created through tools like `ng generate application` or `ng generate library`. Path can be absolute or relative to the workspace directory. Defaults to `projects` |
| `cli`            | A set of options that customize the [Angular CLI](tools/cli). See [Angular CLI configuration options](#angular-cli-configuration-options) below.                                               |
| `schematics`     | A set of [schematics](tools/cli/schematics) that customize the `ng generate` sub-command option defaults for this workspace. See [schematics](#schematics) below.                              |
| `projects`       | Contains a subsection for each application or library in the workspace, with project-specific configuration options.                                                                           |

The initial application that you create with `ng new app-name` is listed under "projects":

When you create a library project with `ng generate library`, the library project is also added to the `projects` section.

HELPFUL: The `projects` section of the configuration file does not correspond exactly to the workspace file structure.
<!-- markdownlint-disable-next-line MD032 -->
* The initial application created by `ng new` is at the top level of the workspace file structure.
* Other applications and libraries are under the `projects` directory by default.

For more information, see [Workspace and project file structure](reference/configs/file-structure).

### Angular CLI configuration options

The following properties are a set of options that customize the Angular CLI.

| Property              | Details                                                                                                                                                                    | Value type                                  | Default value |
|:---                   |:---                                                                                                                                                                        |:---                                         |:---           |
| `analytics`           | Share anonymous usage data with the Angular Team. A boolean value indicates whether or not to share data, while a UUID string shares data using a pseudonymous identifier. | `boolean` \| `string`                       | `false`       |
| `cache`               | Control [persistent disk cache](cli/cache) used by [Angular CLI Builders](tools/cli/cli-builder).                                                                          | [Cache options](#cache-options)             | `{}`          |
| `schematicCollections`| List schematics collections to use in `ng generate`.                                                                                                                       | `string[]`                                  | `[]`          |
| `packageManager`      | The preferred package manager tool to use.                                                                                                                                 | `npm` \| `cnpm` \| `pnpm` \| `yarn`\| `bun` | `npm`         |
| `warnings`            | Control Angular CLI specific console warnings.                                                                                                                             | [Warnings options](#warnings-options)       | `{}`          |

#### Cache options

| Property      | Details                                                                                                                                                                                                                                      | Value type               | Default value    |
|:---           |:---                                                                                                                                                                                                                                          |:---                      |:---              |
| `enabled`     | Configure whether disk caching is enabled for builds.                                                                                                                                                                                        | `boolean`                | `true`           |
| `environment` | Configure in which environment disk cache is enabled.<br><br>* `ci` enables caching only in continuous integration (CI) environments.<br>* `local` enables caching only *outside* of CI environments.<br>* `all` enables caching everywhere. | `local` \| `ci` \| `all` | `local`          |
| `path`        | The directory used to stored cache results.                                                                                                                                                                                                  | `string`                 | `.angular/cache` |

#### Warnings options

| Property          | Details                                                                         | Value type | Default value |
|:---               |:---                                                                             |:---        |:---           |
| `versionMismatch` | Show a warning when the global Angular CLI version is newer than the local one. | `boolean`  | `true`        |

### Project configuration options

The following top-level configuration properties are available for each project, under `projects['project-name']`.

| Property      | Details                                                                                                                                                                              | Value type                                                      | Default value   |
|:---           |:---                                                                                                                                                                                  |:---                                                             |:---             |
| `root`        | The root directory for this project's files, relative to the workspace directory. Empty for the initial application, which resides at the top level of the workspace.                | `string`                                                        | None (required) |
| `projectType` | One of "application" or "library" An application can run independently in a browser, while a library cannot.                                                                         | `application` \| `library`                                      | None (required) |
| `sourceRoot`  | The root directory for this project's source files.                                                                                                                                  | `string`                                                        | `''`            |
| `prefix`      | A string that Angular prepends to selectors when generating new components, directives, and pipes using `ng generate`. Can be customized to identify an application or feature area. | `string`                                                        | `'app'`         |
| `schematics`  | A set of schematics that customize the `ng generate` sub-command option defaults for this project. See the [Generation schematics](#schematics) section.                             | See [schematics](#schematics)                                   | `{}`            |
| `architect`   | Configuration defaults for Architect builder targets for this project.                                                                                                               | See [Configuring builder targets](#configuring-builder-targets) | `{}`            |

### Schematics

[Angular schematics](tools/cli/schematics) are instructions for modifying a project by adding new files or modifying existing files.
These can be configured by mapping the schematic name to a set of default options.

The "name" of a schematic is in the format: `<schematic-package>:<schematic-name>`.
Schematics for the default Angular CLI `ng generate` sub-commands are collected in the package [`@schematics/angular`](https://github.com/angular/angular-cli/blob/main/packages/schematics/angular/application/schema.json).
For example, the schematic for generating a component with `ng generate component` is `@schematics/angular:component`.

The fields given in the schematic's schema correspond to the allowed command-line argument values and defaults for the Angular CLI sub-command options.
You can update your workspace schema file to set a different default for a sub-command option. For example, to disable `standalone` in `ng generate component` by default:

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "schematics": {
        "@schematics/angular:component": {
          "standalone": false
        }
      }
    }
  }
}

</docs-code>

### Configuring CLI builders

Architect is the tool that the Angular CLI uses to perform complex tasks, such as compilation and test running.
Architect is a shell that runs a specified builder to perform a given task, according to a target configuration.
You can define and configure new builders and targets to extend the Angular CLI.
See [Angular CLI Builders](tools/cli/cli-builder).

#### Default Architect builders and targets

Angular defines default builders for use with specific commands, or with the general `ng run` command.
The JSON schemas that define the options and defaults for each of these builders are collected in the [`@angular-devkit/build-angular`](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/build_angular/builders.json) package.
The schemas configure options for the following builders.

#### Configuring builder targets

The `architect` section of `angular.json` contains a set of Architect targets.
Many of the targets correspond to the Angular CLI commands that run them.
Other targets can be executed using the `ng run` command, and you can define your own targets.

Each target object specifies the `builder` for that target, which is the npm package for the tool that Architect runs.
Each target also has an `options` section that configures default options for the target, and a `configurations` section that names and specifies alternative configurations for the target.
See the example in [Build target](#build-target) below.

| Property       | Details                                                                                                                                                                                              |
|:---            |:---                                                                                                                                                                                                  |
| `build`        | Configures defaults for options of the `ng build` command. See the [Build target](#build-target) section for more information.                                                                       |
| `serve`        | Overrides build defaults and supplies extra serve defaults for the `ng serve` command. Besides the options available for the `ng build` command, it adds options related to serving the application. |
| `e2e`          | Overrides build defaults for building end-to-end testing applications using the `ng e2e` command.                                                                                                    |
| `test`         | Overrides build defaults for test builds and supplies extra test-running defaults for the `ng test` command.                                                                                         |
| `lint`         | Configures defaults for options of the `ng lint` command, which performs static code analysis on project source files.                                                                               |
| `extract-i18n` | Configures defaults for options of the `ng extract-i18n` command, which extracts localized message strings from source code and outputs translation files for internationalization.                  |

HELPFUL: All options in the configuration file must use `camelCase`, rather than `dash-case` as used on the command line.

### Build target

Each target under `architect` has the following properties:

| Property        | Details                                                                                                                                                                                                                                                |
|:---             |:---                                                                                                                                                                                                                                                    |
| `builder`       | The CLI builder used to create this target in the form of `<package-name>:<builder-name>`.                                                                                                                                                             |
| `options`       | Build target default options.                                                                                                                                                                                                                          |
| `configurations`| Alternative configurations for executing the target. Each configuration sets the default options for that intended environment, overriding the associated value under `options`. See [Alternate build configurations](#alternate-build-configurations) below. |

For example, to configure a build with optimizations disabled:

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "optimization": false
          }
        }
      }
    }
  }
}

</docs-code>

#### Alternate build configurations

Angular CLI comes with two build configurations: `production` and `development`.
By default, the `ng build` command uses the `production` configuration, which applies several build optimizations, including:

* Bundling files
* Minimizing excess whitespace
* Removing comments and dead code
* Minifying code to use short, mangled names

You can define and name extra alternate configurations (such as `staging`, for instance) appropriate to your development process.
You can select an alternate configuration by passing its name to the `--configuration` command line flag.

For example, to configure a build where optimization is enabled only for production builds (`ng build --configuration production`):

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "optimization": false
          },
          "configurations": {
            "production": {
              "optimization": true
            }
          }
        }
      }
    }
  }
}

</docs-code>

You can also pass in more than one configuration name as a comma-separated list.
For example, to apply both `staging` and `french` build configurations, use the command `ng build --configuration staging,french`.
In this case, the command parses the named configurations from left to right.
If multiple configurations change the same setting, the last-set value is the final one.
In this example, if both `staging` and `french` configurations set the output path, the value in `french` would get used.

#### Extra build and test options

The configurable options for a default or targeted build generally correspond to the options available for the [`ng build`](cli/build), [`ng serve`](cli/serve), and [`ng test`](cli/test) commands.
For details of those options and their possible values, see the [Angular CLI Reference](cli).

| Options properties         | Details                                                                                                                                                                                                                                                                |
|:---                        |:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets`                   | An object containing paths to static assets to serve with the application. The default paths point to the project's `public` directory. See more in the [Assets configuration](#assets-configuration) section.                                       |
| `styles`                   | An array of CSS files to add to the global context of the project. Angular CLI supports CSS imports and all major CSS preprocessors. See more in the [Styles and scripts configuration](#styles-and-scripts-configuration) section.                                    |
| `stylePreprocessorOptions` | An object containing option-value pairs to pass to style preprocessors. See more in the [Styles and scripts configuration](#styles-and-scripts-configuration) section.                                                                                                 |
| `scripts`                  | An object containing JavaScript files to add to the application. The scripts are loaded exactly as if you had added them in a `<script>` tag inside `index.html`. See more in the [Styles and scripts configuration](#styles-and-scripts-configuration) section.       |
| `budgets`                  | Default size-budget type and thresholds for all or parts of your application. You can configure the builder to report a warning or an error when the output reaches or exceeds a threshold size. See [Configure size budgets](tools/cli/build#configure-size-budgets). |
| `fileReplacements`         | An object containing files and their compile-time replacements. See more in [Configure target-specific file replacements](tools/cli/build#configure-target-specific-file-replacements).                                                                                |
| `index`                    | A base HTML document which loads the application. See more in [Index configuration](#index-configuration).                                                                                                                                                                    |

### Complex configuration values

The `assets`, `index`, `outputPath`, `styles`, and `scripts` options can have either simple path string values, or object values with specific fields.
The `sourceMap` and `optimization` options can be set to a simple boolean value. They can also be given a complex value using the configuration file.

The following sections provide more details of how these complex values are used in each case.

#### Assets configuration

Each `build` target configuration can include an `assets` array that lists files or folders you want to copy as-is when building your project.
By default, the contents of the `public/` directory are copied over.

To exclude an asset, you can remove it from the assets configuration.

You can further configure assets to be copied by specifying assets as objects, rather than as simple paths relative to the workspace root.
An asset specification object can have the following fields.

| Fields           | Details                                                                                                                                   |
|:---              |:---                                                                                                                                       |
| `glob`           | A [node-glob](https://github.com/isaacs/node-glob/blob/master/README.md) using `input` as base directory.                                 |
| `input`          | A path relative to the workspace root.                                                                                                    |
| `output`         | A path relative to `outDir`. Because of the security implications, the Angular CLI never writes files outside of the project output path. |
| `ignore`         | A list of globs to exclude.                                                                                                               |
| `followSymlinks` | Allow glob patterns to follow symlink directories. This allows subdirectories of the symlink to be searched. Defaults to `false`.         |

For example, the default asset paths can be represented in more detail using the following objects.

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "assets": [
              {
                "glob": "**/*",
                "input": "src/assets/",
                "output": "/assets/"
              },
              {
                "glob": "favicon.ico",
                "input": "src/",
                "output": "/"
              }
            ]
          }
        }
      }
    }
  }
}

</docs-code>

The following example uses the `ignore` field to exclude certain files in the assets directory from being copied into the build:

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "assets": [
              {
                "glob": "**/*",
                "input": "src/assets/",
                "ignore": ["**/*.svg"],
                "output": "/assets/"
              }
            ]
          }
        }
      }
    }
  }
}

</docs-code>

#### Styles and scripts configuration

An array entry for the `styles` and `scripts` options can be a simple path string, or an object that points to an extra entry-point file.
The associated builder loads that file and its dependencies as a separate bundle during the build.
With a configuration object, you have the option of naming the bundle for the entry point, using a `bundleName` field.

The bundle is injected by default, but you can set `inject` to `false` to exclude the bundle from injection.
For example, the following object values create and name a bundle that contains styles and scripts, and excludes it from injection:

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "styles": [
              {
                "input": "src/external-module/styles.scss",
                "inject": false,
                "bundleName": "external-module"
              }
            ],
            "scripts": [
              {
                "input": "src/external-module/main.js",
                "inject": false,
                "bundleName": "external-module"
              }
            ]
          }
        }
      }
    }
  }
}

</docs-code>

##### Style preprocessor options

In Sass, you can make use of the `includePaths` feature for both component and global styles. This allows you to add extra base paths that are checked for imports.

To add paths, use the `stylePreprocessorOptions` option:

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "stylePreprocessorOptions": {
              "includePaths": [
                "src/style-paths"
              ]
            }
          }
        }
      }
    }
  }
}

</docs-code>

Files in that directory, such as `src/style-paths/_variables.scss`, can be imported from anywhere in your project without the need for a relative path:

<docs-code language="scss">

// src/app/app.component.scss
// A relative path works
@import '../style-paths/variables';

// But now this works as well
@import 'variables';

</docs-code>

HELPFUL: You also need to add any styles or scripts to the `test` builder if you need them for unit tests.
See also [Using runtime-global libraries inside your application](tools/libraries/using-libraries#using-runtime-global-libraries-inside-your-app).

#### Optimization configuration

The `optimization` option can be either a boolean or an object for more fine-tune configuration.
This option enables various optimizations of the build output, including:

* Minification of scripts and styles
* Tree-shaking
* Dead-code elimination
* Inlining of critical CSS
* Fonts inlining

Several options can be used to fine-tune the optimization of an application.

| Options   | Details                                                        | Value type                                                                     | Default value |
|:---       |:---                                                            |:---                                                                            |:---           |
| `scripts` | Enables optimization of the scripts output.                    | `boolean`                                                                      | `true`        |
| `styles`  | Enables optimization of the styles output.                     | `boolean` \| [Styles optimization options](#styles-optimization-options) | `true`        |
| `fonts`   | Enables optimization for fonts. This requires internet access. | `boolean` \| [Fonts optimization options](#fonts-optimization-options)   | `true`        |

##### Styles optimization options

| Options          | Details                                                                                                                  | Value type | Default value |
|:---              |:---                                                                                                                      |:---        |:---           |
| `minify`         | Minify CSS definitions by removing extraneous whitespace and comments, merging identifiers, and minimizing values.       | `boolean`  | `true`        |
| `inlineCritical` | Extract and inline critical CSS definitions to improve [First Contentful Paint](https://web.dev/first-contentful-paint). | `boolean`  | `true`        |
| `removeSpecialComments` | Remove comments in global CSS that contains `@license` or `@preserve` or that starts with `//!` or `/*!`.         | `boolean`  | `true`        |

##### Fonts optimization options

| Options  | Details                                                                                                                                                                                                             | Value type | Default value |
|:---      |:---                                                                                                                                                                                                                 |:---        |:---           |
| `inline` | Reduce [render blocking requests](https://web.dev/render-blocking-resources) by inlining external Google Fonts and Adobe Fonts CSS definitions in the application's HTML index file. This requires internet access. | `boolean`  | `true`        |

You can supply a value such as the following to apply optimization to one or the other:

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "optimization": {
              "scripts": true,
              "styles": {
                "minify": true,
                "inlineCritical": true
              },
              "fonts": true
            }
          }
        }
      }
    }
  }
}

</docs-code>

#### Source map configuration

The `sourceMap` builder option can be either a boolean or an object for more fine-tune configuration to control the source maps of an application.

| Options   | Details                                             | Value type | Default value |
|:---       |:---                                                 |:---        |:---           |
| `scripts` | Output source maps for all scripts.                 | `boolean`  | `true`        |
| `styles`  | Output source maps for all styles.                  | `boolean`  | `true`        |
| `vendor`  | Resolve vendor packages source maps.                | `boolean`  | `false`       |
| `hidden`  | Omit link to sourcemaps from the output JavaScript. | `boolean`  | `false`       |

The example below shows how to toggle one or more values to configure the source map outputs:

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "sourceMap": {
              "scripts": true,
              "styles": false,
              "hidden": true,
              "vendor": true
            }
          }
        }
      }
    }
  }
}

</docs-code>

HELPFUL: When using hidden source maps, source maps are not referenced in the bundle.
These are useful if you only want source maps to map stack traces in error reporting tools without showing up in browser developer tools.
Note that even though `hidden` prevents the source map from being linked in the output bundle, your deployment process must take care not to serve the generated sourcemaps in production, or else the information is still leaked.

#### Index configuration

Configures generation of the application's HTML index.

The `index` option can be either a string or an object for more fine-tune configuration.

When supplying the value as a string the filename of the specified path will be used for the generated file and will be created in the root of the application's configured output path.

##### Index options

| Options  | Details                                                                                                                                                                          | Value type | Default value   |
|:---      |:---                                                                                                                                                                              |:---        |:---             |
| `input`  | The path of a file to use for the application's generated HTML index.                                                                                                            | `string`   | None (required) |
| `output` | The output path of the application's generated HTML index file. The full provided path will be used and will be considered relative to the application's configured output path. | `string`   | `index.html`    |

#### Output path configuration

The `outputPath` option can be either a String which will be used as the `base` value or an Object for more fine-tune configuration.

Several options can be used to fine-tune the output structure of an application.

| Options   | Details                                                                            | Value type | Default value |
|:---       |:---                                                                                |:---        |:---           |
| `base`    | Specify the output path relative to workspace root.                                | `string`   |               |
| `browser` | The output directory name for your browser build is within the base output path. This can be safely served to users.       | `string`   | `browser`     |
| `server`  | The output directory name of your server build within the output path base.        | `string`   | `server`      |
| `media`   | The output directory name for your media files located within the output browser directory. These media files are commonly referred to as resources in CSS files. | `string`   | `media`       |

---


(From NG0100.md)

## Expression Changed After Checked

<docs-video src="https://www.youtube.com/embed/O47uUnJjbJc"/>

Angular throws an `ExpressionChangedAfterItHasBeenCheckedError` when an expression value has been changed after change detection has completed. Angular only throws this error in development mode.

In development mode, Angular performs an additional check after each change detection run, to ensure the bindings haven't changed. This catches errors where the view is left in an inconsistent state. This can occur, for example, if a method or getter returns a different value each time it is called, or if a child component changes values on its parent. If either of these occurs, this is a sign that change detection is not stabilized. Angular throws the error to ensure data is always reflected correctly in the view, which prevents erratic UI behavior or a possible infinite loop.

This error commonly occurs when you've added template expressions or have begun to implement lifecycle hooks like `ngAfterViewInit` or `ngOnChanges`. It is also common when dealing with loading status and asynchronous operations, or when a child component changes its parent bindings.

### Debugging the error

The [source maps](https://developer.mozilla.org/docs/Tools/Debugger/How_to/Use_a_source_map) generated by the CLI are very useful when debugging. Navigate up the call stack until you find a template expression where the value displayed in the error has changed.

Ensure that there are no changes to the bindings in the template after change detection is run. This often means refactoring to use the correct component lifecycle hook for your use case. If the issue exists within `ngAfterViewInit`, the recommended solution is to use a constructor or `ngOnInit` to set initial values, or use `ngAfterContentInit` for other value bindings.

If you are binding to methods in the view, ensure that the invocation does not update any of the other bindings in the template.

Read more about which solution is right for you in ['Everything you need to know about the "ExpressionChangedAfterItHasBeenCheckedError" error'](https://angularindepth.com/posts/1001/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error) and why this is useful at ['Angular Debugging "Expression has changed after it was checked": Simple Explanation (and Fix)'](https://blog.angular-university.io/angular-debugging).

---


(From NG01101.md)

## Wrong Async Validator Return Type

Async validators must return a promise or an observable, and emit/resolve them whether the validation fails or succeeds. In particular, they must implement the [AsyncValidatorFn API](api/forms/AsyncValidator)

```typescript
export function isTenAsync(control: AbstractControl): 
  Observable<ValidationErrors | null> {
    const v: number = control.value;
    if (v !== 10) {
    // Emit an object with a validation error.
      return of({ 'notTen': true, 'requiredValue': 10 });
    }
    // Emit null, to indicate no error occurred.
    return of(null);
  }
```

### Debugging the error

Did you mistakenly use a synchronous validator instead of an async validator?

---


(From NG01203.md)

## Missing value accessor

For all custom form controls, you must register a value accessor.

Here's an example of how to provide one:

```typescript
providers: [
  {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MyInputField),
    multi: true,
  }
]
```

### Debugging the error

As described above, your control was expected to have a value accessor, but was missing one. However, there are many different reasons this can happen in practice. Here's a listing of some known problems leading to this error.

1. If you **defined** a custom form control, did you remember to provide a value accessor?
1. Did you put `ngModel` on an element with no value, or an **invalid element** (e.g. `<div [(ngModel)]="foo">`)?
1. Are you using a custom form control declared inside an `NgModule`? if so, make sure you are **importing** the `NgModule`.
1. Are you using `ngModel` with a third-party custom form control? Check whether that control provides a value accessor. If not, use **`ngDefaultControl`** on the control's element.
1. Are you **testing** a custom form control? Be sure to configure your testbed to know about the control. You can do so with `Testbed.configureTestingModule`.
1. Are you using **Nx and Module Federation** with webpack? Your `webpack.config.js` may require [extra configuration](https://github.com/angular/angular/issues/43821#issuecomment-1054845431) to ensure the forms package is shared.

---


(From NG0200.md)

## Circular Dependency in DI

<docs-video src="https://www.youtube.com/embed/CpLOm4o_FzM"/>

A cyclic dependency exists when a [dependency of a service](guide/di/hierarchical-dependency-injection) directly or indirectly depends on the service itself. For example, if `UserService` depends on `EmployeeService`, which also depends on `UserService`. Angular will have to instantiate `EmployeeService` to create `UserService`, which depends on `UserService`, itself.

### Debugging the error

Use the call stack to determine where the cyclical dependency exists.
You will be able to see if any child dependencies rely on the original file by [mapping out](guide/di/di-in-action) the component, module, or service's dependencies, and identifying the loop causing the problem.

Break this loop \(or circle\) of dependency to resolve this error. This most commonly means removing or refactoring the dependencies to not be reliant on one another.

---


(From NG0201.md)

## No Provider Found

<docs-video src="https://www.youtube.com/embed/lAlOryf1-WU"/>

You see this error when you try to inject a service but have not declared a corresponding provider. A provider is a mapping that supplies a value that you can inject into the constructor of a class in your application.

Read more on providers in our [Dependency Injection guide](guide/di).

### Debugging the error

Work backwards from the object where the error states that a provider is missing: `No provider for ${this}!`. This is commonly thrown in services, which require non-existing providers.

To fix the error ensure that your service is registered in the list of providers of an `NgModule` or has the `@Injectable` decorator with a `providedIn` property at top.

The most common solution is to add a provider in `@Injectable` using `providedIn`:

<docs-code language="typescript">
@Injectable({ providedIn: 'app' })
</docs-code>

---


(From NG0203.md)

## `inject()` must be called from an injection context

You see this error when you try to use the [`inject`](api/core/inject) function outside of the allowed [injection context](guide/di/dependency-injection-context). The injection context is available during the class creation and initialization. It is also available to functions
used with `runInInjectionContext`.

In practice the `inject()` calls are allowed in a constructor, a constructor parameter and a field initializer:

```typescript
@Injectable({providedIn: 'root'})
export class Car {
  radio: Radio|undefined;

  // OK: field initializer
  spareTyre = inject(Tyre);

  constructor() {
    // OK: constructor body
    this.radio = inject(Radio);
  }
}
```

It is also legal to call [`inject`](api/core/inject) from a provider's factory:

```typescript
providers: [
  {provide: Car, useFactory: () => {
    // OK: a class factory
    const engine = inject(Engine);
    return new Car(engine);
  }}
]
```

Calls to the [`inject`](api/core/inject) function outside of the class creation or `runInInjectionContext` will result in error. Most notably, calls to `inject()` are disallowed after a class instance was created, in methods (including lifecycle hooks):

```typescript
@Component({ ... })
export class CarComponent {
  ngOnInit() {
    // ERROR: too late, the component instance was already created
    const engine = inject(Engine);
    engine.start();
  }
}
```

### Debugging the error

Work backwards from the stack trace of the error to identify a place where the disallowed call to `inject()` is located.

To fix the error move the [`inject`](api/core/inject) call to an allowed place (usually a class constructor or a field initializer).

**NOTE:** If you are running in a test context, `TestBed.runInInjectionContext` will enable `inject()` to succeed.

```typescript
TestBed.runInInjectionContext(() => {
   // ...
});
```

---


(From NG0209.md)

## Invalid multi provider

The Angular runtime will throw this error when it injects a token intended to be used with `multi: true` but
a non-Array was found instead. For example, `ENVIRONMENT_INITIALIZER` should be provided
like `{provide: ENVIRONMENT_INITIALIZER, multi: true, useValue: () => {...}}`.

---


(From NG02200.md)

## Missing Iterable Differ

`NgFor` could not find an iterable differ for the value passed in. Make sure it's an iterable, like an `Array`.

### Debugging the error

When using ngFor in a template, you must use some type of Iterable, like `Array`, `Set`, `Map`, etc.
If you're trying to iterate over the keys in an object, you should look at the [KeyValue pipe](/api/common/KeyValuePipe) instead.

---


(From NG02800.md)

## JSONP support in HttpClient configuration

Angular produces this error when you attempt a `JSONP` request without providing the necessary support for it in the `HttpClient` configuration.
To enable `JSONP` support, you can do one of the following:

- add the `withJsonpSupport()` as an argument during the `provideHttpClient` function call (e.g. `provideHttpClient(withJsonpSupport())`) when `bootstrapApplication` is useddocs
- import the `HttpClientJsonpModule` in your root AppModule, when NgModule-based bootstrap is used.

### Debugging the error
Make sure that the JSONP support is added into your application either by calling the `withJsonpSupport` function (when `provideHttpClient` is used) or importing the `HttpClientJsonpModule` module as described above.

---


(From NG0300.md)

## Selector Collision

<docs-video src="https://www.youtube.com/embed/z_3Z5mOm59I"/>

Two or more [components](guide/components) use the same element selector. Because there can only be a single component associated with an element, selectors must be unique strings to prevent ambiguity for Angular.

This error occurs at runtime when you apply two selectors to a single node, each of which matches a different component, or when you apply a single selector to a node and it matches more than one component.

<docs-code language="typescript">

import { Component } from '@angular/core';

@Component({
  selector: '[stroked-button]',
  templateUrl: './stroked-button.component.html',
})
export class StrokedBtnComponent {}

@Component({
  selector: '[raised-button]',
  templateUrl: './raised-button.component.html',
})
export class RaisedBtnComponent {}


@Component({
  selector: 'app-root',
  template: `
  <!-- This node has 2 selectors: stroked-button and raised-button, and both match a different component: StrokedBtnComponent, and RaisedBtnComponent , so NG0300 will be raised  -->
  <button stroked-button  raised-button></button>
  `,
})
export class AppComponent {}

</docs-code>

### Debugging the error

Use the element name from the error message to search for places where you're using the same selector declaration in your codebase:

<docs-code language="typescript">

@Component({
  selector: 'YOUR_STRING',
  …
})

</docs-code>

Ensure that each component has a unique CSS selector. This will guarantee that Angular renders the component you expect.

If you're having trouble finding multiple components with this selector tag name, check for components from imported component libraries, such as Angular Material. Make sure you're following the [best practices](style-guide#component-selectors) for your selectors to prevent collisions.

---


(From NG0301.md)

## Export Not Found

<docs-video src="https://www.youtube.com/embed/fUSAg4kp2WQ"/>

Angular can't find a directive with `{{ PLACEHOLDER }}` export name. The export name is specified in the `exportAs` property of the directive decorator. This is common when using FormsModule or Material modules in templates and you've forgotten to import the corresponding modules.

HELPFUL: This is the runtime equivalent of a common compiler error [NG8003: No directive found with export](errors/NG8003).

### Debugging the error

Use the export name to trace the templates or modules using this export.

Ensure that all dependencies are properly imported and declared in your NgModules. For example, if the export not found is `ngForm`, we need to import `FormsModule` and declare it in the list of imports in `*.module.ts` to resolve the error.

<docs-code language="typescript">

import { FormsModule } from '@angular/forms';

@NgModule({
  …
  imports: [
    FormsModule,
    …

</docs-code>

If you recently added an import, you may need to restart your server to see these changes.

---


(From NG0302.md)

## Pipe Not Found

<docs-video src="https://www.youtube.com/embed/maI2u6Sxk9M"/>

Angular can't find a pipe with this name.

The [pipe](guide/templates/pipes) referenced in the template has not been named or declared properly.

To use the pipe:

- Ensure the name used in a template matches the name defined in the pipe decorator.
- Add the pipe to your component's `imports` array or, if the pipe sets `standalone: false`, add the `NgModule` to which the pipe belongs.

### Debugging the error

Use the pipe name to trace where the pipe is declared and used.

To resolve this error:

- If the pipe is local to the `NgModule`, give it a unique name in the pipe's decorator and declared it in the `NgModule`.
- If the pipe is standalone or is declared in another `NgModule`, add it to the `imports` field of the standalone component or the current `NgModule`.

If you recently added an import or declaration, you may need to restart your server to see these changes.

---


(From NG0403.md)

## Bootstrapped NgModule doesn't specify which component to initialize

This error means that an NgModule that was used for bootstrapping an application is missing key information for Angular to proceed with the bootstrap process.

The error happens when the NgModule `bootstrap` property is missing (or is an empty array) in the `@NgModule` annotation and there is no `ngDoBootstrap` lifecycle hook defined on that NgModule class.

More information about the bootstrapping process can be found in [this guide](guide/ngmodules/bootstrapping).

The following examples will trigger the error.

```typescript
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
})
export class AppModule {}

// The `AppModule` is used for bootstrapping, but the `@NgModule.bootstrap` field is missing.
platformBrowser().bootstrapModule(AppModule);
```

```typescript
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [],
})
export class AppModule {}

// The `AppModule` is used for bootstrapping, but the `@NgModule.bootstrap` field contains an empty array.
platformBrowser().bootstrapModule(AppModule);
```

### Debugging the error

Please make sure that the NgModule that is used for bootstrapping is set up correctly:

- either the `bootstrap` property exists (and contains a non-empty array) in the `@NgModule` annotation
- or the `ngDoBootstrap` method exists on the NgModule class

---


(From NG0500.md)

## Hydration Node Mismatch

This error means that during the hydration process, Angular expected a DOM structure as rendered and annotated during server-side rendering. However, on the client, the DOM tree was different than the server rendered DOM tree.

This error typically happens due to direct DOM manipulation using native browser APIs that alter the DOM structure outside of what Angular produced. It will also occur if you use `innerHTML` or `outerHTML` to set HTML content, which similarly alters the DOM structure outside of what Angular produced. You can resolve this by refactoring the component to use native Angular APIs instead of native APIs. If that's not possible, you can add the `ngSkipHydration` attribute to your component's host node, which will disable hydration for the component and its children. `ngSkipHydration` should only be used as a last resort and should be considered a bug that needs to be fixed.

More information about hydration can be found in [this guide](guide/hydration).

The following example will trigger the error.

```typescript
@Component({
  selector: 'app-example',
  template: '<div><span>world</span></div>',
})
export class ExampleComponent {
  hostElement = inject(ElementRef).nativeElement;

  ngOnInit() {
    // Create a new <p> element with the `Hello` text inside
    const newNode = document.createElement('p');
    newNode.innerHTML = 'Hello';

    // Insert the <p> before the first element. Since Angular has no information
   // about the <p> element, it will be looking for the <div> element at the first
   // element position instead. As a result, a hydration mismatch error would be
   // thrown. Instead, update component's template to create the <p> element.
   this.hostElement.insertBefore(newNode, this.hostElement.firstChild);
 }
}
```

### Debugging the error

The error message in the developer console should contain information on a specific part of the application's DOM structure that is causing the problem. Review that part of the application for hydration-related errors, such as direct DOM manipulation using native APIs.

Check that your template has valid HTML structure. See more information in the [hydration guide](guide/hydration#valid-html-structure).

You can add the `ngSkipHydration` attribute to your component host node as a possible workaround.

If your application works in development environment, but you see hydration errors in production builds, make sure that the generated HTML that is delivered to a browser contains comment nodes produced by Angular during the rendering on the server. Those comment nodes are used by Angular runtime as anchors for view containers (with and without hydration) and hydration process expects them to be present at their original locations. If you have a custom logic to remove comment nodes from the HTML generated by the server-side rendering or you've configured your CDN to remove them before serving the content - disable the comment nodes removal and check if hydration errors are gone.

---


(From NG05000.md)

## Hydration with unsupported Zone.js instance

This warning means that the hydration was enabled for an application that was configured to use an unsupported version of Zone.js: either a custom or a "noop" one (see more info [here](api/core/BootstrapOptions#ngZone)).

Hydration relies on a signal from Zone.js when it becomes stable inside an application, so that Angular can start the serialization process on the server or post-hydration cleanup on the client (to remove DOM nodes that remained unclaimed).

Providing a custom or a "noop" Zone.js implementation may lead to a different timing of the "stable" event, thus triggering the serialization or the cleanup too early or too late. This is not yet a fully supported configuration.

If you use a custom Zone.js implementation, make sure that the "onStable" event is emitted at the right time and does not result in incorrect application behavior with hydration.

More information about hydration can be found in the [hydration guide](guide/hydration).

---


(From NG0501.md)

## Hydration Missing Siblings

This error is similar to the [error NG0500](errors/NG0500), but it indicates that Angular hydration process expected more siblings present in the DOM structure at a particular location. Please refer to the [error NG0500](errors/NG0500) page for additional information.

### Debugging the error

See the [error NG0500](errors/NG0500) for more information on how to debug this error.

---


(From NG0502.md)

## Hydration Missing Node

This error is similar to the [error NG0500](errors/NG0500), but it indicates that Angular hydration process expected a node to be present in the DOM structure at a particular location and none was found. Please refer to the [error NG0500](errors/NG0500) page for additional information.

### Debugging the error

See the [error NG0500](errors/NG0500) for more information on how to debug this error.

---


(From NG0503.md)

## Hydration Unsupported Projection of DOM Nodes

This error means that during the server-side serialization process, Angular encountered nodes that were created outside of Angular's context (i.e. using native DOM APIs) and found those nodes were provided as projectable nodes. They were likely provided using `ViewContainerRef.createComponent` or `createComponent` APIs. Angular hydration does not support this use case.

More information about hydration can be found in [this guide](guide/hydration).

The following examples will trigger the error.

```typescript
@Component({
  selector: 'dynamic',
  template: `
  <ng-content />
`,
})
class DynamicComponent {
}

@Component({
  selector: 'app',
  template: `<div #target></div>`,
})
class SimpleComponent {
  @ViewChild('target', {read: ViewContainerRef}) vcr!: ViewContainerRef;
  envInjector = inject(EnvironmentInjector);

  ngAfterViewInit() {
    const div = document.createElement('div');
    const p = document.createElement('p');
    // In this test we create DOM nodes outside of Angular context
    // (i.e. not using Angular APIs) and try to content-project them.
    // This is an unsupported pattern and an exception will be thrown.
    const compRef = createComponent(DynamicComponent, {
      environmentInjector: this.envInjector,
      projectableNodes: [[div, p]]
    });
  }
}
```

### Debugging the error

The error message in the developer console should contain information on a specific part of the application's DOM structure that is causing the problem. Review that part of the application for hydration-related errors, such as direct DOM manipulation using native APIs.

You can add the `ngSkipHydration` attribute to your component host node as a possible workaround.

---


(From NG0504.md)

## Skip hydration flag is applied to an invalid node

This error occurs when the `ngSkipHydration` attribute was added to an inappropriate DOM node. The `ngSkipHydration` attribute can only be applied to component host nodes either directly in the template or via a host binding. It cannot be applied to other DOM nodes and will have no effect if done so other than causing this error.

More information about hydration can be found in [this guide](guide/hydration).

The following examples will trigger the error.

### Example 1

In this example, the `ngSkipHydration` attribute is applied to a `<div>` using host bindings of a directive. Since the `<div>` doesn't act as a component host node, Angular will throw an error.

```typescript
@Directive({
  selector: '[dir]',
  host: {ngSkipHydration: 'true'},
})
class Dir {
}

@Component({
  selector: 'app',
  imports: [Dir],
  template: `
    <div dir></div>
  `,
})
class SimpleComponent {
}
```

### Example 2

In this example, the `ngSkipHydration` is applied to a `<div>` as an attribute via a template.
Since the `<div>` doesn't act as a component host node, Angular will throw an error.

```typescript
@Component({
  selector: 'app',
  template: `
    <div ngSkipHydration></div>
  `,
})
class SimpleComponent {
}
```

### Debugging the error

Remove the `ngSkipHydration` attribute from any invalid DOM nodes. Alternatively, move the `ngSkipHydration` attribute to the component host node either in a template or via a host binding.

---


(From NG0505.md)

## No hydration info in server response

This error occurs when hydration is enabled on the client, but the server response
doesn't contain special serialized information about the application that hydration
logic relies on.

This can happen when the `provideClientHydration()` function is included in the client
part of the application configuration, but is missing in the server part of the configuration.

In applications with the default project structure (generated by the `ng new`),
the `provideClientHydration()` call is added either into the `providers` array of
the main `AppModule` (which is imported into the server module) or into a set of
providers that are included into both client and server configurations.

If you have a custom setup where client and server configuration are independent
and do not share common set of providers, make sure that the `provideClientHydration()`
is also included into the set of providers used to bootstrap an application on the server.

More information about hydration can be found in [this guide](guide/hydration).

### Debugging the error

Verify that the `provideClientHydration()` call is included into a set of providers
that is used to bootstrap an application on the server.

---


(From NG0506.md)

## Application remains unstable

This warning only appears in the browser during the hydration process when it's enabled on the client but the application remains unstable for an extended period of time (over 10 seconds).

Typically that happens when there are some pending microtasks or macrotasks on a page.

Angular Hydration relies on a signal from `ApplicationRef.isStable` when it becomes stable inside an application:

- during the server-side rendering (SSR) to start the serialization process
- in a browser this signal is used to start the post-hydration cleanup to remove DOM nodes that remained unclaimed

This warning is displayed when `ApplicationRef.isStable` does not emit `true` within 10 seconds. If this behavior is intentional and your application stabilizes later, you could choose to ignore this warning.

### Applications that use zone.js

Applications that use zone.js may have various factors contributing to delays in stability. These may include pending HTTP requests, timers (`setInterval`, `setTimeout`) or some logic that continuously invokes `requestAnimationFrame`.

#### Macrotasks

Macrotasks include functions like `setInterval`, `setTimeout`, `requestAnimationFrame`, etc.
If one of these functions is called during the initialization phase of the application or in bootstrapped components, it may delay the moment when the application becomes stable.

```typescript
@Component({
  selector: 'app',
  template: ``,
})
class SimpleComponent {
  constructor() {
    setInterval(() => { ... }, 1000)

    // or

    setTimeout(() => { ... }, 10_000)
  }
}
```

If these functions must be called during the initialization phase, invoking them outside the Angular zone resolves the problem:

```typescript
class SimpleComponent {
  constructor() {
    const ngZone = inject(NgZone);

    ngZone.runOutsideAngular(() => {
      setInterval(() => {}, 1000);
    });
  }
}
```

#### Third-party libraries

Some third-party libraries can also produce long-running asynchronous tasks, which may delay application stability. The recommendation is to invoke relevant library code outside of the zone as described above.

#### Running code after an application becomes stable

You can run a code that sets up asynchronous tasks once an application becomes stable:

```typescript
class SimpleComponent {
  constructor() {
    const applicationRef = inject(ApplicationRef);

    applicationRef.isStable.pipe( first((isStable) => isStable) ).subscribe(() => {
      // Note that we don't need to use `runOutsideAngular` because `isStable`
      // emits events outside of the Angular zone when it's truthy (falsy values
      // are emitted inside the Angular zone).
      setTimeout(() => { ... });
    });
  }
}
```

### Zoneless applications

In zoneless scenarios, stability might be delayed by an application code inside of an `effect` running in an infinite loop (potentially because signals used in effect functions keep changing) or a pending HTTP request.

Developers may also explicitly contribute to indicating the application's stability by using the [`PendingTasks`](/api/core/PendingTasks) service. If you use the mentioned APIs in your application, make sure you invoke a function to mark the task as completed.

---


(From NG0507.md)

## HTML content was altered after server-side rendering

Angular throws this error when it detects that the content generated by server-side rendering (SSR) was altered after the rendering. The process of hydration relies on the content to be untouched after SSR, which also includes whitespaces and comment nodes. Those whitespaces and comment nodes must be retained in the HTML generated by the SSR process. Learn more in the Hydration guide.

### Debugging the error

Typically this happens in the following cases:

Some CDN providers have a built-in feature to remove whitespaces and comment nodes from HTML as an optimization. Please verify if there is such an option in CDN configuration and turn it off.
If you use custom post-processing of HTML generated by SSR (as a build step), make sure that this process doesn't remove whitespaces and comment nodes.

---


(From NG05104.md)

## Root element was not found

Bootstrapped components are defined in the `bootstrap` property of an `@NgModule` decorator or as the first parameter of `bootstrapApplication` for standalone components.

This error happens when Angular tries to bootstrap one of these components but cannot find its corresponding node in the DOM.

### Debugging the error

This issue occurs when the selector mismatches the tag

```typescript
@Component({
  selector: 'my-app',
  ...
})
class AppComponent {}
```

```angular-html
<html>
    <app-root></app-root> <!-- Doesn't match the selector -->
</html>
```

Replace the tag with the correct one:

```angular-html
<html>
    <my-app></my-app> <!-- OK -->
</html>
```

---


(From NG0602.md)

## Disallowed function call inside reactive context

A function that is not allowed to run inside a reactive context was called from within a reactive context.

For example, an `effect` cannot be scheduled from within a `computed` or an actively executing effect.
Avoid calling functions like `effect` as part of template expressions, as those execute in their own reactive context.

Computed expressions are expected to be pure.
Pure means that expression do not trigger any side effects.
Side effects are operations like scheduling `afterNextRender`/`afterEveryRender`, creating a new `effect`, or subscribing to observables.

Some operations are explicitly banned inside reactive contexts in order to avoid common pitfalls.
As an example, using `afterNextRender`/`afterEveryRender` inside a `computed` will schedule new render hooks every time the computed expression evaluates.
This is likely not intended and could degrade application performance.

#### Fixing the error

This error guide is non-exhaustive.
It captures a few common scenarios and how to address the error.

##### `afterNextRender`/`afterEveryRender`
Move the call for `afterNextRender`/`afterEveryRender` outside of the reactive context.

A good place to schedule the after render hook is in the component's class constructor.
Alternatively, use `untracked` to leave the reactive context and explicitly opt-out of this error.

##### `effect`
Move the call for `effect` outside of the reactive context.

A good place to schedule an effect is in a `@Component`'s class constructor.

##### `toSignal`
Move the call for `toSignal` outside of the reactive context.

```typescript
result = computed(() => {
  const dataSignal = toSignal(dataObservable$);
  return doSomething(dataSignal());
});
```

can be refactored into:

```typescript
dataSignal = toSignal(dataObservable$);
result = computed(() => doSomething(dataSignal()));
```

Alternatively, if this is not possible, consider manually subscribing to the observable.

As a last resort, use `untracked` to leave the reactive context.
Be careful as leaving the reactive context can result in signal reads to be ignored inside `untracked`.

@debugging

The error message mentions the function that was unexpectedly called.
Look for this function call in your application code.

Alternatively, the stack trace in your browser will show where the function was invoked and where it's located.

---


(From NG0750.md)

## @defer dependencies failed to load

This error occurs when loading dependencies for a `@defer` block fails (typically due to poor network conditions) and no `@error` block has been configured to handle the failure state. Having no `@error` block in this scenario may create a poor user experience.

### Debugging the error
Verify that you added `@error` blocks to your `@defer` blocks to handle failure states.

---


(From NG0751.md)

## @defer behavior when HMR is enabled

Hot Module Replacement (HMR) is a technique used by development servers to avoid reloading the entire page when only part of an application is changed.

When the HMR is enabled in Angular, all `@defer` block dependencies are loaded
eagerly, instead of waiting for configured trigger conditions (both for client-only and incremental hydration triggers). This is needed
for the HMR to function properly, replacing components in an application at runtime
without the need to reload the entire page. NOTE: the actual rendering of defer
blocks respects trigger conditions in the HMR mode.

If you want to test `@defer` block behavior in development mode and ensure that
the necessary dependencies are loaded when a triggering condition is met, you can
disable the HMR mode as described in [`this document`](/tools/cli/build-system-migration#hot-module-replacement).

---


(From NG0910.md)

## Unsafe bindings on an iframe element

You see this error when Angular detects an attribute binding or a property binding on an `<iframe>` element using the following property names:

* sandbox
* allow
* allowFullscreen
* referrerPolicy
* csp
* fetchPriority

The mentioned attributes affect the security model setup for `<iframe>`s
and it's important to apply them before setting the `src` or `srcdoc` attributes.
To enforce that, Angular requires these attributes to be set on `<iframe>`s as
static attributes, so the values are set at the element creation time and they
remain the same throughout the lifetime of an `<iframe>` instance.

The error is thrown when a property binding with one of the mentioned attribute names is used:

```angular-html
<iframe [sandbox]="'allow-scripts'" src="..."></iframe>
```

or when it's an attribute bindings:

```angular-html
<iframe [attr.sandbox]="'allow-scripts'" src="..."></iframe>
```

Also, the error is thrown when a similar pattern is used in Directive's host bindings:

```typescript
@Directive({
  selector: 'iframe',
  host: {
    '[sandbox]': `'allow-scripts'`,
    '[attr.sandbox]': `'allow-scripts'`,
  }
})
class IframeDirective {}
```

### Debugging the error

The error message includes the name of the component with the template where
an `<iframe>` element with unsafe bindings is located.

The recommended solution is to use the mentioned attributes as static ones, for example:

```angular-html
<iframe sandbox="allow-scripts" src="..."></iframe>
```

If you need to have different values for these attributes (depending on various conditions),
you can use an `*ngIf` or an `*ngSwitch` on an `<iframe>` element:

```angular-html
<iframe *ngIf="someConditionA" sandbox="allow-scripts" src="..."></iframe>
<iframe *ngIf="someConditionB" sandbox="allow-forms" src="..."></iframe>
<iframe *ngIf="someConditionC" sandbox="allow-popups" src="..."></iframe>
```

---


(From NG0912.md)

## Component ID generation collision

When creating components, Angular generates a unique component ID for each component. This is generated using the Angular component metadata, including but not limited:  selectors, the number of host bindings, class property names, view and content queries. When two components metadata are identical (often times sharing the same selector), an ID generation collision will occur.

Component IDs are used in Angular internally:

- for extra annotations of DOM nodes for style encapsulation
- during [hydration](guide/hydration) to restore an application state after [server-side rendering](guide/ssr).

To avoid issues that might be caused by the component ID collision, it's recommended to resolve them as described below.

### Example of a Component ID collision

```typescript
@Component({
  selector: 'my-component',
  template: 'complex-template',
})
class SomeComponent {}

@Component({
  selector: 'my-component',
  template: 'empty-template',
})
class SomeMockedComponent {}
```

Having these two components defined will trigger an ID generation collision and during development a warning will be displayed.

### Debugging the error

The warning message includes the class name of the two components whose IDs are colliding.

The problem can be resolved using one of the solutions below:

1. Change the selector of one of the two components. For example by using a pseudo-selector with no effect like `:not()` and a different tag name.

```typescript
@Component({
  selector: 'my-component:not(p)',
  template: 'empty-template',
})
class SomeMockedComponent {}
```

1. Add an extra host attribute to one of the components.

```typescript
@Component({
  selector: 'my-component',
  template: 'complex-template',
  host: {'some-binding': 'some-value'},
})
class SomeComponent {}
```

---


(From NG0913.md)

## Runtime Performance Warnings

#### Oversized images
When images are loaded, the **intrinsic size** of the downloaded file is checked against the actual size of the image on the page. The actual size is calculated using the **rendered size** of the image with CSS applied, multiplied by the [pixel device ratio](https://web.dev/codelab-density-descriptors/#pixel-density). If the downloaded image is much larger (more than 1200px too large in either dimension), this warning is triggered. Downloading oversized images can slow down page loading and have a negative effect on [Core Web Vitals](https://web.dev/vitals/).

#### Lazy-loaded LCP element
The largest contentful element on a page during load is considered the "LCP Element", which relates to [Largest Contentful Paint](https://web.dev/lcp/), one of the Core Web Vitals. Lazy loading an LCP element will have a strong negative effect on page performance. With this strategy, the browser has to complete layout calculations to determine whether the element is in the viewport before starting the image download. As a result, a warning is triggered when Angular detects that the LCP element has been given the `loading="lazy"` attribute.

@debugging
Use the image URL provided in the console warning to find the `<img>` element in question. 
#### Ways to fix oversized images
* Use a smaller source image
* Add a [`srcset`](https://web.dev/learn/design/responsive-images/#responsive-images-with-srcset) if multiple sizes are needed for different layouts. 
* Switch to use Angular's built-in image directive ([`NgOptimizedImage`](https://angular.io/api/common/NgOptimizedImage)), which generates [srcsets automatically](https://angular.io/guide/image-directive#request-images-at-the-correct-size-with-automatic-srcset).
#### Ways to fix lazy-loaded LCP element
 
* Change the `loading` attribute to a different value such as `"eager"`.
* Switch to use Angular's built-in image directive ([`NgOptimizedImage`](https://angular.io/api/common/NgOptimizedImage)), which allows for easily [prioritizing LCP images](https://angular.io/guide/image-directive#step-4-mark-images-as-priority).

#### Disabling Image Performance Warnings
Both warnings can be disabled individually, site-wide, using a provider at the root of your application:

```typescript
providers: [
  {
    provide: IMAGE_CONFIG,
    useValue: {
      disableImageSizeWarning: true, 
      disableImageLazyLoadWarning: true
    }
  },
],
```

---


(From NG0950.md)

## Required input is accessed before a value is set.

A required input was accessed but no value was bound.

This can happen when a required input is accessed too early in your directive or component.
This is commonly happening when the input is read as part of class construction.

Inputs are guaranteed to be available in the `ngOnInit` lifecycle hook and afterwards.

### Fixing the error

Access the required input in reactive contexts.
For example, in the template itself, inside a `computed`, or inside an effect.

Alternatively, access the input inside the `ngOnInit` lifecycle hook, or later.

---


(From NG0951.md)

## Child query result is required but no value is available.

Required child query (`contentChild.required` or `viewChild.required`) result was accessed before query results were calculated or query has no matches.

This can happen in two distinct situations:
* query results were accessed before a given query could collect results;
* a query was executed but didn't match any nodes and has no results as a consequence.

Content queries and view queries each calculate their results at different points in time:
* `contentChild` results are available after a _host_ view (template where a directive declaring a query is used) is created;
* `viewChild` results are available after a template of a component declaring a query is created.

Accessing query results before they're available results in the error described on this page. Most notably, query results are _never_ available in a constructor of the component or directive declaring a query.

### Fixing the error

`contentChild` query results can be accessed in the `AfterContentChecked` lifecycle hook, or later.
`viewChild` query results can be accessed in the `AfterViewChecked` lifecycle hook, or later.

Make sure that a required query matches at least one node and has results at all. You can verify this by accessing query results in the lifecycle hooks listed above.

---


(From NG0955.md)

## Track expression resulted in duplicated keys for a given collection.

A track expression specified in the `@for` loop evaluated to duplicated keys for a given collection, ex.:

```typescript
@Component({
    template: `@for (item of items; track item.value) {{{item.value}}}`,
})
class TestComponent {
    items = [{key: 1, value: 'a'}, {key: 2, value: 'b'}, {key: 3, value: 'a'}];
}
```

In the provided example the `item.key` tracking expression will find two duplicate keys `a` (at index 0 and 2). 

Duplicate keys are problematic from the correctness point of view: since the `@for` loop can't uniquely identify items it might choose DOM nodes corresponding to _another_ item (with the same key) when performing DOM moves or destroy.

There is also performance penalty associated with duplicated keys - internally Angular must use more sophisticated and slower data structures while repeating over collections with duplicated keys.

### Fixing the error

Change the tracking expression such that it uniquely identifies an item in a collection. In the discussed example the correct track expression would use the unique `key` property (`item.key`):

```typescript
@Component({
    template: `@for (item of items; track item.key) {{{item.value}}}`,
})
class TestComponent {
    items = [{key: 1, value: 'a'}, {key: 2, value: 'b'}, {key: 3, value: 'a'}];
}
```

---


(From NG0956.md)

## Tracking expression caused re-creation of the DOM structure.

The identity track expression specified in the `@for` loop caused re-creation of the DOM corresponding to _all_ items. This is a very expensive operation that commonly occurs when working with immutable data structures. For example:

```typescript
@Component({
  template: `
    <button (click)="toggleAllDone()">All done!</button>
    <ul>
    @for (todo of todos; track todo) {
      <li>{{todo.task}}</li>
    }
    </ul>
  `,
})
export class App {
  todos = [
    { id: 0, task: 'understand trackBy', done: false },
    { id: 1, task: 'use proper tracking expression', done: false },
  ];

  toggleAllDone() {
    this.todos = this.todos.map(todo => ({ ...todo, done: true }));
  }
}
```

In the provided example, the entire list with all the views (DOM nodes, Angular directives, components, queries, etc.) are re-created (!) after toggling the "done" status of items. Here, a relatively inexpensive binding update to the `done` property would suffice. 

Apart from having a high performance penalty, re-creating the DOM tree results in loss of state in the DOM elements (ex.: focus, text selection, sites loaded in an iframe, etc.).

### Fixing the error

Change the tracking expression such that it uniquely identifies an item in a collection, regardless of its object identity. In the discussed example, the correct track expression would use the unique `id` property (`item.id`):

```typescript
@Component({
  template: `
    <button (click)="toggleAllDone()">All done!</button>
    <ul>
    @for (todo of todos; track todo.id) {
      <li>{{todo.task}}</li>
    }
    </ul>
  `,
})
export class App {
  todos = [
    { id: 0, task: 'understand trackBy', done: false },
    { id: 1, task: 'use proper tracking expression', done: false },
  ];

  toggleAllDone() {
    this.todos = this.todos.map(todo => ({ ...todo, done: true }));
  }
}
```

---


(From NG1001.md)

## Argument Not Literal

To make the metadata extraction in the Angular compiler faster, the decorators `@NgModule`, `@Pipe`, `@Component`, `@Directive`, and `@Injectable` accept only object literals as arguments.

This is an [intentional change in Ivy](https://github.com/angular/angular/issues/30840#issuecomment-498869540), which enforces stricter argument requirements for decorators than View Engine.
Ivy requires this approach because it compiles decorators by moving the expressions into other locations in the class output.

### Debugging the error

Move all declarations:

<docs-code language="typescript">

const moduleDefinition = {…}

@NgModule(moduleDefinition)
export class AppModule {
    constructor() {}
}

</docs-code>

into the decorator:

<docs-code language="typescript">

@NgModule({…})
export class AppModule {
    constructor() {}
}

</docs-code>

---


(From NG2003.md)

## Missing Token

There is no injection token for a constructor parameter at compile time. [InjectionTokens](api/core/InjectionToken) are tokens that can be used in a Dependency Injection Provider.

### Debugging the error

Look at the parameter that throws the error, and all uses of the class.
This error is commonly thrown when a constructor defines parameters with primitive types such as `string`, `number`, `boolean`, and `Object`.

Use the `@Injectable` method or `@Inject` decorator from `@angular/core` to ensure that the type you are injecting is reified \(has a runtime representation\). Make sure to add a provider to this decorator so that you do not throw [NG0201: No Provider Found](errors/NG0201).

---


(From NG2009.md)

## Invalid Shadow DOM selector

The selector of a component using `ViewEncapsulation.ShadowDom` doesn't match the custom element tag name requirements.

In order for a tag name to be considered a valid custom element name, it has to:

* Be in lower case.
* Contain a hyphen.
* Start with a letter \(a-z\).

### Debugging the error

Rename your component's selector so that it matches the requirements.

**Before:**

<docs-code language="typescript">

@Component({
  selector: 'comp',
  encapsulation: ViewEncapsulation.ShadowDom
  …
})

</docs-code>

**After:**

<docs-code language="typescript">

@Component({
  selector: 'app-comp',
  encapsulation: ViewEncapsulation.ShadowDom
  …
})

</docs-code>

---


(From NG3003.md)

## Import Cycle Detected

A component, directive, or pipe that is referenced by this component would require the compiler to add an import that would lead to a cycle of imports.
For example, consider a scenario where a `ParentComponent` references a `ChildComponent` in its template:

<docs-code header="parent.component.ts" path="adev/src/content/examples/errors/cyclic-imports/parent.component.ts"/>

<docs-code header="child.component.ts" path="adev/src/content/examples/errors/cyclic-imports/child.component.ts"/>

There is already an import from `child.component.ts` to `parent.component.ts` since the `ChildComponent` references the `ParentComponent` in its constructor.

HELPFUL: The parent component's template contains `<child></child>`.
The generated code for this template must therefore contain a reference to the `ChildComponent` class.
In order to make this reference, the compiler would have to add an import from `parent.component.ts` to `child.component.ts`, which would cause an import cycle:

<docs-code language="text">

parent.component.ts -> child.component.ts -> parent.component.ts

</docs-code>

### Remote Scoping

If you are using NgModules, to avoid adding imports that create cycles, additional code is added to the `NgModule` class where the component that wires up the dependencies is declared.

This is known as "remote scoping".

### Libraries

Unfortunately, "remote scoping" code is side-effectful —which prevents tree shaking— and cannot be used in libraries.
So when building libraries using the `"compilationMode": "partial"` setting, any component that would require a cyclic import will cause this `NG3003` compiler error to be raised.

### Debugging the error

The cycle that would be generated is shown as part of the error message.
For example:

<docs-code hideCopy="true">

The component ChildComponent is used in the template but importing it would create a cycle:
/parent.component.ts -> /child.component.ts -> /parent.component.ts

</docs-code>

Use this to identify how the referenced component, pipe, or directive has a dependency back to the component being compiled.
Here are some ideas for fixing the problem:

* Try to rearrange your dependencies to avoid the cycle.
  For example, using an intermediate interface that is stored in an independent file that can be imported to both dependent files without causing an import cycle.
* Move the classes that reference each other into the same file, to avoid any imports between them.
* Convert import statements to type-only imports \(using `import type` syntax\) if the imported declarations are only used as types, as type-only imports do not contribute to cycles.

---


(From NG6100.md)

## NgModule.id Set to module.id anti-pattern

Using `module.id` as an NgModule `id` is a common anti-pattern and is likely not serving a useful purpose in your code.

NgModules can be declared with an `id`:

```typescript
@NgModule({
  id: 'my_module'
})
export class MyModule {}
```

Declaring an `id` makes the NgModule available for lookup via the `getNgModuleById()` operation. This functionality is rarely used, mainly in very specific bundling scenarios when lazily loading NgModules without obtaining direct references to them. In most Angular code, ES dynamic `import()` (`import('./path/to/module')`) should be used instead, as this provides a direct reference to the NgModule being loaded without the need for a global registration side effect.

If you are not using `getNgModuleById`, you do not need to provide `id`s for your NgModules. Providing one has a significant drawback: it makes the NgModule non-tree-shakable, which can have an impact on your bundle size.

In particular, the pattern of specifying `id: module.id` results from a misunderstanding of `@NgModule.id`. In earlier versions of Angular, it was sometimes necessary to include the property `moduleId: module.id` in `@Component` metadata.

Using `module.id` for `@NgModule.id` likely results from confusion between `@Component.moduleId` and `@NgModule.id`. `module.id` would not typically be useful for `getNgModuleById()` operations as the `id` needs to be a well-known string, and `module.id` is usually opaque to consumers.

### Debugging the error

You can remove the `id: module.id` declaration from your NgModules. The compiler ignores this declaration and issues this warning instead.

---


(From NG8001.md)

## Invalid Element

One or more elements cannot be resolved during compilation because the element is not defined by the HTML spec, or there is no component or directive with such element selector.

HELPFUL: This is the compiler equivalent of a common runtime error `NG0304: '${tagName}' is not a known element: ...`.

### Debugging the error

Use the element name in the error to find the file(s) where the element is being used.

Check that the name and selector are correct.

Make sure that the component is correctly imported inside your NgModule or standalone component, by checking its presence in the `imports` field. If the component is declared in an NgModule (meaning that it is not standalone) make sure that it is exported correctly from it, by checking its presence in the `exports` field.

When using custom elements or web components, ensure that you add [`CUSTOM_ELEMENTS_SCHEMA`](api/core/CUSTOM_ELEMENTS_SCHEMA) to the application module.

If this does not resolve the error, check the imported libraries for any recent changes to the exports and properties you are using, and restart your server.

---


(From NG8002.md)

## Invalid Attribute

<docs-video src="https://www.youtube.com/embed/wfLkB3RsSJM"/>

An attribute or property cannot be resolved during compilation.

This error arises when attempting to bind to a property that does not exist.
Any property binding must correspond to either:

* A native property on the HTML element, or
* An `@Input()` property of a component or directive applied to the element.

The runtime error for this is `NG0304: '${tagName}' is not a known element: …'`.

### Debugging the error

Look at documentation for the specific [binding syntax](guide/templates) used. This is usually a typo or incorrect import.
There may also be a missing direction with property selector 'name' or missing input.

---


(From NG8003.md)

## Missing Reference Target

<docs-video src="https://www.youtube.com/embed/fUSAg4kp2WQ"/>

Angular can't find a directive with `{{ PLACEHOLDER }}` export name.
This is common with a missing import or a missing [`exportAs`](api/core/Directive#exportAs) on a directive.

HELPFUL: This is the compiler equivalent of a common runtime error [NG0301: Export Not Found](errors/NG0301).

### Debugging the error

Use the string name of the export not found to trace the templates or modules using this export.

Ensure that all dependencies are properly imported and declared in our Modules.
For example, if the export not found is `ngForm`, we will need to import `FormsModule` and declare it in our list of imports in `*.module.ts` to resolve the missing export error.

<docs-code language="typescript">

import { FormsModule } from '@angular/forms';

@NgModule({
  …
  imports: [
    FormsModule,
    …

</docs-code>

If you recently added an import, you will need to restart your server to see these changes.

---


(From overview.md)

## Error Encyclopedia

### Runtime errors

| Code      | Name                                                                                 |
| :-------- | :----------------------------------------------------------------------------------- |
| `NG0100`  | [Expression Changed After Checked](errors/NG0100)                                    |
| `NG0200`  | [Circular Dependency in DI](errors/NG0200)                                           |
| `NG0201`  | [No Provider Found](errors/NG0201)                                                   |
| `NG0203`  | [`inject()` must be called from an injection context](errors/NG0203)                 |
| `NG0209`  | [Invalid multi provider](errors/NG0209)                                              |
| `NG0300`  | [Selector Collision](errors/NG0300)                                                  |
| `NG0301`  | [Export Not Found](errors/NG0301)                                                    |
| `NG0302`  | [Pipe Not Found](errors/NG0302)                                                      |
| `NG0403`  | [Bootstrapped NgModule doesn't specify which component to initialize](errors/NG0403) |
| `NG0500`  | [Hydration Node Mismatch](errors/NG0500)                                             |
| `NG0501`  | [Hydration Missing Siblings](errors/NG0501)                                          |
| `NG0502`  | [Hydration Missing Node](errors/NG0502)                                              |
| `NG0503`  | [Hydration Unsupported Projection of DOM Nodes](errors/NG0503)                       |
| `NG0504`  | [Skip hydration flag is applied to an invalid node](errors/NG0504)                   |
| `NG0505`  | [No hydration info in server response](errors/NG0505)                                |
| `NG0506`  | [NgZone remains unstable](errors/NG0506)                                             |
| `NG0507`  | [HTML content was altered after SSR](errors/NG0507)                                  |
| `NG0750`  | [@defer dependencies failed to load](errors/NG0750)                                  |
| `NG0910`  | [Unsafe bindings on an iframe element](errors/NG0910)                                |
| `NG0912`  | [Component ID generation collision](errors/NG0912)                                   |
| `NG0955`  | [Track expression resulted in duplicated keys for a given collection](errors/NG0955) |
| `NG0956`  | [Tracking expression caused re-creation of the DOM structure](errors/NG0956)         |
| `NG01101` | [Wrong Async Validator Return Type](errors/NG01101)                                  |
| `NG01203` | [Missing value accessor](errors/NG01203)                                             |
| `NG02200` | [Missing Iterable Differ](errors/NG02200)                                            |
| `NG02800` | [JSONP support in HttpClient configuration](errors/NG02800)                          |
| `NG05000` | [Hydration with unsupported Zone.js instance.](errors/NG05000)                       |
| `NG05104` | [Root element was not found.](errors/NG05104)                                        |

### Compiler errors

| Code     | Name                                                       |
| :------- | :--------------------------------------------------------- |
| `NG1001` | [Argument Not Literal](errors/NG1001)                      |
| `NG2003` | [Missing Token](errors/NG2003)                             |
| `NG2009` | [Invalid Shadow DOM selector](errors/NG2009)               |
| `NG3003` | [Import Cycle Detected](errors/NG3003)                     |
| `NG6100` | [NgModule.id Set to module.id anti-pattern](errors/NG6100) |
| `NG8001` | [Invalid Element](errors/NG8001)                           |
| `NG8002` | [Invalid Attribute](errors/NG8002)                         |
| `NG8003` | [Missing Reference Target](errors/NG8003)                  |

---


(From NG8101.md)

## Invalid Banana-in-Box

This diagnostic detects a backwards "banana-in-box" syntax for [two-way bindings](guide/templates/two-way-binding).

<docs-code language="html">

<user-viewer ([user])="loggedInUser" />

</docs-code>

### What's wrong with that?

As it stands, `([var])` is actually an [event binding](guide/templates/event-listeners) with the name `[var]`.
The author likely intended this as a two-way binding to a variable named `var` but, as written, this binding has no effect.

### What should I do instead?

Fix the typo.
As the name suggests, the banana `(` should go _inside_ the box `[]`.
In this case:

<docs-code language="html">

<user-viewer [(user)]="loggedInUser" />

</docs-code>

### Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
`invalidBananaInBox` has no additional requirements beyond `strictTemplates`.

### What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "invalidBananaInBox": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.

---


(From NG8102.md)

## Nullish coalescing not nullable

This diagnostic detects a useless nullish coalescing operator \(`??`\) characters in Angular templates.
Specifically, it looks for operations where the input is not "nullable", meaning its type does not include `null` or `undefined`.
For such values, the right side of the `??` will never be used.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  // Template displays `username` if present, falls back to 'root' if it is
  // `null` or `undefined`.
  template: `<div>{{ username ?? 'root' }}</div>`,
})
class MyComponent {
  // `username` is declared as a `string` which *cannot* be `null` or
  // `undefined`.
  username: string = 'Angelino';
}

</docs-code>

### What's wrong with that?

Using the nullish coalescing operator with a non-nullable input has no effect and is indicative of a discrepancy between the allowed type of a value and how it is presented in the template.
A developer might reasonably assume that the right side of the nullish coalescing operator is displayed in some case, but it will never actually be displayed.
This can lead to confusion about the expected output of the program.

### What should I do instead?

Update the template and declared type to be in sync.
Double-check the type of the input and confirm whether it is actually expected to be nullable.

If the input should be nullable, add `null` or `undefined` to its type to indicate this.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  template: `<div>{{ username ?? 'root' }}</div>`,
})
class MyComponent {
  // `username` is now nullable. If it is ever set to `null`, 'root' will be
  // displayed.
  username: string | null = 'Angelino';
}

</docs-code>

If the input should *not* be nullable, delete the `??` operator and its right operand, since the value is guaranteed by TypeScript to always be non-nullable.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  // Template always displays `username`, which is guaranteed to never be `null`
  // or `undefined`.
  template: `<div>{{ username }}</div>`,
})
class MyComponent {
  username: string = 'Angelino';
}

</docs-code>

### Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
[`strictNullChecks`](tools/cli/template-typecheck#strict-null-checks) must also be enabled to emit `nullishCoalescingNotNullable` diagnostics.

### What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "nullishCoalescingNotNullable": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.

---


(From NG8103.md)

## Missing control flow directive

This diagnostics ensures that a standalone component which uses known control flow directives
(such as `*ngIf`, `*ngFor`, or `*ngSwitch`) in a template, also imports those directives either
individually or by importing the `CommonModule`.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  // Template uses `*ngIf`, but no corresponding directive imported.
  imports: [],
  template: `<div *ngIf="visible">Hi</div>`,
})
class MyComponent {}

</docs-code>

### What's wrong with that?

Using a control flow directive without importing it will fail at runtime, as Angular attempts to bind to an `ngIf` property of the HTML element, which does not exist.

### What should I do instead?

Make sure that a corresponding control flow directive is imported.

A directive can be imported individually:

<docs-code language="typescript">

import {Component} from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  imports: [NgIf],
  template: `<div *ngIf="visible">Hi</div>`,
})
class MyComponent {}

</docs-code>

or you could import the entire `CommonModule`, which contains all control flow directives:

<docs-code language="typescript">

import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  imports: [CommonModule],
  template: `<div *ngIf="visible">Hi</div>`,
})
class MyComponent {}

</docs-code>

### Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
`missingControlFlowDirective` has no additional requirements beyond `strictTemplates`.

### What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "missingControlFlowDirective": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.

---


(From NG8104.md)

## Text attribute not binding

This diagnostic ensures that attributes which have the "special" Angular binding prefix (`attr.`, `style.`, and
`class.`) are interpreted as bindings.

<docs-code language="html">

<div attr.id="my-id"></div>

</docs-code>

### What's wrong with that?

In this example, `attr.id` is interpreted as a regular attribute and will appear
as-is in the final HTML (`<div attr.id="my-id"></div>`). This is likely not the intent of the developer.
Instead, the intent is likely to set the `id` attribute (`<div id="my-id"></div>`).

### What should I do instead?

When binding to `attr.`, `class.`, or `style.`, ensure you use the Angular template binding syntax (`[]`).

<docs-code language="html">

<div [attr.id]="my-id"></div>
<div [style.color]="red"></div>
<div [class.large]="true"></div>

</docs-code>

### Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
`textAttributeNotBinding` has no additional requirements beyond `strictTemplates`.

### What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">

{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "textAttributeNotBinding": "suppress"
      }
    }
  }
}

</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.

---


(From NG8105.md)

## Missing `let` keyword in an `*ngFor` expression

This diagnostic is emitted when an expression used in `*ngFor` is missing the `let` keyword.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  // The `let` keyword is missing in the `*ngFor` expression.
  template: `<div *ngFor="item of items">{{ item }}</div>`,
})
class MyComponent {
  items = [1, 2, 3];
}

</docs-code>

### What's wrong with that?

A missing `let` is indicative of a syntax error in the `*ngFor` string. It also means that `item` will not be properly pulled into scope and `{{ item }}` will not resolve correctly.

### What should I do instead?

Add the missing `let` keyword.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  // The `let` keyword is now present in the `*ngFor` expression,
  // no diagnostic messages are emitted in this case.
  template: `<div *ngFor="let item of items">{{ item }}</div>`,
})
class MyComponent {
  items = [1, 2, 3];
}

</docs-code>

### Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
`missingNgForOfLet` has no additional requirements beyond `strictTemplates`.

### What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "missingNgForOfLet": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.

---


(From NG8106.md)

## Suffix not supported

This diagnostic detects when the `.px`, `.%`, and `.em` suffixes are used with an attribute
binding.

<docs-code language="html">

<img [attr.width.px]="5">

</docs-code>

### What's wrong with that?

These suffixes are only available for style bindings. They do not have any meaning when binding to an attribute.

### What should I do instead?

Rather than using the `.px`, `.%`, or `.em` suffixes that are only supported in style bindings,
move this to the value assignment of the binding.

<docs-code language="html">

<img [attr.width]="'5px'">

</docs-code>

### Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
`suffixNotSupported` has no additional requirements beyond `strictTemplates`.

### What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "suffixNotSupported": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.

---


(From NG8107.md)

## Optional chain not nullable

This diagnostic detects when the left side of an optional chain operation (`.?`) does not include `null` or `undefined` in its type in Angular templates.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  // Print the user's name safely, even if `user` is `null` or `undefined`.
  template: `<div>User name: {{ user?.name }}</div>`,
})
class MyComponent {
  // `user` is declared as an object which *cannot* be `null` or `undefined`.
  user: { name: string } = { name: 'Angelino' };
}

</docs-code>

### What's wrong with that?

Using the optional chain operator with a non-nullable input has no effect and is indicative of a discrepancy between the allowed type of a value and how it is presented in the template.
A developer might reasonably assume that the output of the optional chain operator is could be `null` or `undefined`, but it will never actually be either of those values.
This can lead to confusion about the expected output of the program.

### What should I do instead?

Update the template and declared type to be in sync.
Double-check the type of the input and confirm whether it is actually expected to be nullable.

If the input should be nullable, add `null` or `undefined` to its type to indicate this.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  // If `user` is nullish, `name` won't be evaluated and the expression will
  // return the nullish value (`null` or `undefined`).
  template: `<div>{{ user?.name }}</div>`,
})
class MyComponent {
  user: { name: string } | null = { name: 'Angelino' };
}

</docs-code>

If the input should not be nullable, delete the `?` operator.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  // Template always displays `name` as `user` is guaranteed to never be `null`
  // or `undefined`.
  template: `<div>{{ foo.bar }}</div>`,
})
class MyComponent {
  user: { name: string } = { name: 'Angelino' };
}

</docs-code>

### Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
[`strictNullChecks`](tools/cli/template-typecheck#strict-null-checks) must also be enabled to emit `optionalChainNotNullable` diagnostics.

### What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "optionalChainNotNullable": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.

---


(From NG8108.md)

## `ngSkipHydration` should be a static attribute

`ngSkipHydration` is a special attribute which indicates to Angular that a particular component should be opted-out of [hydration](guide/hydration).
This diagnostic ensures that this attribute `ngSkipHydration` is set statically and the value is either set to `"true"` or an empty value.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  template: `<user-viewer ngSkipHydration="hasUser" />`,
})
class MyComponent {
  hasUser = true;
}

</docs-code>

### What's wrong with that?

As a special attribute implemented by Angular, `ngSkipHydration` needs to be statically analyzable so Angular knows at compile-time whether or not hydration is needed for a component.

### What should I do instead?

When using the `ngSkipHydration`, ensure that it's set as a static attribute (i.e. you do not use the Angular template binding syntax).

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  template: `
    <user-viewer ngSkipHydration />
    <user-viewer ngSkipHydration="true" />
  `,
})
class MyComponent {}

</docs-code>

If a conditional is necessary, you can wrap the component in an `*ngIf`.

<docs-code language="html">

import {Component} from '@angular/core';

@Component({
  template: `
    <div *ngIf="hasUser; else noUser">
      <user-viewer ngSkipHydration />
    </div>

    <ng-template #noUser>
      <user-viewer />
    </ng-template>
  `,
})
class MyComponent {}

</docs-code>

### Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
`skipHydrationNotStatic` has no additional requirements beyond `strictTemplates`.

### What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "skipHydrationNotStatic": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.

---


(From NG8109.md)

## Signals must be invoked in template interpolations. 

This diagnostic detects uninvoked signals in template interpolations.

<docs-code language="typescript">

import {Component, signal, Signal} from '@angular/core';

@Component({
  template: `<div>{{ mySignal }}/div>`,
})
class MyComponent {
    mySignal: Signal<number> = signal(0);
}

</docs-code>

### What's wrong with that?

Angular Signals are zero-argument functions (`() => T`). When executed, they return the current value of the signal.
This means they are meant to be invoked when used in template interpolations to render their value.

### What should I do instead?

Ensure to invoke the signal when you use it within a template interpolation to render its value.

<docs-code language="typescript">

import {Component, signal, Signal} from '@angular/core';

@Component({
  template: `<div>{{ mySignal() }}/div>`,
})
class MyComponent {
  mySignal: Signal<number> = signal(0)
}

</docs-code>

### Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
`interpolatedSignalNotInvoked` has no additional requirements beyond `strictTemplates`.

### What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "interpolatedSignalNotInvoked": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.

---


(From NG8111.md)

## Functions should be invoked in event bindings. 

This diagnostic detects uninvoked functions in event bindings.

<docs-code language="typescript">

import {Component, signal, Signal} from '@angular/core';

@Component({
  template: `<button (click)="onClick">Click me</button>`,
})
class MyComponent {
  onClick() {
    console.log('clicked');
  }
}

</docs-code>

### What's wrong with that?

Functions in event bindings should be invoked when the event is triggered. 
If the function is not invoked, it will not execute when the event is triggered.

### What should I do instead?

Ensure to invoke the function when you use it in an event binding to execute the function when the event is triggered.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  template: `<button (click)="onClick()">Click me</button>`,
})
class MyComponent {
  onClick() {
    console.log('clicked');
  }
}

</docs-code>

### Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
`uninvokedFunctionInEventBinding` has no additional requirements beyond `strictTemplates`.

### What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "uninvokedFunctionInEventBinding": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.

---


(From NG8113.md)

## Unused Standalone Imports

This diagnostic detects cases where the `imports` array of a `@Component` contains symbols that
aren't used within the template.

<docs-code language="typescript">

@Component({
  imports: [UsedDirective, UnusedPipe]
})
class AwesomeCheckbox {}

</docs-code>

### What's wrong with that?

The unused imports add unnecessary noise to your code and can increase your compilation time.

### What should I do instead?

Delete the unused import.

<docs-code language="typescript">

@Component({
  imports: [UsedDirective]
})
class AwesomeCheckbox {}

</docs-code>

### What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "unusedStandaloneImports": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.

---


(From NG8114.md)

## Unparenthesized Nullish Coalescing

This diagnostic detects cases where the nullish coalescing operator (`??`) is mixed with the logical
or (`||`) or logical and (`&&`) operators without parentheses to disambiguate precedence.

<docs-code language="typescript">

import {Component, signal, Signal} from '@angular/core';

@Component({
  template: `
    <button [disabled]="hasPermission() && task()?.disabled ?? true">
      Run
    </button>
  `,
})
class MyComponent {
  hasPermission = input(false);
  task = input<Task|undefined>(undefined);
}

</docs-code>

### What's wrong with that?

Without disambiguating parentheses, its difficult to understand whether the `??` or `||`/`&&` is
evaluated first. This is considered an error in TypeScript and JavaScript, but has historically been
allowed in Angular templates.

### What should I do instead?

Always use parentheses to disambiguate in theses situations. If you're unsure what the original
intent of the code was but want to keep the behavior the same, place the parentheses around the `??`
operator.

<docs-code language="typescript">

import {Component, signal, Signal} from '@angular/core';

@Component({
  template: `
    <button [disabled]="hasPermission() && (task()?.disabled ?? true)">
      Run
    </button>
  `,
})
class MyComponent {
  hasPermission = input(false);
  task = input<Task|undefined>(undefined);
}

</docs-code>

---


(From NG8116.md)

## Missing structural directive

This diagnostic ensures that a standalone component using custom structural directives (e.g., `*select` or `*featureFlag`) in a template has the necessary imports for those directives.

<docs-code language="typescript">

import {Component} from '@angular/core';

@Component({
  // Template uses `*select`, but no corresponding directive imported.
  imports: [],
  template: `<p *select="let data from source">{{data}}</p>`,
})
class MyComponent {}

</docs-code>

### What's wrong with that?

Using a structural directive without importing it will fail at runtime, as Angular attempts to bind to a `select` property of the HTML element, which does not exist.

### What should I do instead?

Make sure that the corresponding structural directive is imported into the component:

<docs-code language="typescript">

import {Component} from '@angular/core';
import {SelectDirective} from 'my-directives';

@Component({
  // Add `SelectDirective` to the `imports` array to make it available in the template.
  imports: [SelectDirective],
  template: `<p *select="let data from source">{{data}}</p>`,
})
class MyComponent {}

</docs-code>

### Configuration requirements

[`strictTemplates`](tools/cli/template-typecheck#strict-mode) must be enabled for any extended diagnostic to emit.
`missingStructuralDirective` has no additional requirements beyond `strictTemplates`.

### What if I can't avoid this?

This diagnostic can be disabled by editing the project's `tsconfig.json` file:

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      "checks": {
        "missingStructuralDirective": "suppress"
      }
    }
  }
}
</docs-code>

See [extended diagnostic configuration](extended-diagnostics#configuration) for more info.

---


(From overview.md)

## Extended Diagnostics

There are many coding patterns that are technically valid to the compiler or runtime, but which may have complex nuances or caveats.
These patterns may not have the intended effect expected by a developer, which often leads to bugs.
The Angular compiler includes "extended diagnostics" which identify many of these patterns, in order to warn developers about the potential issues and enforce common best practices within a codebase.

### Diagnostics

Currently, Angular supports the following extended diagnostics:

| Code     | Name                                                              |
| :------- | :---------------------------------------------------------------- |
| `NG8101` | [`invalidBananaInBox`](extended-diagnostics/NG8101)               |
| `NG8102` | [`nullishCoalescingNotNullable`](extended-diagnostics/NG8102)     |
| `NG8103` | [`missingControlFlowDirective`](extended-diagnostics/NG8103)      |
| `NG8104` | [`textAttributeNotBinding`](extended-diagnostics/NG8104)          |
| `NG8105` | [`missingNgForOfLet`](extended-diagnostics/NG8105)                |
| `NG8106` | [`suffixNotSupported`](extended-diagnostics/NG8106)               |
| `NG8107` | [`optionalChainNotNullable`](extended-diagnostics/NG8107)         |
| `NG8108` | [`skipHydrationNotStatic`](extended-diagnostics/NG8108)           |
| `NG8109` | [`interpolatedSignalNotInvoked`](extended-diagnostics/NG8109)     |
| `NG8111` | [`uninvokedFunctionInEventBinding`](extended-diagnostics/NG8111)  |
| `NG8113` | [`unusedStandaloneImports`](extended-diagnostics/NG8113)          |
| `NG8114` | [`unparenthesizedNullishCoalescing`](extended-diagnostics/NG8114) |
| `NG8116` | [`missingStructuralDirective`](extended-diagnostics/NG8116)       |

### Configuration

Extended diagnostics are warnings by default and do not block compilation.
Each diagnostic can be configured as either:

| Error category | Effect                                                                                                                                                                   |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `warning`      | Default - The compiler emits the diagnostic as a warning but does not block compilation. The compiler will still exist with status code 0, even if warnings are emitted. |
| `error`        | The compiler emits the diagnostic as an error and fails the compilation. The compiler will exit with a non-zero status code if one or more errors are emitted.           |
| `suppress`     | The compiler does _not_ emit the diagnostic at all.                                                                                                                      |

Check severity can be configured as an [Angular compiler option](reference/configs/angular-compiler-options):

<docs-code language="json">
{
  "angularCompilerOptions": {
    "extendedDiagnostics": {
      // The categories to use for specific diagnostics.
      "checks": {
        // Maps check name to its category.
        "invalidBananaInBox": "suppress"
      },

      // The category to use for any diagnostics not listed in `checks` above.
      "defaultCategory": "error"
    }

}
}
</docs-code>

The `checks` field maps the name of individual diagnostics to their associated category.
See [Diagnostics](#diagnostics) for a complete list of extended diagnostics and the name to use for configuring them.

The `defaultCategory` field is used for any diagnostics that are not explicitly listed under `checks`.
If not set, such diagnostics will be treated as `warning`.

Extended diagnostics will emit when [`strictTemplates`](tools/cli/template-typecheck#strict-mode) is enabled.
This is required to allow the compiler to better understand Angular template types and provide accurate and meaningful diagnostics.

### Semantic Versioning

The Angular team intends to add or enable new extended diagnostics in **minor** versions of Angular (see [semver](https://docs.npmjs.com/about-semantic-versioning)).
This means that upgrading Angular may show new warnings in your existing codebase.
This enables the team to deliver features more quickly and to make extended diagnostics more accessible to developers.

However, setting `"defaultCategory": "error"` will promote such warnings to hard errors.
This can cause a minor version upgrade to introduce compilation errors, which may be seen as a semver non-compliant breaking change.
Any new diagnostics can be suppressed or demoted to warnings via the above [configuration](#configuration), so the impact of a new diagnostic should be minimal to
projects that treat extended diagnostics as errors by default.
Defaulting to error is a very powerful tool; just be aware of this semver caveat when deciding if `error` is the right default for your project.

### New Diagnostics

The Angular team is always open to suggestions about new diagnostics that could be added.
Extended diagnostics should generally:

- Detect a common, non-obvious developer mistake with Angular templates
- Clearly articulate why this pattern can lead to bugs or unintended behavior
- Suggest one or more clear solutions
- Have a low, preferably zero, false-positive rate
- Apply to the vast majority of Angular applications (not specific to an unofficial library)
- Improve program correctness or performance (not style, that responsibility falls to a linter)

If you have an idea for an extended diagnostic which fits these criteria, consider filing a [feature request](https://github.com/angular/angular/issues/new?template=2-feature-request.yaml).

---


(From license.md)

## The MIT License

Copyright (c) 2010-2025 Google LLC. https://angular.dev/license

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---


(From cleanup-unused-imports.md)

## Clean up unused imports

As of version 19, Angular reports when a component's `imports` array contains symbols that aren't used in its template.

Running this schematic will clean up all unused imports within the project.

Run the schematic using the following command:

<docs-code language="shell">

ng generate @angular/core:cleanup-unused-imports

</docs-code>

##### Before

<docs-code language="typescript">
import { Component } from '@angular/core';
import { UnusedDirective } from './unused';

@Component({
  template: 'Hello',
  imports: [UnusedDirective],
})
export class MyComp {}
</docs-code>

##### After

<docs-code language="typescript">
import { Component } from '@angular/core';

@Component({
  template: 'Hello',
  imports: [],
})
export class MyComp {}
</docs-code>

---


(From control-flow.md)

## Migration to Control Flow syntax

[Control flow syntax](guide/templates/control-flow) is available from Angular v17. The new syntax is baked into the template, so you don't need to import `CommonModule` anymore.

This schematic migrates all existing code in your application to use new Control Flow Syntax.

Run the schematic using the following command:

<docs-code language="shell">

ng generate @angular/core:control-flow

</docs-code>

---


(From inject-function.md)

## Migration to the `inject` function

Angular's `inject` function offers more accurate types and better compatibility with standard decorators, compared to constructor-based injection.

This schematic converts constructor-based injection in your classes to use the `inject` function instead.

Run the schematic using the following command:

<docs-code language="shell">

ng generate @angular/core:inject

</docs-code>

##### Before

<docs-code language="typescript">
import { Component, Inject, Optional } from '@angular/core';
import { MyService } from './service';
import { DI_TOKEN } from './token';

@Component()
export class MyComp {
  constructor(
    private service: MyService,
    @Inject(DI_TOKEN) @Optional() readonly token: string) {}
}
</docs-code>

##### After

<docs-code language="typescript">
import { Component, inject } from '@angular/core';
import { MyService } from './service';
import { DI_TOKEN } from './token';

@Component()
export class MyComp {
  private service = inject(MyService);
  readonly token = inject(DI_TOKEN, { optional: true });
}
</docs-code>

### Migration options

The migration includes several options to customize its output.

#### `path`

Determines which sub-path in your project should be migrated. Pass in `.` or leave it blank to
migrate the entire directory.

#### `migrateAbstractClasses`

Angular doesn't validate that parameters of abstract classes are injectable. This means that the
migration can't reliably migrate them to `inject` without risking breakages which is why they're
disabled by default. Enable this option if you want abstract classes to be migrated, but note
that you may have to **fix some breakages manually**.

#### `backwardsCompatibleConstructors`

By default the migration tries to clean up the code as much as it can, which includes deleting
parameters from the constructor, or even the entire constructor if it doesn't include any code.
In some cases this can lead to compilation errors when classes with Angular decorators inherit from
other classes with Angular decorators. If you enable this option, the migration will generate an
additional constructor signature to keep it backwards compatible, at the expense of more code.

##### Before

<docs-code language="typescript">
import { Component } from '@angular/core';
import { MyService } from './service';

@Component()
export class MyComp {
  constructor(private service: MyService) {}
}
</docs-code>

##### After

<docs-code language="typescript">
import { Component } from '@angular/core';
import { MyService } from './service';

@Component()
export class MyComp {
  private service = inject(MyService);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}
}
</docs-code>

#### `nonNullableOptional`

If injection fails for a parameter with the `@Optional` decorator, Angular returns `null` which
means that the real type of any `@Optional` parameter will be `| null`. However, because decorators
cannot influence their types, there is a lot of existing code whose type is incorrect. The type is
fixed in `inject()` which can cause new compilation errors to show up. If you enable this option,
the migration will produce a non-null assertion after the `inject()` call to match the old type,
at the expense of potentially hiding type errors.

**NOTE:** non-null assertions won't be added to parameters that are already typed to be nullable,
because the code that depends on them likely already accounts for their nullability.

##### Before

<docs-code language="typescript">
import { Component, Inject, Optional } from '@angular/core';
import { TOKEN_ONE, TOKEN_TWO } from './token';

@Component()
export class MyComp {
  constructor(
    @Inject(TOKEN_ONE) @Optional() private tokenOne: number,
    @Inject(TOKEN_TWO) @Optional() private tokenTwo: string | null) {}
}
</docs-code>

##### After

<docs-code language="typescript">
import { Component, inject } from '@angular/core';
import { TOKEN_ONE, TOKEN_TWO } from './token';

@Component()
export class MyComp {
  // Note the `!` at the end.
  private tokenOne = inject(TOKEN_ONE, { optional: true })!;

  // Does not have `!` at the end, because the type was already nullable.
  private tokenTwo = inject(TOKEN_TWO, { optional: true });
}
</docs-code>

---


(From outputs.md)

## Migration to output function

Angular introduced an improved API for outputs in v17.3 that is considered
production ready as of v19. This API mimics the `input()` API but is not based on Signals.
Read more about custom events output function and its benefits in the [dedicated guide](guide/components/outputs).

To support existing projects that would like to use output function, the Angular team
provides an automated migration that converts `@Output` custom events to the new `output()` API.

Run the schematic using the following command:

```bash
ng generate @angular/core:output-migration
```

### What does the migration change?

1. `@Output()` class members are updated to their `output()` equivalent.
2. Imports in the file of components or directives, at Typescript module level, are updated as well.
3. Migrates the APIs functions like `event.next()`, which use is not recommended, to `event.emit()` and removes `event.complete()` calls.

**Before**

```typescript
import {Component, Output, EventEmitter} from '@angular/core';

@Component({
  template: `<button (click)="someMethod('test')">emit</button>`
})
export class MyComponent {
  @Output() someChange = new EventEmitter<string>();

  someMethod(value: string): void {
    this.someChange.emit(value);
  }
}
```

**After**

```typescript
import {Component, output} from '@angular/core';

@Component({
  template: `<button (click)="someMethod('test')">emit</button>`
})
export class MyComponent {
  readonly someChange = output<string>();

  someMethod(value: string): void {
    this.someChange.emit(value);
  }
}
```

### Configuration options

The migration supports a few options for fine tuning the migration to your specific needs.

#### `--path`

If not specified, the migration will ask you for a path and update your whole Angular CLI workspace.
You can limit the migration to a specific sub-directory using this option.

#### `--analysis-dir`

In large projects you may use this option to reduce the amount of files being analyzed.
By default, the migration analyzes the whole workspace, regardless of the `--path` option, in
order to update all references affected by an `@Output()` migration.

With this option, you can limit analysis to a sub-folder. Note that this means that any
references outside this directory are silently skipped, potentially breaking your build.

Use these options as shown below:

```bash
ng generate @angular/core:output-migration --path src/app/sub-folder
```

### Exceptions

In some cases, the migration will not touch the code.
One of these exceptions is the case where the event is used with a `pipe()` method.
The following code won't be migrated:

```typescript
export class MyDialogComponent {
  @Output() close = new EventEmitter<void>();
  doSome(): void {
    this.close.complete();
  }
  otherThing(): void {
    this.close.pipe();
  }
}
```

---


(From overview.md)

## Migrations

Learn about how you can migrate your existing angular project to the latest features incrementally.

<docs-card-container>
  <docs-card title="Standalone" link="Migrate now" href="reference/migrations/standalone">
    Standalone components provide a simplified way to build Angular applications. Standalone components specify their dependencies directly instead of getting them through NgModules.
  </docs-card>
  <docs-card title="Control Flow Syntax" link="Migrate now" href="reference/migrations/control-flow">
    Built-in Control Flow Syntax allows you to use more ergonomic syntax which is close to JavaScript and has better type checking. It replaces the need to import `CommonModule` to use functionality like `*ngFor`, `*ngIf` and `*ngSwitch`.
  </docs-card>
  <docs-card title="inject() Function" link="Migrate now" href="reference/migrations/inject-function">
    Angular's `inject` function offers more accurate types and better compatibility with standard decorators, compared to constructor-based injection.
  </docs-card>
  <docs-card title="Lazy-loaded routes" link="Migrate now" href="reference/migrations/route-lazy-loading">
    Convert eagerly loaded component routes to lazy loaded ones. This allows the build process to split production bundles into smaller chunks, to load less JavaScript at initial page load.
  </docs-card>
  <docs-card title="New `input()` API" link="Migrate now" href="reference/migrations/signal-inputs">
    Convert existing `@Input` fields to the new signal input API that is now production ready.
  </docs-card>
  <docs-card title="New `output()` function" link="Migrate now" href="reference/migrations/outputs">
    Convert existing `@Output` custom events to the new output function that is now production ready.
  </docs-card>
  <docs-card title="Queries as signal" link="Migrate now" href="reference/migrations/signal-queries">
    Convert existing decorator query fields to the improved signal queries API. The API is now production ready.
  </docs-card>
  <docs-card title="Cleanup unused imports" link="Try it now" href="reference/migrations/cleanup-unused-imports">
    Clean up unused imports in your project.
  </docs-card>
  <docs-card title="Self-closing tags" link="Migrate now" href="reference/migrations/self-closing-tags">
    Convert component templates to use self-closing tags where possible.
  </docs-card>
</docs-card-container>

---


(From route-lazy-loading.md)

## Migration to lazy-loaded routes

This schematic helps developers to convert eagerly loaded component routes to lazy loaded routes. This allows the build process to split the production bundle into smaller chunks, to avoid big JS bundle that includes all routes, which negatively affects initial page load of an application.

Run the schematic using the following command:

<docs-code language="shell">

ng generate @angular/core:route-lazy-loading

</docs-code>

#### `path` config option

By default, migration will go over the entire application. If you want to apply this migration to a subset of the files, you can pass the path argument as shown below:

<docs-code language="shell">

ng generate @angular/core:route-lazy-loading --path src/app/sub-component

</docs-code>

The value of the path parameter is a relative path within the project.

#### How does it work?

The schematic will attempt to find all the places where the application routes as defined:

- `RouterModule.forRoot` and `RouterModule.forChild`
- `Router.resetConfig`
- `provideRouter`
- `provideRoutes`
- variables of type `Routes` or `Route[]` (e.g. `const routes: Routes = [{...}]`)

The migration will check all the components in the routes, check if they are standalone and eagerly loaded, and if so, it will convert them to lazy loaded routes.

##### Before

<docs-code language="typescript">
// app.module.ts
import { HomeComponent } from './home/home.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: 'home',
        // HomeComponent is standalone and eagerly loaded
        component: HomeComponent,
      },
    ]),
  ],
})
export class AppModule {}
</docs-code>

##### After

<docs-code language="typescript">
// app.module.ts
@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: 'home',
        // ↓ HomeComponent is now lazy loaded
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
      },
    ]),
  ],
})
export class AppModule {}
</docs-code>

This migration will also collect information about all the components declared in NgModules and output the list of routes that use them (including corresponding location of the file). Consider making those components standalone and run this migration again. You can use an existing migration (see https://angular.dev/reference/migrations/standalone) to convert those components to standalone.

---


(From self-closing-tags.md)

## Migration to self-closing tags

Self-closing tags are supported in Angular templates since [v16](https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d#7065). .

This schematic migrates the templates in your application to use self-closing tags.

Run the schematic using the following command:

<docs-code language="shell">

ng generate @angular/core:self-closing-tag

</docs-code>


##### Before

<docs-code language="angular-html">

<!-- Before -->
<hello-world></hello-world>

<!-- After -->
<hello-world />

</docs-code>

---


(From signal-inputs.md)

## Migration to signal inputs

Angular introduced an improved API for inputs that is considered
production ready as of v19.
Read more about signal inputs and their benefits in the [dedicated guide](guide/signals/inputs).

To support existing teams that would like to use signal inputs, the Angular team
provides an automated migration that converts `@Input` fields to the new `input()` API.

Run the schematic using the following command:

```bash
ng generate @angular/core:signal-input-migration
```

Alternatively, the migration is available as a [code refactor action](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) in VSCode.
Install the latest version of the VSCode extension and click on an `@Input` field.
See more details in the section [below](#vscode-extension).

### What does the migration change?

1. `@Input()` class members are updated to their signal `input()` equivalent.
2. References to migrated inputs are updated to call the signal.
   - This includes references in templates, host bindings or TypeScript code.

**Before**

```typescript
import {Component, Input} from '@angular/core';

@Component({
  template: `Name: {{name ?? ''}}`
})
export class MyComponent {
  @Input() name: string|undefined = undefined;

  someMethod(): number {
    if (this.name) {
      return this.name.length;
    }
    return -1;
  }
}
```

**After**

<docs-code language="angular-ts" highlight="[[4],[7], [10,12]]">
import {Component, input} from '@angular/core';

@Component({
  template: `Name: {{name() ?? ''}}`
})
export class MyComponent {
  readonly name = input<string>();

  someMethod(): number {
    const name = this.name();
    if (name) {
      return name.length;
    }
    return -1;
  }
}
</docs-code>

### Configuration options

The migration supports a few options for fine tuning the migration to your specific needs.

#### `--path`

By default, the migration will update your whole Angular CLI workspace.
You can limit the migration to a specific sub-directory using this option.

#### `--best-effort-mode`

By default, the migration skips inputs that cannot be safely migrated.
The migration tries to refactor code as safely as possible.

When the `--best-effort-mode` flag is enabled, the migration eagerly
tries to migrate as much as possible, even if it could break your build.

#### `--insert-todos`

When enabled, the migration will add TODOs to inputs that couldn't be migrated.
The TODOs will include reasoning on why inputs were skipped. E.g.

```ts
// TODO: Skipped for migration because:
//  Your application code writes to the input. This prevents migration.
@Input() myInput = false;
```

#### `--analysis-dir`

In large projects you may use this option to reduce the amount of files being analyzed.
By default, the migration analyzes the whole workspace, regardless of the `--path` option, in
order to update all references affected by an `@Input()` migration.

With this option, you can limit analysis to a sub-folder. Note that this means that any
references outside this directory are silently skipped, potentially breaking your build.

### VSCode extension

![Screenshot of the VSCode extension and clicking on an `@Input` field](assets/images/migrations/signal-inputs-vscode.png "Screenshot of the VSCode extension and clicking on an `@Input` field.")

The migration is available as a [code refactor action](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) in VSCode.

To make use of the migration via VSCode, install the latest version of the VSCode extension and either click:

- on a `@Input` field.
- or, on a directive/component

Then, wait for the yellow lightbulb VSCode refactoring button to appear.
Via this button you can then select the signal input migration.

---


(From signal-queries.md)

## Migration to signal queries

Angular introduced improved APIs for queries that are considered
production ready as of v19.
Read more about signal queries and their benefits in the [dedicated guide](guide/signals/queries).

To support existing teams that would like to use signal queries, the Angular team
provides an automated migration that converts existing decorator query fields to the new API.

Run the schematic using the following command:

```bash
ng generate @angular/core:signal-queries-migration
```

Alternatively, the migration is available as a [code refactor action](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) in VSCode.
Install the latest version of the VSCode extension and click onto e.g. a `@ViewChild` field.
See more details in the section [below](#vscode-extension).

### What does the migration change?

1. `@ViewChild()`, `@ViewChildren`, `@ContentChild` and `@ContentChildren` class members
   are updated to their signal equivalents.
2. References in your application to migrated queries are updated to call the signal.
   - This includes references in templates, host bindings or TypeScript code.

**Before**

```typescript
import {Component, ContentChild} from '@angular/core';

@Component({
  template: `Has ref: {{someRef ? 'Yes' : 'No'}}`
})
export class MyComponent {
  @ContentChild('someRef') ref: ElementRef|undefined = undefined;

  someMethod() {
    if (this.ref) {
      this.ref.nativeElement;
    }
  }
}
```

**After**

```typescript
import {Component, contentChild} from '@angular/core';

@Component({
  template: `Has ref: {{someRef() ? 'Yes' : 'No'}}`
})
export class MyComponent {
  readonly ref = contentChild<ElementRef>('someRef');

  someMethod() {
    const ref = this.ref();
    if (ref) {
      ref.nativeElement;
    }
  }
}
```

### Configuration options

The migration supports a few options for fine tuning the migration to your specific needs.

#### `--path`

By default, the migration will update your whole Angular CLI workspace.
You can limit the migration to a specific sub-directory using this option.

#### `--best-effort-mode`

By default, the migration skips queries that cannot be safely migrated.
The migration tries to refactor code as safely as possible.

When the `--best-effort-mode` flag is enabled, the migration eagerly
tries to migrate as much as possible, even if it could break your build.

#### `--insert-todos`

When enabled, the migration will add TODOs to queries that couldn't be migrated.
The TODOs will include reasoning on why queries were skipped. E.g.

```ts
// TODO: Skipped for migration because:
//  Your application code writes to the query. This prevents migration.
@ViewChild('ref') ref?: ElementRef;
```

#### `--analysis-dir`

In large projects you may use this option to reduce the amount of files being analyzed.
By default, the migration analyzes the whole workspace, regardless of the `--path` option, in
order to update all references affected by a query declaration being migrated.

With this option, you can limit analysis to a sub-folder. Note that this means that any
references outside this directory are silently skipped, potentially breaking your build.

### VSCode extension

![Screenshot of the VSCode extension and clicking on an `@ViewChild` field](assets/images/migrations/signal-queries-vscode.png "Screenshot of the VSCode extension and clicking on an `@ViewChild` field.")

The migration is available as a [code refactor action](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) in VSCode.

To make use of the migration via VSCode, install the latest version of the VSCode extension and either click:

- on a `@ViewChild`, `@ViewChildren`, `@ContentChild`, or `@ContentChildren` field.
- on a directive/component

Then, wait for the yellow lightbulb VSCode refactoring button to appear.
Via this button you can then select the signal queries migration.

---


(From standalone.md)

## Migrate an existing Angular project to standalone

**Standalone components** provide a simplified way to build Angular applications. Standalone components, directives, and pipes aim to streamline the authoring experience by reducing the need for `NgModule`s. Existing applications can optionally and incrementally adopt the new standalone style without any breaking changes.

<docs-video src="https://www.youtube.com/embed/x5PZwb4XurU" title="Getting started with standalone components"/>

This schematic helps to transform components, directive and pipes in existing projects to become standalone. The schematic aims to transform as much code as possible automatically, but it may require some manual fixes by the project author.

Run the schematic using the following command:

<docs-code language="shell">

ng generate @angular/core:standalone

</docs-code>

### Before updating

Before using the schematic, please ensure that the project:

1. Is using Angular 15.2.0 or later.
2. Builds without any compilation errors.
3. Is on a clean Git branch and all work is saved.

### Schematic options

| Option              | Details                                                    |
|:---                 |:---                                                        |
| `mode`              | The transformation to perform. See [Migration modes](#migration-modes) below for details on the available options. |
| `path`              | The path to migrate, relative to the project root. You can use this option to migrate sections of your project incrementally. |

### Migrations steps

The migration process is composed of three steps. You'll have to run it multiple times and check manually that the project builds and behaves as expected.

NOTE: While the schematic can automatically update most code, some edge cases require developer intervention.
You should plan to apply manual fixes after each step of the migration. Additionally, the new code generated by the schematic may not match your code's formatting rules.

Run the migration in the order listed below, verifying that your code builds and runs between each step:

1. Run `ng g @angular/core:standalone` and select "Convert all components, directives and pipes to standalone"
2. Run `ng g @angular/core:standalone` and select "Remove unnecessary NgModule classes"
3. Run `ng g @angular/core:standalone` and select "Bootstrap the project using standalone APIs"
4. Run any linting and formatting checks, fix any failures, and commit the result

### After the migration

Congratulations, your application has been converted to standalone 🎉. These are some optional follow-up steps you may want to take now:

* Find and remove any remaining `NgModule` declarations: since the ["Remove unnecessary NgModules" step](#remove-unnecessary-ngmodules) cannot remove all modules automatically, you may have to remove the remaining declarations manually.
* Run the project's unit tests and fix any failures.
* Run any code formatters, if the project uses automatic formatting.
* Run any linters in your project and fix new warnings. Some linters support a `--fix` flag that may resolve some of your warnings automatically.

### Migration modes

The migration has the following modes:

1. Convert declarations to standalone.
2. Remove unnecessary NgModules.
3. Switch to standalone bootstrapping API.
You should run these migrations in the order given.

#### Convert declarations to standalone

In this mode, the migration converts all components, directives and pipes to standalone by removing `standalone: false` and adding dependencies to their `imports` array.

HELPFUL: The schematic ignores NgModules which bootstrap a component during this step because they are likely root modules used by `bootstrapModule` rather than the standalone-compatible `bootstrapApplication`. The schematic converts these declarations automatically as a part of the ["Switch to standalone bootstrapping API"](#switch-to-standalone-bootstrapping-api) step.

**Before:**

```typescript
// shared.module.ts
@NgModule({
  imports: [CommonModule],
  declarations: [GreeterComponent],
  exports: [GreeterComponent]
})
export class SharedModule {}
```

```typescript
// greeter.component.ts
@Component({
  selector: 'greeter',
  template: '<div *ngIf="showGreeting">Hello</div>',
  standalone: false,
})
export class GreeterComponent {
  showGreeting = true;
}
```

**After:**

```typescript
// shared.module.ts
@NgModule({
  imports: [CommonModule, GreeterComponent],
  exports: [GreeterComponent]
})
export class SharedModule {}
```

```typescript
// greeter.component.ts
@Component({
  selector: 'greeter',
  template: '<div *ngIf="showGreeting">Hello</div>',
  imports: [NgIf]
})
export class GreeterComponent {
  showGreeting = true;
}
```

#### Remove unnecessary NgModules

After converting all declarations to standalone, many NgModules can be safely removed. This step deletes such module declarations and as many corresponding references as possible. If the migration cannot delete a reference automatically, it leaves the following TODO comment so that you can delete the NgModule manually:

```typescript
/* TODO(standalone-migration): clean up removed NgModule reference manually */
```

The migration considers a module safe to remove if that module:

* Has no `declarations`.
* Has no `providers`.
* Has no `bootstrap` components.
* Has no `imports` that reference a `ModuleWithProviders` symbol or a module that can't be removed.
* Has no class members. Empty constructors are ignored.

**Before:**

```typescript
// importer.module.ts
@NgModule({
  imports: [FooComponent, BarPipe],
  exports: [FooComponent, BarPipe]
})
export class ImporterModule {}
```

**After:**

```typescript
// importer.module.ts
// Does not exist!
```

#### Switch to standalone bootstrapping API

This step converts any usages of  `bootstrapModule` to the new, standalone-based `bootstrapApplication`. It also removes `standalone: false` from the root component and deletes the root NgModule. If the root module has any `providers` or `imports`, the migration attempts to copy as much of this configuration as possible into the new bootstrap call.

**Before:**

```typescript
// ./app/app.module.ts
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

```typescript
// ./app/app.component.ts
@Component({
  selector: 'app',
  template: 'hello',
  standalone: false,
})
export class AppComponent {}
```

```typescript
// ./main.ts
import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';

platformBrowser().bootstrapModule(AppModule).catch(e => console.error(e));
```

**After:**

```typescript
// ./app/app.module.ts
// Does not exist!
```

```typescript
// ./app/app.component.ts
@Component({
  selector: 'app',
  template: 'hello'
})
export class AppComponent {}
```

```typescript
// ./main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent).catch(e => console.error(e));
```

### Common problems

Some common problems that may prevent the schematic from working correctly include:

* Compilation errors - if the project has compilation errors, Angular cannot analyze and migrate it correctly.
* Files not included in a tsconfig - the schematic determines which files to migrate by analyzing your project's `tsconfig.json` files. The schematic excludes any files not captured by a tsconfig.
* Code that cannot be statically analyzed - the schematic uses static analysis to understand your code and determine where to make changes. The migration may skip any classes with metadata that cannot be statically analyzed at build time.

### Limitations

Due to the size and complexity of the migration, there are some cases that the schematic cannot handle:

* Because unit tests are not ahead-of-time (AoT) compiled, `imports` added to components in unit tests might not be entirely correct.
* The schematic relies on direct calls to Angular APIs. The schematic cannot recognize custom wrappers around Angular APIs. For example, if there you define a custom `customConfigureTestModule` function that wraps `TestBed.configureTestingModule`, components it declares may not be recognized.

---


(From press-kit.md)

## Angular Press Kit

The logo graphics available for download on this page are provided under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

<docs-card-container>
  <docs-card title="Angular logos" href="https://drive.google.com/drive/folders/1IgcAwLDVZUz8ycnFa7T4_H6B4V4LhYUQ?usp=sharing" link="Download from Google Drive">
    ![Angular wordmark gradient logo](assets/images/press-kit/angular_wordmark_gradient.png "Angular wordmark gradient logo")
    ![Angular wordmark white logo](assets/images/press-kit/angular_wordmark_white.png "Angular wordmark white logo")
    ![Angular wordmark black logo](assets/images/press-kit/angular_wordmark_black.png "Angular wordmark black logo")
    Black and white are the default color variations and should be used in most circumstances. A gradient version of the icon and lockup is available in both static and animated formats and can be used in cases where a color icon is required.
  </docs-card>
  <docs-card title="Brand guidelines" href="https://drive.google.com/drive/folders/1gD5-kamfribnib6TH4-aqVZxjYaDZlCg?usp=drive_link" link="Download from Google Drive">
    ![Angular animated gradient logo](assets/images/press-kit/angular_icon_gradient.gif "Angular animated gradient logo")
    Our brand guidelines folders contain the design files, guidance and community examples for how the brand can be adapted.
    Read more about adapting the logo in the section below.
  </docs-card>
</docs-card-container>

### Press and Media

For inquiries regarding press and media please contact us at press@angular.io. For developer inquiries contact devrel@angular.io.

### Adapting the logo

Angular’s success is deeply connected to our community. We know many communities, meetups, conferences, blogs, websites, YouTube channels and developers have built their brand on top of ours. This logo is for us and our community, and it’s important that you can join us in updating your brand as well.

Angular has long valued creative expression through customized shield icons. The new Angular icon allows customization in several ways. The icon shape can be used as a container for simple colors and patterns. Alternatively, a custom backplate can be used for more intricate designs. We recommend keeping your compositions simple and clear, since busy and complex patterns can be difficult to read. We appreciate your cooperation in keeping our community a safe and welcoming space. Please keep designs respectful and be mindful of our community guidelines when creating your icons.

We have provided a template to get you started.

If you have any questions on adapting the new logo, or updating your own, please email devrel@angular.io for additional help – we can’t wait to see what you create!

<docs-workflow>

<docs-step title="Adapt the logo colors as your own">
Lean into the shape of Angular’s new logo by changing the logo colors to match your brand colors, flag, cause, etc.

In this example, we’ve adapted the colors to create an Angular Pride logo variation:
![Angular pride logo](assets/images/press-kit/angular_pride.png#small "Angular pride logo")
</docs-step>

<docs-step title="Adapt the logo shape as your own">
Lean into the shape of Angular’s new logo by adapting the shield to match your own brand.

In this example, we’ve adapted the shield to create an Angular Signals logo variation:
![Angular Signals logo](assets/images/press-kit/angular_signals.png#medium "Angular Signals logo")
</docs-step>

<docs-step title="Do’s and don’ts of using Angular's brand">
If you are creating your own logo, we encourage differentiating your logo from ours to not cause confusion. When adapting the logo, you are free to change and adapt the colors and shape to make it your own.
  
When representing Angular with the original logo, please follow these guidelines:
![Rhubarb the small cat](assets/images/press-kit/do_and_dont.png "Rhubarb the small cat")
</docs-step>

</docs-workflow>

### Deprecated logos

#### 2016 Angular (v3-v16)

In 2023 , we announced a modernized logo with v17. We advise against using the former Angular logo to prevent confusion. You can view the old press kit on our [old docs site](https://angular.io/presskit).

#### AngularJS

AngularJS is the v1.x predecessor of modern Angular. We advise against using this logo to prevent confusion.
Read more about the discontinued LTS (Long Term Support) for AngularJS on our [blog](https://blog.angular.dev/discontinued-long-term-support-for-angularjs-cc066b82e65a).

---


(From releases.md)

## Angular versioning and releases

We recognize that you need stability from the Angular framework.
Stability ensures that reusable components and libraries, tutorials, tools, and learned practices don't become obsolete unexpectedly.
Stability is essential for the ecosystem around Angular to thrive.

We also share with you the need for Angular to keep evolving.
We strive to ensure that the foundation on top of which you are building is continuously improving and enabling you to stay up-to-date with the rest of the web ecosystem and your user needs.

This document contains the practices that we follow to provide you with a leading-edge application development platform, balanced with stability.
We strive to ensure that future changes are always introduced in a predictable way.
We want everyone who depends on Angular to know when and how new features are added, and to be well-prepared when obsolete ones are removed.

Sometimes *breaking changes*, such as the removal of APIs or features, are necessary to innovate and stay current with evolving best practices, changing dependencies, or shifts in the web platform. These breaking changes go through a deprecation process explained in our [deprecation policy](#deprecation-policy).

To make these transitions as straightforward as possible, the Angular team makes these commitments:

* We work hard to minimize the number of breaking changes and to provide migration tools when possible
* We follow the deprecation policy described here, so you have time to update your applications to the latest APIs and best practices

HELPFUL: The practices described in this document apply to Angular 2.0 and later.
If you are currently using AngularJS, see [Upgrading from AngularJS](https://angular.io/guide/upgrade "Upgrading from Angular JS").
*AngularJS* is the name for all v1.x versions of Angular.

### Angular versioning

Angular version numbers indicate the level of changes that are introduced by the release.
This use of [semantic versioning](https://semver.org/ "Semantic Versioning Specification") helps you understand the potential impact of updating to a new version.

Angular version numbers have three parts: `major.minor.patch`.
For example, version 7.2.11 indicates major version 7, minor version 2, and patch level 11.

The version number is incremented based on the level of change included in the release.

| Level of change | Details |
|:---             |:---     |
| Major release   | Contains significant new features, some but minimal developer assistance is expected during the update. When updating to a new major release, you might need to run update scripts, refactor code, run additional tests, and learn new APIs.                                                                                                                                                                                      |
| Minor release   | Contains new smaller features. Minor releases are fully backward-compatible; no developer assistance is expected during update, but you can optionally modify your applications and libraries to begin using new APIs, features, and capabilities that were added in the release. We update peer dependencies in minor versions by expanding the supported versions, but we do not require projects to update these dependencies. |
| Patch release   | Low risk, bug fix release. No developer assistance is expected during update.                                                                                                                                                                                                                                                                                                                                                     |

HELPFUL: As of Angular version 7, the major versions of Angular core and the CLI are aligned.
This means that in order to use the CLI as you develop an Angular app, the version of `@angular/core` and the CLI need to be the same.

#### Preview releases

We let you preview what's coming by providing "Next" and Release Candidates \(`rc`\) pre-releases for each major and minor release:

| Pre-release type  | Details |
|:---               |:---     |
| Next              | The release that is under active development and testing. The next release is indicated by a release tag appended with the `-next` identifier, such as  `8.1.0-next.0`.      |
| Release candidate | A release that is feature complete and in final testing. A release candidate is indicated by a release tag appended with the `-rc` identifier, such as version `8.1.0-rc.0`. |

The latest `next` or `rc` pre-release version of the documentation is available at [next.angular.dev](https://next.angular.dev).

### Release frequency

We work toward a regular schedule of releases, so that you can plan and coordinate your updates with the continuing evolution of Angular.

HELPFUL: Dates are offered as general guidance and are subject to change.

In general, expect the following release cycle:

* A major release every 6 months
* 1-3 minor releases for each major release
* A patch release and pre-release \(`next` or `rc`\) build almost every week

This cadence of releases gives eager developers access to new features as soon as they are fully developed and pass through our code review and integration testing processes, while maintaining the stability and reliability of the platform for production users that prefer to receive features after they have been validated by Google and other developers that use the pre-release builds.

### Support policy and schedule

HELPFUL: Approximate dates are offered as general guidance and are subject to change.

#### Release schedule

| Version | Date               |
|:--------|:-------------------|
| v20.1   | TBD |
| v20.2   | TBD |
| v21.0   | TBD |

#### Support window

All major releases are typically supported for 18 months.

| Support stage     | Support Timing | Details |
|:---               |:---            |:---     |
| Active            | 6 months       | Regularly-scheduled updates and patches are released                |
| Long-term \(LTS\) | 12 months      | Only [critical fixes and security patches](#lts-fixes) are released |

#### Actively supported versions

The following table provides the status for Angular versions under support.

| Version | Status | Released   | Active ends | LTS ends   |
|:--------|:-------|:-----------|:------------|:-----------|
| ^20.0.0 | Active | 2025-05-28 | 2025-11-21  | 2026-11-21 |
| ^19.0.0 | LTS    | 2024-11-19 | 2025-05-28  | 2026-05-19 |
| ^18.0.0 | LTS    | 2024-05-22 | 2024-11-19  | 2025-11-21 |

Angular versions v2 to v17 are no longer supported.

#### LTS fixes

As a general rule, a fix is considered for an LTS version if it resolves one of:

* A newly identified security vulnerability,
* A regression, since the start of LTS, caused by a 3rd party change, such as a new browser version.

### Deprecation policy

When the Angular team intends to remove an API or feature, it will be marked as *deprecated*. This occurs when an API is obsolete, superseded by another API, or otherwise discontinued. Deprecated API remain available through their deprecated phase, which lasts a minimum two major versions (approximately one year).

To help ensure that you have sufficient time and a clear path to update, this is our deprecation policy:

| Deprecation stages | Details |
|:---                |:---     |
| Announcement       | We announce deprecated APIs and features in the [change log](https://github.com/angular/angular/blob/main/CHANGELOG.md "Angular change log"). Deprecated APIs appear in the [documentation](api?status=deprecated) with ~~strikethrough~~. When we announce a deprecation, we also announce a recommended update path. Additionally, all deprecated APIs are annotated with `@deprecated` in the corresponding documentation, which enables text editors and IDEs to provide hints if your project depends on them.                            |
| Deprecation period | When an API or a feature is deprecated, it is still present in at least the next two major releases (period of at least 12 months). After that, deprecated APIs and features are candidates for removal. A deprecation can be announced in any release, but the removal of a deprecated API or feature happens only in major release. Until a deprecated API or feature is removed, it is maintained according to the LTS support policy, meaning that only critical and security issues are fixed. |
| npm dependencies   | We only make npm dependency updates that require changes to your applications in a major release. In minor releases, we update peer dependencies by expanding the supported versions, but we do not require projects to update these dependencies until a future major version. This means that during minor Angular releases, npm dependency updates within Angular applications and libraries are optional.                                               |

### Compatibility policy

Angular is a collection of many packages, subprojects, and tools.
To prevent accidental use of private APIs and so that you can clearly understand what is covered by the practices described here — we document what is and is not considered our public API surface.
For details, see [Supported Public API Surface of Angular](https://github.com/angular/angular/blob/main/contributing-docs/public-api-surface.md "Supported Public API Surface of Angular").

To guarantee backward compatibility of Angular we run a series of checks before we merge any change:

* Unit tests and integration tests
* Comparing the type definitions of the public API surface before and after the change
* Running the tests of all the applications at Google that depend on Angular

Any changes to the public API surface are made in accordance with the versioning, support, and depreciation policies previously described. In exceptional cases, such as critical security patches, fixes may introduce backwards incompatible changes. Such exceptional cases are accompanied by explicit notice on the framework's official communication channels.

### Breaking change policy and update paths

Breaking change requires you to do work because the state after it is not backward compatible with the state before it. You can find the rare exceptions from this rule in the [Compatibility policy](#compatibility-policy). Examples of breaking changes are the removal of public APIs or other changes of the type definition of Angular, changing the timing of calls, or updating to a new version of a dependency of Angular, which includes breaking changes itself.

To support you in case of breaking changes in Angular:

* We follow our [deprecation policy](#deprecation-policy) before we remove a public API
* Support update automation via the `ng update` command. It provides code transformations which we often have tested ahead of time over hundreds of thousands of projects at Google
* Step by step instructions how to update from one major version to another at the ["Angular Update Guide"](update-guide)

You can `ng update` to any version of Angular, provided that the following criteria are met:

* The version you want to update *to* is supported.
* The version you want to update *from* is within one major version of the version you want to
    upgrade to.

For example, you can update from version 11 to version 12, provided that version 12 is still supported.
If you want to update across multiple major versions, perform each update one major version at a time.
For example, to update from version 10 to version 12:

1. Update from version 10 to version 11.
1. Update from version 11 to version 12.

### Developer Preview

Occasionally we introduce new APIs under the label of "Developer Preview". These are APIs that are fully functional and polished, but that we are not ready to stabilize under our normal deprecation policy.

This may be because we want to gather feedback from real applications before stabilization, or because the associated documentation or migration tooling is not fully complete. Feedback can be provided via a [GitHub issue](https://github.com/angular/angular/issues), where developers can share their experiences, report bugs, or suggest improvements to help refine the feature.

The policies and practices that are described in this document do not apply to APIs marked as Developer Preview. Such APIs can change at any time, even in new patch versions of the framework. Teams should decide for themselves whether the benefits of using Developer Preview APIs are worth the risk of breaking changes outside of our normal use of semantic versioning.



### Experimental

These APIs might not become stable at all or have significant changes before becoming stable.

The policies and practices that are described in this document do not apply to APIs marked as experimental. Such APIs can change at any time, even in new patch versions of the framework. Teams should decide for themselves whether the benefits of using experimental APIs are worth the risk of breaking changes outside of our normal use of semantic versioning.

---


(From roadmap.md)

<docs-decorative-header title="Angular Roadmap" imgSrc="adev/src/assets/images/roadmap.svg"> <!-- markdownlint-disable-line -->
Learn how the Angular team is building momentum on the web.
</docs-decorative-header>

As an open source project, Angular’s daily commits, PRs and momentum is all trackable on GitHub. To increase transparency into how this daily work connects to the framework’s future, our roadmap brings together the team’s current and future planned vision.

The following projects are not associated with a particular Angular version. We will release them on completion, and they will be part of a specific version based on our release schedule, following semantic versioning. For example, we release features in the next minor after completion or the next major if they include breaking changes.

Currently, Angular has two goals for the framework:

1. Improve the [Angular developer experience](#improving-the-angular-developer-experience) and
2. Improve the [framework’s performance](#fast-by-default).

Continue reading to learn how we plan to deliver these objectives with specific project work.

### Explore modern Angular

Start developing with the latest Angular features from our roadmap. This list represents the current status of new features from our roadmap:

#### Available to experiment with

* [Incremental hydration](/guide/incremental-hydration)
* [Zoneless change detection](/guide/zoneless)
* [Hydration support for i18n blocks](/api/platform-browser/withI18nSupport)
* [Resource API](/guide/signals/resource)
* [Effect API](/api/core/effect)
* [Linked Signal API](/guide/signals/linked-signal)

#### Production ready

* [Explore Angular Signals](/guide/signals)
* [Event replay with SSR](/api/platform-browser/withEventReplay)
* [Deferrable views](/guide/defer)
* [Built-in control flow](/guide/templates/control-flow)
* [Local variable declaration](/guide/templates/variables)
* [Signal inputs](/guide/signals/inputs)
* [Model inputs](/guide/signals/model)
* [Signal queries](/guide/signals/queries)
* [Function-based outputs](/guide/components/outputs)
* [Route-level render mode](/guide/ssr)

### Improving the Angular developer experience

#### Developer velocity

<docs-card-container>
  <docs-card title="Deliver Angular Signals" href="https://github.com/angular/angular/discussions/49685">
  This project rethinks the Angular reactivity model by introducing Signals as a reactivity primitive. The initial planning resulted in hundreds of discussions, conversations with developers, feedback sessions, user experience studies, and a series of RFCs, which received over 1,000 comments.

  As part of the v17 release, we graduated the Angular Signals library from developer preview. In v19 we moved signal-based queries, inputs, and model inputs to stable. Next, we'll need to finalize effects before we complete this project.
  </docs-card>
  <docs-card title="Zoneless Angular" href="">
  In v18 we shipped experimental zoneless support in Angular. It enables developers to use the framework without including zone.js in their bundle, which improves performance, debugging experience, and interoperability. As part of the initial release we also introduced zoneless support to the Angular CDK and Angular Material.

  In v19 we introduced zoneless support in server-side rendering, addressed some edge cases, and created a schematic to scaffold zoneless projects. We transitioned <a href="https://fonts.google.com/">Google Fonts</a> to zoneless which improved performance, developer experience, and allowed us to identify gaps that we need to address before moving this feature to developer preview. Stay tuned for more updates in the next months.
  </docs-card>
  <docs-card title="Signal integrations" href="">
  We're working towards improving the integration of fundamental Angular packages, such as forms, HTTP, and router, with Signals. As part of this project, we'll seek opportunities to introduce convenient signal-based APIs or wrappers to improve the holistic developer experience.
  </docs-card>
  <docs-card title="Signal debugging in Angular DevTools" href="">
  With the evolution of Signals in Angular, we are working on a better tooling for debugging them. High on the priority list is a UI for inspecting and debugging signals.
  </docs-card>
  <docs-card title="Improve HMR (Hot Module Reload)" href="https://github.com/angular/angular/issues/39367#issuecomment-1439537306">
  We're working towards faster edit/refresh cycle by enabling hot module replacement.

  In Angular v19 we shipped initial support for CSS and template HMR. We'll continue collecting feedback to make sure we're addressing developers' needs before we mark this project as complete.
  </docs-card>
</docs-card-container>

#### Improve Angular Material and the CDK

<docs-card-container>
  <docs-card title="New CDK primitives" href="">
  We are working on new CDK primitives to facilitate creating custom components based on the WAI-ARIA design patterns for [Combobox](https://www.w3.org/TR/wai-aria-practices-1.1/#combobox). Angular v14 introduced stable [menu and dialog primitives](https://material.angular.dev/cdk/categories) as part of this project, and in v15 Listbox.
  </docs-card>
  <docs-card title="Angular component accessibility" href="">
  We are evaluating components in Angular Material against accessibility standards such as WCAG and working to fix any issues that arise from this process.
  </docs-card>
</docs-card-container>

#### Improve tooling

<docs-card-container>
  <docs-card title="Modernize unit testing tooling with ng test" href="">
  In v12, we revisited the Angular end-to-end testing experience by replacing Protractor with modern alternatives such as Cypress, Nightwatch, Puppeteer, Playwright, and Webdriver.io. Next, we'd like to tackle `ng test` to modernize Angular's unit testing experience.

  We're currently evaluating Web Test Runner, Vitest, and Jest as candidates for a new test runner for Angular projects while preserving Jasmine as assertion library to not break existing tests.
  </docs-card>
  <docs-card title="Evaluating Nitro support in the Angular CLI" href="https://nitro.unjs.io/">
  We're excited about the set of features that Nitro offers such as more deployment options, improved compatibility of server-side rendering with different runtimes and file-based routing. In 2025 we'll evaluate how it fits in the Angular server-side rendering model.

  We'll share updates as we make progress in this investigation.
  </docs-card>
</docs-card-container>

### Fast by default

<docs-card-container>
  <docs-card title="Enable incremental hydration" href="">
  In v17 we graduated hydration from developer preview and we've been consistently observing 40-50% improvements in LCP. Since then we started prototyping incremental hydration and shared a demo on stage at ng-conf.

  In v19 we shipped the incremental hydration in developer preview mode, powered by `@defer` blocks. Give it a try and <a href="https://github.com/angular/angular/issues">share your feedback</a> with us!
  </docs-card>
  <docs-card title="Server route configuration" href="">
  We're working towards enabling a more ergonomic route configuration on the server. We want to make it trivial to declare which routes should be server-side rendered, prerendered or client-side rendered.

  In Angular v19 we shipped developer preview of route-level render mode which allows you to granularly configure which routes you want Angular to prerender, server-side render or client-side render.
  </docs-card>
</docs-card-container>

### Future work, explorations, and prototyping

This section represents explorations and prototyping of potential future projects. A reasonable outcome is to decide that our current solutions are the best options. Other projects may result in RFCs, graduating to in-progress projects, or being deprioritized as the web continues to innovate along with our framework.

<docs-card-container>
  <docs-card title="Signal Forms" href="">
  We plan to analyze existing feedback about Angular forms and design a solution which addresses developers' requirements and uses Signals for management of reactive state.
  </docs-card>
  <docs-card title="Selectorless" href="">
  To reduce boilerplate and improve the ergonomics of standalone components we are now designing a solution that will make selectors optional. To use a component or directive you'll be able to import it and directly use it in a component's template.

  We're still in early stages of planning selectorless. We'll share a request for comments when we have an early design and we're ready for next steps.
  </docs-card>
  <docs-card title="Exploration of streamed server-side rendering" href="">
  Over the past few releases we've been working on making Angular's server-side rendering story more robust. On our priority list is to explore streamed server-side rendering for zoneless application.
  </docs-card>
  <docs-card title="Investigation for authoring format improvements" href="">
  Based on our developer surveys' results we saw there are opportunities for improving the ergonomics of the component authoring format. The first step of the process will be to gather requirements and understand the problem space in advanced to an RFC. We'll share updates as we make progress. High priority in the future work will be backward compatibility and interoperability.
  </docs-card>
  <docs-card title="Improve TestBed" href="">
  Based on feedback over the years and the recent updates in Angular's runtime, we'll evaluate TestBed to identify opportunities to improve developer experience and reduce boilerplate when developing unit tests.
  </docs-card>
  <docs-card title="Incremental adoption" href="">
  Angular has been lacking the tools and the flexibility to add interactivity to a multi-page app or embed an Angular component inside of an existing app built with a different framework.

  As part of this project, we'll explore the requirement space of cross framework interop and our build tooling offering to make this use case possible.
  </docs-card>
</docs-card-container>

### Completed projects

<docs-card-container>
  <docs-card title="Support two-dimensional drag-and-drop" link="Completed in Q2 2024" href="https://github.com/angular/components/issues/13372">
  As part of this project, we implemented mixed orientation support for the Angular CDK drag and drop. This is one of the repository's most highly requested features.
  </docs-card>
  <docs-card title="Event replay with SSR and prerendering" link="Completed in Q4 2024" href="https://angular.dev/api/platform-browser/withEventReplay">
  In v18 we introduced an event replay functionality when using server-side rendering or prerendering. For this feature we depend on the event dispatch primitive (previously known as jsaction) that is running on Google.com.

  In Angular v19 we graduated event replay to stable and enabled it by default for all new projects.
  </docs-card>
  <docs-card title="Integrate Angular Language Service with Schematics" link="Completed in Q4 2024" href="">
  To make it easier for developers to use modern Angular APIs, we enabled integration between the Angular language service and schematics which allows you to refactor your app with a single click.
  </docs-card>
  <docs-card title="Streamline standalone imports with Language Service" link="Completed in Q4 2024" href="">
  As part of this initiative, the language service automatically imports components and pipes in standalone and NgModule-based apps. Additionally, we've added a template diagnostic to highlight unused imports in standalone components, which should help make application bundles smaller.
  </docs-card>
  <docs-card title="Local template variables" link="Completed in Q3 2024">
  We've released the support for local template variables in Angular, see [`@let` docs](https://angular.dev/api/core/@let) for additional information.
  </docs-card>
  <docs-card title="Expand the customizability of Angular Material" link="Completed in Q2 2024" href="https://material.angular.dev/guide/theming">
  To provide better customization of our Angular Material components and enable Material 3 capabilities, we'll be collaborating with Google's Material Design team on defining token-based theming APIs.

  In v17.2 we shared experimental support for Angular Material 3 and in v18 we graduated it to stable.
  </docs-card>
  <docs-card title="Introduce deferred loading" link="Completed in Q2 2024" href="https://next.angular.dev/guide/defer">
  In v17 we shipped deferrable views in developer preview, which provide an ergonomic API for deferred code loading. In v18 we enabled deferrable views for library developers and graduated the API to stable.
  </docs-card>
  <docs-card title="iframe support in Angular DevTools" link="Completed in Q2 2024" href="">
  We enabled debugging and profiling of Angular apps embedded within an iframe on the page.
  </docs-card>
  <docs-card title="Automation for transition of existing hybrid rendering projects to esbuild and vite" link="Completed in Q2 2024" href="tools/cli/build-system-migration">
  In v17 we shipped a vite and esbuild-based application builder and enabled it for new projects by default. It improves build time for projects using hybrid rendering with up to 87%. As part of v18 we shipped schematics and a guide that migrate existing projects using hybrid rendering to the new build pipeline.
  </docs-card>
  <docs-card title="Make Angular.dev the official home for Angular developers" link="Completed in Q2 2024" href="https://goo.gle/angular-dot-dev">
  Angular.dev is the new site, domain and home for Angular development. The new site contains updated documentation, tutorials and guidance that will help developers build with Angular’s latest features.
  </docs-card>
  <docs-card title="Introduce built-in control flow" link="Completed in Q2 2024" href="https://next.angular.dev/essentials/conditionals-and-loops">
  In v17 we shipped a developer preview version of a new control flow. It brings significant performance improvements and better ergonomics for template authoring. We also provided a migration of existing `*ngIf`, `*ngFor`, and `*ngSwitch` which you can run to move your project to the new implementation. As of v18 the built-in control flow is now stable.
  </docs-card>
  <docs-card title="Modernize getting started tutorial" link="Completed Q4 2023" href="">
  Over the past two quarters, we developed a new [video](https://www.youtube.com/watch?v=xAT0lHYhHMY&list=PL1w1q3fL4pmj9k1FrJ3Pe91EPub2_h4jF) and [textual](https://angular.dev/tutorials/learn-angular) tutorial based on standalone components.
  </docs-card>
  <docs-card title="Investigate modern bundlers" link="Completed Q4 2023" href="guide/hydration">
  In Angular v16, we released a developer preview of an esbuild-based builder with support for `ng build` and `ng serve`. The `ng serve` development server uses Vite and a multi-file compilation by esbuild and the Angular compiler. In v17 we graduated the build tooling from developer preview and enabled it by default for new projects.
  </docs-card>
  <docs-card title="Introduce dependency injection debugging APIs" link="Completed Q4 2023" href="tools/devtools">
  To improve the debugging utilities of Angular and Angular DevTools, we'll work on APIs that provide access to the dependency injection runtime. As part of the project, we'll expose debugging methods that allow us to explore the injector hierarchy and the dependencies across their associated providers. As of v17, we shipped a feature that enables us to plug into the dependency injection life-cycle. We also launched a visualization of the injector tree and inspection of the providers declared inside each individual node,
  </docs-card>
  <docs-card title="Improve documentation and schematics for standalone components" link="Completed Q4 2023" href="components">
  We released a developer preview of the `ng new --standalone` schematics collection, allowing you to create apps free of NgModules. In v17 we switched the new application authoring format to standalone APIs and changed the documentation to reflect the recommendation. Additionally, we shipped schematics which support updating existing applications to standalone components, directives, and pipes. Even though NgModules will stick around for foreseeable future, we recommend you to explore the benefits of the new APIs to improve developer experience and benefit from the new features we build for them.
  </docs-card>
  <docs-card title="Explore hydration and server-side rendering improvements" link="Completed Q4 2023">
  In v16, we released a developer preview of non-destructive full hydration, see the [hydration guide](guide/hydration) and the [blog post](https://blog.angular.dev/whats-next-for-server-side-rendering-in-angular-2a6f27662b67) for additional information. We're already seeing significant improvements to Core Web Vitals, including [LCP](https://web.dev/lcp) and [CLS](https://web.dev/cls). In lab tests, we consistently observed 45% better LCP of a real-world app.

  In v17 we launched hydration outside developer preview and did a series of improvements in the server-side rendering story, including: route discovery at runtime for SSG, up to 87% faster build times for hybrid rendered applications, prompt that enables hybrid rendering for new projects.
  </docs-card>
  <docs-card title="Non-destructive full app hydration" link="Completed Q1 2023" href="guide/hydration">
  In v16, we released a developer preview of non-destructive full hydration, which allows Angular to reuse existing DOM nodes on a server-side rendered page, instead of re-creating an app from scratch. See additional information in the hydration guide.
  </docs-card>
  <docs-card title="Improvements in the image directive" link="Completed Q1 2023" href="guide/image-optimization">
  We released the Angular image directive as stable in v15. We introduced a new fill mode feature that enables images to fit within their parent container rather than having explicit dimensions. Over the past two months, the Chrome Aurora team backported the directive to v12 and newer.
  </docs-card>
  <docs-card title="Documentation refactoring" link="Completed Q1 2023" href="https://angular.io">
  Ensure all existing documentation fits into a consistent set of content types. Update excessive use of tutorial-style documentation into independent topics. We want to ensure the content outside the main tutorials is self-sufficient without being tightly coupled to a series of guides. In Q2 2022, we refactored the template content and dependency injection. In Q1 2023, we improved the HTTP guides, and with this, we're putting the documentation refactoring project on hold.
  </docs-card>
  <docs-card title="Improve image performance" link="Completed Q4 2022" href="guide/image-optimization">
  The Aurora and the Angular teams are working on the implementation of an image directive that aims to improve Core Web Vitals. We shipped a stable version of the image directive in v15.
  </docs-card>
  <docs-card title="Modern CSS" link="Completed Q4 2022" href="https://blog.angular.dev/modern-css-in-angular-layouts-4a259dca9127">
  The Web ecosystem evolves constantly and we want to reflect the latest modern standards in Angular. In this project we aim to provide guidelines on using modern CSS features in Angular to ensure developers follow best practices for layout, styling, etc. We shared official guidelines for layout and as part of the initiative stopped publishing flex layout.
  </docs-card>
  <docs-card title="Support adding directives to host elements" link="Completed Q4 2022" href="guide/directives/directive-composition-api">
  A long-standing feature request is to add the ability to add directives to host elements. The feature lets developers augment their own components with additional behaviors without using inheritance. In v15 we shipped our directive composition API, which enables enhancing host elements with directives.
  </docs-card>
  <docs-card title="Better stack traces" link="Completed Q4 2022" href="https://developer.chrome.com/blog/devtools-better-angular-debugging/">
  The Angular and the Chrome DevTools are working together to enable more readable stack traces for error messages. In v15 we released improved relevant and linked stack traces. As a lower priority initiative, we'll be exploring how to make the stack traces friendlier by providing more accurate call frame names for templates.
  </docs-card>
  <docs-card title="Enhanced Angular Material components by integrating MDC Web" link="Completed Q4 2022" href="https://material.angular.dev/guide/mdc-migration">
  MDC Web is a library created by the Google Material Design team that provides reusable primitives for building Material Design components. The Angular team is incorporating these primitives into Angular Material. Using MDC Web aligns Angular Material more closely with the Material Design specification, expands accessibility, improves component quality, and improves the velocity of our team.
  </docs-card>
  <docs-card title="Implement APIs for optional NgModules" link="Completed Q4 2022" href="https://blog.angular.dev/angular-v15-is-now-available-df7be7f2f4c8">
  In the process of making Angular simpler, we are working on introducing APIs that allow developers to initialize apps, instantiate components, and use the router without NgModules. Angular v14 introduces developer preview of the APIs for standalone components, directives, and pipes. In the next few quarters we'll collect feedback from developers and finalize the project making the APIs stable. As the next step we will work on improving use cases such as TestBed, Angular elements, etc.
  </docs-card>
  <docs-card title="Allow binding to protected fields in templates" link="Completed Q2 2022" href="guide/templates/binding">
  To improve the encapsulation of Angular components we enabled binding to protected members of the component instance. This way you'll no longer have to expose a field or a method as public to use it inside your templates.
  </docs-card>
  <docs-card title="Publish guides on advanced concepts" link="Completed Q2 2022" href="https://angular.io/guide/change-detection">
  Develop and publish an in-depth guide on change detection. Develop content for performance profiling of Angular apps. Cover how change detection interacts with Zone.js and explain when it gets triggered, how to profile its duration, as well as common practices for performance optimization.
  </docs-card>
  <docs-card title="Rollout strict typings for @angular/forms" link="Completed Q2 2022" href="guide/forms/typed-forms">
  In Q4 2021 we designed a solution for introducing strict typings for forms and in Q1 2022 we concluded the corresponding request for comments. Currently, we are implementing a rollout strategy with an automated migration step that will enable the improvements for existing projects. We are first testing the solution with more than 2,500 projects at Google to ensure a smooth migration path for the external community.
  </docs-card>
  <docs-card title="Remove legacy View Engine" link="Completed Q1 2022" href="https://blog.angular.dev/angular-v15-is-now-available-df7be7f2f4c8">
  After the transition of all our internal tooling to Ivy is completed, we will remove the legacy View Engine for reduced Angular conceptual overhead, smaller package size, lower maintenance cost, and lower codebase complexity.
  </docs-card>
  <docs-card title="Simplified Angular mental model with optional NgModules" link="Completed Q1 2022" href="https://blog.angular.dev/angular-v15-is-now-available-df7be7f2f4c8">
  To simplify the Angular mental model and learning journey, we will be working on making NgModules optional. This work lets developers develop standalone components and implement an alternative API for declaring the compilation scope of the component. We kicked this project off with high-level design discussions that we captured in an RFC.
  </docs-card>
  <docs-card title="Design strict typing for @angular/forms" link="Completed Q1 2022" href="guide/forms/typed-forms">
  We will work on finding a way to implement stricter type checking for reactive forms with minimal backward incompatible implications. This way, we let developers catch more issues during development time, enable better text editor and IDE support, and improve the type checking for reactive forms.
  </docs-card>
  <docs-card title="Improve integration of Angular DevTools with framework" link="Completed Q1 2022" href="tools/devtools">
  To improve the integration of Angular DevTools with the framework, we are working on moving the codebase to the angular/angular monorepository. This includes transitioning Angular DevTools to Bazel and integrating it into the existing processes and CI pipeline.
  </docs-card>
  <docs-card title="Launch advanced compiler diagnostics" link="Completed Q1 2022" href="reference/extended-diagnostics">
  Extend the diagnostics of the Angular compiler outside type checking. Introduce other correctness and conformance checks to further guarantee correctness and best practices.
  </docs-card>
  <docs-card title="Update our e2e testing strategy" link="Completed Q3 2021" href="guide/testing">
  To ensure we provide a future-proof e2e testing strategy, we want to evaluate the state of Protractor, community innovations, e2e best practices, and explore novel opportunities. As first steps of the effort, we shared an RFC and worked with partners to ensure smooth integration between the Angular CLI and state-of-the-art tooling for e2e testing. As the next step, we need to finalize the recommendations and compile a list of resources for the transition.
  </docs-card>
  <docs-card title="Angular libraries use Ivy" link="Completed Q3 2021" href="tools/libraries">
  Earlier in 2020, we shared an RFC for Ivy library distribution. After invaluable feedback from the community, we developed a design of the project. We are now investing in the development of Ivy library distribution, including an update of the library package format to use Ivy compilation, unblock the deprecation of the View Engine library format, and ngcc.
  </docs-card>
  <docs-card title="Improve test times and debugging with automatic test environment tear down" link="Completed Q3 2021" href="guide/testing">
  To improve test time and create better isolation across tests, we want to change TestBed to automatically clean up and tear down the test environment after each test run.
  </docs-card>
  <docs-card title="Deprecate and remove IE11 support" link="Completed Q3 2021" href="https://github.com/angular/angular/issues/41840">
  Internet Explorer 11 (IE11) has been preventing Angular from taking advantage of some of the modern features of the Web platform. As part of this project we are going to deprecate and remove IE11 support to open the path for modern features that evergreen browsers provide. We ran an RFC to collect feedback from the community and decide on next steps to move forward.
  </docs-card>
  <docs-card title="Leverage ES2017+ as the default output language" link="Completed Q3 2021" href="https://www.typescriptlang.org/docs/handbook/tsconfig-json.html">
  Supporting modern browsers lets us take advantage of the more compact, expressive, and performant new syntax of JavaScript. As part of this project we will investigate what the blockers are to moving forward with this effort, and take the steps to enable it.
  </docs-card>
  <docs-card title="Accelerated debugging and performance profiling with Angular DevTools" link="Completed Q2 2021" href="tools/devtools">
  We are working on development tooling for Angular that provides utilities for debugging and performance profiling. This project aims to help developers understand the component structure and the change detection in an Angular app.
  </docs-card>
  <docs-card title="Streamline releases with consolidated Angular versioning & branching" link="Completed Q2 2021" href="reference/releases">
  We want to consolidate release management tooling between the multiple GitHub repositories for Angular (angular/angular, angular/angular-cli, and angular/components). This effort lets us reuse infrastructure, unify and simplify processes, and improve the reliability of our release process.
  </docs-card>
  <docs-card title="Higher developer consistency with commit message standardization" link="Completed Q2 2021" href="https://github.com/angular/angular">
  We want to unify commit message requirements and conformance across Angular repositories (angular/angular, angular/components, and angular/angular-cli) to bring consistency to our development process and reuse infrastructure tooling.
  </docs-card>
  <docs-card title="Transition the Angular language service to Ivy" link="Completed Q2 2021" href="tools/language-service">
  The goal of this project is to improve the experience and remove legacy dependency by transitioning the language service to Ivy. Today the language service still uses the View Engine compiler and type checking, even for Ivy apps. We want to use the Ivy template parser and improved type checking for the Angular Language service to match app behavior. This migration is also a step towards unblocking the removal of View Engine, which will simplify Angular, reduce the npm package size, and improve the maintainability of the framework.
  </docs-card>
  <docs-card title="Increased security with native Trusted Types in Angular" link="Completed Q2 2021" href="best-practices/security">
  In collaboration with the Google security team, we are adding support for the new Trusted Types API. This web platform API helps developers build more secure web apps.
  </docs-card>
  <docs-card title="Optimized build speed and bundle sizes with Angular CLI webpack 5" link="Completed Q2 2021" href="tools/cli/build">
  As part of the v11 release, we introduced an opt-in preview of webpack 5 in the Angular CLI. To ensure stability, we will continue iterating on the implementation to enable build speed and bundle size improvements.
  </docs-card>
  <docs-card title="Faster apps by inlining critical styles in Universal apps" link="Completed Q1 2021" href="guide/ssr">
  Loading external stylesheets is a blocking operation, which means that the browser cannot start rendering your app until it loads all the referenced CSS. Having render-blocking resources in the header of a page can significantly impact its load performance, for example, its first contentful paint. To make apps faster, we have been collaborating with the Google Chrome team on inlining critical CSS and loading the rest of the styles asynchronously.
  </docs-card>
  <docs-card title="Improve debugging with better Angular error messages" link="Completed Q1 2021" href="reference/errors">
  Error messages often bring limited actionable information to help developers resolve them. We have been working on making error messages more discoverable by adding associated codes, developing guides, and other materials to ensure a smoother debugging experience.
  </docs-card>
  <docs-card title="Improved developer onboarding with refreshed introductory documentation" link="Completed Q1 2021" href="tutorials">
  We will redefine the user learning journeys and refresh the introductory documentation. We will clearly state the benefits of Angular, how to explore its capabilities and provide guidance so developers can become proficient with the framework in as little time as possible.
  </docs-card>
  <docs-card title="Expand component harnesses best practices" link="Completed Q1 2021" href="https://material.angular.dev/guide/using-component-harnesses">
  Angular CDK introduced the concept of component test harnesses to Angular in version 9. Test harnesses let component authors create supported APIs for testing component interactions. We are continuing to improve this harness infrastructure and clarifying the best practices around using harnesses. We are also working to drive more harness adoption inside of Google.
  </docs-card>
  <docs-card title="Author a guide for content projection" link="Completed Q2 2021" href="https://angular.io/docs">
  Content projection is a core Angular concept that does not have the presence it deserves in the documentation. As part of this project we want to identify the core use cases and concepts for content projection and document them.
  </docs-card>
  <docs-card title="Migrate to ESLint" link="Completed Q4 2020" href="tools/cli">
  With the deprecation of TSLint we will be moving to ESLint. As part of the process, we will work on ensuring backward compatibility with our current recommended TSLint configuration, implement a migration strategy for existing Angular apps and introduce new tooling to the Angular CLI toolchain.
  </docs-card>
  <docs-card title="Operation Bye Bye Backlog (also known as Operation Byelog)" link="Completed Q4 2020" href="https://github.com/angular/angular/issues">
  We are actively investing up to 50% of our engineering capacity on triaging issues and PRs until we have a clear understanding of broader community needs. After that, we will commit up to 20% of our engineering capacity to keep up with new submissions promptly.
  </docs-card>
</docs-card-container>

---


(From versions.md)

## Version compatibility

The following tables describe the versions of Node.js, TypeScript, and RxJS that each version of
Angular requires.

### Actively supported versions

This table covers [Angular versions under active support](reference/releases#actively-supported-versions).

| Angular            | Node.js                              | TypeScript     | RxJS               |
| ------------------ | ------------------------------------ | -------------- | ------------------ |
| 20.0.x             | ^20.19.0 \|\| ^22.12.0 \|\| ^24.0.0  | >=5.8.0 <5.9.0 | ^6.5.3 \|\| ^7.4.0 |
| 19.2.x             | ^18.19.1 \|\| ^20.11.1 \|\| ^22.0.0  | >=5.5.0 <5.9.0 | ^6.5.3 \|\| ^7.4.0 |
| 19.1.x             | ^18.19.1 \|\| ^20.11.1 \|\| ^22.0.0  | >=5.5.0 <5.8.0 | ^6.5.3 \|\| ^7.4.0 |
| 19.0.x             | ^18.19.1 \|\| ^20.11.1 \|\| ^22.0.0  | >=5.5.0 <5.7.0 | ^6.5.3 \|\| ^7.4.0 |
| 18.1.x \|\| 18.2.x | ^18.19.1 \|\| ^20.11.1 \|\| ^22.0.0  | >=5.4.0 <5.6.0 | ^6.5.3 \|\| ^7.4.0 |
| 18.0.x             | ^18.19.1 \|\| ^20.11.1 \|\| ^22.0.0  | >=5.4.0 <5.5.0 | ^6.5.3 \|\| ^7.4.0 |

### Unsupported Angular versions

This table covers Angular versions that are no longer under long-term support (LTS). This
information was correct when each version went out of LTS and is provided without any further
guarantees. It is listed here for historical reference.

| Angular            | Node.js                              | TypeScript     | RxJS               |
| ------------------ | ------------------------------------ | -------------- | ------------------ |
| 17.3.x             | ^18.13.0 \|\| ^20.9.0                | >=5.2.0 <5.5.0 | ^6.5.3 \|\| ^7.4.0 |
| 17.1.x \|\| 17.2.x | ^18.13.0 \|\| ^20.9.0                | >=5.2.0 <5.4.0 | ^6.5.3 \|\| ^7.4.0 |
| 17.0.x             | ^18.13.0 \|\| ^20.9.0                | >=5.2.0 <5.3.0 | ^6.5.3 \|\| ^7.4.0 |
| 16.1.x \|\| 16.2.x | ^16.14.0 \|\| ^18.10.0               | >=4.9.3 <5.2.0 | ^6.5.3 \|\| ^7.4.0 |
| 16.0.x             | ^16.14.0 \|\| ^18.10.0               | >=4.9.3 <5.1.0 | ^6.5.3 \|\| ^7.4.0 |
| 15.1.x \|\| 15.2.x | ^14.20.0 \|\| ^16.13.0 \|\| ^18.10.0 | >=4.8.2 <5.0.0 | ^6.5.3 \|\| ^7.4.0 |
| 15.0.x             | ^14.20.0 \|\| ^16.13.0 \|\| ^18.10.0 | ~4.8.2         | ^6.5.3 \|\| ^7.4.0 |
| 14.2.x \|\| 14.3.x | ^14.15.0 \|\| ^16.10.0               | >=4.6.2 <4.9.0 | ^6.5.3 \|\| ^7.4.0 |
| 14.0.x \|\| 14.1.x | ^14.15.0 \|\| ^16.10.0               | >=4.6.2 <4.8.0 | ^6.5.3 \|\| ^7.4.0 |
| 13.3.x \|\| 13.4.x | ^12.20.0 \|\| ^14.15.0 \|\| ^16.10.0 | >=4.4.3 <4.7.0 | ^6.5.3 \|\| ^7.4.0 |
| 13.1.x \|\| 13.2.x | ^12.20.0 \|\| ^14.15.0 \|\| ^16.10.0 | >=4.4.3 <4.6.0 | ^6.5.3 \|\| ^7.4.0 |
| 13.0.x             | ^12.20.0 \|\| ^14.15.0 \|\| ^16.10.0 | ~4.4.3         | ^6.5.3 \|\| ^7.4.0 |
| 12.2.x             | ^12.14.0 \|\| ^14.15.0               | >=4.2.3 <4.4.0 | ^6.5.3 \|\| ^7.0.0 |
| 12.1.x             | ^12.14.0 \|\| ^14.15.0               | >=4.2.3 <4.4.0 | ^6.5.3             |
| 12.0.x             | ^12.14.0 \|\| ^14.15.0               | ~4.2.3         | ^6.5.3             |
| 11.2.x             | ^10.13.0 \|\| ^12.11.0               | >=4.0.0 <4.2.0 | ^6.5.3             |
| 11.1.x             | ^10.13.0 \|\| ^12.11.0               | >=4.0.0 <4.2.0 | ^6.5.3             |
| 11.0.x             | ^10.13.0 \|\| ^12.11.0               | ~4.0.0         | ^6.5.3             |
| 10.2.x             | ^10.13.0 \|\| ^12.11.0               | >=3.9.0 <4.1.0 | ^6.5.3             |
| 10.1.x             | ^10.13.0 \|\| ^12.11.0               | >=3.9.0 <4.1.0 | ^6.5.3             |
| 10.0.x             | ^10.13.0 \|\| ^12.11.0               | ~3.9.0         | ^6.5.3             |
| 9.1.x              | ^10.13.0 \|\| ^12.11.0               | >=3.6.0 <3.9.0 | ^6.5.3             |
| 9.0.x              | ^10.13.0 \|\| ^12.11.0               | >=3.6.0 <3.8.0 | ^6.5.3             |

#### Before v9

Until Angular v9, Angular and Angular CLI versions were not synced.

| Angular                     | Angular CLI                 | Node.js             | TypeScript     | RxJS   |
| --------------------------- | --------------------------- | ------------------- | -------------- | ------ |
| 8.2.x                       | 8.2.x \|\| 8.3.x            | ^10.9.0             | >=3.4.2 <3.6.0 | ^6.4.0 |
| 8.0.x \|\| 8.1.x            | 8.0.x \|\| 8.1.x            | ^10.9.0             | ~3.4.2         | ^6.4.0 |
| 7.2.x                       | 7.2.x \|\| 7.3.x            | ^8.9.0 \|\| ^10.9.0 | >=3.1.3 <3.3.0 | ^6.0.0 |
| 7.0.x \|\| 7.1.x            | 7.0.x \|\| 7.1.x            | ^8.9.0 \|\| ^10.9.0 | ~3.1.3         | ^6.0.0 |
| 6.1.x                       | 6.1.x \|\| 6.2.x            | ^8.9.0              | >=2.7.2 <3.0.0 | ^6.0.0 |
| 6.0.x                       | 6.0.x                       | ^8.9.0              | ~2.7.2         | ^6.0.0 |
| 5.2.x                       | 1.6.x \|\| 1.7.x            | ^6.9.0 \|\| ^8.9.0  | >=2.4.2 <2.7.0 | ^5.5.0 |
| 5.0.x \|\| 5.1.x            | 1.5.x                       | ^6.9.0 \|\| ^8.9.0  | ~2.4.2         | ^5.5.0 |
| 4.2.x \|\| 4.3.x \|\| 4.4.x | 1.4.x                       | ^6.9.0 \|\| ^8.9.0  | >=2.1.6 <2.5.0 | ^5.0.1 |
| 4.2.x \|\| 4.3.x \|\| 4.4.x | 1.3.x                       | ^6.9.0              | >=2.1.6 <2.5.0 | ^5.0.1 |
| 4.0.x \|\| 4.1.x            | 1.0.x \|\| 1.1.x \|\| 1.2.x | ^6.9.0              | >=2.1.6 <2.4.0 | ^5.0.1 |
| 2.x                         | -                           | ^6.9.0              | >=1.8.0 <2.2.0 | ^5.0.1 |

### Browser support

Angular uses the ["widely available" Baseline](https://web.dev/baseline) to define browser
support. For each major version, Angular supports browsers included in the Baseline of a
chosen date near the release date for that major.

The "widely available" Baseline includes browsers released less than 30 months (2.5 years)
of the chosen date within Baseline's core browser set (Chrome, Edge, Firefox, Safari) and
targets supporting approximately 95% of web users.

| Angular | Baseline Date | Browser Set                 |
| ------- | ------------- | --------------------------- |
| v20     | 2025-04-30    | [Browser Set][browsers-v20] |

[browsers-v20]: https://browsersl.ist/#q=Chrome+%3E%3D+105%0AChromeAndroid+%3E%3D+105%0AEdge+%3E%3D+105%0AFirefox+%3E%3D+104%0AFirefoxAndroid+%3E%3D+104%0ASafari+%3E%3D+16%0AiOS+%3E%3D+16

Angular versions prior to v20 support the following specific browser versions:

| Browser | Supported versions                          |
| :------ | :------------------------------------------ |
| Chrome  | 2 most recent versions                      |
| Firefox | latest and extended support release \(ESR\) |
| Edge    | 2 most recent major versions                |
| Safari  | 2 most recent major versions                |
| iOS     | 2 most recent major versions                |
| Android | 2 most recent major versions                |

### Polyfills

Angular is built on the latest standards of the web platform.
Targeting such a wide range of browsers is challenging because they do not support all features of modern browsers.
You compensate by loading polyfill scripts \("polyfills"\) for the browsers that you must support.
See instructions on how to include polyfills into your project below.

IMPORTANT: The suggested polyfills are the ones that run full Angular applications.
You might need additional polyfills to support features not covered by this list.

HELPFUL: Polyfills cannot magically transform an old, slow browser into a modern, fast one.

### Enabling polyfills with CLI projects

The [Angular CLI](tools/cli) provides support for polyfills.
If you are not using the CLI to create your projects, see [Polyfill instructions for non-CLI users](#polyfills-for-non-cli-users).

The `polyfills` options of the [browser and test builder](tools/cli/cli-builder) can be a full path for a file \(Example: `src/polyfills.ts`\) or,
relative to the current workspace or module specifier \(Example: `zone.js`\).

If you create a TypeScript file, make sure to include it in the `files` property of your `tsconfig` file.

<docs-code language="json">
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    ...
  },
  "files": [
    "src/main.ts",
    "src/polyfills.ts"
  ]
  ...
}
</docs-code>

### Polyfills for non-CLI users

If you are not using the CLI, add your polyfill scripts directly to the host web page \(`index.html`\).

For example:

<docs-code header="src/index.html" language="html">
<!-- pre-zone polyfills -->
<script src="node_modules/core-js/client/shim.min.js"></script>
<script>
  /**
   * you can configure some zone flags which can disable zone interception for some
   * asynchronous activities to improve startup performance - use these options only
   * if you know what you are doing as it could result in hard to trace down bugs.
   */
  // &lowbar;&lowbar;Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame
  // &lowbar;&lowbar;Zone_disable_on_property = true; // disable patch onProperty such as onclick
  // &lowbar;&lowbar;zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove']; // disable patch specified eventNames
  /*
   * in Edge developer tools, the addEventListener will also be wrapped by zone.js
   * with the following flag, it will bypass `zone.js` patch for Edge.
   */
  // &lowbar;&lowbar;Zone_enable_cross_context_check = true;
</script>
<!-- zone.js required by Angular -->
<script src="node_modules/zone.js/bundles/zone.umd.js"></script>
<!-- application polyfills -->
</docs-code>

---