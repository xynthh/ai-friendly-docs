# Libraries

(From angular-package-format.md)

## Angular package format

This document describes the Angular Package Format \(APF\).
APF is an Angular specific specification for the structure and format of npm packages that is used by all first-party Angular packages \(`@angular/core`, `@angular/material`, etc.\) and most third-party Angular libraries.

APF enables a package to work seamlessly under most common scenarios that use Angular.
Packages that use APF are compatible with the tooling offered by the Angular team as well as wider JavaScript ecosystem.
It is recommended that third-party library developers follow the same npm package format.

HELPFUL: APF is versioned along with the rest of Angular, and every major version improves the package format.
You can find the versions of the specification prior to v13 in this [google doc](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview).

### Why specify a package format?

In today's JavaScript landscape, developers consume packages in many different ways, using many different toolchains \(webpack, Rollup, esbuild, etc.\).
These tools may understand and require different inputs - some tools may be able to process the latest ES language version, while others may benefit from directly consuming an older ES version.

The Angular distribution format supports all of the commonly used development tools and workflows, and adds emphasis on optimizations that result either in smaller application payload size or faster development iteration cycle \(build time\).

Developers can rely on Angular CLI and [ng-packagr](https://github.com/ng-packagr/ng-packagr) \(a build tool Angular CLI uses\) to produce packages in the Angular package format.
See the [Creating Libraries](tools/libraries/creating-libraries) guide for more details.

### File layout

The following example shows a simplified version of the `@angular/core` package's file layout, with an explanation for each file in the package.

```markdown
node_modules/@angular/core
├── README.md
├── package.json
├── index.d.ts
├── fesm2022
│   ├── core.mjs
│   ├── core.mjs.map
│   ├── testing.mjs
│   └── testing.mjs.map
└── testing
    └── index.d.ts
```

This table describes the file layout under `node_modules/@angular/core` annotated to describe the purpose of files and directories:

| Files                                                                                                                                                     | Purpose |
|:---                                                                                                                                                       |:---     |
| `README.md`                                                                                                                                               | Package README, used by npmjs web UI.                                                                                                                                                                          |
| `package.json`                                                                                                                                            | Primary `package.json`, describing the package itself as well as all available entrypoints and code formats. This file contains the "exports" mapping used by runtimes and tools to perform module resolution. |
| `index.d.ts`                                                                                                                                               | Bundled `.d.ts` for the primary entrypoint `@angular/core`.                                                                                                                                                    |
| `fesm2022/` <br /> &nbsp;&nbsp;─ `core.mjs` <br /> &nbsp;&nbsp;─ `core.mjs.map` <br /> &nbsp;&nbsp;─ `testing.mjs` <br /> &nbsp;&nbsp;─ `testing.mjs.map` | Code for all entrypoints in flattened \(FESM\) ES2022 format, along with source maps.                                                                                                                           |
| `testing/`                                                                                                                                                | Directory representing the "testing" entrypoint.                                                                                                                                                               |
| `testing/index.d.ts`                                                                                                                                    | Bundled `.d.ts` for the `@angular/core/testing` entrypoint.                                                                                                                                                     |

### `package.json`

The primary `package.json` contains important package metadata, including the following:

* It [declares](#esm-declaration) the package to be in EcmaScript Module \(ESM\) format
* It contains an [`"exports"` field](#exports) which defines the available source code formats of all entrypoints
* It contains [keys](#legacy-resolution-keys) which define the available source code formats of the primary `@angular/core` entrypoint, for tools which do not understand `"exports"`.
    These keys are considered deprecated, and could be removed as the support for `"exports"` rolls out across the ecosystem.

* It declares whether the package contains [side effects](#side-effects)

#### ESM declaration

The top-level `package.json` contains the key:

<docs-code language="javascript">

{
  "type": "module"
}

</docs-code>

This informs resolvers that code within the package is using EcmaScript Modules as opposed to CommonJS modules.

#### `"exports"`

The `"exports"` field has the following structure:

<docs-code language="javascript">

"exports": {
  "./schematics/*": {
    "default": "./schematics/*.js"
  },
  "./package.json": {
    "default": "./package.json"
  },
  ".": {
    "types": "./core.d.ts",
    "default": "./fesm2022/core.mjs"
  },
  "./testing": {
    "types": "./testing/testing.d.ts",
    "default": "./fesm2022/testing.mjs"
  }
}

</docs-code>

Of primary interest are the `"."` and the `"./testing"` keys, which define the available code formats for the `@angular/core` primary entrypoint and the `@angular/core/testing` secondary entrypoint, respectively.
For each entrypoint, the available formats are:

| Formats                   | Details |
|:---                       |:---     |
| Typings \(`.d.ts` files\) | `.d.ts` files are used by TypeScript when depending on a given package.                                                                                                           |
| `default`               | ES2022 code flattened into a single source.

Tooling that is aware of these keys may preferentially select a desirable code format from `"exports"`.

Libraries may want to expose additional static files which are not captured by the exports of the JavaScript-based entry-points such as Sass mixins or pre-compiled CSS.

For more information, see [Managing assets in a library](tools/libraries/creating-libraries#managing-assets-in-a-library).

#### Legacy resolution keys

In addition to `"exports"`, the top-level `package.json` also defines legacy module resolution keys for resolvers that don't support `"exports"`.
For `@angular/core` these are:

<docs-code language="javascript">

{
  "module": "./fesm2022/core.mjs",
  "typings": "./core.d.ts",
}

</docs-code>

As shown in the preceding code snippet, a module resolver can use these keys to load a specific code format.

#### Side effects

The last function of `package.json` is to declare whether the package has [side effects](#sideeffects-flag).

<docs-code language="javascript">

{
  "sideEffects": false
}

</docs-code>

Most Angular packages should not depend on top-level side effects, and thus should include this declaration.

### Entrypoints and code splitting

Packages in the Angular Package Format contain one primary entrypoint and zero or more secondary entrypoints \(for example, `@angular/common/http`\).
Entrypoints serve several functions.

1. They define the module specifiers from which users import code \(for example, `@angular/core` and `@angular/core/testing`\).

    Users typically perceive these entrypoints as distinct groups of symbols, with different purposes or capability.

    Specific entrypoints might only be used for special purposes, such as testing.
    Such APIs can be separated out from the primary entrypoint to reduce the chance of them being used accidentally or incorrectly.

1. They define the granularity at which code can be lazily loaded.

    Many modern build tools are only capable of "code splitting" \(aka lazy loading\) at the ES Module level.
    The Angular Package Format uses primarily a single "flat" ES Module per entry point. This means that most build tooling is not able to split code with a single entry point into multiple output chunks.

The general rule for APF packages is to use entrypoints for the smallest sets of logically connected code possible.
For example, the Angular Material package publishes each logical component or set of components as a separate entrypoint - one for Button, one for Tabs, etc.
This allows each Material component to be lazily loaded separately, if desired.

Not all libraries require such granularity.
Most libraries with a single logical purpose should be published as a single entrypoint.
`@angular/core` for example uses a single entrypoint for the runtime, because the Angular runtime is generally used as a single entity.

#### Resolution of secondary entry points

Secondary entrypoints can be resolved via the `"exports"` field of the `package.json` for the package.

### README.md

The README file in the Markdown format that is used to display description of a package on npm and GitHub.

Example README content of @angular/core package:

<docs-code language="html">

Angular
&equals;&equals;&equals;&equals;&equals;&equals;&equals;

The sources for this package are in the main [Angular](https://github.com/angular/angular) repo.Please file issues and pull requests against that repo.

License: MIT

</docs-code>

### Partial compilation

Libraries in the Angular Package Format must be published in "partial compilation" mode.
This is a compilation mode for `ngc` which produces compiled Angular code that is not tied to a specific Angular runtime version, in contrast to the full compilation used for applications, where the Angular compiler and runtime versions must match exactly.

To partially compile Angular code, use the `compilationMode` flag in the `angularCompilerOptions` property of your `tsconfig.json`:

<docs-code language="javascript">

{
  …
  "angularCompilerOptions": {
    "compilationMode": "partial",
  }
}

</docs-code>

Partially compiled library code is then converted to fully compiled code during the application build process by the Angular CLI.

If your build pipeline does not use the Angular CLI then refer to the [Consuming partial ivy code outside the Angular CLI](tools/libraries/creating-libraries#consuming-partial-ivy-code-outside-the-angular-cli) guide.

### Optimizations

#### Flattening of ES modules

The Angular Package Format specifies that code be published in "flattened" ES module format.
This significantly reduces the build time of Angular applications as well as download and parse time of the final application bundle.
Please check out the excellent post ["The cost of small modules"](https://nolanlawson.com/2016/08/15/the-cost-of-small-modules) by Nolan Lawson.

The Angular compiler can generate index ES module files. Tools like Rollup can use these files to generate flattened modules in a *Flattened ES Module* (FESM) file format.

FESM is a file format created by flattening all ES Modules accessible from an entrypoint into a single ES Module.
It's formed by following all imports from a package and copying that code into a single file while preserving all public ES exports and removing all private imports.

The abbreviated name, FESM, pronounced *phe-som*, can be followed by a number such as FESM2020.
The number refers to the language level of the JavaScript inside the module.
Accordingly a FESM2022 file would be ESM+ES2022 and include import/export statements and ES2022 source code.

To generate a flattened ES Module index file, use the following configuration options in your tsconfig.json file:

<docs-code language="javascript">

{
  "compilerOptions": {
    …
    "module": "esnext",
    "target": "es2022",
    …
  },
  "angularCompilerOptions": {
    …
    "flatModuleOutFile": "my-ui-lib.js",
    "flatModuleId": "my-ui-lib"
  }
}

</docs-code>

Once the index file \(for example, `my-ui-lib.js`\) is generated by ngc, bundlers and optimizers like Rollup can be used to produce the flattened ESM file.

#### "sideEffects" flag

By default, EcmaScript Modules are side-effectful: importing from a module ensures that any code at the top level of that module should run.
This is often undesirable, as most side-effectful code in typical modules is not truly side-effectful, but instead only affects specific symbols.
If those symbols are not imported and used, it's often desirable to remove them in an optimization process known as tree-shaking, and the side-effectful code can prevent this.

Build tools such as webpack support a flag which allows packages to declare that they do not depend on side-effectful code at the top level of their modules, giving the tools more freedom to tree-shake code from the package.
The end result of these optimizations should be smaller bundle size and better code distribution in bundle chunks after code-splitting.
This optimization can break your code if it contains non-local side-effects - this is however not common in Angular applications and it's usually a sign of bad design.
The recommendation is for all packages to claim the side-effect free status by setting the `sideEffects` property to `false`, and that developers follow the [Angular Style Guide](/style-guide) which naturally results in code without non-local side-effects.

More info: [webpack docs on side effects](https://github.com/webpack/webpack/tree/master/examples/side-effects)

#### ES2022 language level

ES2022 Language level is now the default language level that is consumed by Angular CLI and other tooling.
The Angular CLI down-levels the bundle to a language level that is supported by all targeted browsers at application build time.

#### d.ts bundling / type definition flattening

As of APF v8, it is recommended to bundle TypeScript definitions.
Bundling of type definitions can significantly speed up compilations for users, especially if there are many individual `.ts` source files in your library.

Angular uses [`rollup-plugin-dts`](https://github.com/Swatinem/rollup-plugin-dts) to flatten `.d.ts` files (using `rollup`, similar to how FESM files are created).

Using rollup for `.d.ts` bundling is beneficial as it supports code splitting between entry-points.
For example, consider you have multiple entrypoints relying on the same shared type, a shared `.d.ts` file would be created along with the larger flattened `.d.ts` files.
This is desirable and avoids duplication of types.

#### Tslib

As of APF v10, it is recommended to add tslib as a direct dependency of your primary entry-point.
This is because the tslib version is tied to the TypeScript version used to compile your library.

### Examples

<docs-pill-row>
  <docs-pill href="https://unpkg.com/browse/@angular/core@17.0.0/" title="@angular/core package"/>
  <docs-pill href="https://unpkg.com/browse/@angular/material@17.0.0/" title="@angular/material package"/>
</docs-pill-row>

### Definition of terms

The following terms are used throughout this document intentionally.
In this section are the definitions of all of them to provide additional clarity.

#### Package

The smallest set of files that are published to NPM and installed together, for example `@angular/core`.
This package includes a manifest called package.json, compiled source code, typescript definition files, source maps, metadata, etc.
The package is installed with `npm install @angular/core`.

#### Symbol

A class, function, constant, or variable contained in a module and optionally made visible to the external world via a module export.

#### Module

Short for ECMAScript Modules.
A file containing statements that import and export symbols.
This is identical to the definition of modules in the ECMAScript spec.

#### ESM

Short for ECMAScript Modules \(see above\).

#### FESM

Short for Flattened ES Modules and consists of a file format created by flattening all ES Modules accessible from an entry point into a single ES Module.

#### Module ID

The identifier of a module used in the import statements \(for example, `@angular/core`\).
The ID often maps directly to a path on the filesystem, but this is not always the case due to various module resolution strategies.

#### Module specifier

A module identifier \(see above\).

#### Module resolution strategy

Algorithm used to convert Module IDs to paths on the filesystem.
Node.js has one that is well specified and widely used, TypeScript supports several module resolution strategies, [Closure Compiler](https://developers.google.com/closure/compiler) has yet another strategy.

#### Module format

Specification of the module syntax that covers at minimum the syntax for the importing and exporting from a file.
Common module formats are CommonJS \(CJS, typically used for Node.js applications\) or ECMAScript Modules \(ESM\).
The module format indicates only the packaging of the individual modules, but not the JavaScript language features used to make up the module content.
Because of this, the Angular team often uses the language level specifier as a suffix to the module format, \(for example, ESM+ES2022 specifies that the module is in ESM format and contains ES2022 code\).

#### Bundle

An artifact in the form of a single JS file, produced by a build tool \(for example, [webpack](https://webpack.js.org) or [Rollup](https://rollupjs.org)\) that contains symbols originating in one or more modules.
Bundles are a browser-specific workaround that reduce network strain that would be caused if browsers were to start downloading hundreds if not tens of thousands of files.
Node.js typically doesn't use bundles.
Common bundle formats are UMD and System.register.

#### Language level

The language of the code \(ES2022\).
Independent of the module format.

#### Entry point

A module intended to be imported by the user.
It is referenced by a unique module ID and exports the public API referenced by that module ID.
An example is `@angular/core` or `@angular/core/testing`.
Both entry points exist in the `@angular/core` package, but they export different symbols.
A package can have many entry points.

#### Deep import

A process of retrieving symbols from modules that are not Entry Points.
These module IDs are usually considered to be private APIs that can change over the lifetime of the project or while the bundle for the given package is being created.

#### Top-Level import

An import coming from an entry point.
The available top-level imports are what define the public API and are exposed in "@angular/name" modules, such as `@angular/core` or `@angular/common`.

#### Tree-shaking

The process of identifying and removing code not used by an application - also known as dead code elimination.
This is a global optimization performed at the application level using tools like [Rollup](https://rollupjs.org), [Closure Compiler](https://developers.google.com/closure/compiler), or [Terser](https://github.com/terser/terser).

#### AOT compiler

The Ahead of Time Compiler for Angular.

#### Flattened type definitions

The bundled TypeScript definitions generated from [API Extractor](https://api-extractor.com).

---


(From creating-libraries.md)

## Creating libraries

This page provides a conceptual overview of how to create and publish new libraries to extend Angular functionality.

If you find that you need to solve the same problem in more than one application \(or want to share your solution with other developers\), you have a candidate for a library.
A simple example might be a button that sends users to your company website, that would be included in all applications that your company builds.

### Getting started

Use the Angular CLI to generate a new library skeleton in a new workspace with the following commands.

<docs-code language="shell">

ng new my-workspace --no-create-application
cd my-workspace
ng generate library my-lib

</docs-code>

<docs-callout title="Naming your library">

You should be very careful when choosing the name of your library if you want to publish it later in a public package registry such as npm.
See [Publishing your library](tools/libraries/creating-libraries#publishing-your-library).

Avoid using a name that is prefixed with `ng-`, such as `ng-library`.
The `ng-` prefix is a reserved keyword used from the Angular framework and its libraries.
The `ngx-` prefix is preferred as a convention used to denote that the library is suitable for use with Angular.
It is also an excellent indication to consumers of the registry to differentiate between libraries of different JavaScript frameworks.

</docs-callout>

The `ng generate` command creates the `projects/my-lib` folder in your workspace, which contains a component and a service inside an NgModule.

HELPFUL: For more details on how a library project is structured, refer to the [Library project files](reference/configs/file-structure#library-project-files) section of the [Project File Structure guide](reference/configs/file-structure).

Use the monorepo model to use the same workspace for multiple projects.
See [Setting up for a multi-project workspace](reference/configs/file-structure#multiple-projects).

When you generate a new library, the workspace configuration file, `angular.json`, is updated with a project of type `library`.

<docs-code language="json">

"projects": {
  …
  "my-lib": {
    "root": "projects/my-lib",
    "sourceRoot": "projects/my-lib/src",
    "projectType": "library",
    "prefix": "lib",
    "architect": {
      "build": {
        "builder": "@angular-devkit/build-angular:ng-packagr",
        …

</docs-code>

Build, test, and lint the project with CLI commands:

<docs-code language="shell">

ng build my-lib --configuration development
ng test my-lib
ng lint my-lib

</docs-code>

Notice that the configured builder for the project is different from the default builder for application projects.
This builder, among other things, ensures that the library is always built with the [AOT compiler](tools/cli/aot-compiler).

To make library code reusable you must define a public API for it.
This "user layer" defines what is available to consumers of your library.
A user of your library should be able to access public functionality \(such as NgModules, service providers and general utility functions\) through a single import path.

The public API for your library is maintained in the `public-api.ts` file in your library folder.
Anything exported from this file is made public when your library is imported into an application.
Use an NgModule to expose services and components.

Your library should supply documentation \(typically a README file\) for installation and maintenance.

### Refactoring parts of an application into a library

To make your solution reusable, you need to adjust it so that it does not depend on application-specific code.
Here are some things to consider in migrating application functionality to a library.

* Declarations such as components and pipes should be designed as stateless, meaning they don't rely on or alter external variables.
    If you do rely on state, you need to evaluate every case and decide whether it is application state or state that the library would manage.

* Any observables that the components subscribe to internally should be cleaned up and disposed of during the lifecycle of those components
* Components should expose their interactions through inputs for providing context, and outputs for communicating events to other components

* Check all internal dependencies.
  * For custom classes or interfaces used in components or service, check whether they depend on additional classes or interfaces that also need to be migrated
  * Similarly, if your library code depends on a service, that service needs to be migrated
  * If your library code or its templates depend on other libraries \(such as Angular Material, for instance\), you must configure your library with those dependencies

* Consider how you provide services to client applications.

  * Services should declare their own providers, rather than declaring providers in the NgModule or a component.
        Declaring a provider makes that service *tree-shakable*.
        This practice lets the compiler leave the service out of the bundle if it never gets injected into the application that imports the library.
        For more about this, see [Tree-shakable providers](guide/di/lightweight-injection-tokens).

  * If you register global service providers or share providers across multiple NgModules, use the [`forRoot()` and `forChild()` design patterns](guide/ngmodules/singleton-services) provided by the [RouterModule](api/router/RouterModule)
  * If your library provides optional services that might not be used by all client applications, support proper tree-shaking for that case by using the [lightweight token design pattern](guide/di/lightweight-injection-tokens)

### Integrating with the CLI using code-generation schematics

A library typically includes *reusable code* that defines components, services, and other Angular artifacts \(pipes, directives\) that you import into a project.
A library is packaged into an npm package for publishing and sharing.
This package can also include schematics that provide instructions for generating or transforming code directly in your project, in the same way that the CLI creates a generic new component with `ng generate component`.
A schematic that is packaged with a library can, for example, provide the Angular CLI with the information it needs to generate a component that configures and uses a particular feature, or set of features, defined in that library.
One example of this is [Angular Material's navigation schematic](https://material.angular.io/guide/schematics#navigation-schematic) which configures the CDK's [BreakpointObserver](https://material.angular.io/cdk/layout/overview#breakpointobserver) and uses it with Material's [MatSideNav](https://material.angular.io/components/sidenav/overview) and [MatToolbar](https://material.angular.io/components/toolbar/overview) components.

Create and include the following kinds of schematics:

* Include an installation schematic so that `ng add` can add your library to a project
* Include generation schematics in your library so that `ng generate` can scaffold your defined artifacts \(components, services, tests\) in a project
* Include an update schematic so that `ng update` can update your library's dependencies and provide migrations for breaking changes in new releases

What you include in your library depends on your task.
For example, you could define a schematic to create a dropdown that is pre-populated with canned data to show how to add it to an application.
If you want a dropdown that would contain different passed-in values each time, your library could define a schematic to create it with a given configuration.
Developers could then use `ng generate` to configure an instance for their own application.

Suppose you want to read a configuration file and then generate a form based on that configuration.
If that form needs additional customization by the developer who is using your library, it might work best as a schematic.
However, if the form will always be the same and not need much customization by developers, then you could create a dynamic component that takes the configuration and generates the form.
In general, the more complex the customization, the more useful the schematic approach.

For more information, see [Schematics Overview](tools/cli/schematics) and [Schematics for Libraries](tools/cli/schematics-for-libraries).

### Publishing your library

Use the Angular CLI and the npm package manager to build and publish your library as an npm package.

Angular CLI uses a tool called [ng-packagr](https://github.com/ng-packagr/ng-packagr/blob/master/README.md) to create packages from your compiled code that can be published to npm.
See [Building libraries with Ivy](tools/libraries/creating-libraries#publishing-libraries) for information on the distribution formats supported by `ng-packagr` and guidance on how
to choose the right format for your library.

You should always build libraries for distribution using the `production` configuration.
This ensures that generated output uses the appropriate optimizations and the correct package format for npm.

<docs-code language="shell">

ng build my-lib
cd dist/my-lib
npm publish

</docs-code>

### Managing assets in a library

In your Angular library, the distributable can include additional assets like theming files, Sass mixins, or documentation \(like a changelog\).
For more information [copy assets into your library as part of the build](https://github.com/ng-packagr/ng-packagr/blob/master/docs/copy-assets.md) and [embed assets in component styles](https://github.com/ng-packagr/ng-packagr/blob/master/docs/embed-assets-css.md).

IMPORTANT: When including additional assets like Sass mixins or pre-compiled CSS.
You need to add these manually to the conditional ["exports"](tools/libraries/angular-package-format#quotexportsquot) in the `package.json` of the primary entrypoint.

`ng-packagr` will merge handwritten `"exports"` with the auto-generated ones, allowing for library authors to configure additional export subpaths, or custom conditions.

<docs-code language="json">

"exports": {
  ".": {
    "sass": "./_index.scss",
  },
  "./theming": {
    "sass": "./_theming.scss"
  },
  "./prebuilt-themes/indigo-pink.css": {
    "style": "./prebuilt-themes/indigo-pink.css"
  }
}

</docs-code>

The above is an extract from the [@angular/material](https://unpkg.com/browse/@angular/material/package.json) distributable.

### Peer dependencies

Angular libraries should list any `@angular/*` dependencies the library depends on as peer dependencies.
This ensures that when modules ask for Angular, they all get the exact same module.
If a library lists `@angular/core` in `dependencies` instead of `peerDependencies`, it might get a different Angular module instead, which would cause your application to break.

### Using your own library in applications

You don't have to publish your library to the npm package manager to use it in the same workspace, but you do have to build it first.

To use your own library in an application:

* Build the library.
    You cannot use a library before it is built.

    <docs-code language="shell">

    ng build my-lib

    </docs-code>

* In your applications, import from the library by name:

    <docs-code language="typescript">

    import { myExport } from 'my-lib';

    </docs-code>

#### Building and rebuilding your library

The build step is important if you haven't published your library as an npm package and then installed the package back into your application from npm.
For instance, if you clone your git repository and run `npm install`, your editor shows the `my-lib` imports as missing if you haven't yet built your library.

HELPFUL: When you import something from a library in an Angular application, Angular looks for a mapping between the library name and a location on disk.
When you install a library package, the mapping is in the `node_modules` folder.
When you build your own library, it has to find the mapping in your `tsconfig` paths.

Generating a library with the Angular CLI automatically adds its path to the `tsconfig` file.
The Angular CLI uses the `tsconfig` paths to tell the build system where to find the library.

For more information, see [Path mapping overview](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping).

If you find that changes to your library are not reflected in your application, your application is probably using an old build of the library.

You can rebuild your library whenever you make changes to it, but this extra step takes time.
*Incremental builds* functionality improves the library-development experience.
Every time a file is changed a partial build is performed that emits the amended files.

Incremental builds can be run as a background process in your development environment.
To take advantage of this feature add the `--watch` flag to the build command:

<docs-code language="shell">

ng build my-lib --watch

</docs-code>

IMPORTANT: The CLI `build` command uses a different builder and invokes a different build tool for libraries than it does for applications.

* The build system for applications, `@angular-devkit/build-angular`, is based on `webpack`, and is included in all new Angular CLI projects
* The build system for libraries is based on `ng-packagr`.
    It is only added to your dependencies when you add a library using `ng generate library my-lib`.

The two build systems support different things, and even where they support the same things, they do those things differently.
This means that the TypeScript source can result in different JavaScript code in a built library than it would in a built application.

For this reason, an application that depends on a library should only use TypeScript path mappings that point to the *built library*.
TypeScript path mappings should *not* point to the library source `.ts` files.

### Publishing libraries

There are two distribution formats to use when publishing a library:

| Distribution formats        | Details |
|:---                         |:---     |
| Partial-Ivy \(recommended\) | Contains portable code that can be consumed by Ivy applications built with any version of Angular from v12 onwards. |
| Full-Ivy                    | Contains private Angular Ivy instructions, which are not guaranteed to work across different versions of Angular. This format requires that the library and application are built with the *exact* same version of Angular. This format is useful for environments where all library and application code is built directly from source. |

For publishing to npm use the partial-Ivy format as it is stable between patch versions of Angular.

Avoid compiling libraries with full-Ivy code if you are publishing to npm because the generated Ivy instructions are not part of Angular's public API, and so might change between patch versions.

### Ensuring library version compatibility

The Angular version used to build an application should always be the same or greater than the Angular versions used to build any of its dependent libraries.
For example, if you had a library using Angular version 13, the application that depends on that library should use Angular version 13 or later.
Angular does not support using an earlier version for the application.

If you intend to publish your library to npm, compile with partial-Ivy code by setting `"compilationMode": "partial"` in `tsconfig.prod.json`.
This partial format is stable between different versions of Angular, so is safe to publish to npm.
Code with this format is processed during the application build using the same version of the Angular compiler, ensuring that the application and all of its libraries use a single version of Angular.

Avoid compiling libraries with full-Ivy code if you are publishing to npm because the generated Ivy instructions are not part of Angular's public API, and so might change between patch versions.

If you've never published a package in npm before, you must create a user account.
Read more in [Publishing npm Packages](https://docs.npmjs.com/getting-started/publishing-npm-packages).

### Consuming partial-Ivy code outside the Angular CLI

An application installs many Angular libraries from npm into its `node_modules` directory.
However, the code in these libraries cannot be bundled directly along with the built application as it is not fully compiled.
To finish compilation, use the Angular linker.

For applications that don't use the Angular CLI, the linker is available as a [Babel](https://babeljs.io) plugin.
The plugin is to be imported from `@angular/compiler-cli/linker/babel`.

The Angular linker Babel plugin supports build caching, meaning that libraries only need to be processed by the linker a single time, regardless of other npm operations.

Example of integrating the plugin into a custom [webpack](https://webpack.js.org) build by registering the linker as a [Babel](https://babeljs.io) plugin using [babel-loader](https://webpack.js.org/loaders/babel-loader/#options).

<docs-code header="webpack.config.mjs" path="adev/src/content/examples/angular-linker-plugin/webpack.config.mjs" visibleRegion="webpack-config"/>

HELPFUL: The Angular CLI integrates the linker plugin automatically, so if consumers of your library are using the CLI, they can install Ivy-native libraries from npm without any additional configuration.

---


(From overview.md)

## Overview of Angular libraries

Many applications need to solve the same general problems, such as presenting a unified user interface, presenting data, and allowing data entry.
Developers can create general solutions for particular domains that can be adapted for re-use in different applications.
Such a solution can be built as Angular *libraries* and these libraries can be published and shared as *npm packages*.

An Angular library is an Angular project that differs from an application in that it cannot run on its own.
A library must be imported and used in an application.

Libraries extend Angular's base features.
For example, to add [reactive forms](guide/forms/reactive-forms) to an application, add the library package using `ng add @angular/forms`, then import the `ReactiveFormsModule` from the `@angular/forms` library in your application code.
Similarly, adding the [service worker](ecosystem/service-workers) library to an Angular application is one of the steps for turning an application into a [Progressive Web App](https://developers.google.com/web/progressive-web-apps) \(PWA\).
[Angular Material](https://material.angular.io) is an example of a large, general-purpose library that provides sophisticated, reusable, and adaptable UI components.

Any application developer can use these and other libraries that have been published as npm packages by the Angular team or by third parties.
See [Using Published Libraries](tools/libraries/using-libraries).

HELPFUL: Libraries are intended to be used by Angular applications. To add Angular features to non-Angular web applications, use [Angular custom elements](guide/elements).

### Creating libraries

If you have developed features that are suitable for reuse, you can create your own libraries.
These libraries can be used locally in your workspace, or you can publish them as [npm packages](reference/configs/npm-packages) to share with other projects or other Angular developers.
These packages can be published to the npm registry, a private npm Enterprise registry, or a private package management system that supports npm packages.
See [Creating Libraries](tools/libraries/creating-libraries).

Deciding to package features as a library is an architectural decision. It is comparable to deciding whether a feature is a component or a service, or deciding on the scope of a component.

Packaging features as a library forces the artifacts in the library to be decoupled from the application's business logic.
This can help to avoid various bad practices or architecture mistakes that can make it difficult to decouple and reuse code in the future.

Putting code into a separate library is more complex than simply putting everything in one application.
It requires more of an investment in time and thought for managing, maintaining, and updating the library.
This complexity can pay off when the library is being used in multiple applications.

---


(From using-libraries.md)

## Usage of Angular libraries published to npm

When you build your Angular application, take advantage of sophisticated first-party libraries, as well as a rich ecosystem of third-party libraries.
[Angular Material][AngularMaterialMain] is an example of a sophisticated first-party library.

### Install libraries

Libraries are published as [npm packages][GuideNpmPackages], usually together with schematics that integrate them with the Angular CLI.
To integrate reusable library code into an application, you need to install the package and import the provided functionality in the location you use it.
For most published Angular libraries, use the `ng add <lib_name>` Angular CLI command.

The `ng add` Angular CLI command uses a package manager to install the library package and invokes schematics that are included in the package to other scaffolding within the project code.
Examples of package managers include [npm][NpmjsMain] or [yarn][YarnpkgMain].
Additional scaffolding within the project code includes import statements, fonts, and themes.

A published library typically provides a `README` file or other documentation on how to add that library to your application.
For an example, see the [Angular Material][AngularMaterialMain] documentation.

#### Library typings

Typically, library packages include typings in `.d.ts` files; see examples in `node_modules/@angular/material`.
If the package of your library does not include typings and your IDE complains, you might need to install the `@types/<lib_name>` package with the library.

For example, suppose you have a library named `d3`:

<docs-code language="shell">

npm install d3 --save
npm install @types/d3 --save-dev

</docs-code>

Types defined in a `@types/` package for a library installed into the workspace are automatically added to the TypeScript configuration for the project that uses that library.
TypeScript looks for types in the `node_modules/@types` directory by default, so you do not have to add each type package individually.

If a library does not have typings available at `@types/`, you may use it by manually adding typings for it.
To do this:

1. Create a `typings.d.ts` file in your `src/` directory.
    This file is automatically included as global type definition.

1. Add the following code in `src/typings.d.ts`:

    <docs-code language="typescript">

    declare module 'host' {
      export interface Host {
        protocol?: string;
        hostname?: string;
        pathname?: string;
      }
      export function parse(url: string, queryString?: string): Host;
    }

    </docs-code>

1. In the component or file that uses the library, add the following code:

    <docs-code language="typescript">

    import * as host from 'host';
    const parsedUrl = host.parse('https://angular.io');
    console.log(parsedUrl.hostname);

    </docs-code>

Define more typings as needed.

### Updating libraries

A library is able to be updated by the publisher, and also has individual dependencies which need to be kept current.
To check for updates to your installed libraries, use the [`ng update`][CliUpdate] Angular CLI command.

Use `ng update <lib_name>` Angular CLI command to update individual library versions.
The Angular CLI checks the latest published release of the library, and if the latest version is newer than your installed version, downloads it and updates your `package.json` to match the latest version.

When you update Angular to a new version, you need to make sure that any libraries you are using are current.
If libraries have interdependencies, you might have to update them in a particular order.
See the [Angular Update Guide][AngularUpdateMain] for help.

### Adding a library to the runtime global scope

If a legacy JavaScript library is not imported into an application, you may add it to the runtime global scope and load it as if it was added in a script tag.
Configure the Angular CLI to do this at build time using the `scripts` and `styles` options of the build target in the [`angular.json`][GuideWorkspaceConfig] workspace build configuration file.

For example, to use the [Bootstrap 4][GetbootstrapDocs40GettingStartedIntroduction] library

1. Install the library and the associated dependencies using the npm package manager:

    <docs-code language="shell">

    npm install jquery --save
    npm install popper.js --save
    npm install bootstrap --save

    </docs-code>

1. In the `angular.json` configuration file, add the associated script files to the `scripts` array:

    <docs-code language="json">

    "scripts": [
      "node_modules/jquery/dist/jquery.slim.js",
      "node_modules/popper.js/dist/umd/popper.js",
      "node_modules/bootstrap/dist/js/bootstrap.js"
    ],

    </docs-code>

1. Add the `bootstrap.css` CSS file to the `styles` array:

    <docs-code language="css">

    "styles": [
      "node_modules/bootstrap/dist/css/bootstrap.css",
      "src/styles.css"
    ],

    </docs-code>

1. Run or restart the `ng serve` Angular CLI command to see Bootstrap 4 work in your application.

#### Using runtime-global libraries inside your app

After you import a library using the "scripts" array, do **not** import it using an import statement in your TypeScript code.
The following code snippet is an example import statement.

<docs-code language="typescript">

import * as $ from 'jquery';

</docs-code>

If you import it using import statements, you have two different copies of the library: one imported as a global library, and one imported as a module.
This is especially bad for libraries with plugins, like JQuery, because each copy includes different plugins.

Instead, run the `npm install @types/jquery` Angular CLI command to download typings for your library and then follow the library installation steps.
This gives you access to the global variables exposed by that library.

#### Defining typings for runtime-global libraries

If the global library you need to use does not have global typings, you can declare them manually as `any` in `src/typings.d.ts`.

For example:

<docs-code language="typescript">

declare var libraryName: any;

</docs-code>

Some scripts extend other libraries; for instance with JQuery plugins:

<docs-code language="typescript">

$('.test').myPlugin();

</docs-code>

In this case, the installed `@types/jquery` does not include `myPlugin`, so you need to add an interface in `src/typings.d.ts`.
For example:

<docs-code language="typescript">

interface JQuery {
  myPlugin(options?: any): any;
}

</docs-code>

If you do not add the interface for the script-defined extension, your IDE shows an error:

<docs-code language="text">

[TS][Error] Property 'myPlugin' does not exist on type 'JQuery'

</docs-code>

[CliUpdate]: cli/update "ng update | CLI |Angular"

[GuideNpmPackages]: reference/configs/npm-packages "Workspace npm dependencies | Angular"

[GuideWorkspaceConfig]: reference/configs/workspace-config "Angular workspace configuration | Angular"

[Resources]: resources "Explore Angular Resources | Angular"

[AngularMaterialMain]: https://material.angular.io "Angular Material | Angular"

[AngularUpdateMain]: https://angular.dev/update-guide "Angular Update Guide | Angular"

[GetbootstrapDocs40GettingStartedIntroduction]: https://getbootstrap.com/docs/4.0/getting-started/introduction "Introduction | Bootstrap"

[NpmjsMain]: https://www.npmjs.com "npm"

[YarnpkgMain]: https://yarnpkg.com " Yarn"

---