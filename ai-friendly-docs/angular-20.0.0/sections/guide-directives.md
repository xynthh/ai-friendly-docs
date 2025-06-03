# Guide Directives

(From attribute-directives.md)

## Attribute directives

Change the appearance or behavior of DOM elements and Angular components with attribute directives.

### Building an attribute directive

This section walks you through creating a highlight directive that sets the background color of the host element to yellow.

1. To create a directive, use the CLI command [`ng generate directive`](tools/cli/schematics).

    <docs-code language="shell">

    ng generate directive highlight

    </docs-code>

    The CLI creates `src/app/highlight.directive.ts`, a corresponding test file `src/app/highlight.directive.spec.ts`.

    <docs-code header="src/app/highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.0.ts"/>

    The `@Directive()` decorator's configuration property specifies the directive's CSS attribute selector, `[appHighlight]`.

1. Import `ElementRef` from `@angular/core`.
    `ElementRef` grants direct access to the host DOM element through its `nativeElement` property.

1. Add `ElementRef` in the directive's `constructor()` to [inject](guide/di) a reference to the host DOM element, the element to which you apply `appHighlight`.

1. Add logic to the `HighlightDirective` class that sets the background to yellow.

    <docs-code header="src/app/highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.1.ts"/>

HELPFUL: Directives *do not* support namespaces.

<docs-code header="src/app/app.component.avoid.html (unsupported)" path="adev/src/content/examples/attribute-directives/src/app/app.component.avoid.html" visibleRegion="unsupported"/>

### Applying an attribute directive

1. To use the `HighlightDirective`, add a `<p>` element to the HTML template with the directive as an attribute.

    <docs-code header="src/app/app.component.html" path="adev/src/content/examples/attribute-directives/src/app/app.component.1.html" visibleRegion="applied"/>

Angular creates an instance of the `HighlightDirective` class and injects a reference to the `<p>` element into the directive's constructor, which sets the `<p>` element's background style to yellow.

### Handling user events

This section shows you how to detect when a user mouses into or out of the element and to respond by setting or clearing the highlight color.

1. Import `HostListener` from '@angular/core'.

    <docs-code header="src/app/highlight.directive.ts (imports)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.2.ts" visibleRegion="imports"/>

1. Add two event handlers that respond when the mouse enters or leaves, each with the `@HostListener()` decorator.

    <docs-code header="src/app/highlight.directive.ts (mouse-methods)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.2.ts" visibleRegion="mouse-methods"/>

Subscribe to events of the DOM element that hosts an attribute directive, the `<p>` in this case, with the `@HostListener()` decorator.

HELPFUL: The handlers delegate to a helper method, `highlight()`, that sets the color on the host DOM element, `el`.

The complete directive is as follows:

<docs-code header="src/app/highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.2.ts"/>

The background color appears when the pointer hovers over the paragraph element and disappears as the pointer moves out.

<img alt="Second Highlight" src="assets/images/guide/attribute-directives/highlight-directive-anim.gif">

### Passing values into an attribute directive

This section walks you through setting the highlight color while applying the `HighlightDirective`.

1. In `highlight.directive.ts`, import `Input` from `@angular/core`.

    <docs-code header="src/app/highlight.directive.ts (imports)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.3.ts" visibleRegion="imports"/>

1. Add an `appHighlight` `@Input()` property.

    <docs-code header="src/app/highlight.directive.ts" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.3.ts" visibleRegion="input"/>

    The `@Input()` decorator adds metadata to the class that makes the directive's `appHighlight` property available for binding.

1. In `app.component.ts`, add a `color` property to the `AppComponent`.

    <docs-code header="src/app/app.component.ts (class)" path="adev/src/content/examples/attribute-directives/src/app/app.component.1.ts" visibleRegion="class"/>

1. To simultaneously apply the directive and the color, use property binding with the `appHighlight` directive selector, setting it equal to `color`.

    <docs-code header="src/app/app.component.html (color)" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" visibleRegion="color"/>

    The `[appHighlight]` attribute binding performs two tasks:

    * Applies the highlighting directive to the `<p>` element
    * Sets the directive's highlight color with a property binding

#### Setting the value with user input

This section guides you through adding radio buttons to bind your color choice to the `appHighlight` directive.

1. Add markup to `app.component.html` for choosing a color as follows:

    <docs-code header="src/app/app.component.html (v2)" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" visibleRegion="v2"/>

1. Revise the `AppComponent.color` so that it has no initial value.

    <docs-code header="src/app/app.component.ts (class)" path="adev/src/content/examples/attribute-directives/src/app/app.component.ts" visibleRegion="class"/>

1. In `highlight.directive.ts`, revise `onMouseEnter` method so that it first tries to highlight with `appHighlight` and falls back to `red` if `appHighlight` is `undefined`.

    <docs-code header="src/app/highlight.directive.ts (mouse-enter)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.3.ts" visibleRegion="mouse-enter"/>

1. Serve your application to verify that the user can choose the color with the radio buttons.

    <img alt="Animated gif of the refactored highlight directive changing color according to the radio button the user selects" src="assets/images/guide/attribute-directives/highlight-directive-v2-anim.gif">

### Binding to a second property

This section guides you through configuring your application so the developer can set the default color.

1. Add a second `Input()` property to `HighlightDirective` called `defaultColor`.

    <docs-code header="src/app/highlight.directive.ts (defaultColor)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.ts" visibleRegion="defaultColor"/>

1. Revise the directive's `onMouseEnter` so that it first tries to highlight with the `appHighlight`, then with the `defaultColor`, and falls back to `red` if both properties are `undefined`.

    <docs-code header="src/app/highlight.directive.ts (mouse-enter)" path="adev/src/content/examples/attribute-directives/src/app/highlight.directive.ts" visibleRegion="mouse-enter"/>

1. To bind to the `AppComponent.color` and fall back to "violet" as the default color, add the following HTML.
    In this case,  the `defaultColor` binding doesn't use square brackets, `[]`, because it is static.

    <docs-code header="src/app/app.component.html (defaultColor)" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" visibleRegion="defaultColor"/>

    As with components, you can add multiple directive property bindings to a host element.

The default color is red if there is no default color binding.
When the user chooses a color the selected color becomes the active highlight color.

<img alt="Animated gif of final highlight directive that shows red color with no binding and violet with the default color set. When user selects color, the selection takes precedence." src="assets/images/guide/attribute-directives/highlight-directive-final-anim.gif">

### Deactivating Angular processing with `NgNonBindable`

To prevent expression evaluation in the browser, add `ngNonBindable` to the host element.
`ngNonBindable` deactivates interpolation, directives, and binding in templates.

In the following example, the expression `{{ 1 + 1 }}` renders just as it does in your code editor, and does not display `2`.

<docs-code header="src/app/app.component.html" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" visibleRegion="ngNonBindable"/>

Applying `ngNonBindable` to an element stops binding for that element's child elements.
However, `ngNonBindable` still lets directives work on the element where you apply `ngNonBindable`.
In the following example, the `appHighlight` directive is still active but Angular does not evaluate the expression `{{ 1 + 1 }}`.

<docs-code header="src/app/app.component.html" path="adev/src/content/examples/attribute-directives/src/app/app.component.html" visibleRegion="ngNonBindable-with-directive"/>

If you apply `ngNonBindable` to a parent element, Angular disables interpolation and binding of any sort, such as property binding or event binding, for the element's children.

---


(From directive-composition-api.md)

## Directive composition API

Angular directives offer a great way to encapsulate reusable behaviors— directives can apply
attributes, CSS classes, and event listeners to an element.

The *directive composition API* lets you apply directives to a component's host element from
*within* the component TypeScript class.

### Adding directives to a component

You apply directives to a component by adding a `hostDirectives` property to a component's
decorator. We call such directives *host directives*.

In this example, we apply the directive `MenuBehavior` to the host element of `AdminMenu`. This
works similarly to applying the `MenuBehavior` to the `<admin-menu>` element in a template.

```typescript
@Component({
  selector: 'admin-menu',
  template: 'admin-menu.html',
  hostDirectives: [MenuBehavior],
})
export class AdminMenu { }
```

When the framework renders a component, Angular also creates an instance of each host directive. The
directives' host bindings apply to the component's host element. By default, host directive inputs
and outputs are not exposed as part of the component's public API. See
[Including inputs and outputs](#including-inputs-and-outputs) below for more information.

**Angular applies host directives statically at compile time.** You cannot dynamically add
directives at runtime.

**Directives used in `hostDirectives` may not specify `standalone: false`.**

**Angular ignores the `selector` of directives applied in the `hostDirectives` property.**

### Including inputs and outputs

When you apply `hostDirectives` to your component, the inputs and outputs from the host directives
are not included in your component's API by default. You can explicitly include inputs and outputs
in your component's API by expanding the entry in `hostDirectives`:

```typescript
@Component({
  selector: 'admin-menu',
  template: 'admin-menu.html',
  hostDirectives: [{
    directive: MenuBehavior,
    inputs: ['menuId'],
    outputs: ['menuClosed'],
  }],
})
export class AdminMenu { }
```

By explicitly specifying the inputs and outputs, consumers of the component with `hostDirective` can
bind them in a template:

```angular-html

<admin-menu menuId="top-menu" (menuClosed)="logMenuClosed()">
```

Furthermore, you can alias inputs and outputs from `hostDirective` to customize the API of your
component:

```typescript
@Component({
  selector: 'admin-menu',
  template: 'admin-menu.html',
  hostDirectives: [{
    directive: MenuBehavior,
    inputs: ['menuId: id'],
    outputs: ['menuClosed: closed'],
  }],
})
export class AdminMenu { }
```

```angular-html

<admin-menu id="top-menu" (closed)="logMenuClosed()">
```

### Adding directives to another directive

You can also add `hostDirectives` to other directives, in addition to components. This enables the
transitive aggregation of multiple behaviors.

In the following example, we define two directives, `Menu` and `Tooltip`. We then compose the behavior
of these two directives in `MenuWithTooltip`. Finally, we apply `MenuWithTooltip`
to `SpecializedMenuWithTooltip`.

When `SpecializedMenuWithTooltip` is used in a template, it creates instances of all of `Menu`
, `Tooltip`, and `MenuWithTooltip`. Each of these directives' host bindings apply to the host
element of `SpecializedMenuWithTooltip`.

```typescript
@Directive({...})
export class Menu { }

@Directive({...})
export class Tooltip { }

// MenuWithTooltip can compose behaviors from multiple other directives
@Directive({
  hostDirectives: [Tooltip, Menu],
})
export class MenuWithTooltip { }

// CustomWidget can apply the already-composed behaviors from MenuWithTooltip
@Directive({
  hostDirectives: [MenuWithTooltip],
})
export class SpecializedMenuWithTooltip { }
```

### Host directive semantics

#### Directive execution order

Host directives go through the same lifecycle as components and directives used directly in a
template. However, host directives always execute their constructor, lifecycle hooks, and bindings _before_ the component or directive on which they are applied.

The following example shows minimal use of a host directive:

```typescript
@Component({
  selector: 'admin-menu',
  template: 'admin-menu.html',
  hostDirectives: [MenuBehavior],
})
export class AdminMenu { }
```

The order of execution here is:

1. `MenuBehavior` instantiated
2. `AdminMenu` instantiated
3. `MenuBehavior` receives inputs (`ngOnInit`)
4. `AdminMenu` receives inputs (`ngOnInit`)
5. `MenuBehavior` applies host bindings
6. `AdminMenu` applies host bindings

This order of operations means that components with `hostDirectives` can override any host bindings
specified by a host directive.

This order of operations extends to nested chains of host directives, as shown in the following
example.

```typescript
@Directive({...})
export class Tooltip { }

@Directive({
  hostDirectives: [Tooltip],
})
export class CustomTooltip { }

@Directive({
  hostDirectives: [CustomTooltip],
})
export class EvenMoreCustomTooltip { }
```

In the example above, the order of execution is:

1. `Tooltip` instantiated
2. `CustomTooltip` instantiated
3. `EvenMoreCustomTooltip` instantiated
4. `Tooltip` receives inputs (`ngOnInit`)
5. `CustomTooltip` receives inputs (`ngOnInit`)
6. `EvenMoreCustomTooltip` receives inputs (`ngOnInit`)
7. `Tooltip` applies host bindings
8. `CustomTooltip` applies host bindings
9. `EvenMoreCustomTooltip` applies host bindings

#### Dependency injection

A component or directive that specifies `hostDirectives` can inject the instances of those host
directives and vice versa.

When applying host directives to a component, both the component and host directives can define
providers.

If a component or directive with `hostDirectives` and those host directives both provide the same
injection token, the providers defined by class with `hostDirectives` take precedence over providers
defined by the host directives.

---


(From overview.md)

<docs-decorative-header title="Built-in directives" imgSrc="adev/src/assets/images/directives.svg"> <!-- markdownlint-disable-line -->
Directives are classes that add additional behavior to elements in your Angular applications.
</docs-decorative-header>

Use Angular's built-in directives to manage forms, lists, styles, and what users see.

The different types of Angular directives are as follows:

| Directive Types                                          | Details                                                                           |
| :------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| [Components](guide/components)                           | Used with a template. This type of directive is the most common directive type.   |
| [Attribute directives](#built-in-attribute-directives)   | Change the appearance or behavior of an element, component, or another directive. |
| [Structural directives](#built-in-structural-directives) | Change the DOM layout by adding and removing DOM elements.                        |

This guide covers built-in [attribute directives](#built-in-attribute-directives) and [structural directives](#built-in-structural-directives).

### Built-in attribute directives

Attribute directives listen to and modify the behavior of other HTML elements, attributes, properties, and components.

The most common attribute directives are as follows:

| Common directives                                             | Details                                            |
| :------------------------------------------------------------ | :------------------------------------------------- |
| [`NgClass`](#adding-and-removing-classes-with-ngclass)        | Adds and removes a set of CSS classes.             |
| [`NgStyle`](#setting-inline-styles-with-ngstyle)              | Adds and removes a set of HTML styles.             |
| [`NgModel`](#displaying-and-updating-properties-with-ngmodel) | Adds two-way data binding to an HTML form element. |

HELPFUL: Built-in directives use only public APIs. They do not have special access to any private APIs that other directives can't access.

### Adding and removing classes with `NgClass`

Add or remove multiple CSS classes simultaneously with `ngClass`.

HELPFUL: To add or remove a _single_ class, use [class binding](guide/templates/class-binding) rather than `NgClass`.

#### Import `NgClass` in the component

To use `NgClass`, add it to the component's `imports` list.

<docs-code header="src/app/app.component.ts (NgClass import)" path="adev/src/content/examples/built-in-directives/src/app/app.component.ts" visibleRegion="import-ng-class"/>

#### Using `NgClass` with an expression

On the element you'd like to style, add `[ngClass]` and set it equal to an expression.
In this case, `isSpecial` is a boolean set to `true` in `app.component.ts`.
Because `isSpecial` is true, `ngClass` applies the class of `special` to the `<div>`.

<docs-code header="src/app/app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" visibleRegion="special-div"/>

#### Using `NgClass` with a method

1. To use `NgClass` with a method, add the method to the component class.
   In the following example, `setCurrentClasses()` sets the property `currentClasses` with an object that adds or removes three classes based on the `true` or `false` state of three other component properties.

   Each key of the object is a CSS class name.
   If a key is `true`, `ngClass` adds the class.
   If a key is `false`, `ngClass` removes the class.

   <docs-code header="src/app/app.component.ts" path="adev/src/content/examples/built-in-directives/src/app/app.component.ts" visibleRegion="setClasses"/>

1. In the template, add the `ngClass` property binding to `currentClasses` to set the element's classes:

<docs-code header="src/app/app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" visibleRegion="NgClass-1"/>

For this use case, Angular applies the classes on initialization and in case of changes caused by reassigning the `currentClasses` object.
The full example calls `setCurrentClasses()` initially with `ngOnInit()` when the user clicks on the `Refresh currentClasses` button.
These steps are not necessary to implement `ngClass`.

### Setting inline styles with `NgStyle`

HELPFUL: To add or remove a _single_ style, use [style bindings](guide/templates/binding#css-class-and-style-property-bindings) rather than `NgStyle`.

#### Import `NgStyle` in the component

To use `NgStyle`, add it to the component's `imports` list.

<docs-code header="src/app/app.component.ts (NgStyle import)" path="adev/src/content/examples/built-in-directives/src/app/app.component.ts" visibleRegion="import-ng-style"/>

Use `NgStyle` to set multiple inline styles simultaneously, based on the state of the component.

1. To use `NgStyle`, add a method to the component class.

   In the following example, `setCurrentStyles()` sets the property `currentStyles` with an object that defines three styles, based on the state of three other component properties.

   <docs-code header="src/app/app.component.ts" path="adev/src/content/examples/built-in-directives/src/app/app.component.ts" visibleRegion="setStyles"/>

1. To set the element's styles, add an `ngStyle` property binding to `currentStyles`.

<docs-code header="src/app/app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" visibleRegion="NgStyle-2"/>

For this use case, Angular applies the styles upon initialization and in case of changes.
To do this, the full example calls `setCurrentStyles()` initially with `ngOnInit()` and when the dependent properties change through a button click.
However, these steps are not necessary to implement `ngStyle` on its own.

### Displaying and updating properties with `ngModel`

Use the `NgModel` directive to display a data property and update that property when the user makes changes.

1. Import `FormsModule` and add it to the AppComponent's `imports` list.

<docs-code header="src/app/app.component.ts (FormsModule import)" path="adev/src/content/examples/built-in-directives/src/app/app.component.ts" visibleRegion="import-forms-module" />

1. Add an `[(ngModel)]` binding on an HTML `<form>` element and set it equal to the property, here `name`.

   <docs-code header="src/app/app.component.html (NgModel example)" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" visibleRegion="NgModel-1"/>

   This `[(ngModel)]` syntax can only set a data-bound property.

To customize your configuration, write the expanded form, which separates the property and event binding.
Use [property binding](guide/templates/property-binding) to set the property and [event binding](guide/templates/event-listeners) to respond to changes.
The following example changes the `<input>` value to uppercase:

<docs-code header="src/app/app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" visibleRegion="uppercase"/>

Here are all variations in action, including the uppercase version:

<img alt="NgModel variations" src="assets/images/guide/built-in-directives/ng-model-anim.gif">

#### `NgModel` and value accessors

The `NgModel` directive works for an element supported by a [ControlValueAccessor](api/forms/ControlValueAccessor).
Angular provides _value accessors_ for all of the basic HTML form elements.
For more information, see [Forms](guide/forms).

To apply `[(ngModel)]` to a non-form built-in element or a third-party custom component, you have to write a value accessor.
For more information, see the API documentation on [DefaultValueAccessor](api/forms/DefaultValueAccessor).

HELPFUL: When you write an Angular component, you don't need a value accessor or `NgModel` if you name the value and event properties according to Angular's [two-way binding syntax](guide/templates/two-way-binding#how-two-way-binding-works).

### Built-in structural directives

Structural directives are responsible for HTML layout.
They shape or reshape the DOM's structure, typically by adding, removing, and manipulating the host elements to which they are attached.

This section introduces the most common built-in structural directives:

| Common built-in structural directives              | Details                                                          |
| :------------------------------------------------- | :--------------------------------------------------------------- |
| [`NgIf`](#adding-or-removing-an-element-with-ngif) | Conditionally creates or disposes of subviews from the template. |
| [`NgFor`](#listing-items-with-ngfor)               | Repeat a node for each item in a list.                           |
| [`NgSwitch`](#switching-cases-with-ngswitch)       | A set of directives that switch among alternative views.         |

For more information, see [Structural Directives](guide/directives/structural-directives).

### Adding or removing an element with `NgIf`

Add or remove an element by applying an `NgIf` directive to a host element.

When `NgIf` is `false`, Angular removes an element and its descendants from the DOM.
Angular then disposes of their components, which frees up memory and resources.

#### Import `NgIf` in the component

To use `NgIf`, add it to the component's `imports` list.

<docs-code header="src/app/app.component.ts (NgIf import)" path="adev/src/content/examples/built-in-directives/src/app/app.component.ts" visibleRegion="import-ng-if"/>

#### Using `NgIf`

To add or remove an element, bind `*ngIf` to a condition expression such as `isActive` in the following example.

<docs-code header="src/app/app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" visibleRegion="NgIf-1"/>

When the `isActive` expression returns a truthy value, `NgIf` adds the `ItemDetailComponent` to the DOM.
When the expression is falsy, `NgIf` removes the `ItemDetailComponent` from the DOM and disposes of the component and all of its subcomponents.

For more information on `NgIf` and `NgIfElse`, see the [NgIf API documentation](api/common/NgIf).

#### Guarding against `null`

By default, `NgIf` prevents display of an element bound to a null value.

To use `NgIf` to guard a `<div>`, add `*ngIf="yourProperty"` to the `<div>`.
In the following example, the `currentCustomer` name appears because there is a `currentCustomer`.

<docs-code header="src/app/app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" visibleRegion="NgIf-2"/>

However, if the property is `null`, Angular does not display the `<div>`.
In this example, Angular does not display the `nullCustomer` because it is `null`.

<docs-code header="src/app/app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" visibleRegion="NgIf-2b"/>

### Listing items with `NgFor`

Use the `NgFor` directive to present a list of items.

#### Import `NgFor` in the component

To use `NgFor`, add it to the component's `imports` list.

<docs-code header="src/app/app.component.ts (NgFor import)" path="adev/src/content/examples/built-in-directives/src/app/app.component.ts" visibleRegion="import-ng-for"/>

#### Using `NgFor`

To use `NgFor`, you have to:

1. Define a block of HTML that determines how Angular renders a single item.
1. To list your items, assign the shorthand `let item of items` to `*ngFor`.

<docs-code header="src/app/app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" visibleRegion="NgFor-1"/>

The string `"let item of items"` instructs Angular to do the following:

- Store each item in the `items` array in the local `item` looping variable
- Make each item available to the templated HTML for each iteration
- Translate `"let item of items"` into an `<ng-template>` around the host element
- Repeat the `<ng-template>` for each `item` in the list

For more information see the [Structural directive shorthand](guide/directives/structural-directives#structural-directive-shorthand) section of [Structural directives](guide/directives/structural-directives).

#### Repeating a component view

To repeat a component element, apply `*ngFor` to the selector.
In the following example, the selector is `<app-item-detail>`.

<docs-code header="src/app/app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" visibleRegion="NgFor-2"/>

Reference a template input variable, such as `item`, in the following locations:

- Within the `ngFor` host element
- Within the host element descendants to access the item's properties

The following example references `item` first in an interpolation and then passes in a binding to the `item` property of the `<app-item-detail>` component.

<docs-code header="src/app/app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" visibleRegion="NgFor-1-2"/>

For more information about template input variables, see [Structural directive shorthand](guide/directives/structural-directives#structural-directive-shorthand).

#### Getting the `index` of `*ngFor`

Get the `index` of `*ngFor` in a template input variable and use it in the template.

In the `*ngFor`, add a semicolon and `let i=index` to the shorthand.
The following example gets the `index` in a variable named `i` and displays it with the item name.

<docs-code header="src/app/app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" visibleRegion="NgFor-3"/>

The index property of the `NgFor` directive context returns the zero-based index of the item in each iteration.

Angular translates this instruction into an `<ng-template>` around the host element,
then uses this template repeatedly to create a new set of elements and bindings for each `item`
in the list.
For more information about shorthand, see the [Structural Directives](guide/directives/structural-directives#structural-directive-shorthand) guide.

### Repeating elements when a condition is true

To repeat a block of HTML when a particular condition is true, put the `*ngIf` on a container element that wraps an `*ngFor` element.

For more information see [one structural directive per element](guide/directives/structural-directives#one-structural-directive-per-element).

#### Tracking items with `*ngFor` `trackBy`

Reduce the number of calls your application makes to the server by tracking changes to an item list.
With the `*ngFor` `trackBy` property, Angular can change and re-render only those items that have changed, rather than reloading the entire list of items.

1. Add a method to the component that returns the value `NgFor` should track.
In this example, the value to track is the item's `id`.
If the browser has already rendered `id`, Angular keeps track of it and doesn't re-query the server for the same `id`.

<docs-code header="src/app/app.component.ts" path="adev/src/content/examples/built-in-directives/src/app/app.component.ts" visibleRegion="trackByItems"/>

1. In the shorthand expression, set `trackBy` to the `trackByItems()` method.

<docs-code header="src/app/app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" visibleRegion="trackBy"/>

**Change ids** creates new items with new `item.id`s.
In the following illustration of the `trackBy` effect, **Reset items** creates new items with the same `item.id`s.

- With no `trackBy`, both buttons trigger complete DOM element replacement.
- With `trackBy`, only changing the `id` triggers element replacement.

<img alt="Animation of trackBy" src="assets/images/guide/built-in-directives/ngfor-trackby.gif">

### Hosting a directive without a DOM element

The Angular `<ng-container>` is a grouping element that doesn't interfere with styles or layout because Angular doesn't put it in the DOM.

Use `<ng-container>` when there's no single element to host the directive.

Here's a conditional paragraph using `<ng-container>`.

<docs-code header="src/app/app.component.html (ngif-ngcontainer)" path="adev/src/content/examples/structural-directives/src/app/app.component.html" visibleRegion="ngif-ngcontainer"/>

<img alt="ngcontainer paragraph with proper style" src="assets/images/guide/structural-directives/good-paragraph.png">

1. Import the `ngModel` directive from `FormsModule`.

1. Add `FormsModule` to the imports section of the relevant Angular module.

1. To conditionally exclude an `<option>`, wrap the `<option>` in an `<ng-container>`.

   <docs-code header="src/app/app.component.html (select-ngcontainer)" path="adev/src/content/examples/structural-directives/src/app/app.component.html" visibleRegion="select-ngcontainer"/>

   <img alt="ngcontainer options work properly" src="assets/images/guide/structural-directives/select-ngcontainer-anim.gif">

### Switching cases with `NgSwitch`

Like the JavaScript `switch` statement, `NgSwitch` displays one element from among several possible elements, based on a switch condition.
Angular puts only the selected element into the DOM.

<!--todo: API Flagged -->

`NgSwitch` is a set of three directives:

| `NgSwitch` directives | Details                                                                                                                                                                |
| :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NgSwitch`            | An attribute directive that changes the behavior of its companion directives.                                                                                          |
| `NgSwitchCase`        | Structural directive that adds its element to the DOM when its bound value equals the switch value and removes its bound value when it doesn't equal the switch value. |
| `NgSwitchDefault`     | Structural directive that adds its element to the DOM when there is no selected `NgSwitchCase`.                                                                        |

To use the directives, add the `NgSwitch`, `NgSwitchCase` and `NgSwitchDefault` to the component's `imports` list.

<docs-code header="src/app/app.component.ts (NgSwitch imports)" path="adev/src/content/examples/built-in-directives/src/app/app.component.ts" visibleRegion="import-ng-switch"/>

#### Using `NgSwitch`

1. On an element, such as a `<div>`, add `[ngSwitch]` bound to an expression that returns the switch value, such as `feature`.
   Though the `feature` value in this example is a string, the switch value can be of any type.

1. Bind to `*ngSwitchCase` and `*ngSwitchDefault` on the elements for the cases.

<docs-code header="src/app/app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" visibleRegion="NgSwitch"/>

1. In the parent component, define `currentItem`, to use it in the `[ngSwitch]` expression.

<docs-code header="src/app/app.component.ts" path="adev/src/content/examples/built-in-directives/src/app/app.component.ts" visibleRegion="item"/>

1. In each child component, add an `item` [input property](guide/components/inputs) which is bound to the `currentItem` of the parent component.
   The following two snippets show the parent component and one of the child components.
   The other child components are identical to `StoutItemComponent`.

   <docs-code header="In each child component, here StoutItemComponent" path="adev/src/content/examples/built-in-directives/src/app/item-switch.component.ts" visibleRegion="input"/>

   <img alt="Animation of NgSwitch" src="assets/images/guide/built-in-directives/ngswitch.gif">

Switch directives also work with built-in HTML elements and web components.
For example, you could replace the `<app-best-item>` switch case with a `<div>` as follows.

<docs-code header="src/app/app.component.html" path="adev/src/content/examples/built-in-directives/src/app/app.component.html" visibleRegion="NgSwitch-div"/>

### What's next

<docs-pill-row>
  <docs-pill href="guide/directives/attribute-directives" title="Attribute Directives"/>
  <docs-pill href="guide/directives/structural-directives" title="Structural Directives"/>
  <docs-pill href="guide/directives/directive-composition-api" title="Directive composition API"/>
</docs-pill-row>

---


(From structural-directives.md)

## Structural directives

Structural directives are directives applied to an `<ng-template>` element that conditionally or repeatedly render the content of that `<ng-template>`.

### Example use case

In this guide you'll build a structural directive which fetches data from a given data source and renders its template when that data is available. This directive is called `SelectDirective`, after the SQL keyword `SELECT`, and match it with an attribute selector `[select]`.

`SelectDirective` will have an input naming the data source to be used, which you will call `selectFrom`. The `select` prefix for this input is important for the [shorthand syntax](#structural-directive-shorthand). The directive will instantiate its `<ng-template>` with a template context providing the selected data.

The following is an example of using this directive directly on an `<ng-template>` would look like:

```angular-html
<ng-template select let-data [selectFrom]="source">
  <p>The data is: {{ data }}</p>
</ng-template>
```

The structural directive can wait for the data to become available and then render its `<ng-template>`.

HELPFUL: Note that Angular's `<ng-template>` element defines a template that doesn't render anything by default, if you just wrap elements in an `<ng-template>` without applying a structural directive those elements will not be rendered.

For more information, see the [ng-template API](api/core/ng-template) documentation.

### Structural directive shorthand

Angular supports a shorthand syntax for structural directives which avoids the need to explicitly author an `<ng-template>` element.

Structural directives can be applied directly on an element by prefixing the directive attribute selector with an asterisk (`*`), such as `*select`. Angular transforms the asterisk in front of a structural directive into an `<ng-template>` that hosts the directive and surrounds the element and its descendants.

You can use this with `SelectDirective` as follows:

```angular-html
<p *select="let data from source">The data is: {{data}}</p>
```

This example shows the flexibility of structural directive shorthand syntax, which is sometimes called _microsyntax_.

When used in this way, only the structural directive and its bindings are applied to the `<ng-template>`. Any other attributes or bindings on the `<p>` tag are left alone. For example, these two forms are equivalent:

```angular-html
<!-- Shorthand syntax: -->
<p class="data-view" *select="let data from source">The data is: {{data}}</p>

<!-- Long-form syntax: -->
<ng-template select let-data [selectFrom]="source">
  <p class="data-view">The data is: {{data}}</p>
</ng-template>
```

Shorthand syntax is expanded through a set of conventions. A more thorough [grammar](#structural-directive-syntax-reference) is defined below, but in the above example, this transformation can be explained as follows:

The first part of the `*select` expression is `let data`, which declares a template variable `data`. Since no assignment follows, the template variable is bound to the template context property `$implicit`.

The second piece of syntax is a key-expression pair, `from source`. `from` is a binding key and `source` is a regular template expression. Binding keys are mapped to properties by transforming them to PascalCase and prepending the structural directive selector. The `from` key is mapped to `selectFrom`, which is then bound to the expression `source`. This is why many structural directives will have inputs that are all prefixed with the structural directive's selector.

### One structural directive per element

You can only apply one structural directive per element when using the shorthand syntax. This is because there is only one `<ng-template>` element onto which that directive gets unwrapped. Multiple directives would require multiple nested `<ng-template>`, and it's unclear which directive should be first. `<ng-container>` can be used when to create wrapper layers when multiple structural directives need to be applied around the same physical DOM element or component, which allows the user to define the nested structure.

### Creating a structural directive

This section guides you through creating the `SelectDirective`.

<docs-workflow>
<docs-step title="Generate the directive">
Using the Angular CLI, run the following command, where `select` is the name of the directive:

```shell
ng generate directive select
```

Angular creates the directive class and specifies the CSS selector, `[select]`, that identifies the directive in a template.
</docs-step>
<docs-step title="Make the directive structural">
Import `TemplateRef`, and `ViewContainerRef`. Inject `TemplateRef` and `ViewContainerRef` in the directive as private properties.

```ts
import {Directive, TemplateRef, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[select]',
})
export class SelectDirective {
  private templateRef = inject(TemplateRef);
  private viewContainerRef = inject(ViewContainerRef);
}

```

</docs-step>
<docs-step title="Add the 'selectFrom' input">
Add a `selectFrom` `@Input()` property.

```ts
export class SelectDirective {
  // ...

  @Input({required: true}) selectFrom!: DataSource;
}
```

</docs-step>
<docs-step title="Add the business logic">
With `SelectDirective` now scaffolded as a structural directive with its input, you can now add the logic to fetch the data and render the template with it:

```ts
export class SelectDirective {
  // ...

  async ngOnInit() {
    const data = await this.selectFrom.load();
    this.viewContainerRef.createEmbeddedView(this.templateRef, {
      // Create the embedded view with a context object that contains
      // the data via the key `$implicit`.
      $implicit: data,
    });
  }
}
```

</docs-step>
</docs-workflow>

That's it - `SelectDirective` is up and running. A follow-up step might be to [add template type-checking support](#typing-the-directives-context).

### Structural directive syntax reference

When you write your own structural directives, use the following syntax:

<docs-code hideCopy language="typescript">

*:prefix="( :let | :expression ) (';' | ',')? ( :let | :as | :keyExp )*"

</docs-code>

The following patterns describe each portion of the structural directive grammar:

```ts
as = :export "as" :local ";"?
keyExp = :key ":"? :expression ("as" :local)? ";"?
let = "let" :local "=" :export ";"?
```

| Keyword      | Details                                            |
| :----------- | :------------------------------------------------- |
| `prefix`     | HTML attribute key                                 |
| `key`        | HTML attribute key                                 |
| `local`      | Local variable name used in the template           |
| `export`     | Value exported by the directive under a given name |
| `expression` | Standard Angular expression                        |

#### How Angular translates shorthand

Angular translates structural directive shorthand into the normal binding syntax as follows:

| Shorthand | Translation |
|:--- |:--- |
| `prefix` and naked `expression` | `[prefix]="expression"` |
| `keyExp` | `[prefixKey]="expression"` (The `prefix` is added to the `key`) |
| `let local` | `let-local="export"` |

#### Shorthand examples

The following table provides shorthand examples:

| Shorthand | How Angular interprets the syntax |
|:--- |:--- |
| `*ngFor="let item of [1,2,3]"` | `<ng-template ngFor let-item [ngForOf]="[1, 2, 3]">` |
| `*ngFor="let item of [1,2,3] as items; trackBy: myTrack; index as i"` | `<ng-template ngFor let-item [ngForOf]="[1,2,3]" let-items="ngForOf" [ngForTrackBy]="myTrack" let-i="index">` |
| `*ngIf="exp"`| `<ng-template [ngIf]="exp">` |
| `*ngIf="exp as value"` | `<ng-template [ngIf]="exp" let-value="ngIf">` |

### Improving template type checking for custom directives

You can improve template type checking for custom directives by adding template guards to your directive definition.
These guards help the Angular template type checker find mistakes in the template at compile time, which can avoid runtime errors.
Two different types of guards are possible:

* `ngTemplateGuard_(input)` lets you control how an input expression should be narrowed based on the type of a specific input.
* `ngTemplateContextGuard` is used to determine the type of the context object for the template, based on the type of the directive itself.

This section provides examples of both kinds of guards.
For more information, see [Template type checking](tools/cli/template-typecheck "Template type-checking guide").

#### Type narrowing with template guards

A structural directive in a template controls whether that template is rendered at run time. Some structural directives want to perform type narrowing based on the type of input expression.

There are two narrowings which are possible with input guards:

* Narrowing the input expression based on a TypeScript type assertion function.
* Narrowing the input expression based on its truthiness.

To narrow the input expression by defining a type assertion function:

```ts
// This directive only renders its template if the actor is a user.
// You want to assert that within the template, the type of the `actor`
// expression is narrowed to `User`.
@Directive(...)
class ActorIsUser {
  @Input() actor: User|Robot;

  static ngTemplateGuard_actor(dir: ActorIsUser, expr: User|Robot): expr is User {
    // The return statement is unnecessary in practice, but included to
    // prevent TypeScript errors.
    return true;
  }
}
```

Type-checking will behave within the template as if the `ngTemplateGuard_actor` has been asserted on the expression bound to the input.

Some directives only render their templates when an input is truthy. It's not possible to capture the full semantics of truthiness in a type assertion function, so instead a literal type of `'binding'` can be used to signal to the template type-checker that the binding expression itself should be used as the guard:

```ts
@Directive(...)
class CustomIf {
  @Input() condition!: any;

  static ngTemplateGuard_condition: 'binding';
}
```

The template type-checker will behave as if the expression bound to `condition` was asserted to be truthy within the template.

#### Typing the directive's context

If your structural directive provides a context to the instantiated template, you can properly type it inside the template by providing a static `ngTemplateContextGuard` type assertion function. This function can use the type of the directive to derive the type of the context, which is useful when the type of the directive is generic.

For the `SelectDirective` described above, you can implement an `ngTemplateContextGuard` to correctly specify the data type, even if the data source is generic.

```ts
// Declare an interface for the template context:
export interface SelectTemplateContext<T> {
  $implicit: T;
}

@Directive(...)
export class SelectDirective<T> {
  // The directive's generic type `T` will be inferred from the `DataSource` type
  // passed to the input.
  @Input({required: true}) selectFrom!: DataSource<T>;

  // Narrow the type of the context using the generic type of the directive.
  static ngTemplateContextGuard<T>(dir: SelectDirective<T>, ctx: any): ctx is SelectTemplateContext<T> {
    // As before the guard body is not used at runtime, and included only to avoid
    // TypeScript errors.
    return true;
  }
}
```

---