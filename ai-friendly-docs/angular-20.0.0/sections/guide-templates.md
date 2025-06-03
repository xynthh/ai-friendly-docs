# Guide Templates

(From binding.md)

## Binding dynamic text, properties and attributes

In Angular, a **binding** creates a dynamic connection between a component's template and its data. This connection ensures that changes to the component's data automatically update the rendered template.

### Render dynamic text with text interpolation

You can bind dynamic text in templates with double curly braces, which tells Angular that it is responsible for the expression inside and ensuring it is updated correctly. This is called **text interpolation**.

```angular-ts
@Component({
  template: `
    <p>Your color preference is {{ theme }}.</p>
  `,
  ...
})
export class AppComponent {
  theme = 'dark';
}
```

In this example, when the snippet is rendered to the page, Angular will replace `{{ theme }}` with `dark`.

```angular-html
<!-- Rendered Output -->
<p>Your color preference is dark.</p>
```

In addition to evaluating the expression at first render, Angular also updates the rendered content when the expression's value changes.

Continuing the theme example, if a user clicks on a button that changes the value of `theme` to `'light'` after the page loads, the page updates accordingly to:

```angular-html
<!-- Rendered Output -->
<p>Your color preference is light.</p>
```

You can use text interpolation anywhere you would normally write text in HTML.

All expression values are converted to a string. Objects and arrays are converted using the value’s `toString` method.

### Binding dynamic properties and attributes

Angular supports binding dynamic values into object properties and HTML attributes with square brackets.

You can bind to properties on an HTML element's DOM instance, a [component](guide/components) instance, or a [directive](guide/directives) instance.

#### Native element properties

Every HTML element has a corresponding DOM representation. For example, each `<button>` HTML element corresponds to an instance of `HTMLButtonElement` in the DOM. In Angular, you use property bindings to set values directly to the DOM representation of the element.

```angular-html
<!-- Bind the `disabled` property on the button element's DOM object -->
<button [disabled]="isFormValid">Save</button>
```

In this example, every time `isFormValid` changes, Angular automatically sets the `disabled` property of the `HTMLButtonElement` instance.

#### Component and directive properties

When an element is an Angular component, you can use property bindings to set component input properties using the same square bracket syntax.

```angular-html
<!-- Bind the `value` property on the `MyListbox` component instance. -->
<my-listbox [value]="mySelection" />
```

In this example, every time `mySelection` changes, Angular automatically sets the `value` property of the `MyListbox` instance.

You can bind to directive properties as well.

```angular-html
<!-- Bind to the `ngSrc` property of the `NgOptimizedImage` directive  -->
<img [ngSrc]="profilePhotoUrl" alt="The current user's profile photo">
```

#### Attributes

When you need to set HTML attributes that do not have corresponding DOM properties, such as ARIA attributes or SVG attributes, you can bind attributes to elements in your template with the `attr.` prefix.

```angular-html
<!-- Bind the `role` attribute on the `<ul>` element to the component's `listRole` property. -->
<ul [attr.role]="listRole">
```

In this example, every time `listRole` changes, Angular automatically sets the `role` attribute of the `<ul>` element by calling `setAttribute`.

If the value of an attribute binding is `null`, Angular removes the attribute by calling `removeAttribute`.

#### Text interpolation in properties and attributes

You can also use text interpolation syntax in properties and attributes by using the double curly brace syntax instead of square braces around the property or attribute name. When using this syntax, Angular treats the assignment as a property binding.

```angular-html
<!-- Binds a value to the `alt` property of the image element's DOM object. -->
<img src="profile-photo.jpg" alt="Profile photo of {{ firstName }}" >
```

To bind to an attribute with the text interpolation syntax, prefix the attribute name with `attr.`

```angular-html
<button attr.aria-label="Save changes to {{ objectType }}">
```

### CSS class and style property bindings

Angular supports additional features for binding CSS classes and CSS style properties to elements.

#### CSS classes

You can create a CSS class binding to conditionally add or remove a CSS class on an element based on whether the bound value is [truthy or falsy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy).

```angular-html
<!-- When `isExpanded` is truthy, add the `expanded` CSS class. -->
<ul [class.expanded]="isExpanded">
```

You can also bind directly to the `class` property. Angular accepts three types of value:

| Description of `class` value                                                                                                                                      | TypeScript type       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| A string containing one or more CSS classes separated by spaces                                                                                                   | `string`              |
| An array of CSS class strings                                                                                                                                     | `string[]`            |
| An object where each property name is a CSS class name and each corresponding value determines whether that class is applied to the element, based on truthiness. | `Record<string, any>` |

```angular-ts
@Component({
  template: `
    <ul [class]="listClasses"> ... </ul>
    <section [class]="sectionClasses"> ... </section>
    <button [class]="buttonClasses"> ... </button>
  `,
  ...
})
export class UserProfile {
  listClasses = 'full-width outlined';
  sectionClasses = ['expandable', 'elevated'];
  buttonClasses = {
    highlighted: true,
    embiggened: false,
  };
}
```

The above example renders the following DOM:

```angular-html
<ul class="full-width outlined"> ... </ul>
<section class="expandable elevated"> ... </section>
<button class="highlighted"> ... </button>
```

Angular ignores any string values that are not valid CSS class names.

When using static CSS classes, directly binding `class`, and binding specific classes, Angular intelligently combines all of the classes in the rendered result.

```angular-ts
@Component({
  template: `<ul class="list" [class]="listType" [class.expanded]="isExpanded"> ...`,
  ...
})
export class Listbox {
  listType = 'box';
  isExpanded = true;
}
```

In the example above, Angular renders the `ul` element with all three CSS classes.

```angular-html
<ul class="list box expanded">
```

Angular does not guarantee any specific order of CSS classes on rendered elements.

When binding `class` to an array or an object, Angular compares the previous value to the current value with the triple-equals operator (`===`). You must create a new object or array instance when you modify these values in order for Angular to apply any updates.

If an element has multiple bindings for the same CSS class, Angular resolves collisions by following its style precedence order.

#### CSS style properties

You can also bind to CSS style properties directly on an element.

```angular-html
<!-- Set the CSS `display` property based on the `isExpanded` property. -->
<section [style.display]="isExpanded ? 'block' : 'none'">
```

You can further specify units for CSS properties that accept units.

```angular-html
<!-- Set the CSS `height` property to a pixel value based on the `sectionHeightInPixels` property. -->
<section [style.height.px]="sectionHeightInPixels">
```

You can also set multiple style values in one binding. Angular accepts the following types of value:

| Description of `style` value                                                                                              | TypeScript type       |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| A string containing zero or more CSS declarations, such as `"display: flex; margin: 8px"`.                                | `string`              |
| An object where each property name is a CSS property name and each corresponding value is the value of that CSS property. | `Record<string, any>` |

```angular-ts
@Component({
  template: `
    <ul [style]="listStyles"> ... </ul>
    <section [style]="sectionStyles"> ... </section>
  `,
  ...
})
export class UserProfile {
  listStyles = 'display: flex; padding: 8px';
  sectionStyles = {
    border: '1px solid black',
    'font-weight': 'bold',
  };
}
```

The above example renders the following DOM.

```angular-html
<ul style="display: flex; padding: 8px"> ... </ul>
<section style="border: 1px solid black; font-weight: bold"> ... </section>
```

When binding `style` to an object, Angular compares the previous value to the current value with the triple-equals operator (`===`). You must create a new object instance when you modify these values in order to Angular to apply any updates.

If an element has multiple bindings for the same style property, Angular resolves collisions by following its style precedence order.

---


(From control-flow.md)

## Control flow

Angular templates support control flow blocks that let you conditionally show, hide, and repeat elements.

NOTE: This was previously accomplished with the *ngIf, *ngFor, and \*ngSwitch directives.

### Conditionally display content with `@if`, `@else-if` and `@else`

The `@if` block conditionally displays its content when its condition expression is truthy:

```angular-html
@if (a > b) {
  <p>{{a}} is greater than {{b}}</p>
}
```

If you want to display alternative content, you can do so by providing any number of `@else if` blocks and a singular `@else` block.

```angular-html
@if (a > b) {
  {{a}} is greater than {{b}}
} @else if (b > a) {
  {{a}} is less than {{b}}
} @else {
  {{a}} is equal to {{b}}
}
```

#### Referencing the conditional expression's result

The `@if` conditional supports saving the result of the conditional expression into a variable for reuse inside of the block.

```angular-html
@if (user.profile.settings.startDate; as startDate) {
  {{ startDate }}
}
```

This can be useful for referencing longer expressions that would be easier to read and maintain within the template.

### Repeat content with the `@for` block

The `@for` block loops through a collection and repeatedly renders the content of a block. The collection can be any JavaScript [iterable](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols), but Angular has additional performance optimizations for `Array` values.

A typical `@for` loop looks like:

```angular-html
@for (item of items; track item.id) {
  {{ item.name }}
}
```

Angular's `@for` block does not support flow-modifying statements like JavaScript's `continue` or `break`.

#### Why is `track` in `@for` blocks important?

The `track` expression allows Angular to maintain a relationship between your data and the DOM nodes on the page. This allows Angular to optimize performance by executing the minimum necessary DOM operations when the data changes.

Using track effectively can significantly improve your application's rendering performance when looping over data collections.

Select a property that uniquely identifies each item in the `track` expression. If your data model includes a uniquely identifying property, commonly `id` or `uuid`, use this value. If your data does not include a field like this, strongly consider adding one.

For static collections that never change, you can use `$index` to tell Angular to track each item by its index in the collection.

If no other option is available, you can specify `identity`. This tells Angular to track the item by its reference identity using the triple-equals operator (`===`). Avoid this option whenever possible as it can lead to significantly slower rendering updates, as Angular has no way to map which data item corresponds to which DOM nodes.

#### Contextual variables in `@for` blocks

Inside `@for` blocks, several implicit variables are always available:

| Variable | Meaning                                       |
| -------- | --------------------------------------------- |
| `$count` | Number of items in a collection iterated over |
| `$index` | Index of the current row                      |
| `$first` | Whether the current row is the first row      |
| `$last`  | Whether the current row is the last row       |
| `$even`  | Whether the current row index is even         |
| `$odd`   | Whether the current row index is odd          |

These variables are always available with these names, but can be aliased via a `let` segment:

```angular-html
@for (item of items; track item.id; let idx = $index, e = $even) {
  <p>Item #{{ idx }}: {{ item.name }}</p>
}
```

The aliasing is useful when nesting `@for` blocks, letting you read variables from the outer `@for` block from an inner `@for` block.

#### Providing a fallback for `@for` blocks with the `@empty` block

You can optionally include an `@empty` section immediately after the `@for` block content. The content of the `@empty` block displays when there are no items:

```angular-html
@for (item of items; track item.name) {
  <li> {{ item.name }}</li>
} @empty {
  <li aria-hidden="true"> There are no items. </li>
}
```

### Conditionally display content with the `@switch` block

While the `@if` block is great for most scenarios, the `@switch` block provides an alternate syntax to conditionally render data. Its syntax closely resembles JavaScript's `switch` statement.

```angular-html
@switch (userPermissions) {
  @case ('admin') {
    <app-admin-dashboard />
  }
  @case ('reviewer') {
    <app-reviewer-dashboard />
  }
  @case ('editor') {
    <app-editor-dashboard />
  }
  @default {
    <app-viewer-dashboard />
  }
}
```

The value of the conditional expression is compared to the case expression using the triple-equals (`===`) operator.

**`@switch` does not have a fallthrough**, so you do not need an equivalent to a `break` or `return` statement in the block.

You can optionally include a `@default` block. The content of the `@default` block displays if none of the preceding case expressions match the switch value.

If no `@case` matches the expression and there is no `@default` block, nothing is shown.

---


(From defer.md)

## Deferred loading with `@defer`

Deferrable views, also known as `@defer` blocks, reduce the initial bundle size of your application by deferring the loading of code that is not strictly necessary for the initial rendering of a page. This often results in a faster initial load and improvement in Core Web Vitals (CWV), primarily Largest Contentful Paint (LCP) and Time to First Byte (TTFB).

To use this feature, you can declaratively wrap a section of your template in a @defer block:

```angular-html
@defer {
  <large-component />
}
```

The code for any components, directives, and pipes inside the `@defer` block is split into a separate JavaScript file and loaded only when necessary, after the rest of the template has been rendered.

Deferrable views support a variety of triggers, prefetching options, and sub-blocks for placeholder, loading, and error state management.

### Which dependencies are deferred?

Components, directives, pipes, and any component CSS styles can be deferred when loading an application.

In order for the dependencies within a `@defer` block to be deferred, they need to meet two conditions:

1. **They must be standalone.** Non-standalone dependencies cannot be deferred and are still eagerly loaded, even if they are inside of `@defer` blocks.
1. **They cannot be referenced outside of `@defer` blocks within the same file.** If they are referenced outside the `@defer` block or referenced within ViewChild queries, the dependencies will be eagerly loaded.

The _transitive_ dependencies of the components, directives and pipes used in the `@defer` block do not strictly need to be standalone; transitive dependencies can still be declared in an `NgModule` and participate in deferred loading.

Angular's compiler produces a [dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) statement for each component, directive, and pipe used in the `@defer` block. The main content of the block renders after all the imports resolve. Angular does not guarantee any particular order for these imports.

### How to manage different stages of deferred loading

`@defer` blocks have several sub blocks to allow you to gracefully handle different stages in the deferred loading process.

#### `@defer`

This is the primary block that defines the section of content that is lazily loaded. It is not rendered initially– deferred content loads and renders once the specified [trigger](/guide/defer#triggers) occurs or the `when` condition is met.

By default, a @defer block is triggered when the browser state becomes [idle](/guide/defer#idle).

```angular-html
@defer {
  <large-component />
}
```

#### Show placeholder content with `@placeholder`

By default, defer blocks do not render any content before they are triggered.

The `@placeholder` is an optional block that declares what content to show before the `@defer` block is triggered.

```angular-html
@defer {
  <large-component />
} @placeholder {
  <p>Placeholder content</p>
}
```

While optional, certain triggers may require the presence of either a `@placeholder` or a [template reference variable](/guide/templates/variables#template-reference-variables) to function. See the [Triggers](/guide/defer#triggers) section for more details.

Angular replaces placeholder content with the main content once loading is complete. You can use any content in the placeholder section including plain HTML, components, directives, and pipes. Keep in mind the _dependencies of the placeholder block are eagerly loaded_.

The `@placeholder` block accepts an optional parameter to specify the `minimum` amount of time that this placeholder should be shown after the placeholder content initially renders.

```angular-html
@defer {
  <large-component />
} @placeholder (minimum 500ms) {
  <p>Placeholder content</p>
}
```

This `minimum` parameter is specified in time increments of milliseconds (ms) or seconds (s). You can use this parameter to prevent fast flickering of placeholder content in the case that the deferred dependencies are fetched quickly.

#### Show loading content with `@loading`

The `@loading` block is an optional block that allows you to declare content that is shown while deferred dependencies are loading. It replaces the `@placeholder` block once loading is triggered.

```angular-html
@defer {
  <large-component />
} @loading {
  <img alt="loading..." src="loading.gif" />
} @placeholder {
  <p>Placeholder content</p>
}
```

Its dependencies are eagerly loaded (similar to `@placeholder`).

The `@loading` block accepts two optional parameters to help prevent fast flickering of content that may occur when deferred dependencies are fetched quickly,:

- `minimum` - the minimum amount of time that this placeholder should be shown
- `after` - the amount of time to wait after loading begins before showing the loading template

```angular-html
@defer {
  <large-component />
} @loading (after 100ms; minimum 1s) {
  <img alt="loading..." src="loading.gif" />
}
```

Both parameters are specified in time increments of milliseconds (ms) or seconds (s). In addition, the timers for both parameters begin immediately after the loading has been triggered.

#### Show error state when deferred loading fails with `@error`

The `@error` block is an optional block that displays if deferred loading fails. Similar to `@placeholder` and `@loading`, the dependencies of the @error block are eagerly loaded.

```angular-html
@defer {
  <large-component />
} @error {
  <p>Failed to load large component.</p>
}
```

### Controlling deferred content loading with triggers

You can specify **triggers** that control when Angular loads and displays deferred content.

When a `@defer` block is triggered, it replaces placeholder content with lazily loaded content.

Multiple event triggers can be defined by separating them with a semicolon, `;` and will be evaluated as OR conditions.

There are two types of triggers: `on` and `when`.

#### `on`

`on` specifies a condition for when the `@defer` block is triggered.

The available triggers are as follows:

| Trigger                       | Description                                                            |
| ----------------------------- | ---------------------------------------------------------------------- |
| [`idle`](#idle)               | Triggers when the browser is idle.                                     |
| [`viewport`](#viewport)       | Triggers when specified content enters the viewport                    |
| [`interaction`](#interaction) | Triggers when the user interacts with specified element                |
| [`hover`](#hover)             | Triggers when the mouse hovers over specified area                     |
| [`immediate`](#immediate)     | Triggers immediately after non-deferred content has finished rendering |
| [`timer`](#timer)             | Triggers after a specific duration                                     |

##### `idle`

The `idle` trigger loads the deferred content once the browser has reached an idle state, based on requestIdleCallback. This is the default behavior with a defer block.

```angular-html
<!-- @defer (on idle) -->
@defer {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

##### `viewport`

The `viewport` trigger loads the deferred content when the specified content enters the viewport using the [Intersection Observer API](https://developer.mozilla.org/docs/Web/API/Intersection_Observer_API). Observed content may be `@placeholder` content or an explicit element reference.

By default, the `@defer` watches for the placeholder entering the viewport. Placeholders used this way must have a single root element.

```angular-html
@defer (on viewport) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

Alternatively, you can specify a [template reference variable](/guide/templates/variables) in the same template as the `@defer` block as the element that is watched to enter the viewport. This variable is passed in as a parameter on the viewport trigger.

```angular-html
<div #greeting>Hello!</div>
@defer (on viewport(greeting)) {
  <greetings-cmp />
}
```

##### `interaction`

The `interaction` trigger loads the deferred content when the user interacts with the specified element through `click` or `keydown` events.

By default, the placeholder acts as the interaction element. Placeholders used this way must have a single root element.

```angular-html
@defer (on interaction) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

Alternatively, you can specify a [template reference variable](/guide/templates/variables) in the same template as the `@defer` block as the element that is watched to enter the viewport. This variable is passed in as a parameter on the viewport trigger.

```angular-html
<div #greeting>Hello!</div>
@defer (on interaction(greeting)) {
  <greetings-cmp />
}
```

##### `hover`

The `hover` trigger loads the deferred content when the mouse has hovered over the triggered area through the `mouseover` and `focusin` events.

By default, the placeholder acts as the interaction element. Placeholders used this way must have a single root element.

```angular-html
@defer (on hover) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

Alternatively, you can specify a [template reference variable](/guide/templates/variables) in the same template as the `@defer` block as the element that is watched to enter the viewport. This variable is passed in as a parameter on the viewport trigger.

```angular-html
<div #greeting>Hello!</div>
@defer (on hover(greeting)) {
  <greetings-cmp />
}
```

##### `immediate`

The `immediate` trigger loads the deferred content immediately. This means that the deferred block loads as soon as all other non-deferred content has finished rendering.

```angular-html
@defer (on immediate) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

##### `timer`

The `timer` trigger loads the deferred content after a specified duration.

```angular-html
@defer (on timer(500ms)) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

The duration parameter must be specified in milliseconds (`ms`) or seconds (`s`).

#### `when`

The `when` trigger accepts a custom conditional expression and loads the deferred content when the condition becomes truthy.

```angular-html
@defer (when condition) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

This is a one-time operation– the `@defer` block does not revert back to the placeholder if the condition changes to a falsy value after becoming truthy.

### Prefetching data with `prefetch`

In addition to specifying a condition that determines when deferred content is shown, you can optionally specify a **prefetch trigger**. This trigger lets you load the JavaScript associated with the `@defer` block before the deferred content is shown.

Prefetching enables more advanced behaviors, such as letting you start to prefetch resources before a user has actually seen or interacted with a defer block, but might interact with it soon, making the resources available faster.

You can specify a prefetch trigger similarly to the block's main trigger, but prefixed with the `prefetch` keyword. The block's main trigger and prefetch trigger are separated with a semi-colon character (`;`).

In the example below, the prefetching starts when a browser becomes idle and the contents of the block is rendered only once the user interacts with the placeholder.

```angular-html
@defer (on interaction; prefetch on idle) {
  <large-cmp />
} @placeholder {
  <div>Large component placeholder</div>
}
```

### Testing `@defer` blocks

Angular provides TestBed APIs to simplify the process of testing `@defer` blocks and triggering different states during testing. By default, `@defer` blocks in tests play through like a defer block would behave in a real application. If you want to manually step through states, you can switch the defer block behavior to `Manual` in the TestBed configuration.

```angular-ts
it('should render a defer block in different states', async () => {
  // configures the defer block behavior to start in "paused" state for manual control.
  TestBed.configureTestingModule({deferBlockBehavior: DeferBlockBehavior.Manual});
  @Component({
    // ...
    template: `
      @defer {
        <large-component />
      } @placeholder {
        Placeholder
      } @loading {
        Loading...
      }
    `
  })
  class ComponentA {}
  // Create component fixture.
  const componentFixture = TestBed.createComponent(ComponentA);
  // Retrieve the list of all defer block fixtures and get the first block.
  const deferBlockFixture = (await componentFixture.getDeferBlocks())[0];
  // Renders placeholder state by default.
  expect(componentFixture.nativeElement.innerHTML).toContain('Placeholder');
  // Render loading state and verify rendered output.
  await deferBlockFixture.render(DeferBlockState.Loading);
  expect(componentFixture.nativeElement.innerHTML).toContain('Loading');
  // Render final state and verify the output.
  await deferBlockFixture.render(DeferBlockState.Complete);
  expect(componentFixture.nativeElement.innerHTML).toContain('large works!');
});
```

### Does `@defer` work with `NgModule`?

`@defer` blocks are compatible with both standalone and NgModule-based components, directives and pipes. However, **only standalone components, directives and pipes can be deferred**. NgModule-based dependencies are not deferred and are included in the eagerly loaded bundle.

### How does `@defer` work with server-side rendering (SSR) and static-site generation (SSG)?

By default, when rendering an application on the server (either using SSR or SSG), defer blocks always render their `@placeholder` (or nothing if a placeholder is not specified) and triggers are not invoked. On the client, the content of the `@placeholder` is hydrated and triggers are activated.

To render the main content of `@defer` blocks on the server (both SSR and SSG), you can enable [the Incremental Hydration feature](/guide/incremental-hydration) and configure `hydrate` triggers for the necessary blocks.

### Best practices for deferring views

#### Avoid cascading loads with nested `@defer` blocks

When you have nested `@defer` blocks, they should have different triggers in order to avoid loading simultaneously, which causes cascading requests and may negatively impact page load performance.

#### Avoid layout shifts

Avoid deferring components that are visible in the user’s viewport on initial load. Doing this may negatively affect Core Web Vitals by causing an increase in cumulative layout shift (CLS).

In the event this is necessary, avoid `immediate`, `timer`, `viewport`, and custom `when` triggers that cause the content to load during the initial page render.

---


(From event-listeners.md)

## Adding event listeners

Angular supports defining event listeners on an element in your template by specifying the event name inside parentheses along with a statement that runs every time the event occurs.

### Listening to native events

When you want to add event listeners to an HTML element, you wrap the event with parentheses, `()`, which allows you to specify a listener statement.

```angular-ts
@Component({
  template: `
    <input type="text" (keyup)="updateField()" />
  `,
  ...
})
export class AppComponent{
  updateField(): void {
    console.log('Field is updated!');
  }
}
```

In this example, Angular calls `updateField` every time the `<input>` element emits a `keyup` event.

You can add listeners for any native events, such as: `click`, `keydown`, `mouseover`, etc. To learn more, check out the [all available events on elements on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element#events).

### Accessing the event argument

In every template event listener, Angular provides a variable named `$event` that contains a reference to the event object.

```angular-ts
@Component({
  template: `
    <input type="text" (keyup)="updateField($event)" />
  `,
  ...
})
export class AppComponent {
  updateField(event: KeyboardEvent): void {
    console.log(`The user pressed: ${event.key}`);
  }
}
```

### Using key modifiers

When you want to capture specific keyboard events for a specific key, you might write some code like the following:

```angular-ts
@Component({
  template: `
    <input type="text" (keyup)="updateField($event)" />
  `,
  ...
})
export class AppComponent {
  updateField(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      console.log('The user pressed enter in the text field.');
    }
  }
}
```

However, since this is a common scenario, Angular lets you filter the events by specifying a specific key using the period (`.`) character. By doing so, code can be simplified to:

```angular-ts
@Component({
  template: `
    <input type="text" (keyup.enter)="updateField($event)" />
  `,
  ...
})
export class AppComponent{
  updateField(event: KeyboardEvent): void {
    console.log('The user pressed enter in the text field.');
  }
}
```

You can also add additional key modifiers:

```angular-html
<!-- Matches shift and enter -->
<input type="text" (keyup.shift.enter)="updateField($event)" />
```

Angular supports the modifiers `alt`, `control`, `meta`, and `shift`.

You can specify the key or code that you would like to bind to keyboard events. The key and code fields are a native part of the browser keyboard event object. By default, event binding assumes you want to use the [Key values for keyboard events](https://developer.mozilla.org/docs/Web/API/UI_Events/Keyboard_event_key_values).

Angular also allows you to specify [Code values for keyboard events](https://developer.mozilla.org/docs/Web/API/UI_Events/Keyboard_event_code_values) by providing a built-in `code` suffix.

```angular-html
<!-- Matches alt and left shift -->
<input type="text" (keydown.code.alt.shiftleft)="updateField($event)" />
```

This can be useful for handling keyboard events consistently across different operating systems. For example, when using the Alt key on MacOS devices, the `key` property reports the key based on the character already modified by the Alt key. This means that a combination like Alt + S reports a `key` value of `'ß'`. The `code` property, however, corresponds to the physical or virtual button pressed rather than the character produced.

### Preventing event default behavior

If your event handler should replace the native browser behavior, you can use the event object's [`preventDefault` method](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault):

```angular-ts
@Component({
  template: `
    <a href="#overlay" (click)="showOverlay($event)">
  `,
  ...
})
export class AppComponent{
  showOverlay(event: PointerEvent): void {
    event.preventDefault();
    console.log('Show overlay without updating the URL!');
  }
}
```

If the event handler statement evaluates to `false`, Angular automatically calls `preventDefault()`, similar to [native event handler attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes#event_handler_attributes). *Always prefer explicitly calling `preventDefault`*, as this approach makes the code's intent obvious.

---


(From expression-syntax.md)

## Expression Syntax

Angular expressions are based on JavaScript, but differ in some key ways. This guide walks through the similarities and differences between Angular expressions and standard JavaScript.

### Value literals

Angular supports a subset of [literal values](https://developer.mozilla.org/en-US/docs/Glossary/Literal) from JavaScript.

#### Supported value literals

| Literal type           | Example values                  |
| ---------------------- | ------------------------------- |
| String                 | `'Hello'`, `"World"`            |
| Boolean                | `true`, `false`                 |
| Number                 | `123`, `3.14`                   |
| Object                 | `{name: 'Alice'}`               |
| Array                  | `['Onion', 'Cheese', 'Garlic']` |
| null                   | `null`                          |
| Template string        | `` `Hello ${name}` ``           |
| Tagged template string | `` tag`Hello ${name}` ``        |

#### Unsupported literals

| Literal type           | Example value            |
| ---------------------- | ------------------------ |
| RegExp                 | `/\d+/`                  |
| Tagged template string | `` tag`Hello ${name}` `` |

### Globals

Angular expressions support the following [globals](https://developer.mozilla.org/en-US/docs/Glossary/Global_object):

- [undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)
- [$any](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any)

No other JavaScript globals are supported. Common JavaScript globals include `Number`, `Boolean`, `NaN`, `Infinity`, `parseInt`, and more.

### Local variables

Angular automatically makes special local variables available for use in expressions in specific contexts. These special variables always start with the dollar sign character (`$`).

For example, `@for` blocks make several local variables corresponding to information about the loop, such as `$index`.

### What operators are supported?

#### Supported operators

Angular supports the following operators from standard JavaScript.

| Operator              | Example(s)                               |
| --------------------- | ---------------------------------------- |
| Add / Concatenate     | `1 + 2`                                  |
| Subtract              | `52 - 3`                                 |
| Multiply              | `41 * 6`                                 |
| Divide                | `20 / 4`                                 |
| Remainder (Modulo)    | `17 % 5`                                 |
| Exponentiation        | `10 ** 3`                                |
| Parenthesis           | `9 * (8 + 4)`                            |
| Conditional (Ternary) | `a > b ? true : false`                   |
| And (Logical)         | `&&`                                     |
| Or (Logical)          | `\|\|`                                   |
| Not (Logical)         | `!`                                      |
| Nullish Coalescing    | `possiblyNullValue ?? 'default'`         |
| Comparison Operators  | `<`, `<=`, `>`, `>=`, `==`, `===`, `!==` |
| Unary Negation        | `-x`                                     |
| Unary Plus            | `+y`                                     |
| Property Accessor     | `person['name']`                         |
| typeof                | `typeof 42`                              |
| void                  | `void 1`                                 |
| in                    | `'model' in car`                         |

Angular expressions additionally also support the following non-standard operators:

| Operator                        | Example(s)                     |
| ------------------------------- | ------------------------------ |
| [Pipe](/guide/templates/pipes) | `{{ total \| currency }}`      |
| Optional chaining\*             | `someObj.someProp?.nestedProp` |
| Non-null assertion (TypeScript) | `someObj!.someProp`            |

NOTE: Optional chaining behaves differently from the standard JavaScript version in that if the left side of Angular’s optional chaining operator is `null` or `undefined`, it returns `null` instead of `undefined`.

#### Unsupported operators

| Operator              | Example(s)                        |
| --------------------- | --------------------------------- |
| All bitwise operators | `&`, `&=`, `~`, `\|=`, `^=`, etc. |
| Assignment operators  | `=`                               |
| Object destructuring  | `const { name } = person`         |
| Array destructuring   | `const [firstItem] = items`       |
| Comma operator        | `x = (x++, x)`                    |
| in                    | `'model' in car`                  |
| typeof                | `typeof 42`                       |
| void                  | `void 1`                          |
| instanceof            | `car instanceof Automobile`       |
| new                   | `new Car()`                       |

### Lexical context for expressions

Angular expressions are evaluated within the context of the component class as well as any relevant [template variables](/guide/templates/variables), locals, and globals.

When referring to component class members, `this` is always implied. However, if a template declares a [template variables](guide/templates/variables) with the same name as a member, the variable shadows that member. You can unambiguously reference such a class member by explicitly using `this.`. This can be useful when creating an `@let` declaration that shadows a class member, e.g. for signal narrowing purposes.

### Declarations

Generally speaking, declarations are not supported in Angular expressions. This includes, but is not limited to:

| Declarations    | Example(s)                                  |
| --------------- | ------------------------------------------- |
| Variables       | `let label = 'abc'`, `const item = 'apple'` |
| Functions       | `function myCustomFunction() { }`           |
| Arrow Functions | `() => { }`                                 |
| Classes         | `class Rectangle { }`                       |

## Event listener statements

Event handlers are **statements** rather than expressions. While they support all of the same syntax as Angular expressions, the are two key differences:

1. Statements **do support** assignment operators (but not destructing assignments)
1. Statements **do not support** pipes

---


(From ng-container.md)

## Grouping elements with ng-container

`<ng-container>` is a special element in Angular that groups multiple elements together or marks a location in a template without rendering a real element in the DOM.

```angular-html
<!-- Component template -->
<section>
  <ng-container>
    <h3>User bio</h3>
    <p>Here's some info about the user</p>
  </ng-container>
</section>
```

```angular-html
<!-- Rendered DOM -->
<section>
  <h3>User bio</h3>
  <p>Here's some info about the user</p>
</section>
```

You can apply directives to `<ng-container>` to add behaviors or configuration to a part of your template.

Angular ignores all attribute bindings and event listeners applied to `<ng-container>`, including those applied via directive.

### Using `<ng-container>` to display dynamic contents

`<ng-container>` can act as a placeholder for rendering dynamic content.

#### Rendering components

You can use Angular's built-in `NgComponentOutlet` directive to dynamically render a component to the location of the `<ng-container>`.

```angular-ts
@Component({
  template: `
    <h2>Your profile</h2>
    <ng-container [ngComponentOutlet]="profileComponent()" />
  `
})
export class UserProfile {
  isAdmin = input(false);
  profileComponent = computed(() => this.isAdmin() ? AdminProfile : BasicUserProfile);
}
```

In the example above, the `NgComponentOutlet` directive dynamically renders either `AdminProfile` or `BasicUserProfile` in the location of the `<ng-container>` element.

#### Rendering template fragments

You can use Angular's built-in `NgTemplateOutlet` directive to dynamically render a template fragment to the location of the `<ng-container>`.

```angular-ts
@Component({
  template: `
    <h2>Your profile</h2>
    <ng-container [ngTemplateOutlet]="profileTemplate()" />

    <ng-template #admin>This is the admin profile</ng-template>
    <ng-template #basic>This is the basic profile</ng-template>
  `
})
export class UserProfile {
  isAdmin = input(false);
  adminTemplate = viewChild('admin', {read: TemplateRef});
  basicTemplate = viewChild('basic', {read: TemplateRef});
  profileTemplate = computed(() => this.isAdmin() ? this.adminTemplate() : this.basicTemplate());
}
```

In the example above, the `ngTemplateOutlet` directive dynamically renders one of two template fragments in the location of the `<ng-container>` element.

For more information regarding NgTemplateOutlet, see the [NgTemplateOutlets API documentation page](/api/common/NgTemplateOutlet).

### Using `<ng-container>` with structural directives

You can also apply structural directives to `<ng-container>` elements. Common examples of this include `ngIf`and `ngFor`.

```angular-html
<ng-container *ngIf="permissions == 'admin'">
  <h1>Admin Dashboard</h1>
  <admin-infographic></admin-infographic>
</ng-container>

<ng-container *ngFor="let item of items; index as i; trackBy: trackByFn">
  <h2>{{ item.title }}</h2>
  <p>{{ item.description }}</p>
</ng-container>
```

### Using `<ng-container>` for injection

See the Dependency Injection guide for more information on Angular's dependency injection system.

When you apply a directive to `<ng-container>`, descendant elements can inject the directive or anything that the directive provides. Use this when you want to declaratively provide a value to a specific part of your template.

```angular-ts
@Directive({
  selector: '[theme]',
})
export class Theme {
  // Create an input that accepts 'light' or 'dark`, defaulting to 'light'.
  mode = input<'light' | 'dark'>('light');
}
```

```angular-html
<ng-container theme="dark">
  <profile-pic />
  <user-bio />
</ng-container>
```

In the example above, the `ProfilePic` and `UserBio` components can inject the `Theme` directive and apply styles based on its `mode`.

---


(From ng-content.md)

## Render templates from a parent component with `ng-content`

`<ng-content>` is a special element that accepts markup or a template fragment and controls how components render content. It does not render a real DOM element.

Here is an example of a `BaseButton` component that accepts any markup from its parent.

```angular-ts
// ./base-button/base-button.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'button[baseButton]',
  template: `
      <ng-content />
  `,
})
export class BaseButton {}
```

```angular-ts
// ./app.component.ts
import { Component } from '@angular/core';
import { BaseButton } from './base-button/base-button.component.ts';

@Component({
  selector: 'app-root',
  imports: [BaseButton],
  template: `
    <button baseButton>
      Next <span class="icon arrow-right" />
    </button>
  `,
})
export class AppComponent {}
```

For more detail, check out the [`<ng-content>` in-depth guide](/guide/components/content-projection) for other ways you can leverage this pattern.

---


(From ng-template.md)

## Create template fragments with ng-template

Inspired by the [native `<template>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template), the `<ng-template>` element lets you declare a **template fragment** – a section of content that you can dynamically or programmatically render.

### Creating a template fragment

You can create a template fragment inside of any component template with the `<ng-template>` element:

```angular-html
<p>This is a normal element</p>

<ng-template>
  <p>This is a template fragment</p>
</ng-template>
```

When the above is rendered, the content of the `<ng-template>` element is not rendered on the page. Instead, you can get a reference to the template fragment and write code to dynamically render it.

#### Binding context for fragments

Template fragments may contain bindings with dynamic expressions:

```angular-ts
@Component({
  /* ... */,
  template: `<ng-template>You've selected {{count}} items.</ng-template>`,
})
export class ItemCounter {
  count: number = 0;
}
```

Expressions or statements in a template fragment are evaluated against the component in which the fragment is declared, regardless of where the fragment is rendered.

### Getting a reference to a template fragment

You can get a reference to a template fragment in one of three ways:

- By declaring a [template reference variable](/guide/templates/variables#template-reference-variables) on the `<ng-template>` element
- By querying for the fragment with [a component or directive query](/guide/components/queries)
- By injecting the fragment in a directive that's applied directly to an `<ng-template>` element.

In all three cases, the fragment is represented by a [TemplateRef](/api/core/TemplateRef) object.

#### Referencing a template fragment with a template reference variable

You can add a template reference variable to an `<ng-template>` element to reference that template fragment in other parts of the same template file:

```angular-html
<p>This is a normal element</p>

<ng-template #myFragment>
  <p>This is a template fragment</p>
</ng-template>
```

You can then reference this fragment anywhere else in the template via the `myFragment` variable.

#### Referencing a template fragment with queries

You can get a reference to a template fragment using any [component or directive query API](/guide/components/queries).

For example, if your template has exactly one template fragment, you can query directly for the `TemplateRef` object with a `@ViewChild` query:

```angular-ts
@Component({
  /* ... */,
  template: `
    <p>This is a normal element</p>

    <ng-template>
      <p>This is a template fragment</p>
    </ng-template>
  `,
})
export class ComponentWithFragment {
  @ViewChild(TemplateRef) myFragment: TemplateRef<unknown> | undefined;
}
```

You can then reference this fragment in your component code or the component's template like any other class member.

If a template contains multiple fragments, you can assign a name to each fragment by adding a template reference variable to each `<ng-template>` element and querying for the fragments based on that name:

```angular-ts
@Component({
  /* ... */,
  template: `
    <p>This is a normal element</p>

    <ng-template #fragmentOne>
      <p>This is one template fragment</p>
    </ng-template>

    <ng-template #fragmentTwo>
      <p>This is another template fragment</p>
    </ng-template>
  `,
})
export class ComponentWithFragment {
  // When querying by name, you can use the `read` option to specify that you want to get the
  // TemplateRef object associated with the element.
  @ViewChild('fragmentOne', {read: TemplateRef}) fragmentOne: TemplateRef<unknown> | undefined;
  @ViewChild('fragmentTwo', {read: TemplateRef}) fragmentTwo: TemplateRef<unknown> | undefined;
}
```

Again, you can then reference these fragments in your component code or the component's template like any other class members.

#### Injecting a template fragment

A directive can inject a `TemplateRef` if that directive is applied directly to an `<ng-template>` element:

```angular-ts
@Directive({
  selector: '[myDirective]'
})
export class MyDirective {
  private fragment = inject(TemplateRef);
}
```

```angular-html
<ng-template myDirective>
  <p>This is one template fragment</p>
</ng-template>
```

You can then reference this fragment in your directive code like any other class member.

### Rendering a template fragment

Once you have a reference to a template fragment's `TemplateRef` object, you can render a fragment in one of two ways: in your template with the `NgTemplateOutlet` directive or in your TypeScript code with `ViewContainerRef`.

#### Using `NgTemplateOutlet`

The `NgTemplateOutlet` directive from `@angular/common` accepts a `TemplateRef` and renders the fragment as a **sibling** to the element with the outlet. You should generally use `NgTemplateOutlet` on an [`<ng-container>` element](/guide/templates/ng-container).

First, import `NgTemplateOutlet`:
```typescript
import { NgTemplateOutlet } from '@angular/common';
```

The following example declares a template fragment and renders that fragment to a `<ng-container>` element with `NgTemplateOutlet`:

```angular-html
<p>This is a normal element</p>

<ng-template #myFragment>
  <p>This is a fragment</p>
</ng-template>

<ng-container *ngTemplateOutlet="myFragment"></ng-container>
```

This example produces the following rendered DOM:

```angular-html
<p>This is a normal element</p>
<p>This is a fragment</p>
```

#### Using `ViewContainerRef`

A **view container** is a node in Angular's component tree that can contain content. Any component or directive can inject `ViewContainerRef` to get a reference to a view container corresponding to that component or directive's location in the DOM.

You can use the `createEmbeddedView` method on `ViewContainerRef` to dynamically render a template fragment. When you render a fragment with a `ViewContainerRef`, Angular appends it into the DOM as the next sibling of the component or directive that injected the `ViewContainerRef`.

The following example shows a component that accepts a reference to a template fragment as an input and renders that fragment into the DOM on a button click.

```angular-ts
@Component({
  /* ... */,
  selector: 'component-with-fragment',
  template: `
    <h2>Component with a fragment</h2>
    <ng-template #myFragment>
      <p>This is the fragment</p>
    </ng-template>
    <my-outlet [fragment]="myFragment" />
  `,
})
export class ComponentWithFragment { }

@Component({
  /* ... */,
  selector: 'my-outlet',
  template: `<button (click)="showFragment()">Show</button>`,
})
export class MyOutlet {
  private viewContainer = inject(ViewContainerRef);
  @Input() fragment: TemplateRef<unknown> | undefined;

  showFragment() {
    if (this.fragment) {
      this.viewContainer.createEmbeddedView(this.fragment);
    }
  }
}
```

In the example above, clicking the "Show" button results in the following output:

```angular-html
<component-with-fragment>
  <h2>Component with a fragment>
  <my-outlet>
    <button>Show</button>
  </my-outlet>
  <p>This is the fragment</p>
</component-with-fragment>
```

### Passing parameters when rendering a template fragment

When declaring a template fragment with `<ng-template>`, you can additionally declare parameters accepted by the fragment. When you render a fragment, you can optionally pass a `context` object corresponding to these parameters. You can use data from this context object in binding expressions and statements, in addition to referencing data from the component in which the fragment is declared.

Each parameter is written as an attribute prefixed with `let-` with a value matching a property name in the context object:

```angular-html
<ng-template let-pizzaTopping="topping">
  <p>You selected: {{pizzaTopping}}</p>
</ng-template>
```

#### Using `NgTemplateOutlet`

You can bind a context object to the `ngTemplateOutletContext` input:

```angular-html
<ng-template #myFragment let-pizzaTopping="topping">
  <p>You selected: {{pizzaTopping}}</p>
</ng-template>

<ng-container
  [ngTemplateOutlet]="myFragment"
  [ngTemplateOutletContext]="{topping: 'onion'}"
/>
```

#### Using `ViewContainerRef`

You can pass a context object as the second argument to `createEmbeddedView`:

```angular-ts
this.viewContainer.createEmbeddedView(this.myFragment, {topping: 'onion'});
```

### Structural directives

A **structural directive** is any directive that:

- Injects `TemplateRef`
- Injects `ViewContainerRef` and programmatically renders the injected `TemplateRef`

Angular supports a special convenience syntax for structural directives. If you apply the directive to an element and prefix the directive's selector with an asterisk (`*`) character, Angular interprets the entire element and all of its content as a template fragment:

```angular-html
<section *myDirective>
  <p>This is a fragment</p>
</section>
```

This is equivalent to:

```angular-html
<ng-template myDirective>
  <section>
    <p>This is a fragment</p>
  </section>
</ng-template>
```

Developers typically use structural directives to conditionally render fragments or render fragments multiple times.

For more details, see [Structural Directives](/guide/directives/structural-directives).

### Additional resources

For examples of how `ng-template` is used in other libraries, check out:

- [Tabs from Angular Material](https://material.angular.dev/components/tabs/overview) - nothing gets rendered into the DOM until the tab is activated
- [Table from Angular Material](https://material.angular.dev/components/table/overview) - allows developers to define different ways to render data

---


(From overview.md)

<docs-decorative-header title="Template syntax" imgSrc="adev/src/assets/images/templates.svg"> <!-- markdownlint-disable-line -->
In Angular, a template is a chunk of HTML.
Use special syntax within a template to leverage many of Angular's features.
</docs-decorative-header>

TIP: Check out Angular's [Essentials](essentials/templates) before diving into this comprehensive guide.

Every Angular component has a **template** that defines the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) that the component renders onto the page. By using templates, Angular is able to automatically keep your page up-to-date as data changes.

Templates are usually found within either the `template` property of a `*.component.ts` file or the `*.component.html` file. To learn more, check out the [in-depth components guide](/guide/components).

### How do templates work?

Templates are based on [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) syntax, with additional features such as built-in template functions, data binding, event listening, variables, and more.

Angular compiles templates into JavaScript in order to build up an internal understanding of your application. One of the benefits of this are built-in rendering optimizations that Angular applies to your application automatically.

#### Differences from standard HTML

Some differences between templates and standard HTML syntax include:

- Comments in the template source code are not included in the rendered output
- Component and directive elements can be self-closed (e.g., `<UserProfile />`)
- Attributes with certain characters (i.e., `[]`, `()`, etc.) have special meaning to Angular. See [binding docs](guide/templates/binding) and [adding event listeners docs](guide/templates/event-listeners) for more information.
- The `@` character has a special meaning to Angular for adding dynamic behavior, such as [control flow](guide/templates/control-flow), to templates. You can include a literal `@` character by escaping it as an HTML entity code (`&commat;` or `&#64;`).
- Angular ignores and collapses unnecessary whitespace characters. See [whitespace in templates](guide/templates/whitespace) for more details.
- Angular may add comment nodes to a page as placeholders for dynamic content, but developers can ignore these.

In addition, while most HTML syntax is valid template syntax, Angular does not support `<script>` element in templates. For more information, see the [Security](best-practices/security) page.

### What's next?

You might also be interested in the following:

| Topics                                                                      | Details                                                                                 |
| :-------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| [Binding dynamic text, properties, and attributes](guide/templates/binding) | Bind dynamic data to text, properties and attributes.                                   |
| [Adding event listeners](guide/templates/event-listeners)                   | Respond to events in your templates.                                                    |
| [Two-way binding](guide/templates/two-way-binding)                          | Simultaneously binds a value and propagate changes.                                     |
| [Control flow](guide/templates/control-flow)                                | Conditionally show, hide and repeat elements.                                           |
| [Pipes](guide/templates/pipes)                                              | Transform data declaratively.                                                           |
| [Slotting child content with ng-content](guide/templates/ng-content)        | Control how components render content.                                                  |
| [Create template fragments with ng-template](guide/templates/ng-template)   | Declare a template fragment.                                                            |
| [Grouping elements with ng-container](guide/templates/ng-container)         | Group multiple elements together or mark a location for rendering.                      |
| [Variables in templates](guide/templates/variables)                         | Learn about variable declarations.                                                      |
| [Deferred loading with @defer](guide/templates/defer)                       | Create deferrable views with `@defer`.                                                  |
| [Expression syntax](guide/templates/expression-syntax)                      | Learn similarities and differences between Angular expressions and standard JavaScript. |
| [Whitespace in templates](guide/templates/whitespace)                       | Learn how Angular handles whitespace.                                                   |

---


(From pipes.md)

## Pipes

### Overview

Pipes are a special operator in Angular template expressions that allows you to transform data declaratively in your template. Pipes let you declare a transformation function once and then use that transformation across multiple templates. Angular pipes use the vertical bar character (`|`), inspired by the [Unix pipe](<https://en.wikipedia.org/wiki/Pipeline_(Unix)>).

NOTE: Angular's pipe syntax deviates from standard JavaScript, which uses the vertical bar character for the [bitwise OR operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_OR). Angular template expressions do not support bitwise operators.

Here is an example using some built-in pipes that Angular provides:

```angular-ts
import { Component } from '@angular/core';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CurrencyPipe, DatePipe, TitleCasePipe],
  template: `
    <main>
       <!-- Transform the company name to title-case and
       transform the purchasedOn date to a locale-formatted string -->
<h1>Purchases from {{ company | titlecase }} on {{ purchasedOn | date }}</h1>

	    <!-- Transform the amount to a currency-formatted string -->
      <p>Total: {{ amount | currency }}</p>
    </main>
  `,
})
export class ShoppingCartComponent {
  amount = 123.45;
  company = 'acme corporation';
  purchasedOn = '2024-07-08';
}
```

When Angular renders the component, it will ensure that the appropriate date format and currency is based on the locale of the user. If the user is in the United States, it would render:

```angular-html
<main>
  <h1>Purchases from Acme Corporation on Jul 8, 2024</h1>
  <p>Total: $123.45</p>
</main>
```

See the [in-depth guide on i18n](/guide/i18n) to learn more about how Angular localizes values.

#### Built-in Pipes

Angular includes a set of built-in pipes in the `@angular/common` package:

| Name                                          | Description                                                                                   |
| --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [`AsyncPipe`](api/common/AsyncPipe)           | Read the value from a `Promise` or an RxJS `Observable`.                                      |
| [`CurrencyPipe`](api/common/CurrencyPipe)     | Transforms a number to a currency string, formatted according to locale rules.                |
| [`DatePipe`](api/common/DatePipe)             | Formats a `Date` value according to locale rules.                                             |
| [`DecimalPipe`](api/common/DecimalPipe)       | Transforms a number into a string with a decimal point, formatted according to locale rules.  |
| [`I18nPluralPipe`](api/common/I18nPluralPipe) | Maps a value to a string that pluralizes the value according to locale rules.                 |
| [`I18nSelectPipe`](api/common/I18nSelectPipe) | Maps a key to a custom selector that returns a desired value.                                 |
| [`JsonPipe`](api/common/JsonPipe)             | Transforms an object to a string representation via `JSON.stringify`, intended for debugging. |
| [`KeyValuePipe`](api/common/KeyValuePipe)     | Transforms Object or Map into an array of key value pairs.                                    |
| [`LowerCasePipe`](api/common/LowerCasePipe)   | Transforms text to all lower case.                                                            |
| [`PercentPipe`](api/common/PercentPipe)       | Transforms a number to a percentage string, formatted according to locale rules.              |
| [`SlicePipe`](api/common/SlicePipe)           | Creates a new Array or String containing a subset (slice) of the elements.                    |
| [`TitleCasePipe`](api/common/TitleCasePipe)   | Transforms text to title case.                                                                |
| [`UpperCasePipe`](api/common/UpperCasePipe)   | Transforms text to all upper case.                                                            |

### Using pipes

Angular's pipe operator uses the vertical bar character (`|`), within a template expression. The pipe operator is a binary operator– the left-hand operand is the value passed to the transformation function, and the right side operand is the name of the pipe and any additional arguments (described below).

```angular-html
<p>Total: {{ amount | currency }}</p>
```

In this example, the value of `amount` is passed into the `CurrencyPipe` where the pipe name is `currency`. It then renders the default currency for the user’s locale.

#### Combining multiple pipes in the same expression

You can apply multiple transformations to a value by using multiple pipe operators. Angular runs the pipes from left to right.

The following example demonstrates a combination of pipes to display a localized date in all uppercase:

```angular-html
<p>The event will occur on {{ scheduledOn | date | uppercase }}.</p>
```

#### Passing parameters to pipes

Some pipes accept parameters to configure the transformation. To specify a parameter, append the pipe name with a colon (`:`) followed by the parameter value.

For example, the `DatePipe` is able to take parameters to format the date in a specific way.

```angular-html
<p>The event will occur at {{ scheduledOn | date:'hh:mm' }}.</p>
```

Some pipes may accept multiple parameters. You can specify additional parameter values separated by the colon character (`:`).

For example, we can also pass a second optional parameter to control the timezone.

```angular-html
<p>The event will occur at {{ scheduledOn | date:'hh:mm':'UTC' }}.</p>
```

### How pipes work

Conceptually, pipes are functions that accept an input value and return a transformed value.

```angular-ts
import { Component } from '@angular/core';
import { CurrencyPipe} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CurrencyPipe],
  template: `
    <main>
      <p>Total: {{ amount | currency }}</p>
    </main>
  `,
})
export class AppComponent {
  amount = 123.45;
}
```

In this example:

1. `CurrencyPipe` is imported from `@angular/common`
1. `CurrencyPipe` is added to the `imports` array
1. The `amount` data is passed to the `currency` pipe

#### Pipe operator precedence

The pipe operator has lower precedence than other binary operators, including `+`, `-`, `*`, `/`, `%`, `&&`, `||`, and `??`.

```angular-html
<!-- firstName and lastName are concatenated before the result is passed to the uppercase pipe -->
{{ firstName + lastName | uppercase }}
```

The pipe operator has higher precedence than the conditional (ternary) operator.

```angular-html
{{ (isAdmin ? 'Access granted' : 'Access denied') | uppercase }}
```

If the same expression were written without parentheses:

```angular-html
{{ isAdmin ? 'Access granted' : 'Access denied' | uppercase }}
```

It will be parsed instead as:

```angular-html
{{ isAdmin ? 'Access granted' : ('Access denied' | uppercase) }}
```

Always use parentheses in your expressions when operator precedence may be ambiguous.

#### Change detection with pipes

By default, all pipes are considered `pure`, which means that it only executes when a primitive input value (such as a `String`, `Number`, `Boolean`, or `Symbol`) or a object reference (such as `Array`, `Object`, `Function`, or `Date`) is changed. Pure pipes offer a performance advantage because Angular can avoid calling the transformation function if the passed value has not changed.

As a result, this means that mutations to object properties or array items are not detected unless the entire object or array reference is replaced with a different instance. If you want this level of change detection, refer to [detecting changes within arrays or objects](#detecting-change-within-arrays-or-objects).

### Creating custom pipes

You can define a custom pipe by implementing a TypeScript class with the `@Pipe` decorator. A pipe must have two things:

- A name, specified in the pipe decorator
- A method named `transform` that performs the value transformation.

The TypeScript class should additionally implement the `PipeTransform` interface to ensure that it satisfies the type signature for a pipe.

Here is an example of a custom pipe that transforms strings to kebab case:

```angular-ts
// kebab-case.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'kebabCase',
})
export class KebabCasePipe implements PipeTransform {
  transform(value: string): string {
    return value.toLowerCase().replace(/ /g, '-');
  }
}
```

#### Using the `@Pipe` decorator

When creating a custom pipe, import `Pipe` from the `@angular/core` package and use it as a decorator for the TypeScript class.

```angular-ts
import { Pipe } from '@angular/core';

@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe {}
```

The `@Pipe` decorator requires a `name` that controls how the pipe is used in a template.

#### Naming convention for custom pipes

The naming convention for custom pipes consists of two conventions:

- `name` - camelCase is recommended. Do not use hyphens.
- `class name` - PascalCase version of the `name` with `Pipe` appended to the end

#### Implement the `PipeTransform` interface

In addition to the `@Pipe` decorator, custom pipes should always implement the `PipeTransform` interface from `@angular/core`.

```angular-ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe implements PipeTransform {}
```

Implementing this interface ensures that your pipe class has the correct structure.

#### Transforming the value of a pipe

Every transformation is invoked by the `transform` method with the first parameter being the value being passed in and the return value being the transformed value.

```angular-ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe implements PipeTransform {
  transform(value: string): string {
    return `My custom transformation of ${value}.`
  }
}
```

#### Adding parameters to a custom pipe

You can add parameters to your transformation by adding additional parameters to the `transform` method:

```angular-ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myCustomTransformation',
})
export class MyCustomTransformationPipe implements PipeTransform {
  transform(value: string, format: string): string {
    let msg = `My custom transformation of ${value}.`

    if (format === 'uppercase') {
      return msg.toUpperCase()
    } else {
      return msg
    }
  }
}
```

#### Detecting change within arrays or objects

When you want a pipe to detect changes within arrays or objects, it must be marked as an impure function by passing the `pure` flag with a value of `false`.

Avoid creating impure pipes unless absolutely necessary, as they can incur a significant performance penalty if used without care.

```angular-ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'joinNamesImpure',
  pure: false,
})
export class JoinNamesImpurePipe implements PipeTransform {
  transform(names: string[]): string {
    return names.join();
  }
}
```

Angular developers often adopt the convention of including `Impure` in the pipe `name` and class name to indicate the potential performance pitfall to other developers.

---


(From two-way-binding.md)

## Two-way binding

**Two way binding** is a shorthand to simultaneously bind a value into an element, while also giving that element the ability to propagate changes back through this binding.

### Syntax

The syntax for two-way binding is a combination of square brackets and parentheses, `[()]`. It combines the syntax from property binding, `[]`, and the syntax from event binding, `()`. The Angular community informally refers to this syntax as "banana-in-a-box".

### Two-way binding with form controls

Developers commonly use two-way binding to keep component data in sync with a form control as a user interacts with the control. For example, when a user fills out a text input, it should update the state in the component.

The following example dynamically updates the `firstName` attribute on the page:

```angular-ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  template: `
    <main>
      <h2>Hello {{ firstName }}!</h2>
      <input type="text" [(ngModel)]="firstName" />
    </main>
  `
})
export class AppComponent {
  firstName = 'Ada';
}
```

To use two-way binding with native form controls, you need to:

1. Import the `FormsModule` from `@angular/forms`
1. Use the `ngModel` directive with the two-way binding syntax (e.g., `[(ngModel)]`)
1. Assign it the state that you want it to update (e.g., `firstName`)

Once that is set up, Angular will ensure that any updates in the text input will reflect correctly inside of the component state!

Learn more about [`NgModel`](guide/directives#displaying-and-updating-properties-with-ngmodel) in the official docs.

### Two-way binding between components

Leveraging two-way binding between a parent and child component requires more configuration compared to form elements.

Here is an example where the `AppComponent` is responsible for setting the initial count state, but the logic for updating and rendering the UI for the counter primarily resides inside its child `CounterComponent`.

```angular-ts
// ./app.component.ts
import { Component } from '@angular/core';
import { CounterComponent } from './counter/counter.component';

@Component({
  selector: 'app-root',
  imports: [CounterComponent],
  template: `
    <main>
      <h1>Counter: {{ initialCount }}</h1>
      <app-counter [(count)]="initialCount"></app-counter>
    </main>
  `,
})
export class AppComponent {
  initialCount = 18;
}
```

```angular-ts
// './counter/counter.component.ts';
import { Component, model } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <button (click)="updateCount(-1)">-</button>
    <span>{{ count() }}</span>
    <button (click)="updateCount(+1)">+</button>
  `,
})
export class CounterComponent {
  count = model<number>(0);

  updateCount(amount: number): void {
    this.count.update(currentCount => currentCount + amount);
  }
}
```

#### Enabling two-way binding between components

If we break down the example above to its core, each two-way binding for components requires the following:

The child component must contain a `model` property.

Here is a simplified example:

```angular-ts
// './counter/counter.component.ts';
import { Component, model } from '@angular/core';

@Component({ // Omitted for brevity })
export class CounterComponent {
  count = model<number>(0);

  updateCount(amount: number): void {
    this.count.update(currentCount => currentCount + amount);
  }
}
```

The parent component must:

1. Wrap the `model` property name in the two-way binding syntax.
1. Assign a property or a signal to the `model` property.

Here is a simplified example:

```angular-ts
// ./app.component.ts
import { Component } from '@angular/core';
import { CounterComponent } from './counter/counter.component';

@Component({
  selector: 'app-root',
  imports: [CounterComponent],
  template: `
    <main>
      <app-counter [(count)]="initialCount"></app-counter>
    </main>
  `,
})
export class AppComponent {
  initialCount = 18;
}
```

---


(From variables.md)

## Variables in templates

Angular has two types of variable declarations in templates: local template variables and template reference variables.

### Local template variables with `@let`

Angular's `@let` syntax allows you to define a local variable and re-use it across a template, similar to the [JavaScript `let` syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let).

#### Using `@let`

Use `@let` to declare a variable whose value is based on the result of a template expression. Angular automatically keeps the variable's value up-to-date with the given expression, similar to [bindings](./templates/bindings).

```angular-html
@let name = user.name;
@let greeting = 'Hello, ' + name;
@let data = data$ | async;
@let pi = 3.1459;
@let coordinates = {x: 50, y: 100};
@let longExpression = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit ' +
                      'sed do eiusmod tempor incididunt ut labore et dolore magna ' +
                      'Ut enim ad minim veniam...';
```

Each `@let` block can declare exactly one variable. You cannot declare multiple variables in the same block with a comma.

#### Referencing the value of `@let`

Once you've declared a variable with `@let`, you can reuse it in the same template:

```angular-html
@let user = user$ | async;

@if (user) {
  <h1>Hello, {{user.name}}</h1>
  <user-avatar [photo]="user.photo"/>

  <ul>
    @for (snack of user.favoriteSnacks; track snack.id) {
      <li>{{snack.name}}</li>
    }
  </ul>

  <button (click)="update(user)">Update profile</button>
}
```

#### Assignability

A key difference between `@let` and JavaScript's `let` is that `@let` cannot be reassigned after declaration. However, Angular automatically keeps the variable's value up-to-date with the given expression.

```angular-html
@let value = 1;

<!-- Invalid - This does not work! -->
<button (click)="value = value + 1">Increment the value</button>
```

#### Variable scope

`@let` declarations are scoped to the current view and its descendants. Angular creates a new view at component boundaries and wherever a template might contain dynamic content, such as control flow blocks, `@defer` blocks, or structural directives.

Since `@let` declarations are not hoisted, they **cannot** be accessed by parent views or siblings:

```angular-html
@let topLevel = value;

<div>
  @let insideDiv = value;
</div>

{{topLevel}} <!-- Valid -->
{{insideDiv}} <!-- Valid -->

@if (condition) {
  {{topLevel + insideDiv}} <!-- Valid -->

  @let nested = value;

  @if (condition) {
    {{topLevel + insideDiv + nested}} <!-- Valid -->
  }
}

<div *ngIf="condition">
  {{topLevel + insideDiv}} <!-- Valid -->

  @let nestedNgIf = value;

  <div *ngIf="condition">
     {{topLevel + insideDiv + nestedNgIf}} <!-- Valid -->
  </div>
</div>

{{nested}} <!-- Error, not hoisted from @if -->
{{nestedNgIf}} <!-- Error, not hoisted from *ngIf -->
```

#### Full syntax

The `@let` syntax is formally defined as:

- The `@let` keyword.
- Followed by one or more whitespaces, not including new lines.
- Followed by a valid JavaScript name and zero or more whitespaces.
- Followed by the = symbol and zero or more whitespaces.
- Followed by an Angular expression which can be multi-line.
- Terminated by the `;` symbol.

### Template reference variables

Template reference variables give you a way to declare a variable that references a value from an element in your template.

A template reference variable can refer to the following:

- a DOM element within a template (including [custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements))
- an Angular component or directive
- a [TemplateRef](/api/core/TemplateRef) from an [ng-template](/api/core/ng-template)

You can use template reference variables to read information from one part of the template in another part of the same template.

#### Declaring a template reference variable

You can declare a variable on an element in a template by adding an attribute that starts with the hash character (`#`) followed by the variable name.

```angular-html
<!-- Create a template reference variable named "taskInput", referring to the HTMLInputElement. -->
<input #taskInput placeholder="Enter task name">
```

#### Assigning values to template reference variables

Angular assigns a value to template variables based on the element on which the variable is declared.

If you declare the variable on a Angular component, the variable refers to the component instance.

```angular-html
<!-- The `startDate` variable is assigned the instance of `MyDatepicker`. -->
<my-datepicker #startDate />
```

If you declare the variable on an `<ng-template>` element, the variable refers to a TemplateRef instance which represents the template. For more information, see [How Angular uses the asterisk, \*, syntax](/guide/directives/structural-directives#structural-directive-shorthand) in [Structural directives](/guide/directives/structural-directives).

```angular-html
<!-- The `myFragment` variable is assigned the `TemplateRef` instance corresponding to this template fragment. -->
<ng-template #myFragment>
  <p>This is a template fragment</p>
</ng-template>
```

If you declare the variable on any other displayed element, the variable refers to the `HTMLElement` instance.

```angular-html
<!-- The "taskInput" variable refers to the HTMLInputElement instance. -->
<input #taskInput placeholder="Enter task name">
```

##### Assigning a reference to an Angular directive

Angular directives may have an `exportAs` property that defines a name by which the directive can be referenced in a template:

```angular-ts
@Directive({
  selector: '[dropZone]',
  exportAs: 'dropZone',
})
export class DropZone { /* ... */ }
```

When you declare a template variable on an element, you can assign that variable a directive instance by specifying this `exportAs` name:

```angular-html
<!-- The `firstZone` variable refers to the `DropZone` directive instance. -->
<section dropZone #firstZone="dropZone"> ... </section>
```

You cannot refer to a directive that does not specify an `exportAs` name.

#### Using template reference variables with queries

In addition to using template variables to read values from another part of the same template, you can also use this style of variable declaration to "mark" an element for [component and directive queries](/guide/components/queries).

When you want to query for a specific element in a template, you can declare a template variable on that element and then query for the element based on the variable name.

```angular-html
 <input #description value="Original description">
```

```angular-ts
@Component({
  /* ... */,
  template: `<input #description value="Original description">`,
})
export class AppComponent {
  // Query for the input element based on the template variable name.
  @ViewChild('description') input: ElementRef | undefined;
}
```

See [Referencing children with queries](/guide/components/queries) for more information on queries.

---


(From whitespace.md)

## Whitespace in templates

By default, Angular templates do not preserve whitespace that the framework considers unnecessary. This commonly occurs in two situations: whitespace between elements, and collapsible whitespace inside of text.

### Whitespace between elements

Most developers prefer to format their templates with newlines and indentation to make the template readable:

```angular-html
<section>
  <h3>User profile</p>
  <label>
    User name
    <input>
  </label>
</section>
```

This template contains whitespace between all of the elements. The following snippet shows the same HTML with each whitespace character replaced with the hash (`#`) character to highlight how much whitespace is present:

```angular-html
<!-- Total Whitespace: 20 -->
<section>###<h3>User profile</p>###<label>#####User name#####<input>###</label>#</section>
```

Preserving the whitespace as written in the template would result in many unnecessary [text nodes](https://developer.mozilla.org/en-US/docs/Web/API/Text) and increase page rendering overhead. By ignoring this whitespace between elements, Angular performs less work when rendering the template on the page, improving overall performance.

### Collapsible whitespace inside text

When your web browser renders HTML on a page, it collapses multiple consecutive whitespace characters to a single character:

```angular-html
<!-- What it looks like in the template -->
<p>Hello         world</p>
```

In this example, the browser displays only a single space between "Hello" and "world".

```angular-html
<!-- What shows up in the browser -->
<p>Hello world</p>
```

See [How whitespace is handled by HTML, CSS, and in the DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace) for more context on how this works.

Angular avoids sending these unnecessary whitespace characters to the browser in the first place by collapsing them to a single character when it compiles the template.

### Preserving whitespace

You can tell Angular to preserve whitespace in a template by specifying `preserveWhitespaces: true` in the `@Component` decorator for a template.

```angular-ts
@Component({
  /* ... */,
  preserveWhitespaces: true,
  template: `
    <p>Hello         world</p>
  `
})
```

Avoid setting this option unless absolutely necessary. Preserving whitespace can cause Angular to produce significantly more nodes while rendering, slowing down your application.

You can additionally use a special HTML entity unique to Angular, `&ngsp;`. This entity produces a single space character that's preserved in the compiled output.

---