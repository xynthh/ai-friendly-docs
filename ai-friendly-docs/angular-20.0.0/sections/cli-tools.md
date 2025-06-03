# Cli Tools

(From aot-compiler.md)

## Ahead-of-time (AOT) compilation

An Angular application consists mainly of components and their HTML templates.
Because the components and templates provided by Angular cannot be understood by the browser directly, Angular applications require a compilation process before they can run in a browser.

The Angular ahead-of-time (AOT) compiler converts your Angular HTML and TypeScript code into efficient JavaScript code during the build phase *before* the browser downloads and runs that code.
Compiling your application during the build process provides a faster rendering in the browser.

This guide explains how to specify metadata and apply available compiler options to compile your applications efficiently using the AOT compiler.

HELPFUL: [Watch Alex Rickabaugh explain the Angular compiler](https://www.youtube.com/watch?v=anphffaCZrQ) at AngularConnect 2019.

Here are some reasons you might want to use AOT.

| Reasons                                 | Details |
|:---                                     |:---     |
| Faster rendering                        | With AOT, the browser downloads a pre-compiled version of the application. The browser loads executable code so it can render the application immediately, without waiting to compile the application first.                                       |
| Fewer asynchronous requests             | The compiler *inlines* external HTML templates and CSS style sheets within the application JavaScript, eliminating separate ajax requests for those source files.                                                                                  |
| Smaller Angular framework download size | There's no need to download the Angular compiler if the application is already compiled. The compiler is roughly half of Angular itself, so omitting it dramatically reduces the application payload.                                              |
| Detect template errors earlier          | The AOT compiler detects and reports template binding errors during the build step before users can see them.                                                                                                                                      |
| Better security                         | AOT compiles HTML templates and components into JavaScript files long before they are served to the client. With no templates to read and no risky client-side HTML or JavaScript evaluation, there are fewer opportunities for injection attacks. |

### Choosing a compiler

Angular offers two ways to compile your application:

| Angular compile       | Details |
|:---                   |:---     |
| Just-in-Time \(JIT\)  | Compiles your application in the browser at runtime. This was the default until Angular 8.        |
| Ahead-of-Time \(AOT\) | Compiles your application and libraries at build time. This is the default starting in Angular 9. |

When you run the [`ng build`](cli/build) \(build only\) or [`ng serve`](cli/serve) \(build and serve locally\) CLI commands, the type of compilation \(JIT or AOT\) depends on the value of the `aot` property in your build configuration specified in `angular.json`.
By default, `aot` is set to `true` for new CLI applications.

See the [CLI command reference](cli) and [Building and serving Angular apps](tools/cli/build) for more information.

### How AOT works

The Angular AOT compiler extracts **metadata** to interpret the parts of the application that Angular is supposed to manage.
You can specify the metadata explicitly in **decorators** such as `@Component()` and `@Input()`, or implicitly in the constructor declarations of the decorated classes.
The metadata tells Angular how to construct instances of your application classes and interact with them at runtime.

In the following example, the `@Component()` metadata object and the class constructor tell Angular how to create and display an instance of `TypicalComponent`.

<docs-code language="typescript">

@Component({
  selector: 'app-typical',
  template: '<div>A typical component for {{data.name}}</div>'
})
export class TypicalComponent {
  @Input() data: TypicalData;
  private someService = inject(SomeService);
}

</docs-code>

The Angular compiler extracts the metadata *once* and generates a *factory* for `TypicalComponent`.
When it needs to create a `TypicalComponent` instance, Angular calls the factory, which produces a new visual element, bound to a new instance of the component class with its injected dependency.

#### Compilation phases

There are three phases of AOT compilation.

|     | Phase                  | Details                                                                                                                                                                                                                                                                                                        |
|:--- |:---                    |:---                                                                                                                                                                                                                                                                                                            |
| 1   | code analysis          | In this phase, the TypeScript compiler and *AOT collector* create a representation of the source. The collector does not attempt to interpret the metadata it collects. It represents the metadata as best it can and records errors when it detects a metadata syntax violation.                              |
| 2   | code generation        | In this phase, the compiler's `StaticReflector` interprets the metadata collected in phase 1, performs additional validation of the metadata, and throws an error if it detects a metadata restriction violation.                                                                                              |
| 3   | template type checking | In this optional phase, the Angular *template compiler* uses the TypeScript compiler to validate the binding expressions in templates. You can enable this phase explicitly by setting the `strictTemplates` configuration option; see [Angular compiler options](reference/configs/angular-compiler-options). |

#### Metadata restrictions

You write metadata in a *subset* of TypeScript that must conform to the following general constraints:

* Limit [expression syntax](#expression-syntax-limitations) to the supported subset of JavaScript
* Only reference exported symbols after [code folding](#code-folding)
* Only call [functions supported](#supported-classes-and-functions) by the compiler
* Input/Outputs and data-bound class members must be public or protected.For additional guidelines and instructions on preparing an application for AOT compilation, see [Angular: Writing AOT-friendly applications](https://medium.com/sparkles-blog/angular-writing-aot-friendly-applications-7b64c8afbe3f).

HELPFUL: Errors in AOT compilation commonly occur because of metadata that does not conform to the compiler's requirements \(as described more fully below\).
For help in understanding and resolving these problems, see [AOT Metadata Errors](tools/cli/aot-metadata-errors).

#### Configuring AOT compilation

You can provide options in the [TypeScript configuration file](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) that controls the compilation process.
See [Angular compiler options](reference/configs/angular-compiler-options) for a complete list of available options.

### Phase 1: Code analysis

The TypeScript compiler does some of the analytic work of the first phase.
It emits the `.d.ts` *type definition files* with type information that the AOT compiler needs to generate application code.
At the same time, the AOT **collector** analyzes the metadata recorded in the Angular decorators and outputs metadata information in **`.metadata.json`** files, one per `.d.ts` file.

You can think of `.metadata.json` as a diagram of the overall structure of a decorator's metadata, represented as an [abstract syntax tree (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree).

HELPFUL: Angular's [schema.ts](https://github.com/angular/angular/blob/main/packages/compiler-cli/src/metadata/schema.ts) describes the JSON format as a collection of TypeScript interfaces.

#### Expression syntax limitations

The AOT collector only understands a subset of JavaScript.
Define metadata objects with the following limited syntax:

| Syntax                    | Example |
|:---                       |:---     |
| Literal object            | `{cherry: true, apple: true, mincemeat: false}`                        |
| Literal array             | `['cherries', 'flour', 'sugar']`                                       |
| Spread in literal array   | `['apples', 'flour', …]`                                               |
| Calls                     | `bake(ingredients)`                                                    |
| New                       | `new Oven()`                                                           |
| Property access           | `pie.slice`                                                            |
| Array index               | `ingredients[0]`                                                       |
| Identity reference        | `Component`                                                            |
| A template string         | <code>`pie is ${multiplier} times better than cake`</code> |
| Literal string            | `'pi'`                                                                 |
| Literal number            | `3.14153265`                                                           |
| Literal boolean           | `true`                                                                 |
| Literal null              | `null`                                                                 |
| Supported prefix operator | `!cake`                                                                |
| Supported binary operator | `a+b`                                                                  |
| Conditional operator      | `a ? b : c`                                                            |
| Parentheses               | `(a+b)`                                                                |

If an expression uses unsupported syntax, the collector writes an error node to the `.metadata.json` file.
The compiler later reports the error if it needs that piece of metadata to generate the application code.

HELPFUL: If you want `ngc` to report syntax errors immediately rather than produce a `.metadata.json` file with errors, set the `strictMetadataEmit` option in the TypeScript configuration file.

<docs-code language="json">

"angularCompilerOptions": {
  …
  "strictMetadataEmit" : true
}

</docs-code>

Angular libraries have this option to ensure that all Angular `.metadata.json` files are clean and it is a best practice to do the same when building your own libraries.

#### No arrow functions

The AOT compiler does not support [function expressions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/function)
and [arrow functions](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Functions/Arrow_functions), also called *lambda* functions.

Consider the following component decorator:

<docs-code language="typescript">

@Component({
  …
  providers: [{provide: server, useFactory: () => new Server()}]
})

</docs-code>

The AOT collector does not support the arrow function, `() => new Server()`, in a metadata expression.
It generates an error node in place of the function.
When the compiler later interprets this node, it reports an error that invites you to turn the arrow function into an *exported function*.

You can fix the error by converting to this:

<docs-code language="typescript">

export function serverFactory() {
  return new Server();
}

@Component({
  …
  providers: [{provide: server, useFactory: serverFactory}]
})

</docs-code>

In version 5 and later, the compiler automatically performs this rewriting while emitting the `.js` file.

#### Code folding

The compiler can only resolve references to ***exported*** symbols.
The collector, however, can evaluate an expression during collection and record the result in the `.metadata.json`, rather than the original expression.
This allows you to make limited use of non-exported symbols within expressions.

For example, the collector can evaluate the expression `1 + 2 + 3 + 4` and replace it with the result, `10`.
This process is called *folding*.
An expression that can be reduced in this manner is *foldable*.

The collector can evaluate references to module-local `const` declarations and initialized `var` and `let` declarations, effectively removing them from the `.metadata.json` file.

Consider the following component definition:

<docs-code language="typescript">

const template = '<div>{{hero.name}}</div>';

@Component({
  selector: 'app-hero',
  template: template
})
export class HeroComponent {
  @Input() hero: Hero;
}

</docs-code>

The compiler could not refer to the `template` constant because it isn't exported.
The collector, however, can fold the `template` constant into the metadata definition by in-lining its contents.
The effect is the same as if you had written:

<docs-code language="typescript">

@Component({
  selector: 'app-hero',
  template: '<div>{{hero.name}}</div>'
})
export class HeroComponent {
  @Input() hero: Hero;
}

</docs-code>

There is no longer a reference to `template` and, therefore, nothing to trouble the compiler when it later interprets the *collector's* output in `.metadata.json`.

You can take this example a step further by including the `template` constant in another expression:

<docs-code language="typescript">

const template = '<div>{{hero.name}}</div>';

@Component({
  selector: 'app-hero',
  template: template + '<div>{{hero.title}}</div>'
})
export class HeroComponent {
  @Input() hero: Hero;
}

</docs-code>

The collector reduces this expression to its equivalent *folded* string:

<docs-code language="typescript">

'<div>{{hero.name}}</div><div>{{hero.title}}</div>'

</docs-code>

##### Foldable syntax

The following table describes which expressions the collector can and cannot fold:

| Syntax                           | Foldable |
|:---                              |:---      |
| Literal object                   | yes                                      |
| Literal array                    | yes                                      |
| Spread in literal array          | no                                       |
| Calls                            | no                                       |
| New                              | no                                       |
| Property access                  | yes, if target is foldable               |
| Array index                      | yes, if target and index are foldable    |
| Identity reference               | yes, if it is a reference to a local     |
| A template with no substitutions | yes                                      |
| A template with substitutions    | yes, if the substitutions are foldable   |
| Literal string                   | yes                                      |
| Literal number                   | yes                                      |
| Literal boolean                  | yes                                      |
| Literal null                     | yes                                      |
| Supported prefix operator        | yes, if operand is foldable              |
| Supported binary operator        | yes, if both left and right are foldable |
| Conditional operator             | yes, if condition is foldable            |
| Parentheses                      | yes, if the expression is foldable       |

If an expression is not foldable, the collector writes it to `.metadata.json` as an [AST](https://en.wikipedia.org/wiki/Abstract*syntax*tree) for the compiler to resolve.

### Phase 2: code generation

The collector makes no attempt to understand the metadata that it collects and outputs to `.metadata.json`.
It represents the metadata as best it can and records errors when it detects a metadata syntax violation.
It's the compiler's job to interpret the `.metadata.json` in the code generation phase.

The compiler understands all syntax forms that the collector supports, but it may reject *syntactically* correct metadata if the *semantics* violate compiler rules.

#### Public or protected symbols

The compiler can only reference *exported symbols*.

* Decorated component class members must be public or protected.
    You cannot make an `@Input()` property private.

* Data bound properties must also be public or protected

#### Supported classes and functions

The collector can represent a function call or object creation with `new` as long as the syntax is valid.
The compiler, however, can later refuse to generate a call to a *particular* function or creation of a *particular* object.

The compiler can only create instances of certain classes, supports only core decorators, and only supports calls to macros \(functions or static methods\) that return expressions.

| Compiler action      | Details |
|:---                  |:---     |
| New instances        | The compiler only allows metadata that create instances of the class `InjectionToken` from `@angular/core`.                                            |
| Supported decorators | The compiler only supports metadata for the [Angular decorators in the `@angular/core` module](api/core#decorators).                                   |
| Function calls       | Factory functions must be exported, named functions. The AOT compiler does not support lambda expressions \("arrow functions"\) for factory functions. |

#### Functions and static method calls

The collector accepts any function or static method that contains a single `return` statement.
The compiler, however, only supports macros in the form of functions or static methods that return an *expression*.

For example, consider the following function:

<docs-code language="typescript">

export function wrapInArray<T>(value: T): T[] {
  return [value];
}

</docs-code>

You can call the `wrapInArray` in a metadata definition because it returns the value of an expression that conforms to the compiler's restrictive JavaScript subset.

You might use  `wrapInArray()` like this:

<docs-code language="typescript">

@NgModule({
  declarations: wrapInArray(TypicalComponent)
})
export class TypicalModule {}

</docs-code>

The compiler treats this usage as if you had written:

<docs-code language="typescript">

@NgModule({
  declarations: [TypicalComponent]
})
export class TypicalModule {}

</docs-code>

The Angular [`RouterModule`](api/router/RouterModule) exports two macro static methods, `forRoot` and `forChild`, to help declare root and child routes.
Review the [source code](https://github.com/angular/angular/blob/main/packages/router/src/router_module.ts#L139 "RouterModule.forRoot source code")
for these methods to see how macros can simplify configuration of complex [NgModules](guide/ngmodules).

#### Metadata rewriting

The compiler treats object literals containing the fields `useClass`, `useValue`, `useFactory`, and `data` specially, converting the expression initializing one of these fields into an exported variable that replaces the expression.
This process of rewriting these expressions removes all the restrictions on what can be in them because
the compiler doesn't need to know the expression's value — it just needs to be able to generate a reference to the value.

You might write something like:

<docs-code language="typescript">

class TypicalServer {

}

@NgModule({
  providers: [{provide: SERVER, useFactory: () => TypicalServer}]
})
export class TypicalModule {}

</docs-code>

Without rewriting, this would be invalid because lambdas are not supported and `TypicalServer` is not exported.
To allow this, the compiler automatically rewrites this to something like:

<docs-code language="typescript">

class TypicalServer {

}

export const θ0 = () => new TypicalServer();

@NgModule({
  providers: [{provide: SERVER, useFactory: θ0}]
})
export class TypicalModule {}

</docs-code>

This allows the compiler to generate a reference to `θ0` in the factory without having to know what the value of `θ0` contains.

The compiler does the rewriting during the emit of the `.js` file.
It does not, however, rewrite the `.d.ts` file, so TypeScript doesn't recognize it as being an export.
And it does not interfere with the ES module's exported API.

### Phase 3: Template type checking

One of the Angular compiler's most helpful features is the ability to type-check expressions within templates, and catch any errors before they cause crashes at runtime.
In the template type-checking phase, the Angular template compiler uses the TypeScript compiler to validate the binding expressions in templates.

Enable this phase explicitly by adding the compiler option `"fullTemplateTypeCheck"` in the `"angularCompilerOptions"` of the project's TypeScript configuration file
(see [Angular Compiler Options](reference/configs/angular-compiler-options)).

Template validation produces error messages when a type error is detected in a template binding
expression, similar to how type errors are reported by the TypeScript compiler against code in a `.ts`
file.

For example, consider the following component:

<docs-code language="typescript">

@Component({
  selector: 'my-component',
  template: '{{person.addresss.street}}'
})
class MyComponent {
  person?: Person;
}

</docs-code>

This produces the following error:

<docs-code hideCopy language="shell">

my.component.ts.MyComponent.html(1,1): : Property 'addresss' does not exist on type 'Person'. Did you mean 'address'?

</docs-code>

The file name reported in the error message, `my.component.ts.MyComponent.html`, is a synthetic file
generated by the template compiler that holds contents of the `MyComponent` class template.
The compiler never writes this file to disk.
The line and column numbers are relative to the template string in the `@Component` annotation of the class, `MyComponent` in this case.
If a component uses `templateUrl` instead of `template`, the errors are reported in the HTML file referenced by the `templateUrl` instead of a synthetic file.

The error location is the beginning of the text node that contains the interpolation expression with the error.
If the error is in an attribute binding such as `[value]="person.address.street"`, the error
location is the location of the attribute that contains the error.

The validation uses the TypeScript type checker and the options supplied to the TypeScript compiler to control how detailed the type validation is.
For example, if the `strictTypeChecks` is specified, the error

<docs-code hideCopy language="shell">

my.component.ts.MyComponent.html(1,1): : Object is possibly 'undefined'

</docs-code>

is reported as well as the above error message.

#### Type narrowing

The expression used in an `ngIf` directive is used to narrow type unions in the Angular
template compiler, the same way the `if` expression does in TypeScript.
For example, to avoid `Object is possibly 'undefined'` error in the template above, modify it to only emit the interpolation if the value of `person` is initialized as shown below:

<docs-code language="typescript">

@Component({
  selector: 'my-component',
  template: '<span *ngIf="person"> {{person.address.street}} </span>'
})
class MyComponent {
  person?: Person;
}

</docs-code>

Using `*ngIf` allows the TypeScript compiler to infer that the `person` used in the binding expression will never be `undefined`.

For more information about input type narrowing, see [Improving template type checking for custom directives](guide/directives/structural-directives#directive-type-checks).

#### Non-null type assertion operator

Use the non-null type assertion operator to suppress the `Object is possibly 'undefined'` error when it is inconvenient to use `*ngIf` or when some constraint in the component ensures that the expression is always non-null when the binding expression is interpolated.

In the following example, the `person` and `address` properties are always set together, implying that `address` is always non-null if `person` is non-null.
There is no convenient way to describe this constraint to TypeScript and the template compiler, but the error is suppressed in the example by using `address!.street`.

<docs-code language="typescript">

@Component({
  selector: 'my-component',
  template: '<span *ngIf="person"> {{person.name}} lives on {{address!.street}} </span>'
})
class MyComponent {
  person?: Person;
  address?: Address;

  setData(person: Person, address: Address) {
    this.person = person;
    this.address = address;
  }
}

</docs-code>

The non-null assertion operator should be used sparingly as refactoring of the component might break this constraint.

In this example it is recommended to include the checking of `address` in the `*ngIf` as shown below:

<docs-code language="typescript">

@Component({
  selector: 'my-component',
  template: '<span *ngIf="person &amp;&amp; address"> {{person.name}} lives on {{address.street}} </span>'
})
class MyComponent {
  person?: Person;
  address?: Address;

  setData(person: Person, address: Address) {
    this.person = person;
    this.address = address;
  }
}

</docs-code>

---


(From aot-metadata-errors.md)

## AOT metadata errors

The following are metadata errors you may encounter, with explanations and suggested corrections.

### Expression form not supported

HELPFUL: The compiler encountered an expression it didn't understand while evaluating Angular metadata.

Language features outside of the compiler's [restricted expression syntax](tools/cli/aot-compiler#expression-syntax)
can produce this error, as seen in the following example:

<docs-code language="typescript">
// ERROR
export class Fooish { … }
…
const prop = typeof Fooish; // typeof is not valid in metadata
  …
  // bracket notation is not valid in metadata
  { provide: 'token', useValue: { [prop]: 'value' } };
  …
</docs-code>

You can use `typeof` and bracket notation in normal application code.
You just can't use those features within expressions that define Angular metadata.

Avoid this error by sticking to the compiler's [restricted expression syntax](tools/cli/aot-compiler#expression-syntax)
when writing Angular metadata
and be wary of new or unusual TypeScript features.

### Reference to a local (non-exported) symbol

HELPFUL: Reference to a local \(non-exported\) symbol 'symbol name'. Consider exporting the symbol.

The compiler encountered a reference to a locally defined symbol that either wasn't exported or wasn't initialized.

Here's a `provider` example of the problem.

<docs-code language="typescript">

// ERROR
let foo: number; // neither exported nor initialized

@Component({
  selector: 'my-component',
  template: … ,
  providers: [
    { provide: Foo, useValue: foo }
  ]
})
export class MyComponent {}

</docs-code>

The compiler generates the component factory, which includes the `useValue` provider code, in a separate module. *That* factory module can't reach back to *this* source module to access the local \(non-exported\) `foo` variable.

You could fix the problem by initializing `foo`.

<docs-code language="typescript">
let foo = 42; // initialized
</docs-code>

The compiler will [fold](tools/cli/aot-compiler#code-folding) the expression into the provider as if you had written this.

<docs-code language="typescript">
providers: [
  { provide: Foo, useValue: 42 }
]
</docs-code>

Alternatively, you can fix it by exporting `foo` with the expectation that `foo` will be assigned at runtime when you actually know its value.

<docs-code language="typescript">
// CORRECTED
export let foo: number; // exported

@Component({
  selector: 'my-component',
  template: … ,
  providers: [
    { provide: Foo, useValue: foo }
  ]
})
export class MyComponent {}
</docs-code>

Adding `export` often works for variables referenced in metadata such as `providers` and `animations` because the compiler can generate *references* to the exported variables in these expressions. It doesn't need the *values* of those variables.

Adding `export` doesn't work when the compiler needs the *actual value*
in order to generate code.
For example, it doesn't work for the `template` property.

<docs-code language="typescript">

// ERROR
export let someTemplate: string; // exported but not initialized

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}

</docs-code>

The compiler needs the value of the `template` property *right now* to generate the component factory.
The variable reference alone is insufficient.
Prefixing the declaration with `export` merely produces a new error, "[`Only initialized variables and constants can be referenced`](#only-initialized-variables)".

### Only initialized variables and constants

HELPFUL: *Only initialized variables and constants can be referenced because the value of this variable is needed by the template compiler.*

The compiler found a reference to an exported variable or static field that wasn't initialized.
It needs the value of that variable to generate code.

The following example tries to set the component's `template` property to the value of the exported `someTemplate` variable which is declared but *unassigned*.

<docs-code language="typescript">

// ERROR
export let someTemplate: string;

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}

</docs-code>

You'd also get this error if you imported `someTemplate` from some other module and neglected to initialize it there.

<docs-code language="typescript">

// ERROR - not initialized there either
import { someTemplate } from './config';

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}

</docs-code>

The compiler cannot wait until runtime to get the template information.
It must statically derive the value of the `someTemplate` variable from the source code so that it can generate the component factory, which includes instructions for building the element based on the template.

To correct this error, provide the initial value of the variable in an initializer clause *on the same line*.

<docs-code language="typescript">

// CORRECTED
export let someTemplate = '<h1>Greetings from Angular</h1>';

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}

</docs-code>

### Reference to a non-exported class

HELPFUL: *Reference to a non-exported class `<class name>`.*
*Consider exporting the class.*

Metadata referenced a class that wasn't exported.

For example, you may have defined a class and used it as an injection token in a providers array but neglected to export that class.

<docs-code language="typescript">

// ERROR
abstract class MyStrategy { }

  …
  providers: [
    { provide: MyStrategy, useValue: … }
  ]
  …

</docs-code>

Angular generates a class factory in a separate module and that factory [can only access exported classes](tools/cli/aot-compiler#exported-symbols).
To correct this error, export the referenced class.

<docs-code language="typescript">

// CORRECTED
export abstract class MyStrategy { }

  …
  providers: [
    { provide: MyStrategy, useValue: … }
  ]
  …

</docs-code>

### Reference to a non-exported function

HELPFUL: *Metadata referenced a function that wasn't exported.*

For example, you may have set a providers `useFactory` property to a locally defined function that you neglected to export.

<docs-code language="typescript">

// ERROR
function myStrategy() { … }

  …
  providers: [
    { provide: MyStrategy, useFactory: myStrategy }
  ]
  …

</docs-code>

Angular generates a class factory in a separate module and that factory [can only access exported functions](tools/cli/aot-compiler#exported-symbols).
To correct this error, export the function.

<docs-code language="typescript">

// CORRECTED
export function myStrategy() { … }

  …
  providers: [
    { provide: MyStrategy, useFactory: myStrategy }
  ]
  …

</docs-code>

### Function calls are not supported

HELPFUL: *Function calls are not supported. Consider replacing the function or lambda with a reference to an exported function.*

The compiler does not currently support [function expressions or lambda functions](tools/cli/aot-compiler#function-expression).
For example, you cannot set a provider's `useFactory` to an anonymous function or arrow function like this.

<docs-code language="typescript">

// ERROR
  …
  providers: [
    { provide: MyStrategy, useFactory: function() { … } },
    { provide: OtherStrategy, useFactory: () => { … } }
  ]
  …

</docs-code>

You also get this error if you call a function or method in a provider's `useValue`.

<docs-code language="typescript">

// ERROR
import { calculateValue } from './utilities';

  …
  providers: [
    { provide: SomeValue, useValue: calculateValue() }
  ]
  …

</docs-code>

To correct this error, export a function from the module and refer to the function in a `useFactory` provider instead.

<docs-code language="typescript">

// CORRECTED
import { calculateValue } from './utilities';

export function myStrategy() { … }
export function otherStrategy() { … }
export function someValueFactory() {
  return calculateValue();
}
  …
  providers: [
    { provide: MyStrategy, useFactory: myStrategy },
    { provide: OtherStrategy, useFactory: otherStrategy },
    { provide: SomeValue, useFactory: someValueFactory }
  ]
  …

</docs-code>

### Destructured variable or constant not supported

HELPFUL: *Referencing an exported destructured variable or constant is not supported by the template compiler. Consider simplifying this to avoid destructuring.*

The compiler does not support references to variables assigned by [destructuring](https://www.typescriptlang.org/docs/handbook/variable-declarations.html#destructuring).

For example, you cannot write something like this:

<docs-code language="typescript">

// ERROR
import { configuration } from './configuration';

// destructured assignment to foo and bar
const {foo, bar} = configuration;
  …
  providers: [
    {provide: Foo, useValue: foo},
    {provide: Bar, useValue: bar},
  ]
  …

</docs-code>

To correct this error, refer to non-destructured values.

<docs-code language="typescript">

// CORRECTED
import { configuration } from './configuration';
  …
  providers: [
    {provide: Foo, useValue: configuration.foo},
    {provide: Bar, useValue: configuration.bar},
  ]
  …

</docs-code>

### Could not resolve type

HELPFUL: *The compiler encountered a type and can't determine which module exports that type.*

This can happen if you refer to an ambient type.
For example, the `Window` type is an ambient type declared in the global `.d.ts` file.

You'll get an error if you reference it in the component constructor, which the compiler must statically analyze.

<docs-code language="typescript">

// ERROR
@Component({ })
export class MyComponent {
  constructor (private win: Window) { … }
}

</docs-code>

TypeScript understands ambient types so you don't import them.
The Angular compiler does not understand a type that you neglect to export or import.

In this case, the compiler doesn't understand how to inject something with the `Window` token.

Do not refer to ambient types in metadata expressions.

If you must inject an instance of an ambient type,
you can finesse the problem in four steps:

1. Create an injection token for an instance of the ambient type.
1. Create a factory function that returns that instance.
1. Add a `useFactory` provider with that factory function.
1. Use `@Inject` to inject the instance.

Here's an illustrative example.

<docs-code language="typescript">

// CORRECTED
import { Inject } from '@angular/core';

export const WINDOW = new InjectionToken('Window');
export function _window() { return window; }

@Component({
  …
  providers: [
    { provide: WINDOW, useFactory: _window }
  ]
})
export class MyComponent {
  constructor (@Inject(WINDOW) private win: Window) { … }
}

</docs-code>

The `Window` type in the constructor is no longer a problem for the compiler because it
uses the `@Inject(WINDOW)` to generate the injection code.

Angular does something similar with the `DOCUMENT` token so you can inject the browser's `document` object \(or an abstraction of it, depending upon the platform in which the application runs\).

<docs-code language="typescript">

import { Inject }   from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({ … })
export class MyComponent {
  constructor (@Inject(DOCUMENT) private doc: Document) { … }
}

</docs-code>

### Name expected

HELPFUL: *The compiler expected a name in an expression it was evaluating.*

This can happen if you use a number as a property name as in the following example.

<docs-code language="typescript">

// ERROR
provider: [{ provide: Foo, useValue: { 0: 'test' } }]

</docs-code>

Change the name of the property to something non-numeric.

<docs-code language="typescript">

// CORRECTED
provider: [{ provide: Foo, useValue: { '0': 'test' } }]

</docs-code>

### Unsupported enum member name

HELPFUL: *Angular couldn't determine the value of the [enum member](https://www.typescriptlang.org/docs/handbook/enums.html) that you referenced in metadata.*

The compiler can understand simple enum values but not complex values such as those derived from computed properties.

<docs-code language="typescript">

// ERROR
enum Colors {
  Red = 1,
  White,
  Blue = "Blue".length // computed
}

  …
  providers: [
    { provide: BaseColor,   useValue: Colors.White } // ok
    { provide: DangerColor, useValue: Colors.Red }   // ok
    { provide: StrongColor, useValue: Colors.Blue }  // bad
  ]
  …

</docs-code>

Avoid referring to enums with complicated initializers or computed properties.

### Tagged template expressions are not supported

HELPFUL: *Tagged template expressions are not supported in metadata.*

The compiler encountered a JavaScript ES2015 [tagged template expression](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals) such as the following.

<docs-code language="typescript">

// ERROR
const expression = 'funky';
const raw = String.raw`A tagged template ${expression} string`;
 …
 template: '<div>' + raw + '</div>'
 …

</docs-code>

[`String.raw()`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/raw) is a *tag function* native to JavaScript ES2015.

The AOT compiler does not support tagged template expressions; avoid them in metadata expressions.

### Symbol reference expected

HELPFUL: *The compiler expected a reference to a symbol at the location specified in the error message.*

This error can occur if you use an expression in the `extends` clause of a class.

<!--todo: Chuck: After reviewing your PR comment I'm still at a loss. See [comment there](https://github.com/angular/angular/pull/17712#discussion_r132025495). -->

---


(From build-system-migration.md)

## Angular application build system

In v17 and higher, the new build system provides an improved way to build Angular applications. This new build system includes:

- A modern output format using ESM, with dynamic import expressions to support lazy module loading.
- Faster build-time performance for both initial builds and incremental rebuilds.
- Newer JavaScript ecosystem tools such as [esbuild](https://esbuild.github.io/) and [Vite](https://vitejs.dev/).
- Integrated SSR and prerendering capabilities.
- Automatic global and component stylesheet hot replacement.

This new build system is stable and fully supported for use with Angular applications.
You can migrate to the new build system with applications that use the `browser` builder.
If using a custom builder, please refer to the documentation for that builder on possible migration options.

IMPORTANT: The existing webpack-based build system is still considered stable and fully supported.
Applications can continue to use the `browser` builder and projects can opt-out of migrating during an update.

### For new applications

New applications will use this new build system by default via the `application` builder.

### For existing applications

Both automated and manual procedures are available depending on the requirements of the project.
Starting with v18, the update process will ask if you would like to migrate existing applications to use the new build system via the automated migration.
Prior to migrating, please consider reviewing the [Known Issues](#known-issues) section as it may contain relevant information for your project.

HELPFUL: Remember to remove any CommonJS assumptions in the application server code if using SSR such as `require`, `__filename`, `__dirname`, or other constructs from the [CommonJS module scope](https://nodejs.org/api/modules.html#the-module-scope). All application code should be ESM compatible. This does not apply to third-party dependencies.

#### Automated migration (Recommended)

The automated migration will adjust both the application configuration within `angular.json` as well as code and stylesheets to remove previous webpack-specific feature usage.
While many changes can be automated and most applications will not require any further changes, each application is unique and there may be some manual changes required.
After the migration, please attempt a build of the application as there could be new errors that will require adjustments within the code.
The errors will attempt to provide solutions to the problem when possible and the later sections of this guide describe some of the more common situations that you may encounter.
When updating to Angular v18 via `ng update`, you will be asked to execute the migration.
This migration is entirely optional for v18 and can also be run manually at anytime after an update via the following command:

<docs-code language="shell">

ng update @angular/cli --name use-application-builder

</docs-code>

The migration does the following:

* Converts existing `browser` or `browser-esbuild` target to `application`
* Removes any previous SSR builders (because `application` does that now).
* Updates configuration accordingly.
* Merges `tsconfig.server.json` with `tsconfig.app.json` and adds the TypeScript option `"esModuleInterop": true` to ensure `express` imports are [ESM compliant](#esm-default-imports-vs-namespace-imports).
* Updates application server code to use new bootstrapping and output directory structure.
* Removes any webpack-specific builder stylesheet usage such as the tilde or caret in `@import`/`url()` and updates the configuration to provide equivalent behavior
* Converts to use the new lower dependency `@angular/build` Node.js package if no other `@angular-devkit/build-angular` usage is found.

#### Manual migration

Additionally for existing projects, you can manually opt-in to use the new builder on a per-application basis with two different options.
Both options are considered stable and fully supported by the Angular team.
The choice of which option to use is a factor of how many changes you will need to make to migrate and what new features you would like to use in the project.

- The `browser-esbuild` builder builds only the client-side bundle of an application designed to be compatible with the existing `browser` builder that provides the preexisting build system.
This builder provides equivalent build options, and in many cases, it serves as a drop-in replacement for existing `browser` applications.
- The `application` builder covers an entire application, such as the client-side bundle, as well as optionally building a server for server-side rendering and performing build-time prerendering of static pages.

The `application` builder is generally preferred as it improves server-side rendered (SSR) builds, and makes it easier for client-side rendered projects to adopt SSR in the future.
However it requires a little more migration effort, particularly for existing SSR applications if performed manually.
If the `application` builder is difficult for your project to adopt, `browser-esbuild` can be an easier solution which gives most of the build performance benefits with fewer breaking changes.

##### Manual migration to the compatibility builder

A builder named `browser-esbuild` is available within the `@angular-devkit/build-angular` package that is present in an Angular CLI generated application.
You can try out the new build system for applications that use the `browser` builder.
If using a custom builder, please refer to the documentation for that builder on possible migration options.

The compatibility option was implemented to minimize the amount of changes necessary to initially migrate your applications.
This is provided via an alternate builder (`browser-esbuild`).
You can update the `build` target for any application target to migrate to the new build system.

The following is what you would typically find in `angular.json` for an application:

<docs-code language="json">
...
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:browser",
...
</docs-code>

Changing the `builder` field is the only change you will need to make.

<docs-code language="json">
...
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:browser-esbuild",
...
</docs-code>

##### Manual migration to the new `application` builder

A builder named `application` is also available within the `@angular-devkit/build-angular` package that is present in an Angular CLI generated application.
This builder is the default for all new applications created via `ng new`.

The following is what you would typically find in `angular.json` for an application:

<docs-code language="json">
...
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:browser",
...
</docs-code>

Changing the `builder` field is the first change you will need to make.

<docs-code language="json">
...
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:application",
...
</docs-code>

Once the builder name has been changed, options within the `build` target will need to be updated.
The following list discusses all the `browser` builder options that will need to be adjusted.

- `main` should be renamed to `browser`.
- `polyfills` should be an array, rather than a single file.
- `buildOptimizer` should be removed, as this is covered by the `optimization` option.
- `resourcesOutputPath` should be removed, this is now always `media`.
- `vendorChunk` should be removed, as this was a performance optimization which is no longer needed.
- `commonChunk` should be removed, as this was a performance optimization which is no longer needed.
- `deployUrl` should be removed and is not supported. Prefer [`<base href>`](guide/routing/common-router-tasks) instead. See [deployment documentation](tools/cli/deployment#--deploy-url) for more information.
- `ngswConfigPath` should be renamed to `serviceWorker`.

If the application is not using SSR currently, this should be the final step to allow `ng build` to function.
After executing `ng build` for the first time, there may be new warnings or errors based on behavioral differences or application usage of webpack-specific features.
Many of the warnings will provide suggestions on how to remedy that problem.
If it appears that a warning is incorrect or the solution is not apparent, please open an issue on [GitHub](https://github.com/angular/angular-cli/issues).
Also, the later sections of this guide provide additional information on several specific cases as well as current known issues.

For applications new to SSR, the [Angular SSR Guide](guide/ssr) provides additional information regarding the setup process for adding SSR to an application.

For applications that are already using SSR, additional adjustments will be needed to update the application server to support the new integrated SSR capabilities.
The `application` builder now provides the integrated functionality for all of the following preexisting builders:

- `app-shell`
- `prerender`
- `server`
- `ssr-dev-server`

The `ng update` process will automatically remove usages of the `@nguniversal` scope packages where some of these builders were previously located.
The new `@angular/ssr` package will also be automatically added and used with configuration and code being adjusted during the update.
The `@angular/ssr` package supports the `browser` builder as well as the `application` builder.

### Executing a build

Once you have updated the application configuration, builds can be performed using `ng build` as was previously done.
Depending on the choice of builder migration, some of the command line options may be different.
If the build command is contained in any `npm` or other scripts, ensure they are reviewed and updated.
For applications that have migrated to the `application` builder and that use SSR and/or prererending, you also may be able to remove extra `ng run` commands from scripts now that `ng build` has integrated SSR support.

<docs-code language="shell">

ng build

</docs-code>

### Starting the development server

The development server will automatically detect the new build system and use it to build the application.
To start the development server no changes are necessary to the `dev-server` builder configuration or command line.

<docs-code language="shell">

ng serve

</docs-code>

You can continue to use the [command line options](/cli/serve) you have used in the past with the development server.

HELPFUL: With the development server, you may see a small Flash of Unstyled Content (FOUC) on startup as the server initializes.
The development server attempts to defer processing of stylesheets until first use to improve rebuild times.
This will not occur in builds outside the development server.

#### Hot module replacement

Hot Module Replacement (HMR) is a technique used by development servers to avoid reloading the entire page when only part of an application is changed.
The changes in many cases can be immediately shown in the browser which allows for an improved edit/refresh cycle while developing an application.
While general JavaScript-based hot module replacement (HMR) is currently not supported, several more specific forms of HMR are available:
- **global stylesheet** (`styles` build option)
- **component stylesheet** (inline and file-based)
- **component template** (inline and file-based)

The HMR capabilities are automatically enabled and require no code or configuration changes to use.
Angular provides HMR support for both file-based (`templateUrl`/`styleUrl`/`styleUrls`) and inline (`template`/`styles`) component styles and templates.
The build system will attempt to compile and process the minimal amount of application code when it detects a stylesheet only change.

If preferred, the HMR capabilities can be disabled by setting the `hmr` development server option to `false`.
This can also be changed on the command line via:

<docs-code language="shell">

ng serve --no-hmr

</docs-code>

#### Vite as a development server

The usage of Vite in the Angular CLI is currently within a _development server capacity only_. Even without using the underlying Vite build system, Vite provides a full-featured development server with client side support that has been bundled into a low dependency npm package. This makes it an ideal candidate to provide comprehensive development server functionality. The current development server process uses the new build system to generate a development build of the application in memory and passes the results to Vite to serve the application. The usage of Vite, much like the Webpack-based development server, is encapsulated within the Angular CLI `dev-server` builder and currently cannot be directly configured.

#### Prebundling

Prebundling provides improved build and rebuild times when using the development server.
Vite provides [prebundling capabilities](https://vite.dev/guide/dep-pre-bundling) that are enabled by default when using the Angular CLI.
The prebundling process analyzes all the third-party project dependencies within a project and processes them the first time the development server is executed.
This process removes the need to rebuild and bundle the project's dependencies each time a rebuild occurs or the development server is executed.

In most cases, no additional customization is required. However, some situations where it may be needed include:
- Customizing loader behavior for imports within the dependency such as the [`loader` option](#file-extension-loader-customization)
- Symlinking a dependency to local code for development such as [`npm link`](https://docs.npmjs.com/cli/v10/commands/npm-link)
- Working around an error encountered during prebundling of a dependency

The prebundling process can be fully disabled or individual dependencies can be excluded if needed by a project.
The `dev-server` builder's `prebundle` option can be used for these customizations.
To exclude specific dependencies, the `prebundle.exclude` option is available:

<docs-code language="json">
    "serve": {
      "builder": "@angular/build:dev-server",
      "options": {
        "prebundle": {
          "exclude": ["some-dep"]
        }
      },
</docs-code>

By default, `prebundle` is set to `true` but can be set to `false` to fully disable prebundling.
However, excluding specific dependencies is recommended instead since rebuild times will increase with prebundling disabled.

<docs-code language="json">
    "serve": {
      "builder": "@angular/build:dev-server",
      "options": {
        "prebundle": false
      },
</docs-code>

### New features

One of the main benefits of the application build system is the improved build and rebuild speed.
However, the new application build system also provides additional features not present in the `browser` builder.

IMPORTANT: The new features of the `application` builder described here are incompatible with the `karma` test builder by default because it is using the `browser` builder internally.
Users can opt-in to use the `application` builder by setting the `builderMode` option to `application` for the `karma` builder.
This option is currently in developer preview.
If you notice any issues, please report them [here](https://github.com/angular/angular-cli/issues).

#### Build-time value replacement (define)

The `define` option allows identifiers present in the code to be replaced with another value at build time.
This is similar to the behavior of Webpack's `DefinePlugin` which was previously used with some custom Webpack configurations that used third-party builders.
The option can either be used within the `angular.json` configuration file or on the command line.
Configuring `define` within `angular.json` is useful for cases where the values are constant and able to be checked in to source control.

Within the configuration file, the option is in the form of an object.
The keys of the object represent the identifier to replace and the values of the object represent the corresponding replacement value for the identifier.
An example is as follows:

<docs-code language="json">
  "build": {
    "builder": "@angular/build:application",
    "options": {
      ...
      "define": {
          "SOME_NUMBER": "5",
          "ANOTHER": "'this is a string literal, note the extra single quotes'",
          "REFERENCE": "globalThis.someValue.noteTheAbsentSingleQuotes"
      }
    }
  }
</docs-code>

HELPFUL: All replacement values are defined as strings within the configuration file.
If the replacement is intended to be an actual string literal, it should be enclosed in single quote marks.
This allows the flexibility of using any valid JSON type as well as a different identifier as a replacement.

The command line usage is preferred for values that may change per build execution such as the git commit hash or an environment variable.
The CLI will merge `--define` values from the command line with `define` values from `angular.json`, including both in a build.
Command line usage takes precedence if the same identifier is present for both.
For command line usage, the `--define` option uses the format of `IDENTIFIER=VALUE`.

<docs-code language="shell">
ng build --define SOME_NUMBER=5 --define "ANOTHER='these will overwrite existing'"
</docs-code>

Environment variables can also be selectively included in a build.
For non-Windows shells, the quotes around the hash literal can be escaped directly if preferred.
This example assumes a bash-like shell but similar behavior is available for other shells as well.

<docs-code language="shell">
export MY_APP_API_HOST="http://example.com"
export API_RETRY=3
ng build --define API_HOST=\'$MY_APP_API_HOST\' --define API_RETRY=$API_RETRY
</docs-code>

For either usage, TypeScript needs to be aware of the types for the identifiers to prevent type-checking errors during the build.
This can be accomplished with an additional type definition file within the application source code (`src/types.d.ts`, for example) with similar content:

```ts
declare const SOME_NUMBER: number;
declare const ANOTHER: string;
declare const GIT_HASH: string;
declare const API_HOST: string;
declare const API_RETRY: number;
```

The default project configuration is already setup to use any type definition files present in the project source directories.
If the TypeScript configuration for the project has been altered, it may need to be adjusted to reference this newly added type definition file.

IMPORTANT: This option will not replace identifiers contained within Angular metadata such as a Component or Directive decorator.

#### File extension loader customization

IMPORTANT: This feature is only available with the `application` builder.

Some projects may need to control how all files with a specific file extension are loaded and bundled into an application.
When using the `application` builder, the `loader` option can be used to handle these cases.
The option allows a project to define the type of loader to use with a specified file extension.
A file with the defined extension can then be used within the application code via an import statement or dynamic import expression.
The available loaders that can be used are:
* `text` - inlines the content as a `string` available as the default export
* `binary` - inlines the content as a `Uint8Array` available as the default export
* `file` - emits the file at the application output path and provides the runtime location of the file as the default export
* `empty` - considers the content to be empty and will not include it in bundles

The `empty` value, while less common, can be useful for compatibility of third-party libraries that may contain bundler-specific import usage that needs to be removed.
One case for this is side-effect imports (`import 'my.css';`) of CSS files which has no effect in a browser.
Instead, the project can use `empty` and then the CSS files can be added to the `styles` build option or use some other injection method.

The loader option is an object-based option with the keys used to define the file extension and the values used to define the loader type.

An example of the build option usage to inline the content of SVG files into the bundled application would be as follows:

<docs-code language="json">
  "build": {
    "builder": "@angular/build:application",
    "options": {
      ...
      "loader": {
        ".svg": "text"
      }
    }
  }
</docs-code>

An SVG file can then be imported:
```ts
import contents from './some-file.svg';

console.log(contents); // <svg>...</svg>
```

Additionally, TypeScript needs to be aware of the module type for the import to prevent type-checking errors during the build. This can be accomplished with an additional type definition file within the application source code (`src/types.d.ts`, for example) with the following or similar content:
```ts
declare module "*.svg" {
  const content: string;
  export default content;
}
```

The default project configuration is already setup to use any type definition files (`.d.ts` files) present in the project source directories. If the TypeScript configuration for the project has been altered, the tsconfig may need to be adjusted to reference this newly added type definition file.

#### Import attribute loader customization

For cases where only certain files should be loaded in a specific way, per file control over loading behavior is available.
This is accomplished with a `loader` [import attribute](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with) that can be used with both import statements and expressions.
The presence of the import attribute takes precedence over all other loading behavior including JS/TS and any `loader` build option values.
For general loading for all files of an otherwise unsupported file type, the [`loader`](#file-extension-loader-customization) build option is recommended.

For the import attribute, the following loader values are supported:
* `text` - inlines the content as a `string` available as the default export
* `binary` - inlines the content as a `Uint8Array` available as the default export
* `file` - emits the file at the application output path and provides the runtime location of the file as the default export

An additional requirement to use import attributes is that the TypeScript `module` option must be set to `esnext` to allow TypeScript to successfully build the application code.
Once `ES2025` is available within TypeScript, this change will no longer be needed.

At this time, TypeScript does not support type definitions that are based on import attribute values.
The use of `@ts-expect-error`/`@ts-ignore` or the use of individual type definition files (assuming the file is only imported with the same loader attribute) is currently required.
As an example, an SVG file can be imported as text via:
```ts
// @ts-expect-error TypeScript cannot provide types based on attributes yet
import contents from './some-file.svg' with { loader: 'text' };
```

The same can be accomplished with an import expression inside an async function.
```ts
async function loadSvg(): Promise<string> {
  // @ts-expect-error TypeScript cannot provide types based on attributes yet
  return import('./some-file.svg', { with: { loader: 'text' } }).then((m) => m.default);
}
```
For the import expression, the `loader` value must be a string literal to be statically analyzed.
A warning will be issued if the value is not a string literal.

The `file` loader is useful when a file will be loaded at runtime through either a `fetch()`, setting to an image elements `src`, or other similar method.
```ts
// @ts-expect-error TypeScript cannot provide types based on attributes yet
import imagePath from './image.webp' with { loader: 'file' };

console.log(imagePath); // media/image-ULK2SIIB.webp
```
For production builds as shown in the code comment above, hashing will be automatically added to the path for long-term caching.

HELPFUL: When using the development server and using a `loader` attribute to import a file from a Node.js package, that package must be excluded from prebundling via the development server `prebundle` option.

#### Import/export conditions

Projects may need to map certain import paths to different files based on the type of build.
This can be particularly useful for cases such as `ng serve` needing to use debug/development specific code but `ng build` needing to use code without any development features/information.
Several import/export [conditions](https://nodejs.org/api/packages.html#community-conditions-definitions) are automatically applied to support these project needs:
* For optimized builds, the `production` condition is enabled.
* For non-optimized builds, the `development` condition is enabled.
* For browser output code, the `browser` condition is enabled.

An optimized build is determined by the value of the `optimization` option.
When `optimization` is set to `true` or more specifically if `optimization.scripts` is set to `true`, then the build is considered optimized.
This classification applies to both `ng build` and `ng serve`.
In a new project, `ng build` defaults to optimized and `ng serve` defaults to non-optimized.

A useful method to leverage these conditions within application code is to combine them with [subpath imports](https://nodejs.org/api/packages.html#subpath-imports).
By using the following import statement:
```ts
import {verboseLogging} from '#logger';
```

The file can be switched in the `imports` field in `package.json`:

<docs-code language="json">
{
  ...
  "imports": {
    "#logger": {
      "development": "./src/logging/debug.ts",
      "default": "./src/logging/noop.ts"
    }
  }
}
</docs-code>

For applications that are also using SSR, browser and server code can be switched by using the `browser` condition:

<docs-code language="json">
{
  ...
  "imports": {
    "#crashReporter": {
      "browser": "./src/browser-logger.ts",
      "default": "./src/server-logger.ts"
    }
  }
}
</docs-code>

These conditions also apply to Node.js packages and any defined [`exports`](https://nodejs.org/api/packages.html#conditional-exports) within the packages.

HELPFUL: If currently using the `fileReplacements` build option, this feature may be able to replace its usage.

### Known Issues

There are currently several known issues that you may encounter when trying the new build system. This list will be updated to stay current. If any of these issues are currently blocking you from trying out the new build system, please check back in the future as it may have been solved.

#### Type-checking of Web Worker code and processing of nested Web Workers

Web Workers can be used within application code using the same syntax (`new Worker(new URL('<workerfile>', import.meta.url))`) that is supported with the `browser` builder.
However, the code within the Worker will not currently be type-checked by the TypeScript compiler. TypeScript code is supported just not type-checked.
Additionally, any nested workers will not be processed by the build system. A nested worker is a Worker instantiation within another Worker file.

#### ESM default imports vs. namespace imports

TypeScript by default allows default exports to be imported as namespace imports and then used in call expressions.
This is unfortunately a divergence from the ECMAScript specification.
The underlying bundler (`esbuild`) within the new build system expects ESM code that conforms to the specification.
The build system will now generate a warning if your application uses an incorrect type of import of a package.
However, to allow TypeScript to accept the correct usage, a TypeScript option must be enabled within the application's `tsconfig` file.
When enabled, the [`esModuleInterop`](https://www.typescriptlang.org/tsconfig#esModuleInterop) option provides better alignment with the ECMAScript specification and is also recommended by the TypeScript team.
Once enabled, you can update package imports where applicable to an ECMAScript conformant form.

Using the [`moment`](https://npmjs.com/package/moment) package as an example, the following application code will cause runtime errors:

```ts
import * as moment from 'moment';

console.log(moment().format());
```

The build will generate a warning to notify you that there is a potential problem. The warning will be similar to:

<docs-code language="text">
▲ [WARNING] Calling "moment" will crash at run-time because it's an import namespace object, not a function [call-import-namespace]

    src/main.ts:2:12:
      2 │ console.log(moment().format());
        ╵             ~~~~~~

Consider changing "moment" to a default import instead:

    src/main.ts:1:7:
      1 │ import * as moment from 'moment';
        │        ~~~~~~~~~~~
        ╵        moment

</docs-code>

However, you can avoid the runtime errors and the warning by enabling the `esModuleInterop` TypeScript option for the application and changing the import to the following:

```ts
import moment from 'moment';

console.log(moment().format());
```

#### Order-dependent side-effectful imports in lazy modules

Import statements that are dependent on a specific ordering and are also used in multiple lazy modules can cause top-level statements to be executed out of order.
This is not common as it depends on the usage of side-effectful modules and does not apply to the `polyfills` option.
This is caused by a [defect](https://github.com/evanw/esbuild/issues/399) in the underlying bundler but will be addressed in a future update.

IMPORTANT: Avoiding the use of modules with non-local side effects (outside of polyfills) is recommended whenever possible regardless of the build system being used and avoids this particular issue. Modules with non-local side effects can have a negative effect on both application size and runtime performance as well.

### Bug reports

Report issues and feature requests on [GitHub](https://github.com/angular/angular-cli/issues).

Please provide a minimal reproduction where possible to aid the team in addressing issues.

---


(From build.md)

## Building Angular apps

You can build your Angular CLI application or library with the `ng build` command.
This will compile your TypeScript code to JavaScript, as well as optimize, bundle, and minify the output as appropriate.

`ng build` only executes the builder for the `build` target in the default project as specified in `angular.json`.
Angular CLI includes four builders typically used as `build` targets:

| Builder                                         | Purpose                                                                                                                                                                           |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@angular-devkit/build-angular:application`     | Builds an application with a client-side bundle, a Node server, and build-time prerendered routes with [esbuild](https://esbuild.github.io/).                                     |
| `@angular-devkit/build-angular:browser-esbuild` | Bundles a client-side application for use in a browser with [esbuild](https://esbuild.github.io/). See [`browser-esbuild` documentation](tools/cli/build-system-migration#manual-migration-to-the-compatibility-builder) for more information. |
| `@angular-devkit/build-angular:browser`         | Bundles a client-side application for use in a browser with [webpack](https://webpack.js.org/).                                                                                   |
| `@angular-devkit/build-angular:ng-packagr`      | Builds an Angular library adhering to [Angular Package Format](tools/libraries/angular-package-format).                                                                           |

Applications generated by `ng new` use `@angular-devkit/build-angular:application` by default.
Libraries generated by `ng generate library` use `@angular-devkit/build-angular:ng-packagr` by default.

You can determine which builder is being used for a particular project by looking up the `build` target for that project.

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "architect": {
        // `ng build` invokes the Architect target named `build`.
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          …
        },
        "serve": { … }
        "test": { … }
        …
      }
    }
  }
}

</docs-code>

This page discusses usage and options of `@angular-devkit/build-angular:application`.

### Output directory

The result of this build process is output to a directory (`dist/${PROJECT_NAME}` by default).

### Configuring size budgets

As applications grow in functionality, they also grow in size.
The CLI lets you set size thresholds in your configuration to ensure that parts of your application stay within size boundaries that you define.

Define your size boundaries in the CLI configuration file, `angular.json`, in a `budgets` section for each [configured environment](tools/cli/environments).

<docs-code language="json">

{
  …
  "configurations": {
    "production": {
      …
      "budgets": [
        {
          "type": "initial",
          "maximumWarning": "250kb",
          "maximumError": "500kb"
        },
      ]
    }
  }
}

</docs-code>

You can specify size budgets for the entire app, and for particular parts.
Each budget entry configures a budget of a given type.
Specify size values in the following formats:

| Size value      | Details                                                                     |
| :-------------- | :-------------------------------------------------------------------------- |
| `123` or `123b` | Size in bytes.                                                              |
| `123kb`         | Size in kilobytes.                                                          |
| `123mb`         | Size in megabytes.                                                          |
| `12%`           | Percentage of size relative to baseline. \(Not valid for baseline values.\) |

When you configure a budget, the builder warns or reports an error when a given part of the application reaches or exceeds a boundary size that you set.

Each budget entry is a JSON object with the following properties:

| Property       | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type           | The type of budget. One of: <table> <thead> <tr> <th> Value </th> <th> Details </th> </tr> </thead> <tbody> <tr> <td> <code>bundle</code> </td> <td> The size of a specific bundle. </td> </tr> <tr> <td> <code>initial</code> </td> <td> The size of JavaScript and CSS needed for bootstrapping the application. Defaults to warning at 500kb and erroring at 1mb. </td> </tr> <tr> <td> <code>allScript</code> </td> <td> The size of all scripts. </td> </tr> <tr> <td> <code>all</code> </td> <td> The size of the entire application. </td> </tr> <tr> <td> <code>anyComponentStyle</code> </td> <td> This size of any one component stylesheet. Defaults to warning at 2kb and erroring at 4kb. </td> </tr> <tr> <td> <code>anyScript</code> </td> <td> The size of any one script. </td> </tr> <tr> <td> <code>any</code> </td> <td> The size of any file. </td> </tr> </tbody> </table> |
| name           | The name of the bundle (for `type=bundle`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| baseline       | The baseline size for comparison.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| maximumWarning | The maximum threshold for warning relative to the baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| maximumError   | The maximum threshold for error relative to the baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| minimumWarning | The minimum threshold for warning relative to the baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| minimumError   | The minimum threshold for error relative to the baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| warning        | The threshold for warning relative to the baseline (min & max).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| error          | The threshold for error relative to the baseline (min & max).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

### Configuring CommonJS dependencies

Always prefer native [ECMAScript modules](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/import) (ESM) throughout your application and its dependencies.
ESM is a fully specified web standard and JavaScript language feature with strong static analysis support. This makes bundle optimizations more powerful than other module formats.

Angular CLI also supports importing [CommonJS](https://nodejs.org/api/modules.html) dependencies into your project and will bundle these dependencies automatically.
However, CommonJS modules can prevent bundlers and minifiers from optimizing those modules effectively, which results in larger bundle sizes.
For more information, see [How CommonJS is making your bundles larger](https://web.dev/commonjs-larger-bundles).

Angular CLI outputs warnings if it detects that your browser application depends on CommonJS modules.
When you encounter a CommonJS dependency, consider asking the maintainer to support ECMAScript modules, contributing that support yourself, or using an alternative dependency which meets your needs.
If the best option is to use a CommonJS dependency, you can disable these warnings by adding the CommonJS module name to `allowedCommonJsDependencies` option in the `build` options located in `angular.json`.

<docs-code language="json">

"build": {
  "builder": "@angular-devkit/build-angular:browser",
  "options": {
     "allowedCommonJsDependencies": [
        "lodash"
     ]
     …
   }
   …
},

</docs-code>

### Configuring browser compatibility

The Angular CLI uses [Browserslist](https://github.com/browserslist/browserslist) to ensure compatibility with different browser versions.
Depending on supported browsers, Angular will automatically transform certain JavaScript and CSS features to ensure the built application does not use a feature which has not been implemented by a supported browser. However, the Angular CLI will not automatically add polyfills to supplement missing Web APIs. Use the `polyfills` option in `angular.json` to add polyfills.

By default, the Angular CLI uses a `browserslist` configuration which [matches browsers supported by Angular](reference/versions#browser-support) for the current major version.

To override the internal configuration, run [`ng generate config browserslist`](cli/generate/config), which generates a `.browserslistrc` configuration file in the project directory matching Angular's supported browsers.

See the [browserslist repository](https://github.com/browserslist/browserslist) for more examples of how to target specific browsers and versions.
Avoid expanding this list to more browsers. Even if your application code more broadly compatible, Angular itself might not be.
You should only ever _reduce_ the set of browsers or versions in this list.

HELPFUL: Use [browsersl.ist](https://browsersl.ist) to display compatible browsers for a `browserslist` query.

### Configuring Tailwind

Angular supports [Tailwind](https://tailwindcss.com/), a utility-first CSS framework.

Follow the [Tailwind documentation](https://tailwindcss.com/docs/installation/framework-guides/angular) for integrating with Angular CLI.

---


(From cli-builder.md)

## Angular CLI builders

A number of Angular CLI commands run a complex process on your code, such as building, testing, or serving your application.
The commands use an internal tool called Architect to run *CLI builders*, which invoke another tool (bundler, test runner, server) to accomplish the desired task.
Custom builders can perform an entirely new task, or to change which third-party tool is used by an existing command.

This document explains how CLI builders integrate with the workspace configuration file, and shows how you can create your own builder.

HELPFUL: Find the code from the examples used here in this [GitHub repository](https://github.com/mgechev/cli-builders-demo).

### CLI builders

The internal Architect tool delegates work to handler functions called *builders*.
A builder handler function receives two arguments:

| Argument  | Type             |
|:---       |:---              |
| `options` | `JSONObject`     |
| `context` | `BuilderContext` |

The separation of concerns here is the same as with [schematics](tools/cli/schematics-authoring), which are used for other CLI commands that touch your code (such as `ng generate`).

* The `options` object is provided by the CLI user's options and configuration, while the `context` object is provided by the CLI Builder API automatically.
* In addition to the contextual information, the `context` object also provides access to a scheduling method, `context.scheduleTarget()`.
    The scheduler executes the builder handler function with a given target configuration.

The builder handler function can be synchronous (return a value), asynchronous (return a `Promise`), or watch and return multiple values (return an `Observable`).
The return values must always be of type `BuilderOutput`.
This object contains a Boolean `success` field and an optional `error` field that can contain an error message.

Angular provides some builders that are used by the CLI for commands such as `ng build` and `ng test`.
Default target configurations for these and other built-in CLI builders can be found and configured in the "architect" section of the [workspace configuration file](reference/configs/workspace-config), `angular.json`.
Also, extend and customize Angular by creating your own builders, which you can run directly using the [`ng run` CLI command](cli/run).

#### Builder project structure

A builder resides in a "project" folder that is similar in structure to an Angular workspace, with global configuration files at the top level, and more specific configuration in a source folder with the code files that define the behavior.
For example, your `myBuilder` folder could contain the following files.

| Files                    | Purpose                                                                                                   |
|:---                      | :---                                                                                                      |
| `src/my-builder.ts`      | Main source file for the builder definition.                                                              |
| `src/my-builder.spec.ts` | Source file for tests.                                                                                    |
| `src/schema.json`        | Definition of builder input options.                                                                      |
| `builders.json`          | Builders definition.                                                                                      |
| `package.json`           | Dependencies. See [https://docs.npmjs.com/files/package.json](https://docs.npmjs.com/files/package.json). |
| `tsconfig.json`          | [TypeScript configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).              |

Builders can be published to `npm`, see [Publishing your Library](tools/libraries/creating-libraries).

### Creating a builder

As an example, create a builder that copies a file to a new location.
To create a builder, use the `createBuilder()` CLI Builder function, and return a `Promise<BuilderOutput>` object.

<docs-code header="src/my-builder.ts (builder skeleton)" path="adev/src/content/examples/cli-builder/src/my-builder.ts" visibleRegion="builder-skeleton"/>

Now let's add some logic to it.
The following code retrieves the source and destination file paths from user options and copies the file from the source to the destination \(using the [Promise version of the built-in NodeJS `copyFile()` function](https://nodejs.org/api/fs.html#fs_fspromises_copyfile_src_dest_mode)\).
If the copy operation fails, it returns an error with a message about the underlying problem.

<docs-code header="src/my-builder.ts (builder)" path="adev/src/content/examples/cli-builder/src/my-builder.ts" visibleRegion="builder"/>

#### Handling output

By default, `copyFile()` does not print anything to the process standard output or error.
If an error occurs, it might be difficult to understand exactly what the builder was trying to do when the problem occurred.
Add some additional context by logging additional information using the `Logger` API.
This also lets the builder itself be executed in a separate process, even if the standard output and error are deactivated.

You can retrieve a `Logger` instance from the context.

<docs-code header="src/my-builder.ts (handling output)" path="adev/src/content/examples/cli-builder/src/my-builder.ts" visibleRegion="handling-output"/>

#### Progress and status reporting

The CLI Builder API includes progress and status reporting tools, which can provide hints for certain functions and interfaces.

To report progress, use the `context.reportProgress()` method, which takes a current value, optional total, and status string as arguments.
The total can be any number. For example, if you know how many files you have to process, the total could be the number of files, and current should be the number processed so far.
The status string is unmodified unless you pass in a new string value.

In our example, the copy operation either finishes or is still executing, so there's no need for a progress report, but you can report status so that a parent builder that called our builder would know what's going on.
Use the `context.reportStatus()` method to generate a status string of any length.

HELPFUL: There's no guarantee that a long string will be shown entirely; it could be cut to fit the UI that displays it.

Pass an empty string to remove the status.

<docs-code header="src/my-builder.ts (progress reporting)" path="adev/src/content/examples/cli-builder/src/my-builder.ts" visibleRegion="progress-reporting"/>

### Builder input

You can invoke a builder indirectly through a CLI command such as `ng build`, or directly with the Angular CLI `ng run` command.
In either case, you must provide required inputs, but can let other inputs default to values that are pre-configured for a specific *target*, specified by a [configuration](tools/cli/environments), or set on the command line.

#### Input validation

You define builder inputs in a JSON schema associated with that builder.
Similar to schematics, the Architect tool collects the resolved input values into an `options` object, and validates their types against the schema before passing them to the builder function.

For our example builder, `options` should be a `JsonObject` with two keys:
a `source` and a `destination`, each of which are a string.

You can provide the following schema for type validation of these values.

<docs-code header="src/schema.json" language="json">

{
  "$schema": "http://json-schema.org/schema",
  "type": "object",
  "properties": {
    "source": {
      "type": "string"
    },
    "destination": {
      "type": "string"
    }
  }
}

</docs-code>

HELPFUL: This is a minimal example, but the use of a schema for validation can be very powerful.
For more information, see the [JSON schemas website](http://json-schema.org).

To link our builder implementation with its schema and name, you need to create a *builder definition* file, which you can point to in `package.json`.

Create a file named `builders.json` that looks like this:

<docs-code header="builders.json" language="json">

{
  "builders": {
    "copy": {
      "implementation": "./dist/my-builder.js",
      "schema": "./src/schema.json",
      "description": "Copies a file."
    }
  }
}

</docs-code>

In the `package.json` file, add a `builders` key that tells the Architect tool where to find our builder definition file.

<docs-code header="package.json" language="json">

{
  "name": "@example/copy-file",
  "version": "1.0.0",
  "description": "Builder for copying files",
  "builders": "builders.json",
  "dependencies": {
    "@angular-devkit/architect": "~0.1200.0",
    "@angular-devkit/core": "^12.0.0"
  }
}

</docs-code>

The official name of our builder is now `@example/copy-file:copy`.
The first part of this is the package name and the second part is the builder name as specified in the `builders.json` file.

These values are accessed on `options.source` and `options.destination`.

<docs-code header="src/my-builder.ts (report status)" path="adev/src/content/examples/cli-builder/src/my-builder.ts" visibleRegion="report-status"/>

#### Target configuration

A builder must have a defined target that associates it with a specific input configuration and project.

Targets are defined in the `angular.json` [CLI configuration file](reference/configs/workspace-config).
A target specifies the builder to use, its default options configuration, and named alternative configurations.
Architect in the Angular CLI uses the target definition to resolve input options for a given run.

The `angular.json` file has a section for each project, and the "architect" section of each project configures targets for builders used by CLI commands such as 'build', 'test', and 'serve'.
By default, for example, the `ng build` command runs the builder `@angular-devkit/build-angular:browser` to perform the build task, and passes in default option values as specified for the `build` target in `angular.json`.

<docs-code header="angular.json" language="json">

…

"myApp": {
  …
  "architect": {
    "build": {
      "builder": "@angular-devkit/build-angular:browser",
      "options": {
        "outputPath": "dist/myApp",
        "index": "src/index.html",
        …
      },
      "configurations": {
        "production": {
          "fileReplacements": [
            {
              "replace": "src/environments/environment.ts",
              "with": "src/environments/environment.prod.ts"
            }
          ],
          "optimization": true,
          "outputHashing": "all",
          …
        }
      }
    },
    …
  }
}

…

</docs-code>

The command passes the builder the set of default options specified in the "options" section.
If you pass the `--configuration=production` flag, it uses the override values specified in the `production` configuration.
Specify further option overrides individually on the command line.

##### Target strings

The generic `ng run` CLI command takes as its first argument a target string of the following form.

<docs-code language="shell">

project:target[:configuration]

</docs-code>

|               | Details |
|:---           |:---     |
| project       | The name of the Angular CLI project that the target is associated with.                                               |
| target        | A named builder configuration from the `architect` section of the `angular.json` file.                                |
| configuration | (optional) The name of a specific configuration override for the given target, as defined in the `angular.json` file. |

If your builder calls another builder, it might need to read a passed target string.
Parse this string into an object by using the `targetFromTargetString()` utility function from `@angular-devkit/architect`.

### Schedule and run

Architect runs builders asynchronously.
To invoke a builder, you schedule a task to be run when all configuration resolution is complete.

The builder function is not executed until the scheduler returns a `BuilderRun` control object.
The CLI typically schedules tasks by calling the `context.scheduleTarget()` function, and then resolves input options using the target definition in the `angular.json` file.

Architect resolves input options for a given target by taking the default options object, then overwriting values from the configuration, then further overwriting values from the overrides object passed to `context.scheduleTarget()`.
For the Angular CLI, the overrides object is built from command line arguments.

Architect validates the resulting options values against the schema of the builder.
If inputs are valid, Architect creates the context and executes the builder.

For more information see [Workspace Configuration](reference/configs/workspace-config).

HELPFUL: You can also invoke a builder directly from another builder or test by calling `context.scheduleBuilder()`.
You pass an `options` object directly to the method, and those option values are validated against the schema of the builder without further adjustment.

Only the  `context.scheduleTarget()` method resolves the configuration and overrides through the `angular.json` file.

#### Default architect configuration

Let's create a simple `angular.json` file that puts target configurations into context.

You can publish the builder to npm (see [Publishing your Library](tools/libraries/creating-libraries#publishing-your-library)), and install it using the following command:

<docs-code language="shell">

npm install @example/copy-file

</docs-code>

If you create a new project with `ng new builder-test`, the generated `angular.json` file looks something like this, with only default builder configurations.

<docs-code header="angular.json" language="json">

{
  "projects": {
    "builder-test": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            // more options...
            "outputPath": "dist/builder-test",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": "src/polyfills.ts",
            "tsConfig": "src/tsconfig.app.json"
          },
          "configurations": {
            "production": {
              // more options...
              "optimization": true,
              "aot": true,
              "buildOptimizer": true
            }
          }
        }
      }
    }
  }
}

</docs-code>

#### Adding a target

Add a new target that will run our builder to copy a file.
This target tells the builder to copy the `package.json` file.

* We will add a new target section to the `architect` object for our project
* The target named `copy-package` uses our builder, which you published to `@example/copy-file`.
* The options object provides default values for the two inputs that you defined.
  * `source` - The existing file you are copying.
  * `destination` - The path you want to copy to.

<docs-code header="angular.json" language="json">

{
  "projects": {
    "builder-test": {
      "architect": {
        "copy-package": {
          "builder": "@example/copy-file:copy",
          "options": {
            "source": "package.json",
            "destination": "package-copy.json"
          }
        },

        // Existing targets...
      }
    }
  }
}

</docs-code>

#### Running the builder

To run our builder with the new target's default configuration, use the following CLI command.

<docs-code language="shell">

ng run builder-test:copy-package

</docs-code>

This copies the `package.json` file to `package-copy.json`.

Use command-line arguments to override the configured defaults.
For example, to run with a different `destination` value, use the following CLI command.

<docs-code language="shell">

ng run builder-test:copy-package --destination=package-other.json

</docs-code>

This copies the file to `package-other.json` instead of `package-copy.json`.
Because you did not override the *source* option, it will still copy from the default `package.json` file.

### Testing a builder

Use integration testing for your builder, so that you can use the Architect scheduler to create a context, as in this [example](https://github.com/mgechev/cli-builders-demo).
In the builder source directory, create a new test file `my-builder.spec.ts`. The test creates new instances of `JsonSchemaRegistry` (for schema validation), `TestingArchitectHost` (an in-memory implementation of `ArchitectHost`), and `Architect`.

Here's an example of a test that runs the copy file builder.
The test uses the builder to copy the `package.json` file and validates that the copied file's contents are the same as the source.

<docs-code header="src/my-builder.spec.ts" path="adev/src/content/examples/cli-builder/src/my-builder.spec.ts"/>

HELPFUL: When running this test in your repo, you need the [`ts-node`](https://github.com/TypeStrong/ts-node) package.
You can avoid this by renaming `my-builder.spec.ts` to `my-builder.spec.js`.

#### Watch mode

Most builders to run once and return. However, this behavior is not entirely compatible with a builder that watches for changes (like a devserver, for example).
Architect can support watch mode, but there are some things to look out for.

* To be used with watch mode, a builder handler function should return an `Observable`.
    Architect subscribes to the `Observable` until it completes and might reuse it if the builder is scheduled again with the same arguments.

* The builder should always emit a `BuilderOutput` object after each execution.
    Once it's been executed, it can enter a watch mode, to be triggered by an external event.
    If an event triggers it to restart, the builder should execute the `context.reportRunning()` function to tell Architect that it is running again.
    This prevents Architect from stopping the builder if another run is scheduled.

When your builder calls `BuilderRun.stop()` to exit watch mode, Architect unsubscribes from the builder's `Observable` and calls the builder's teardown logic to clean up.
This behavior also allows for long-running builds to be stopped and cleaned up.

In general, if your builder is watching an external event, you should separate your run into three phases.

| Phases     | Details |
|:---        |:---     |
| Running    | The task being performed, such as invoking a compiler. This ends when the compiler finishes and your builder emits a `BuilderOutput` object.                                                                                                  |
| Watching   | Between two runs, watch an external event stream. For example, watch the file system for any changes. This ends when the compiler restarts, and `context.reportRunning()` is called.                                                          |
| Completion | Either the task is fully completed, such as a compiler which needs to run a number of times, or the builder run was stopped (using `BuilderRun.stop()`). Architect executes teardown logic and unsubscribes from your builder's `Observable`. |

### Summary

The CLI Builder API provides a means of changing the behavior of the Angular CLI by using builders to execute custom logic.

* Builders can be synchronous or asynchronous, execute once or watch for external events, and can schedule other builders or targets.
* Builders have option defaults specified in the `angular.json` configuration file, which can be overwritten by an alternate configuration for the target, and further overwritten by command line flags
* The Angular team recommends that you use integration tests to test Architect builders. Use unit tests to validate the logic that the builder executes.
* If your builder returns an `Observable`, it should clean up the builder in the teardown logic of that `Observable`.

---


(From deployment.md)

## Deployment

When you are ready to deploy your Angular application to a remote server, you have various options.

### Automatic deployment with the CLI

The Angular CLI command `ng deploy` executes the `deploy` [CLI builder](tools/cli/cli-builder) associated with your project.
A number of third-party builders implement deployment capabilities to different platforms.
You can add any of them to your project with `ng add`.

When you add a package with deployment capability, it will automatically update your workspace configuration (`angular.json` file) with a `deploy` section for the selected project.
You can then use the `ng deploy` command to deploy that project.

For example, the following command automatically deploys a project to [Firebase](https://firebase.google.com/).

<docs-code language="shell">

ng add @angular/fire
ng deploy

</docs-code>

The command is interactive.
In this case, you must have or create a Firebase account and authenticate using it.
The command prompts you to select a Firebase project for deployment before building your application and uploading the production assets to Firebase.

The table below lists tools which implement deployment functionality to different platforms.
The `deploy` command for each package may require different command line options.
You can read more by following the links associated with the package names below:

| Deployment to                                                     | Setup Command                                                                              |
|:---                                                               |:---                                                                                  |
| [Firebase hosting](https://firebase.google.com/docs/hosting)      | [`ng add @angular/fire`](https://npmjs.org/package/@angular/fire)                           |
| [Vercel](https://vercel.com/solutions/angular)                    | [`vercel init angular`](https://github.com/vercel/vercel/tree/main/examples/angular) |
| [Netlify](https://www.netlify.com)                                | [`ng add @netlify-builder/deploy`](https://npmjs.org/package/@netlify-builder/deploy)       |
| [GitHub pages](https://pages.github.com)                          | [`ng add angular-cli-ghpages`](https://npmjs.org/package/angular-cli-ghpages)               |
| [Amazon Cloud S3](https://aws.amazon.com/s3/?nc2=h_ql_prod_st_s3) | [`ng add @jefiozie/ngx-aws-deploy`](https://www.npmjs.com/package/@jefiozie/ngx-aws-deploy) |

If you're deploying to a self-managed server or there's no builder for your favorite cloud platform, you can either [create a builder](tools/cli/cli-builder) that allows you to use the `ng deploy` command, or read through this guide to learn how to manually deploy your application.

### Manual deployment to a remote server

To manually deploy your application, create a production build and copy the output directory to a web server or content delivery network (CDN).
By default, `ng build` uses the `production` configuration.
If you have customized your build configurations, you may want to confirm [production optimizations](tools/cli/deployment#production-optimizations) are being applied before deploying.

`ng build` outputs the built artifacts to `dist/my-app/` by default, however this path can be configured with the `outputPath` option in the `@angular-devkit/build-angular:browser` builder.
Copy this directory to the server and configure it to serve the directory.

While this is a minimal deployment solution, there are a few requirements for the server to serve your Angular application correctly.

### Server configuration

This section covers changes you may need to configure on the server to run your Angular application.

#### Routed apps must fall back to `index.html`

Client-side rendered Angular applications are perfect candidates for serving with a static HTML server because all the content is static and generated at build time.

If the application uses the Angular router, you must configure the server to return the application's host page (`index.html`) when asked for a file that it does not have.

A routed application should support "deep links".
A *deep link* is a URL that specifies a path to a component inside the application.
For example, `http://my-app.test/users/42` is a *deep link* to the user detail page that displays the user with `id` 42.

There is no issue when the user initially loads the index page and then navigates to that URL from within a running client.
The Angular router performs the navigation *client-side* and does not request a new HTML page.

But clicking a deep link in an email, entering it in the browser address bar, or even refreshing the browser while already on the deep linked page will all be handled by the browser itself, *outside* the running application.
The browser makes a direct request to the server for `/users/42`, bypassing Angular's router.

A static server routinely returns `index.html` when it receives a request for `http://my-app.test/`.
But most servers by default will reject `http://my-app.test/users/42` and returns a `404 - Not Found` error *unless* it is configured to return `index.html` instead.
Configure the fallback route or 404 page to `index.html` for your server, so Angular is served for deep links and can display the correct route.
Some servers call this fallback behavior "Single-Page Application" (SPA) mode.

Once the browser loads the application, Angular router will read the URL to determine which page it is on and display `/users/42` correctly.

For "real" 404 pages such as `http://my-app.test/does-not-exist`, the server does not require any additional configuration.
[404 pages implemented in the Angular router](guide/routing/common-router-tasks#displaying-a-404-page) will be displayed correctly.

#### Requesting data from a different server (CORS)

Web developers may encounter a [*cross-origin resource sharing*](https://developer.mozilla.org/docs/Web/HTTP/CORS "Cross-origin resource sharing") error when making a network request to a server other than the application's own host server.
Browsers forbid such requests unless the server explicitly permits them.

There isn't anything Angular or the client application can do about these errors.
The _server_ must be configured to accept the application's requests.
Read about how to enable CORS for specific servers at [enable-cors.org](https://enable-cors.org/server.html "Enabling CORS server").

### Production optimizations

`ng build` uses the `production` configuration unless configured otherwise. This configuration enables the following build optimization features.

| Features                                                           | Details                                                                                       |
|:---                                                                |:---                                                                                           |
| [Ahead-of-Time (AOT) Compilation](tools/cli/aot-compiler)          | Pre-compiles Angular component templates.                                                     |
| [Production mode](tools/cli/deployment#development-only-features) | Optimizes the application for the best runtime performance                                    |
| Bundling                                                           | Concatenates your many application and library files into a minimum number of deployed files. |
| Minification                                                       | Removes excess whitespace, comments, and optional tokens.                                     |
| Mangling                                                           | Renames functions, classes, and variables to use shorter, arbitrary identifiers.              |
| Dead code elimination                                              | Removes unreferenced modules and unused code.                                                 |

See [`ng build`](cli/build) for more about CLI build options and their effects.

#### Development-only features

When you run an application locally using `ng serve`, Angular uses the development configuration
at runtime which enables:

* Extra safety checks such as [`expression-changed-after-checked`](errors/NG0100) detection.
* More detailed error messages.
* Additional debugging utilities such as the global `ng` variable with [debugging functions](api#core-global) and [Angular DevTools](tools/devtools) support.

These features are helpful during development, but they require extra code in the app, which is
undesirable in production. To ensure these features do not negatively impact bundle size for end users, Angular CLI
removes development-only code from the bundle when building for production.

Building your application with `ng build` by default uses the `production` configuration which removes these features from the output for optimal bundle size.

### `--deploy-url`

`--deploy-url` is a command line option used to specify the base path for resolving relative URLs for assets such as images, scripts, and style sheets at *compile* time.

<docs-code language="shell">

ng build --deploy-url /my/assets

</docs-code>

The effect and purpose of `--deploy-url` overlaps with [`<base href>`](guide/routing/common-router-tasks). Both can be used for initial scripts, stylesheets, lazy scripts, and css resources.

Unlike `<base href>` which can be defined in a single place at runtime, the `--deploy-url` needs to be hard-coded into an application at build time.
Prefer `<base href>` where possible.

---


(From end-to-end.md)

## End to End Testing

End-to-end or (E2E) testing is a form of testing used to assert your entire application works as expected from start to finish or _"end-to-end"_. E2E testing differs from unit testing in that it is completely decoupled from the underlying implementation details of your code. It is typically used to validate an application in a way that mimics the way a user would interact with it. This page serves as a guide to getting started with end-to-end testing in Angular using the Angular CLI.

### Set Up E2E Testing

The Angular CLI downloads and installs everything you need to run end-to-end tests for your Angular application.

<docs-code language="shell">

ng e2e

</docs-code>

The `ng e2e` command will first check your project for the "e2e" target. If it can't locate it, the CLI will then prompt you which e2e package you would like to use and walk you through the setup.

<docs-code language="shell">

Cannot find "e2e" target for the specified project.
You can add a package that implements these capabilities.

For example:
Cypress: ng add @cypress/schematic
Nightwatch: ng add @nightwatch/schematics
WebdriverIO: ng add @wdio/schematics
Playwright: ng add playwright-ng-schematics
Puppeteer: ng add @puppeteer/ng-schematics

Would you like to add a package with "e2e" capabilities now?
No
❯ Cypress
Nightwatch
WebdriverIO
Playwright
Puppeteer

</docs-code>

If you don't find the test runner you would like to use from the list above, you can manually add a package using `ng add`.

### Running E2E Tests

Now that your application is configured for end-to-end testing we can now run the same command to execute your tests.

<docs-code language="shell">

ng e2e

</docs-code>

Note, their isn't anything "special" about running your tests with any of the integrated e2e packages. The `ng e2e` command is really just running the `e2e` builder under the hood. You can always [create your own custom builder](tools/cli/cli-builder#creating-a-builder) named `e2e` and run it using `ng e2e`.

### More information on end-to-end testing tools

| Testing Tool | Details                                                                                                              |
| :----------- | :------------------------------------------------------------------------------------------------------------------- |
| Cypress      | [Getting started with Cypress](https://docs.cypress.io/guides/end-to-end-testing/writing-your-first-end-to-end-test) |
| Nightwatch   | [Getting started with Nightwatch](https://nightwatchjs.org/guide/writing-tests/introduction.html)                    |
| WebdriverIO  | [Getting started with Webdriver.io](https://webdriver.io/docs/gettingstarted)                                        |
| Playwright   | [Getting started with Playwright](https://playwright.dev/docs/writing-tests)                                         |
| Puppeteer    | [Getting started with Puppeteer](https://pptr.dev)                                                                   |

---


(From environments.md)

## Configuring application environments

You can define different named build configurations for your project, such as `development` and `staging`, with different defaults.

Each named configuration can have defaults for any of the options that apply to the various builder targets, such as `build`, `serve`, and `test`.
The [Angular CLI](tools/cli) `build`, `serve`, and `test` commands can then replace files with appropriate versions for your intended target environment.

### Angular CLI configurations

Angular CLI builders support a `configurations` object, which allows overwriting specific options for a builder based on the configuration provided on the command line.

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            // By default, disable source map generation.
            "sourceMap": false
          },
          "configurations": {
            // For the `debug` configuration, enable source maps.
            "debug": {
              "sourceMap": true
            }
          }
        },
        …
      }
    }
  }
}

</docs-code>

You can choose which configuration to use with the `--configuration` option.

<docs-code language="shell">

ng build --configuration debug

</docs-code>

Configurations can be applied to any Angular CLI builder. Multiple configurations can be specified with a comma separator. The configurations are applied in order, with conflicting options using the value from the last configuration.

<docs-code language="shell">

ng build --configuration debug,production,customer-facing

</docs-code>

### Configure environment-specific defaults

`@angular-devkit/build-angular:browser` supports file replacements, an option for substituting source files before executing a build.
Using this in combination with `--configuration` provides a mechanism for configuring environment-specific data in your application.

Start by [generating environments](cli/generate/environments) to create the `src/environments/` directory and configure the project to use file replacements.

<docs-code language="shell">

ng generate environments

</docs-code>

The project's `src/environments/` directory contains the base configuration file, `environment.ts`, which provides the default configuration for production.
You can override default values for additional environments, such as `development` and `staging`, in target-specific configuration files.

For example:

<docs-code language="text">

my-app/src/environments
├── environment.development.ts
├── environment.staging.ts
└── environment.ts

</docs-code>

The base file `environment.ts`, contains the default environment settings.
For example:

<docs-code language="typescript">

export const environment = {
  production: true
};

</docs-code>

The `build` command uses this as the build target when no environment is specified.
You can add further variables, either as additional properties on the environment object, or as separate objects.
For example, the following adds a default for a variable to the default environment:

<docs-code language="typescript">

export const environment = {
  production: true,
  apiUrl: 'http://my-prod-url'
};

</docs-code>

You can add target-specific configuration files, such as `environment.development.ts`.
The following content sets default values for the development build target:

<docs-code language="typescript">

export const environment = {
  production: false,
  apiUrl: 'http://my-dev-url'
};

</docs-code>

### Using environment-specific variables in your app

To use the environment configurations you have defined, your components must import the original environments file:

<docs-code language="typescript">

import { environment } from './environments/environment';

</docs-code>

This ensures that the build and serve commands can find the configurations for specific build targets.

The following code in the component file (`app.component.ts`) uses an environment variable defined in the configuration files.

<docs-code language="typescript">

import { environment } from './../environments/environment';

// Fetches from `http://my-prod-url` in production, `http://my-dev-url` in development.
fetch(environment.apiUrl);

</docs-code>

The main CLI configuration file, `angular.json`, contains a `fileReplacements` section in the configuration for each build target, which lets you replace any file in the TypeScript program with a target-specific version of that file.
This is useful for including target-specific code or variables in a build that targets a specific environment, such as production or staging.

By default no files are replaced, however `ng generate environments` sets up this configuration automatically.
You can change or add file replacements for specific build targets by editing the `angular.json` configuration directly.

<docs-code language="json">

  "configurations": {
    "development": {
      "fileReplacements": [
          {
            "replace": "src/environments/environment.ts",
            "with": "src/environments/environment.development.ts"
          }
        ],
        …

</docs-code>

This means that when you build your development configuration with `ng build --configuration development`, the `src/environments/environment.ts` file is replaced with the target-specific version of the file, `src/environments/environment.development.ts`.

To add a staging environment, create a copy of `src/environments/environment.ts` called `src/environments/environment.staging.ts`, then add a `staging` configuration to `angular.json`:

<docs-code language="json">

  "configurations": {
    "development": { … },
    "production": { … },
    "staging": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.staging.ts"
        }
      ]
    }
  }

</docs-code>

You can add more configuration options to this target environment as well.
Any option that your build supports can be overridden in a build target configuration.

To build using the staging configuration, run the following command:

<docs-code language="shell">

ng build --configuration staging

</docs-code>

By default, the `build` target includes `production` and `development` configurations and `ng serve` uses the development build of the application.
You can also configure `ng serve` to use the targeted build configuration if you set the `buildTarget` option:

<docs-code language="json">

  "serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "options": { … },
    "configurations": {
      "development": {
        // Use the `development` configuration of the `build` target.
        "buildTarget": "my-app:build:development"
      },
      "production": {
        // Use the `production` configuration of the `build` target.
        "buildTarget": "my-app:build:production"
      }
    },
    "defaultConfiguration": "development"
  },

</docs-code>

The `defaultConfiguration` option specifies which configuration is used by default.
When `defaultConfiguration` is not set, `options` are used directly without modification.

---


(From overview.md)

## The Angular CLI

The Angular CLI is a command-line interface tool which allows you to scaffold, develop, test, deploy, and maintain Angular applications directly from a command shell.

Angular CLI is published on npm as the `@angular/cli` package and includes a binary named `ng`. Commands invoking `ng` are using the Angular CLI.

<docs-callout title="Try Angular without local setup">

If you are new to Angular, you might want to start with [Try it now!](tutorials/learn-angular), which introduces the essentials of Angular in the context of a ready-made basic online store app for you to examine and modify.
This standalone tutorial takes advantage of the interactive [StackBlitz](https://stackblitz.com) environment for online development.
You don't need to set up your local environment until you're ready.

</docs-callout>

<docs-card-container>
  <docs-card title="Getting Started" link="Get Started" href="tools/cli/setup-local">
    Install Angular CLI to create and build your first app.
  </docs-card>
  <docs-card title="Command Reference" link="Learn More" href="cli">
    Discover CLI commands to make you more productive with Angular.
  </docs-card>
  <docs-card title="Schematics" link="Learn More" href="tools/cli/schematics">
    Create and run schematics to generate and modify source files in your application automatically.
  </docs-card>
  <docs-card title="Builders" link="Learn More" href="tools/cli/cli-builder">
    Create and run builders to perform complex transformations from your source code to generated build outputs.
  </docs-card>
</docs-card-container>

### CLI command-language syntax

Angular CLI roughly follows Unix/POSIX conventions for option syntax.

#### Boolean options

Boolean options have two forms: `--this-option` sets the flag to `true`, `--no-this-option` sets it to `false`.
You can also use `--this-option=false` or `--this-option=true`.
If neither option is supplied, the flag remains in its default state, as listed in the reference documentation.

#### Array options

Array options can be provided in two forms: `--option value1 value2` or `--option value1 --option value2`.

#### Key/value options

Some options like `--define` expect an array of `key=value` pairs as their values.
Just like array options, key/value options can be provided in two forms:
`--define 'KEY_1="value1"' KEY_2=true` or `--define 'KEY_1="value1"' --define KEY_2=true`.

#### Relative paths

Options that specify files can be given as absolute paths, or as paths relative to the current working directory, which is generally either the workspace or project root.

---


(From schematics-authoring.md)

## Authoring schematics

You can create your own schematics to operate on Angular projects.
Library developers typically package schematics with their libraries to integrate them with the Angular CLI.
You can also create stand-alone schematics to manipulate the files and constructs in Angular applications as a way of customizing them for your development environment and making them conform to your standards and constraints.
Schematics can be chained, running other schematics to perform complex operations.

Manipulating the code in an application has the potential to be both very powerful and correspondingly dangerous.
For example, creating a file that already exists would be an error, and if it was applied immediately, it would discard all the other changes applied so far.
The Angular Schematics tooling guards against side effects and errors by creating a virtual file system.
A schematic describes a pipeline of transformations that can be applied to the virtual file system.
When a schematic runs, the transformations are recorded in memory, and only applied in the real file system once they're confirmed to be valid.

### Schematics concepts

The public API for schematics defines classes that represent the basic concepts.

* The virtual file system is represented by a `Tree`.
    The `Tree` data structure contains a *base* \(a set of files that already exists\) and a *staging area* \(a list of changes to be applied to the base\).
    When making modifications, you don't actually change the base, but add those modifications to the staging area.

* A `Rule` object defines a function that takes a `Tree`, applies transformations, and returns a new `Tree`.
    The main file for a schematic, `index.ts`, defines a set of rules that implement the schematic's logic.

* A transformation is represented by an `Action`.
    There are four action types: `Create`, `Rename`, `Overwrite`, and `Delete`.

* Each schematic runs in a context, represented by a `SchematicContext` object.

The context object passed into a rule provides access to utility functions and metadata that the schematic might need to work with, including a logging API to help with debugging.
The context also defines a *merge strategy* that determines how changes are merged from the staged tree into the base tree.
A change can be accepted or ignored, or throw an exception.

#### Defining rules and actions

When you create a new blank schematic with the [Schematics CLI](#schematics-cli), the generated entry function is a *rule factory*.
A `RuleFactory` object defines a higher-order function that creates a `Rule`.

<docs-code header="index.ts" language="typescript">

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

// You don't have to export the function as default.
// You can also have more than one rule factory per file.
export function helloWorld(_options: any): Rule {
 return (tree: Tree,_context: SchematicContext) => {
   return tree;
 };
}

</docs-code>

Your rules can make changes to your projects by calling external tools and implementing logic.
You need a rule, for example, to define how a template in the schematic is to be merged into the hosting project.

Rules can make use of utilities provided with the `@schematics/angular` package.
Look for helper functions for working with modules, dependencies, TypeScript, AST, JSON, Angular CLI workspaces and projects, and more.

<docs-code header="index.ts" language="typescript">

import {
  JsonAstObject,
  JsonObject,
  JsonValue,
  Path,
  normalize,
  parseJsonAst,
  strings,
} from '@angular-devkit/core';

</docs-code>

#### Defining input options with a schema and interfaces

Rules can collect option values from the caller and inject them into templates.
The options available to your rules, with their allowed values and defaults, are defined in the schematic's JSON schema file, `<schematic>/schema.json`.
Define variable or enumerated data types for the schema using TypeScript interfaces.

The schema defines the types and default values of variables used in the schematic.
For example, the hypothetical "Hello World" schematic might have the following schema.

<docs-code header="src/hello-world/schema.json" language="json">

{
    "properties": {
        "name": {
            "type": "string",
            "minLength": 1,
            "default": "world"
        },
        "useColor": {
            "type": "boolean"
        }
    }
}
</docs-code>

See examples of schema files for the Angular CLI command schematics in [`@schematics/angular`](https://github.com/angular/angular-cli/blob/main/packages/schematics/angular/application/schema.json).

#### Schematic prompts

Schematic *prompts* introduce user interaction into schematic execution.
Configure schematic options to display a customizable question to the user.
The prompts are displayed before the execution of the schematic, which then uses the response as the value for the option.
This lets users direct the operation of the schematic without requiring in-depth knowledge of the full spectrum of available options.

The "Hello World" schematic might, for example, ask the user for their name, and display that name in place of the default name "world".
To define such a prompt, add an `x-prompt` property to the schema for the `name` variable.

Similarly, you can add a prompt to let the user decide whether the schematic uses color when executing its hello action.
The schema with both prompts would be as follows.

<docs-code header="src/hello-world/schema.json" language="json">

{
    "properties": {
        "name": {
            "type": "string",
            "minLength": 1,
            "default": "world",
            "x-prompt": "What is your name?"
        },
        "useColor": {
            "type": "boolean",
            "x-prompt": "Would you like the response in color?"
        }
    }
}
</docs-code>

##### Prompt short-form syntax

These examples use a shorthand form of the prompt syntax, supplying only the text of the question.
In most cases, this is all that is required.
Notice however, that the two prompts expect different types of input.
When using the shorthand form, the most appropriate type is automatically selected based on the property's schema.
In the example, the `name` prompt uses the `input` type because it is a string property.
The `useColor` prompt uses a `confirmation` type because it is a Boolean property.
In this case, "yes" corresponds to `true` and "no" corresponds to `false`.

There are three supported input types.

| Input type   | Details |
|:---          |:----    |
| confirmation | A yes or no question; ideal for Boolean options.   |
| input        | Textual input; ideal for string or number options. |
| list         | A predefined set of allowed values.                |

In the short form, the type is inferred from the property's type and constraints.

| Property schema | Prompt type |
|:---             |:---         |
| "type": "boolean"  | confirmation \("yes"=`true`, "no"=`false`\)  |
| "type": "string"   | input                                        |
| "type": "number"   | input \(only valid numbers accepted\)        |
| "type": "integer"  | input \(only valid numbers accepted\)        |
| "enum": […] | list \(enum members become list selections\) |

In the following example, the property takes an enumerated value, so the schematic automatically chooses the list type, and creates a menu from the possible values.

<docs-code header="schema.json" language="json">

"style": {
  "description": "The file extension or preprocessor to use for style files.",
  "type": "string",
  "default": "css",
  "enum": [
    "css",
    "scss",
    "sass",
    "less",
    "styl"
  ],
  "x-prompt": "Which stylesheet format would you like to use?"
}

</docs-code>

The prompt runtime automatically validates the provided response against the constraints provided in the JSON schema.
If the value is not acceptable, the user is prompted for a new value.
This ensures that any values passed to the schematic meet the expectations of the schematic's implementation, so that you do not need to add additional checks within the schematic's code.

##### Prompt long-form syntax

The `x-prompt` field syntax supports a long form for cases where you require additional customization and control over the prompt.
In this form, the `x-prompt` field value is a JSON object with subfields that customize the behavior of the prompt.

| Field   | Data value |
|:---     |:---        |
| type    | `confirmation`, `input`, or `list` \(selected automatically in short form\) |
| message | string \(required\)                                                         |
| items   | string and/or label/value object pair \(only valid with type `list`\)       |

The following example of the long form is from the JSON schema for the schematic that the CLI uses to [generate applications](https://github.com/angular/angular-cli/blob/ba8a6ea59983bb52a6f1e66d105c5a77517f062e/packages/schematics/angular/application/schema.json#L56).
It defines the prompt that lets users choose which style preprocessor they want to use for the application being created.
By using the long form, the schematic can provide more explicit formatting of the menu choices.

<docs-code header="package/schematics/angular/application/schema.json" language="json">

"style": {
  "description": "The file extension or preprocessor to use for style files.",
  "type": "string",
  "default": "css",
  "enum": [
    "css",
    "scss",
    "sass",
    "less"
  ],
  "x-prompt": {
    "message": "Which stylesheet format would you like to use?",
    "type": "list",
    "items": [
      { "value": "css",  "label": "CSS" },
      { "value": "scss", "label": "SCSS   [ https://sass-lang.com/documentation/syntax#scss                ]" },
      { "value": "sass", "label": "Sass   [ https://sass-lang.com/documentation/syntax#the-indented-syntax ]" },
      { "value": "less", "label": "Less   [ https://lesscss.org/                                            ]" }
    ]
  },
},

</docs-code>

##### x-prompt schema

The JSON schema that defines a schematic's options supports extensions to allow the declarative definition of prompts and their respective behavior.
No additional logic or changes are required to the code of a schematic to support the prompts.
The following JSON schema is a complete description of the long-form syntax for the `x-prompt` field.

<docs-code header="x-prompt schema" language="json">

{
    "oneOf": [
        { "type": "string" },
        {
            "type": "object",
            "properties": {
                "type": { "type": "string" },
                "message": { "type": "string" },
                "items": {
                    "type": "array",
                    "items": {
                        "oneOf": [
                            { "type": "string" },
                            {
                                "type": "object",
                                "properties": {
                                    "label": { "type": "string" },
                                    "value": { }
                                },
                                "required": [ "value" ]
                            }
                        ]
                    }
                }
            },
            "required": [ "message" ]
        }
    ]
}

</docs-code>

### Schematics CLI

Schematics come with their own command-line tool.
Using Node 6.9 or later, install the Schematics command line tool globally:

<docs-code language="shell">

npm install -g @angular-devkit/schematics-cli

</docs-code>

This installs the `schematics` executable, which you can use to create a new schematics collection in its own project folder, add a new schematic to an existing collection, or extend an existing schematic.

In the following sections, you will create a new schematics collection using the CLI to introduce the files and file structure, and some of the basic concepts.

The most common use of schematics, however, is to integrate an Angular library with the Angular CLI.
Do this by creating the schematic files directly within the library project in an Angular workspace, without using the Schematics CLI.
See [Schematics for Libraries](tools/cli/schematics-for-libraries).

#### Creating a schematics collection

The following command creates a new schematic named `hello-world` in a new project folder of the same name.

<docs-code language="shell">

schematics blank --name=hello-world

</docs-code>

The `blank` schematic is provided by the Schematics CLI.
The command creates a new project folder \(the root folder for the collection\) and an initial named schematic in the collection.

Go to the collection folder, install your npm dependencies, and open your new collection in your favorite editor to see the generated files.
For example, if you are using VS Code:

<docs-code language="shell">

cd hello-world
npm install
npm run build
code .

</docs-code>

The initial schematic gets the same name as the project folder, and is generated in `src/hello-world`.
Add related schematics to this collection, and modify the generated skeleton code to define your schematic's functionality.
Each schematic name must be unique within the collection.

#### Running a schematic

Use the `schematics` command to run a named schematic.
Provide the path to the project folder, the schematic name, and any mandatory options, in the following format.

<docs-code language="shell">

schematics <path-to-schematics-project>:<schematics-name> --<required-option>=<value>

</docs-code>

The path can be absolute or relative to the current working directory where the command is executed.
For example, to run the schematic you just generated \(which has no required options\), use the following command.

<docs-code language="shell">

schematics .:hello-world

</docs-code>

#### Adding a schematic to a collection

To add a schematic to an existing collection, use the same command you use to start a new schematics project, but run the command inside the project folder.

<docs-code language="shell">

cd hello-world
schematics blank --name=goodbye-world

</docs-code>

The command generates the new named schematic inside your collection, with a main `index.ts` file and its associated test spec.
It also adds the name, description, and factory function for the new schematic to the collection's schema in the `collection.json` file.

### Collection contents

The top level of the root project folder for a collection contains configuration files, a `node_modules` folder, and a `src/` folder.
The `src/` folder contains subfolders for named schematics in the collection, and a schema, `collection.json`, which describes the collected schematics.
Each schematic is created with a name, description, and factory function.

<docs-code language="json">

{
  "$schema":
     "../node_modules/@angular-devkit/schematics/collection-schema.json",
  "schematics": {
    "hello-world": {
      "description": "A blank schematic.",
      "factory": "./hello-world/index#helloWorld"
    }
  }
}

</docs-code>

* The `$schema` property specifies the schema that the CLI uses for validation.
* The `schematics` property lists named schematics that belong to this collection.
    Each schematic has a plain-text description, and points to the generated entry function in the main file.

* The `factory` property points to the generated entry function.
    In this example, you invoke the `hello-world` schematic by calling the `helloWorld()` factory function.

* The optional  `schema` property points to a JSON schema file that defines the command-line options available to the schematic.
* The optional `aliases` array specifies one or more strings that can be used to invoke the schematic.
    For example, the schematic for the Angular CLI "generate" command has an alias "g", that lets you use the command `ng g`.

#### Named schematics

When you use the Schematics CLI to create a blank schematics project, the new blank schematic is the first member of the collection, and has the same name as the collection.
When you add a new named schematic to this collection, it is automatically added to the  `collection.json`  schema.

In addition to the name and description, each schematic has a `factory` property that identifies the schematic's entry point.
In the example, you invoke the schematic's defined functionality by calling the `helloWorld()` function in the main file,  `hello-world/index.ts`.

<img alt="overview" src="assets/images/guide/schematics/collection-files.gif">

Each named schematic in the collection has the following main parts.

| Parts          | Details |
|:---            |:---     |
| `index.ts`     | Code that defines the transformation logic for a named schematic.  |
| `schema.json`  | Schematic variable definition.                                     |
| `schema.d.ts`  | Schematic variables.                                               |
| `files/`       | Optional component/template files to replicate.                    |

It is possible for a schematic to provide all of its logic in the `index.ts` file, without additional templates.
You can create dynamic schematics for Angular, however, by providing components and templates in the `files` folder, like those in standalone Angular projects.
The logic in the index file configures these templates by defining rules that inject data and modify variables.

---


(From schematics-for-libraries.md)

## Schematics for libraries

When you create an Angular library, you can provide and package it with schematics that integrate it with the Angular CLI.
With your schematics, your users can use `ng add` to install an initial version of your library,
`ng generate` to create artifacts defined in your library, and `ng update` to adjust their project for a new version of your library that introduces breaking changes.

All three types of schematics can be part of a collection that you package with your library.

### Creating a schematics collection

To start a collection, you need to create the schematic files.
The following steps show you how to add initial support without modifying any project files.

1. In your library's root folder, create a `schematics` folder.
1. In the `schematics/` folder, create an `ng-add` folder for your first schematic.
1. At the root level of the `schematics` folder, create a `collection.json` file.
1. Edit the `collection.json` file to define the initial schema for your collection.

    <docs-code header="projects/my-lib/schematics/collection.json (Schematics Collection)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/collection.1.json"/>

    * The `$schema` path is relative to the Angular Devkit collection schema.
    * The `schematics` object describes the named schematics that are part of this collection.
    * The first entry is for a schematic named `ng-add`.
        It contains the description, and points to the factory function that is called when your schematic is executed.

1. In your library project's `package.json` file, add a "schematics" entry with the path to your schema file.
    The Angular CLI uses this entry to find named schematics in your collection when it runs commands.

    <docs-code header="projects/my-lib/package.json (Schematics Collection Reference)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/package.json" visibleRegion="collection"/>

The initial schema that you have created tells the CLI where to find the schematic that supports the `ng add` command.
Now you are ready to create that schematic.

### Providing installation support

A schematic for the `ng add` command can enhance the initial installation process for your users.
The following steps define this type of schematic.

1. Go to the `<lib-root>/schematics/ng-add` folder.
1. Create the main file, `index.ts`.
1. Open `index.ts` and add the source code for your schematic factory function.

    <docs-code header="projects/my-lib/schematics/ng-add/index.ts (ng-add Rule Factory)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/ng-add/index.ts"/>

The Angular CLI will install the latest version of the library automatically, and this example is taking it a step further by adding the `MyLibModule` to the root of the application. The `addRootImport` function accepts a callback that needs to return a code block. You can write any code inside of the string tagged with the `code` function and any external symbol have to be wrapped with the `external` function to ensure that the appropriate import statements are generated.

#### Define dependency type

Use the `save` option of `ng-add` to configure if the library should be added to the `dependencies`, the `devDependencies`, or not saved at all in the project's `package.json` configuration file.

<docs-code header="projects/my-lib/package.json (ng-add Reference)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/package.json" visibleRegion="ng-add"/>

Possible values are:

| Values              | Details |
|:---                 |:---     |
| `false`             | Don't add the package to `package.json` |
| `true`              | Add the package to the dependencies     |
| `"dependencies"`    | Add the package to the dependencies     |
| `"devDependencies"` | Add the package to the devDependencies  |

### Building your schematics

To bundle your schematics together with your library, you must configure the library to build the schematics separately, then add them to the bundle.
You must build your schematics *after* you build your library, so they are placed in the correct directory.

* Your library needs a custom Typescript configuration file with instructions on how to compile your schematics into your distributed library
* To add the schematics to the library bundle, add scripts to the library's `package.json` file

Assume you have a library project `my-lib` in your Angular workspace.
To tell the library how to build the schematics, add a `tsconfig.schematics.json` file next to the generated `tsconfig.lib.json` file that configures the library build.

1. Edit the `tsconfig.schematics.json` file to add the following content.

    <docs-code header="projects/my-lib/tsconfig.schematics.json (TypeScript Config)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/tsconfig.schematics.json"/>

    | Options | Details |
    |:---     |:---     |
    | `rootDir` | Specifies that your `schematics` folder contains the input files to be compiled.                                 |
    | `outDir`  | Maps to the library's output folder. By default, this is the `dist/my-lib` folder at the root of your workspace. |

1. To make sure your schematics source files get compiled into the library bundle, add the following scripts to the `package.json` file in your library project's root folder \(`projects/my-lib`\).

    <docs-code header="projects/my-lib/package.json (Build Scripts)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/package.json"/>

    * The `build` script compiles your schematic using the custom `tsconfig.schematics.json` file
    * The `postbuild` script copies the schematic files after the `build` script completes
    * Both the `build` and the `postbuild` scripts require the `copyfiles` and `typescript` dependencies.
        To install the dependencies, navigate to the path defined in `devDependencies` and run `npm install` before you run the scripts.

### Providing generation support

You can add a named schematic to your collection that lets your users use the `ng generate` command to create an artifact that is defined in your library.

We'll assume that your library defines a service, `my-service`, that requires some setup.
You want your users to be able to generate it using the following CLI command.

<docs-code language="shell">

ng generate my-lib:my-service

</docs-code>

To begin, create a new subfolder, `my-service`, in the `schematics` folder.

#### Configure the new schematic

When you add a schematic to the collection, you have to point to it in the collection's schema, and provide configuration files to define options that a user can pass to the command.

1. Edit the `schematics/collection.json` file to point to the new schematic subfolder, and include a pointer to a schema file that specifies inputs for the new schematic.

    <docs-code header="projects/my-lib/schematics/collection.json (Schematics Collection)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/collection.json"/>

1. Go to the `<lib-root>/schematics/my-service` folder.
1. Create a `schema.json` file and define the available options for the schematic.

    <docs-code header="projects/my-lib/schematics/my-service/schema.json (Schematic JSON Schema)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/schema.json"/>

    * *id*: A unique ID for the schema in the collection.
    * *title*: A human-readable description of the schema.
    * *type*: A descriptor for the type provided by the properties.
    * *properties*: An object that defines the available options for the schematic.

    Each option associates key with a type, description, and optional alias.
    The type defines the shape of the value you expect, and the description is displayed when the user requests usage help for your schematic.

    See the workspace schema for additional customizations for schematic options.

1. Create a `schema.ts` file and define an interface that stores the values of the options defined in the `schema.json` file.

    <docs-code header="projects/my-lib/schematics/my-service/schema.ts (Schematic Interface)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/schema.ts"/>

    | Options | Details |
    |:---     |:---     |
    | name    | The name you want to provide for the created service.                                                                                       |
    | path    | Overrides the path provided to the schematic. The default path value is based on the current working directory.                             |
    | project | Provides a specific project to run the schematic on. In the schematic, you can provide a default if the option is not provided by the user. |

#### Add template files

To add artifacts to a project, your schematic needs its own template files.
Schematic templates support special syntax to execute code and variable substitution.

1. Create a `files/` folder inside the `schematics/my-service/` folder.
1. Create a file named `__name@dasherize__.service.ts.template` that defines a template to use for generating files.
    This template will generate a service that already has Angular's `HttpClient` injected into an `http` property.

    <docs-code lang="typescript" header="projects/my-lib/schematics/my-service/files/__name@dasherize__.service.ts.template (Schematic Template)">

    import { Injectable } from '@angular/core';
    import { HttpClient } from '@angular/common/http';

    @Injectable({
      providedIn: 'root'
    })
    export class <%= classify(name) %>Service {
      private http = inject(HttpClient);
    }

    </docs-code>

    * The `classify` and `dasherize` methods are utility functions that your schematic uses to transform your source template and filename.

    * The `name` is provided as a property from your factory function.
        It is the same `name` you defined in the schema.

#### Add the factory function

Now that you have the infrastructure in place, you can define the main function that performs the modifications you need in the user's project.

The Schematics framework provides a file templating system, which supports both path and content templates.
The system operates on placeholders defined inside files or paths that loaded in the input `Tree`.
It fills these in using values passed into the `Rule`.

For details of these data structures and syntax, see the [Schematics README](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/schematics/README.md).

1. Create the main file `index.ts` and add the source code for your schematic factory function.
1. First, import the schematics definitions you will need.
    The Schematics framework offers many utility functions to create and use rules when running a schematic.

    <docs-code header="projects/my-lib/schematics/my-service/index.ts (Imports)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" visibleRegion="schematics-imports"/>

1. Import the defined schema interface that provides the type information for your schematic's options.

    <docs-code header="projects/my-lib/schematics/my-service/index.ts (Schema Import)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" visibleRegion="schema-imports"/>

1. To build up the generation schematic, start with an empty rule factory.

    <docs-code header="projects/my-lib/schematics/my-service/index.ts (Initial Rule)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.1.ts" visibleRegion="factory"/>

This rule factory returns the tree without modification.
The options are the option values passed through from the `ng generate` command.

### Define a generation rule

You now have the framework in place for creating the code that actually modifies the user's application to set it up for the service defined in your library.

The Angular workspace where the user installed your library contains multiple projects \(applications and libraries\).
The user can specify the project on the command line, or let it default.
In either case, your code needs to identify the specific project to which this schematic is being applied, so that you can retrieve information from the project configuration.

Do this using the `Tree` object that is passed in to the factory function.
The `Tree` methods give you access to the complete file tree in your workspace, letting you read and write files during the execution of the schematic.

#### Get the project configuration

1. To determine the destination project, use the `workspaces.readWorkspace` method to read the contents of the workspace configuration file, `angular.json`.
    To use `workspaces.readWorkspace` you need to create a `workspaces.WorkspaceHost` from the `Tree`.
    Add the following code to your factory function.

    <docs-code header="projects/my-lib/schematics/my-service/index.ts (Schema Import)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" visibleRegion="workspace"/>

    Be sure to check that the context exists and throw the appropriate error.

1. Now that you have the project name, use it to retrieve the project-specific configuration information.

    <docs-code header="projects/my-lib/schematics/my-service/index.ts (Project)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" visibleRegion="project-info"/>

    The `workspace.projects` object contains all the project-specific configuration information.

1. The `options.path` determines where the schematic template files are moved to once the schematic is applied.

    The `path` option in the schematic's schema is substituted by default with the current working directory.
    If the `path` is not defined, use the `sourceRoot` from the project configuration along with the `projectType`.

    <docs-code header="projects/my-lib/schematics/my-service/index.ts (Project Info)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" visibleRegion="path"/>

#### Define the rule

A `Rule` can use external template files, transform them, and return another `Rule` object with the transformed template.
Use the templating to generate any custom files required for your schematic.

1. Add the following code to your factory function.

    <docs-code header="projects/my-lib/schematics/my-service/index.ts (Template transform)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" visibleRegion="template"/>

    | Methods            | Details |
    |:---                |:---     |
    | `apply()`          | Applies multiple rules to a source and returns the transformed source. It takes 2 arguments, a source and an array of rules.                                                                                                                     |
    | `url()`            | Reads source files from your filesystem, relative to the schematic.                                                                                                                                                                              |
    | `applyTemplates()` | Receives an argument of methods and properties you want make available to the schematic template and the schematic filenames. It returns a `Rule`. This is where you define the `classify()` and `dasherize()` methods, and the `name` property. |
    | `classify()`       | Takes a value and returns the value in title case. For example, if the provided name is `my service`, it is returned as `MyService`.                                                                                                             |
    | `dasherize()`      | Takes a value and returns the value in dashed and lowercase. For example, if the provided name is MyService, it is returned as `my-service`.                                                                                                     |
    | `move()`           | Moves the provided source files to their destination when the schematic is applied.                                                                                                                                                              |

1. Finally, the rule factory must return a rule.

    <docs-code header="projects/my-lib/schematics/my-service/index.ts (Chain Rule)" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" visibleRegion="chain"/>

    The `chain()` method lets you combine multiple rules into a single rule, so that you can perform multiple operations in a single schematic.
    Here you are only merging the template rules with any code executed by the schematic.

See a complete example of the following schematic rule function.

<docs-code header="projects/my-lib/schematics/my-service/index.ts" path="adev/src/content/examples/schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts"/>

For more information about rules and utility methods, see [Provided Rules](https://github.com/angular/angular-cli/tree/main/packages/angular_devkit/schematics#provided-rules).

### Running your library schematic

After you build your library and schematics, you can install the schematics collection to run against your project.
The following steps show you how to generate a service using the schematic you created earlier.

#### Build your library and schematics

From the root of your workspace, run the `ng build` command for your library.

<docs-code language="shell">

ng build my-lib

</docs-code>

Then, you change into your library directory to build the schematic

<docs-code language="shell">

cd projects/my-lib
npm run build

</docs-code>

#### Link the library

Your library and schematics are packaged and placed in the `dist/my-lib` folder at the root of your workspace.
For running the schematic, you need to link the library into your `node_modules` folder.
From the root of your workspace, run the `npm link` command with the path to your distributable library.

<docs-code language="shell">

npm link dist/my-lib

</docs-code>

#### Run the schematic

Now that your library is installed, run the schematic using the `ng generate` command.

<docs-code language="shell">

ng generate my-lib:my-service --name my-data

</docs-code>

In the console, you see that the schematic was run and the `my-data.service.ts` file was created in your application folder.

<docs-code language="shell" hideCopy>

CREATE src/app/my-data.service.ts (208 bytes)

</docs-code>

---


(From schematics.md)

## Generating code using schematics

A schematic is a template-based code generator that supports complex logic.
It is a set of instructions for transforming a software project by generating or modifying code.
Schematics are packaged into collections and installed with npm.

The schematic collection can be a powerful tool for creating, modifying, and maintaining any software project, but is particularly useful for customizing Angular projects to suit the particular needs of your own organization.
You might use schematics, for example, to generate commonly-used UI patterns or specific components, using predefined templates or layouts.
Use schematics to enforce architectural rules and conventions, making your projects consistent and interoperative.

### Schematics for the Angular CLI

Schematics are part of the Angular ecosystem.
The Angular CLI  uses schematics to apply transforms to a web-app project.
You can modify these schematics, and define new ones to do things like update your code to fix breaking changes in a dependency, for example, or to add a new configuration option or framework to an existing project.

Schematics that are included in the `@schematics/angular` collection are run by default by the commands `ng generate` and `ng add`.
The package contains named schematics that configure the options that are available to the CLI for `ng generate` sub-commands, such as `ng generate component` and `ng generate service`.
The sub-commands for `ng generate` are shorthand for the corresponding schematic.
To specify and generate a particular schematic, or a collection of schematics, using the long form:

<docs-code language="shell">

ng generate my-schematic-collection:my-schematic-name

</docs-code>

or

<docs-code language="shell">

ng generate my-schematic-name --collection collection-name

</docs-code>

#### Configuring CLI schematics

A JSON schema associated with a schematic tells the Angular CLI what options are available to commands and sub-commands, and determines the defaults.
These defaults can be overridden by providing a different value for an option on the command line.
See [Workspace Configuration](reference/configs/workspace-config) for information about how to change the generation option defaults for your workspace.

The JSON schemas for the default schematics used by the CLI to generate projects and parts of projects are collected in the package [`@schematics/angular`](https://github.com/angular/angular-cli/tree/main/packages/schematics/angular).
The schema describes the options available to the CLI for each of the `ng generate` sub-commands, as shown in the `--help` output.

### Developing schematics for libraries

As a library developer, you can create your own collections of custom schematics to integrate your library with the Angular CLI.

* An *add schematic* lets developers install your library in an Angular workspace using `ng add`
* *Generation schematics* can tell the `ng generate` sub-commands how to modify projects, add configurations and scripts, and scaffold artifacts that are defined in your library
* An *update schematic* can tell the `ng update` command how to update your library's dependencies and adjust for breaking changes when you release a new version

For more details of what these look like and how to create them, see:

<docs-pill-row>
  <docs-pill href="tools/cli/schematics-authoring" title="Authoring Schematics"/>
  <docs-pill href="tools/cli/schematics-for-libraries" title="Schematics for Libraries"/>
</docs-pill-row>

#### Add schematics

An *add schematic* is typically supplied with a library, so that the library can be added to an existing project with `ng add`.
The `add` command uses your package manager to download new dependencies, and invokes an installation script that is implemented as a schematic.

For example, the [`@angular/material`](https://material.angular.dev/guide/schematics) schematic tells the `add` command to install and set up Angular Material and theming, and register new starter components that can be created with `ng generate`.
Look at this one as an example and model for your own add schematic.

Partner and third party libraries also support the Angular CLI with add schematics.
For example, `@ng-bootstrap/schematics` adds [ng-bootstrap](https://ng-bootstrap.github.io)  to an app, and  `@clr/angular` installs and sets up [Clarity from VMWare](https://clarity.design/documentation/get-started).

An *add schematic* can also update a project with configuration changes, add additional dependencies \(such as polyfills\), or scaffold package-specific initialization code.
For example, the `@angular/pwa` schematic turns your application into a PWA by adding an application manifest and service worker.

#### Generation schematics

Generation schematics are instructions for the `ng generate` command.
The documented sub-commands use the default Angular generation schematics, but you can specify a different schematic \(in place of a sub-command\) to generate an artifact defined in your library.

Angular Material, for example, supplies generation schematics for the UI components that it defines.
The following command uses one of these schematics to render an Angular Material `<mat-table>` that is pre-configured with a datasource for sorting and pagination.

<docs-code language="shell">

ng generate @angular/material:table <component-name>

</docs-code>

#### Update schematics

 The `ng update` command can be used to update your workspace's library dependencies.
 If you supply no options or use the help option, the command examines your workspace and suggests libraries to update.

<docs-code language="shell">

ng update
We analyzed your package.json, there are some packages to update:

    Name                                      Version                     Command to update
    &hyphen;-------------------------------------------------------------------------------
    @angular/cdk                       7.2.2 -> 7.3.1           ng update @angular/cdk
    @angular/cli                       7.2.3 -> 7.3.0           ng update @angular/cli
    @angular/core                      7.2.2 -> 7.2.3           ng update @angular/core
    @angular/material                  7.2.2 -> 7.3.1           ng update @angular/material
    rxjs                                      6.3.3 -> 6.4.0           ng update rxjs

</docs-code>

If you pass the command a set of libraries to update, it updates those libraries, their peer dependencies, and the peer dependencies that depend on them.

HELPFUL: If there are inconsistencies \(for example, if peer dependencies cannot be matched by a simple [semver](https://semver.io) range\), the command generates an error and does not change anything in the workspace.

We recommend that you do not force an update of all dependencies by default.
Try updating specific dependencies first.

For more about how the `ng update` command works, see [Update Command](https://github.com/angular/angular-cli/blob/main/docs/specifications/update.md).

If you create a new version of your library that introduces potential breaking changes, you can provide an *update schematic* to enable the `ng update` command to automatically resolve any such changes in the project being updated.

For example, suppose you want to update the Angular Material library.

<docs-code language="shell">
ng update @angular/material
</docs-code>

This command updates both `@angular/material` and its dependency `@angular/cdk` in your workspace's `package.json`.
If either package contains an update schematic that covers migration from the existing version to a new version, the command runs that schematic on your workspace.

---


(From serve.md)

## Serving Angular apps for development

You can serve your Angular CLI application with the `ng serve` command.
This will compile your application, skip unnecessary optimizations, start a devserver, and automatically rebuild and live reload any subsequent changes.
You can stop the server by pressing `Ctrl+C`.

`ng serve` only executes the builder for the `serve` target in the default project as specified in `angular.json`.
While any builder can be used here, the most common (and default) builder is `@angular-devkit/build-angular:dev-server`.

You can determine which builder is being used for a particular project by looking up the `serve` target for that project.

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "architect": {
        // `ng serve` invokes the Architect target named `serve`.
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          // ...
        },
        "build": { /* ... */ }
        "test": { /* ... */ }
      }
    }
  }
}

</docs-code>

This page discusses usage and options of `@angular-devkit/build-angular:dev-server`.

### Proxying to a backend server

Use [proxying support](https://webpack.js.org/configuration/dev-server/#devserverproxy) to divert certain URLs to a backend server, by passing a file to the `--proxy-config` build option.
For example, to divert all calls for `http://localhost:4200/api` to a server running on `http://localhost:3000/api`, take the following steps.

1. Create a file `proxy.conf.json` in your project's `src/` folder.
1. Add the following content to the new proxy file:

    <docs-code language="json">

    {
      "/api": {
        "target": "http://localhost:3000",
        "secure": false
      }
    }

    </docs-code>

1. In the CLI configuration file, `angular.json`, add the `proxyConfig` option to the `serve` target:

    <docs-code language="json">

    {
      "projects": {
        "my-app": {
          "architect": {
            "serve": {
              "builder": "@angular-devkit/build-angular:dev-server",
              "options": {
                "proxyConfig": "src/proxy.conf.json"
              }
            }
          }
        }
      }
    }

    </docs-code>

1. To run the development server with this proxy configuration, call `ng serve`.

Edit the proxy configuration file to add configuration options; following are some examples.
For a detailed description of all options, refer to the [webpack DevServer documentation](https://webpack.js.org/configuration/dev-server/#devserverproxy) when using `@angular-devkit/build-angular:browser`, or the [Vite DevServer documentation](https://vite.dev/config/server-options#server-proxy) when using `@angular-devkit/build-angular:browser-esbuild` or `@angular-devkit/build-angular:application`.

NOTE: If you edit the proxy configuration file, you must relaunch the `ng serve` process to make your changes effective.

### `localhost` resolution

As of Node version 17, Node will _not_ always resolve `http://localhost:<port>` to `http://127.0.0.1:<port>`
depending on each machine's configuration.

If you get an `ECONNREFUSED` error using a proxy targeting a `localhost` URL,
you can fix this issue by updating the target from `http://localhost:<port>` to `http://127.0.0.1:<port>`.

See [the `http-proxy-middleware` documentation](https://github.com/chimurai/http-proxy-middleware#nodejs-17-econnrefused-issue-with-ipv6-and-localhost-705)
for more information.

---


(From setup-local.md)

## Setting up the local environment and workspace

This guide explains how to set up your environment for Angular development using the [Angular CLI](cli "CLI command reference").
It includes information about installing the CLI, creating an initial workspace and starter app, and running that app locally to verify your setup.

<docs-callout title="Try Angular without local setup">

If you are new to Angular, you might want to start with [Try it now!](tutorials/learn-angular), which introduces the essentials of Angular in your browser.
This standalone tutorial takes advantage of the interactive [StackBlitz](https://stackblitz.com) environment for online development.
You don't need to set up your local environment until you're ready.

</docs-callout>

### Before you start

To use Angular CLI, you should be familiar with the following:

<docs-pill-row>
  <docs-pill href="https://developer.mozilla.org/docs/Web/JavaScript/A_re-introduction_to_JavaScript" title="JavaScript"/>
  <docs-pill href="https://developer.mozilla.org/docs/Learn/HTML/Introduction_to_HTML" title="HTML"/>
  <docs-pill href="https://developer.mozilla.org/docs/Learn/CSS/First_steps" title="CSS"/>
</docs-pill-row>

You should also be familiar with usage of command line interface (CLI) tools and have a general understanding of command shells.
Knowledge of [TypeScript](https://www.typescriptlang.org) is helpful, but not required.

### Dependencies

To install Angular CLI on your local system, you need to install [Node.js](https://nodejs.org/).
Angular CLI uses Node and its associated package manager, npm, to install and run JavaScript tools outside the browser.

[Download and install Node.js](https://nodejs.org/en/download), which will include the `npm` CLI as well.
Angular requires an [active LTS or maintenance LTS](https://nodejs.org/en/about/previous-releases) version of Node.js.
See [Angular's version compatibility](reference/versions) guide for more information.

### Install the Angular CLI

To install the Angular CLI, open a terminal window and run the following command:

<docs-code-multifile>
   <docs-code
     header="npm"
     >
     npm install -g @angular/cli
     </docs-code>
   <docs-code
     header="pnpm"
     >
     pnpm install -g @angular/cli
     </docs-code>
   <docs-code
     header="yarn"
     >
     yarn global add @angular/cli
     </docs-code>
   <docs-code
     header="bun"
     >
     bun install -g @angular/cli
     </docs-code>

 </docs-code-multifile>

#### Powershell execution policy

On Windows client computers, the execution of PowerShell scripts is disabled by default, so the above command may fail with an error.
To allow the execution of PowerShell scripts, which is needed for npm global binaries, you must set the following <a href="https://docs.microsoft.com/powershell/module/microsoft.powershell.core/about/about_execution_policies">execution policy</a>:

<docs-code language="sh">

Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

</docs-code>

Carefully read the message displayed after executing the command and follow the instructions. Make sure you understand the implications of setting an execution policy.

#### Unix permissions

On some Unix-like setups, global  scripts may be owned by the root user, so to the above command may fail with a permission error.
Run with `sudo` to execute the command as the root user and enter your password when prompted:

<docs-code-multifile>
   <docs-code
     header="npm"
     >
     sudo npm install -g @angular/cli
     </docs-code>
   <docs-code
     header="pnpm"
     >
     sudo pnpm install -g @angular/cli
     </docs-code>
   <docs-code
     header="yarn"
     >
     sudo yarn global add @angular/cli
     </docs-code>
   <docs-code
     header="bun"
     >
     sudo bun install -g @angular/cli
     </docs-code>

 </docs-code-multifile>

Make sure you understand the implications of running commands as root.

### Create a workspace and initial application

You develop apps in the context of an Angular **workspace**.

To create a new workspace and initial starter app, run the CLI command `ng new` and provide the name `my-app`, as shown here, then answer prompts about features to include:

<docs-code language="shell">

ng new my-app

</docs-code>

The Angular CLI installs the necessary Angular npm packages and other dependencies.
This can take a few minutes.

The CLI creates a new workspace and a small welcome app in a new directory with the same name as the workspace, ready to run.
Navigate to the new directory so subsequent commands use this workspace.

<docs-code language="shell">

cd my-app

</docs-code>

### Run the application

The Angular CLI includes a development server, for you to build and serve your app locally. Run the following command:

<docs-code language="shell">

ng serve --open

</docs-code>

The `ng serve` command launches the server, watches your files, as well as rebuilds the app and reloads the browser as you make changes to those files.

The `--open` (or just `-o`) option automatically opens your browser to `http://localhost:4200/` to view the generated application.

### Workspaces and project files

The [`ng new`](cli/new) command creates an [Angular workspace](reference/configs/workspace-config) folder and generates a new application inside it.
A workspace can contain multiple applications and libraries.
The initial application created by the [`ng new`](cli/new) command is at the root directory of the workspace.
When you generate an additional application or library in an existing workspace, it goes into a `projects/` subfolder by default.

A newly generated application contains the source files for a root component and template.
Each application has a `src` folder that contains its components, data, and assets.

You can edit the generated files directly, or add to and modify them using CLI commands.
Use the [`ng generate`](cli/generate) command to add new files for additional components, directives, pipes, services, and more.
Commands such as [`ng add`](cli/add) and [`ng generate`](cli/generate), which create or operate on applications and libraries, must be executed
from within a workspace. By contrast, commands such as `ng new` must be executed *outside* a workspace because they will create a new one.

### Next steps

* Learn more about the [file structure](reference/configs/file-structure) and [configuration](reference/configs/workspace-config) of the generated workspace.

* Test your new application with [`ng test`](cli/test).

* Generate boilerplate like components, directives, and pipes with [`ng generate`](cli/generate).

* Deploy your new application and make it available to real users with [`ng deploy`](cli/deploy).

* Set up and run end-to-end tests of your application with [`ng e2e`](cli/e2e).

---


(From template-typecheck.md)

## Template type checking

### Overview of template type checking

Just as TypeScript catches type errors in your code, Angular checks the expressions and bindings within the templates of your application and can report any type errors it finds.
Angular currently has three modes of doing this, depending on the value of the `fullTemplateTypeCheck` and `strictTemplates` flags in [Angular's compiler options](reference/configs/angular-compiler-options).

#### Basic mode

In the most basic type-checking mode, with the `fullTemplateTypeCheck` flag set to `false`, Angular validates only top-level expressions in a template.

If you write `<map [city]="user.address.city">`, the compiler verifies the following:

* `user` is a property on the component class
* `user` is an object with an address property
* `user.address` is an object with a city property

The compiler does not verify that the value of `user.address.city` is assignable to the city input of the `<map>` component.

The compiler also has some major limitations in this mode:

* Importantly, it doesn't check embedded views, such as `*ngIf`, `*ngFor`, other `<ng-template>` embedded view.
* It doesn't figure out the types of `#refs`, the results of pipes, or the type of `$event` in event bindings.

In many cases, these things end up as type `any`, which can cause subsequent parts of the expression to go unchecked.

#### Full mode

If the `fullTemplateTypeCheck` flag is set to `true`, Angular is more aggressive in its type-checking within templates.
In particular:

* Embedded views \(such as those within an `*ngIf` or `*ngFor`\) are checked
* Pipes have the correct return type
* Local references to directives and pipes have the correct type \(except for any generic parameters, which will be `any`\)

The following still have type `any`.

* Local references to DOM elements
* The `$event` object
* Safe navigation expressions

IMPORTANT: The `fullTemplateTypeCheck` flag has been deprecated in Angular 13.
The `strictTemplates` family of compiler options should be used instead.

#### Strict mode

Angular maintains the behavior of the `fullTemplateTypeCheck` flag, and introduces a third "strict mode".
Strict mode is a superset of full mode, and is accessed by setting the `strictTemplates` flag to true.
This flag supersedes the `fullTemplateTypeCheck` flag.

In addition to the full mode behavior, Angular does the following:

* Verifies that component/directive bindings are assignable to their `@Input()`s
* Obeys TypeScript's `strictNullChecks` flag when validating the preceding mode
* Infers the correct type of components/directives, including generics
* Infers template context types where configured \(for example, allowing correct type-checking of `NgFor`\)
* Infers the correct type of `$event` in component/directive, DOM, and animation event bindings
* Infers the correct type of local references to DOM elements, based on the tag name \(for example, the type that `document.createElement` would return for that tag\)

### Checking of `*ngFor`

The three modes of type-checking treat embedded views differently.
Consider the following example.

<docs-code language="typescript" header="User interface">

interface User {
  name: string;
  address: {
    city: string;
    state: string;
  }
}

</docs-code>

<docs-code language="html">

<div *ngFor="let user of users">
  <h2>{{config.title}}</h2>
  <span>City: {{user.address.city}}</span>
</div>

</docs-code>

The `<h2>` and the `<span>` are in the `*ngFor` embedded view.
In basic mode, Angular doesn't check either of them.
However, in full mode, Angular checks that `config` and `user` exist and assumes a type of `any`.
In strict mode, Angular knows that the `user` in the `<span>` has a type of `User`, and that `address` is an object with a `city` property of type `string`.

### Troubleshooting template errors

With strict mode, you might encounter template errors that didn't arise in either of the previous modes.
These errors often represent genuine type mismatches in the templates that were not caught by the previous tooling.
If this is the case, the error message should make it clear where in the template the problem occurs.

There can also be false positives when the typings of an Angular library are either incomplete or incorrect, or when the typings don't quite line up with expectations as in the following cases.

* When a library's typings are wrong or incomplete \(for example, missing `null | undefined` if the library was not written with `strictNullChecks` in mind\)
* When a library's input types are too narrow and the library hasn't added appropriate metadata for Angular to figure this out.
    This usually occurs with disabled or other common Boolean inputs used as attributes, for example, `<input disabled>`.

* When using `$event.target` for DOM events \(because of the possibility of event bubbling, `$event.target` in the DOM typings doesn't have the type you might expect\)

In case of a false positive like these, there are a few options:

* Use the `$any()` type-cast function in certain contexts to opt out of type-checking for a part of the expression
* Disable strict checks entirely by setting `strictTemplates: false` in the application's TypeScript configuration file, `tsconfig.json`
* Disable certain type-checking operations individually, while maintaining strictness in other aspects, by setting a *strictness flag* to `false`
* If you want to use `strictTemplates` and `strictNullChecks` together, opt out of strict null type checking specifically for input bindings using `strictNullInputTypes`

Unless otherwise commented, each following option is set to the value for `strictTemplates` \(`true` when `strictTemplates` is `true` and conversely, the other way around\).

| Strictness flag              | Effect |
|:---                          |:---    |
| `strictInputTypes`           | Whether the assignability of a binding expression to the `@Input()` field is checked. Also affects the inference of directive generic types.                                                                                                                                                                                                                                                                                                |
| `strictInputAccessModifiers` | Whether access modifiers such as `private`/`protected`/`readonly` are honored when assigning a binding expression to an `@Input()`. If disabled, the access modifiers of the `@Input` are ignored; only the type is checked. This option is `false` by default, even with `strictTemplates` set to `true`.                                                                                                                                  |
| `strictNullInputTypes`       | Whether `strictNullChecks` is honored when checking `@Input()` bindings \(per `strictInputTypes`\). Turning this off can be useful when using a library that was not built with `strictNullChecks` in mind.                                                                                                                                                                                                                                 |
| `strictAttributeTypes`       | Whether to check `@Input()` bindings that are made using text attributes. For example, `<input matInput disabled="true">` \(setting the `disabled` property to the string `'true'`\) vs `<input matInput [disabled]="true">` \(setting the `disabled` property to the boolean `true`\). |
| `strictSafeNavigationTypes`  | Whether the return type of safe navigation operations \(for example, `user?.name` will be correctly inferred based on the type of `user`\). If disabled, `user?.name` will be of type `any`.                                                                                                                                                                                                                                                |
| `strictDomLocalRefTypes`     | Whether local references to DOM elements will have the correct type. If disabled `ref` will be of type `any` for `<input #ref>`.                                                                                                                                                                                                                                                                                                            |
| `strictOutputEventTypes`     | Whether `$event` will have the correct type for event bindings to component/directive an `@Output()`, or to animation events. If disabled, it will be `any`.                                                                                                                                                                                                                                                                                |
| `strictDomEventTypes`        | Whether `$event` will have the correct type for event bindings to DOM events. If disabled, it will be `any`.                                                                                                                                                                                                                                                                                                                                |
| `strictContextGenerics`      | Whether the type parameters of generic components will be inferred correctly \(including any generic bounds\). If disabled, any type parameters will be `any`.                                                                                                                                                                                                                                                                              |
| `strictLiteralTypes`         | Whether object and array literals declared in the template will have their type inferred. If disabled, the type of such literals will be `any`. This flag is `true` when *either* `fullTemplateTypeCheck` or `strictTemplates` is set to `true`.                                                                                                                                                                                            |

If you still have issues after troubleshooting with these flags, fall back to full mode by disabling `strictTemplates`.

If that doesn't work, an option of last resort is to turn off full mode entirely with `fullTemplateTypeCheck: false`.

A type-checking error that you cannot resolve with any of the recommended methods can be the result of a bug in the template type-checker itself.
If you get errors that require falling back to basic mode, it is likely to be such a bug.
If this happens, [file an issue](https://github.com/angular/angular/issues) so the team can address it.

### Inputs and type-checking

The template type checker checks whether a binding expression's type is compatible with that of the corresponding directive input.
As an example, consider the following component:

<docs-code language="typescript">

export interface User {
  name: string;
}

@Component({
  selector: 'user-detail',
  template: '{{ user.name }}',
})
export class UserDetailComponent {
  @Input() user: User;
}

</docs-code>

The `AppComponent` template uses this component as follows:

<docs-code language="typescript">

@Component({
  selector: 'app-root',
  template: '<user-detail [user]="selectedUser"></user-detail>',
})
export class AppComponent {
  selectedUser: User | null = null;
}

</docs-code>

Here, during type checking of the template for `AppComponent`, the `[user]="selectedUser"` binding corresponds with the `UserDetailComponent.user` input.
Therefore, Angular assigns the `selectedUser` property to `UserDetailComponent.user`, which would result in an error if their types were incompatible.
TypeScript checks the assignment according to its type system, obeying flags such as `strictNullChecks` as they are configured in the application.

Avoid run-time type errors by providing more specific in-template type requirements to the template type checker.
Make the input type requirements for your own directives as specific as possible by providing template-guard functions in the directive definition.
See [Improving template type checking for custom directives](guide/directives/structural-directives#directive-type-checks) in this guide.

#### Strict null checks

When you enable `strictTemplates` and the TypeScript flag `strictNullChecks`, typecheck errors might occur for certain situations that might not easily be avoided.
For example:

* A nullable value that is bound to a directive from a library which did not have `strictNullChecks` enabled.

    For a library compiled without `strictNullChecks`, its declaration files will not indicate whether a field can be `null` or not.
    For situations where the library handles `null` correctly, this is problematic, as the compiler will check a nullable value against the declaration files which omit the `null` type.
    As such, the compiler produces a type-check error because it adheres to `strictNullChecks`.

* Using the `async` pipe with an Observable which you know will emit synchronously.

    The `async` pipe currently assumes that the Observable it subscribes to can be asynchronous, which means that it's possible that there is no value available yet.
    In that case, it still has to return something —which is `null`.
    In other words, the return type of the `async` pipe includes `null`, which might result in errors in situations where the Observable is known to emit a non-nullable value synchronously.

There are two potential workarounds to the preceding issues:

* In the template, include the non-null assertion operator `!` at the end of a nullable expression, such as

    <docs-code hideCopy language="html">

    <user-detail [user]="user!"></user-detail>

    </docs-code>

    In this example, the compiler disregards type incompatibilities in nullability, just as in TypeScript code.
    In the case of the `async` pipe, notice that the expression needs to be wrapped in parentheses, as in

    <docs-code hideCopy language="html">

    <user-detail [user]="(user$ | async)!"></user-detail>

    </docs-code>

* Disable strict null checks in Angular templates completely.

    When `strictTemplates` is enabled, it is still possible to disable certain aspects of type checking.
    Setting the option `strictNullInputTypes` to `false` disables strict null checks within Angular templates.
    This flag applies for all components that are part of the application.

#### Advice for library authors

As a library author, you can take several measures to provide an optimal experience for your users.
First, enabling `strictNullChecks` and including `null` in an input's type, as appropriate, communicates to your consumers whether they can provide a nullable value or not.
Additionally, it is possible to provide type hints that are specific to the template type checker.
See [Improving template type checking for custom directives](guide/directives/structural-directives#directive-type-checks), and [Input setter coercion](#input-setter-coercion).

### Input setter coercion

Occasionally it is desirable for the `@Input()` of a directive or component to alter the value bound to it, typically using a getter/setter pair for the input.
As an example, consider this custom button component:

Consider the following directive:

<docs-code language="typescript">

@Component({
  selector: 'submit-button',
  template: `
    <div class="wrapper">
      <button [disabled]="disabled">Submit</button>
    </div>
  `,
})
class SubmitButton {
  private _disabled: boolean;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = value;
  }
}

</docs-code>

Here, the `disabled` input of the component is being passed on to the `<button>` in the template.
All of this works as expected, as long as a `boolean` value is bound to the input.
But, suppose a consumer uses this input in the template as an attribute:

<docs-code language="html">

<submit-button disabled></submit-button>

</docs-code>

This has the same effect as the binding:

<docs-code language="html">

<submit-button [disabled]="''"></submit-button>

</docs-code>

At runtime, the input will be set to the empty string, which is not a `boolean` value.
Angular component libraries that deal with this problem often "coerce" the value into the right type in the setter:

<docs-code language="typescript">

set disabled(value: boolean) {
  this._disabled = (value === '') || value;
}

</docs-code>

It would be ideal to change the type of `value` here, from `boolean` to `boolean|''`, to match the set of values which are actually accepted by the setter.
TypeScript prior to version 4.3 requires that both the getter and setter have the same type, so if the getter should return a `boolean` then the setter is stuck with the narrower type.

If the consumer has Angular's strictest type checking for templates enabled, this creates a problem: the empty string \(`''`\) is not actually assignable to the `disabled` field, which creates a type error when the attribute form is used.

As a workaround for this problem, Angular supports checking a wider, more permissive type for `@Input()` than is declared for the input field itself.
Enable this by adding a static property with the `ngAcceptInputType_` prefix to the component class:

<docs-code language="typescript">

class SubmitButton {
  private _disabled: boolean;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = (value === '') || value;
  }

  static ngAcceptInputType_disabled: boolean|'';
}

</docs-code>

Since TypeScript 4.3, the setter could have been declared to accept `boolean|''` as type, making the input setter coercion field obsolete.
As such, input setters coercion fields have been deprecated.

This field does not need to have a value.
Its existence communicates to the Angular type checker that the `disabled` input should be considered as accepting bindings that match the type `boolean|''`.
The suffix should be the `@Input` *field* name.

Care should be taken that if an `ngAcceptInputType_` override is present for a given input, then the setter should be able to handle any values of the overridden type.

### Disabling type checking using `$any()`

Disable checking of a binding expression by surrounding the expression in a call to the `$any()` cast pseudo-function.
The compiler treats it as a cast to the `any` type just like in TypeScript when a `<any>` or `as any` cast is used.

In the following example, casting `person` to the `any` type suppresses the error `Property address does not exist`.

<docs-code language="typescript">

@Component({
  selector: 'my-component',
  template: '{{$any(person).address.street}}'
})
class MyComponent {
  person?: Person;
}

</docs-code>

---