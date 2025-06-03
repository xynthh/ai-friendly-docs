# Guide Animations

(From complex-sequences.md)

## Complex animation sequences

IMPORTANT: The Angular team recommends using native CSS for animations instead of the Animations package for all new code. Use this guide to understand existing code built with the Animations Package. See [Migrating away from Angular's Animations package](guide/animations/migration#complex-sequences) to learn how you can start using pure CSS animations in your apps.

So far, we've learned simple animations of single HTML elements.
Angular also lets you animate coordinated sequences, such as an entire grid or list of elements as they enter and leave a page.
You can choose to run multiple animations in parallel, or run discrete animations sequentially, one following another.

The functions that control complex animation sequences are:

| Functions                         | Details |
|:---                               |:---     |
| `query()`                         | Finds one or more inner HTML elements. |
| `stagger()`                       | Applies a cascading delay to animations for multiple elements. |
| [`group()`](api/animations/group) | Runs multiple animation steps in parallel. |
| `sequence()`                      | Runs animation steps one after another. |

### The query() function

Most complex animations rely on the `query()` function to find child elements and apply animations to them, basic examples of such are:

| Examples                               | Details |
|:---                                    |:---     |
| `query()` followed by `animate()`      | Used to query simple HTML elements and directly apply animations to them.                                                                                                                            |
| `query()` followed by `animateChild()` | Used to query child elements, which themselves have animations metadata applied to them and trigger such animation \(which would be otherwise be blocked by the current/parent element's animation\). |

The first argument of `query()` is a [css selector](https://developer.mozilla.org/docs/Web/CSS/CSS_Selectors) string which can also contain the following Angular-specific tokens:

| Tokens                     | Details |
|:---                        |:---     |
| `:enter` <br /> `:leave`   | For entering/leaving elements.               |
| `:animating`               | For elements currently animating.            |
| `@*` <br /> `@triggerName` | For elements with any—or a specific—trigger. |
| `:self`                    | The animating element itself.                |

<docs-callout title="Entering and Leaving Elements">

Not all child elements are actually considered as entering/leaving; this can, at times, be counterintuitive and confusing. Please see the [query api docs](api/animations/query#entering-and-leaving-elements) for more information.

You can also see an illustration of this in the animations example \(introduced in the animations [introduction section](guide/animations#about-this-guide)\) under the Querying tab.

</docs-callout>

### Animate multiple elements using query() and stagger() functions

After having queried child elements via `query()`, the `stagger()` function lets you define a timing gap between each queried item that is animated and thus animates elements with a delay between them.

The following example demonstrates how to use the `query()` and `stagger()` functions to animate a list \(of heroes\) adding each in sequence, with a slight delay, from top to bottom.

* Use `query()` to look for an element entering the page that meets certain criteria
* For each of these elements, use `style()` to set the same initial style for the element.
    Make it transparent and use `transform` to move it out of position so that it can slide into place.

* Use `stagger()` to delay each animation by 30 milliseconds
* Animate each element on screen for 0.5 seconds using a custom-defined easing curve, simultaneously fading it in and un-transforming it

<docs-code header="src/app/hero-list-page.component.ts" path="adev/src/content/examples/animations/src/app/hero-list-page.component.ts" visibleRegion="page-animations"/>

### Parallel animation using group() function

You've seen how to add a delay between each successive animation.
But you might also want to configure animations that happen in parallel.
For example, you might want to animate two CSS properties of the same element but use a different `easing` function for each one.
For this, you can use the animation [`group()`](api/animations/group) function.

HELPFUL: The [`group()`](api/animations/group) function is used to group animation *steps*, rather than animated elements.

The following example uses [`group()`](api/animations/group)s on both `:enter` and `:leave` for two different timing configurations, thus applying two independent animations to the same element in parallel.

<docs-code header="src/app/hero-list-groups.component.ts (excerpt)" path="adev/src/content/examples/animations/src/app/hero-list-groups.component.ts" visibleRegion="animationdef"/>

### Sequential vs. parallel animations

Complex animations can have many things happening at once.
But what if you want to create an animation involving several animations happening one after the other? Earlier you used [`group()`](api/animations/group) to run multiple animations all at the same time, in parallel.

A second function called `sequence()` lets you run those same animations one after the other.
Within `sequence()`, the animation steps consist of either `style()` or `animate()` function calls.

* Use `style()` to apply the provided styling data immediately.
* Use `animate()` to apply styling data over a given time interval.

### Filter animation example

Take a look at another animation on the example page.
Under the Filter/Stagger tab, enter some text into the **Search Heroes** text box, such as `Magnet` or `tornado`.

The filter works in real time as you type.
Elements leave the page as you type each new letter and the filter gets progressively stricter.
The heroes list gradually re-enters the page as you delete each letter in the filter box.

The HTML template contains a trigger called `filterAnimation`.

<docs-code header="src/app/hero-list-page.component.html" path="adev/src/content/examples/animations/src/app/hero-list-page.component.html" visibleRegion="filter-animations" language="angular-html"/>

The `filterAnimation` in the component's decorator contains three transitions.

<docs-code header="src/app/hero-list-page.component.ts" path="adev/src/content/examples/animations/src/app/hero-list-page.component.ts" visibleRegion="filter-animations"/>

The code in this example performs the following tasks:

* Skips animations when the user first opens or navigates to this page \(the filter animation narrows what is already there, so it only works on elements that already exist in the DOM\)
* Filters heroes based on the search input's value

For each change:

* Hides an element leaving the DOM by setting its opacity and width to 0
* Animates an element entering the DOM over 300 milliseconds.
    During the animation, the element assumes its default width and opacity.

* If there are multiple elements entering or leaving the DOM, staggers each animation starting at the top of the page, with a 50-millisecond delay between each element

### Animating the items of a reordering list

Although Angular animates correctly `*ngFor` list items out of the box, it will not be able to do so if their ordering changes.
This is because it will lose track of which element is which, resulting in broken animations.
The only way to help Angular keep track of such elements is by assigning a `TrackByFunction` to the `NgForOf` directive.
This makes sure that Angular always knows which element is which, thus allowing it to apply the correct animations to the correct elements all the time.

IMPORTANT: If you need to animate the items of an `*ngFor` list and there is a possibility that the order of such items will change during runtime, always use a `TrackByFunction`.

### Animations and Component View Encapsulation

Angular animations are based on the components DOM structure and do not directly take [View Encapsulation](guide/components/styling#style-scoping) into account, this means that components using `ViewEncapsulation.Emulated` behave exactly as if they were using `ViewEncapsulation.None` (`ViewEncapsulation.ShadowDom` behaves differently as we'll discuss shortly).

For example if the `query()` function (which you'll see more of in the rest of the Animations guide) were to be applied at the top of a tree of components using the emulated view encapsulation, such query would be able to identify (and thus animate) DOM elements on any depth of the tree.

On the other hand the `ViewEncapsulation.ShadowDom` changes the component's DOM structure by "hiding" DOM elements inside [`ShadowRoot`](https://developer.mozilla.org/docs/Web/API/ShadowRoot) elements. Such DOM manipulations do prevent some of the animations implementation to work properly since it relies on simple DOM structures and doesn't take `ShadowRoot` elements into account. Therefore it is advised to avoid applying animations to views incorporating components using the ShadowDom view encapsulation.

### Animation sequence summary

Angular functions for animating multiple elements start with `query()` to find inner elements; for example, gathering all images within a `<div>`.
The remaining functions, `stagger()`, [`group()`](api/animations/group), and `sequence()`, apply cascades or let you control how multiple animation steps are applied.

### More on Angular animations

You might also be interested in the following:

<docs-pill-row>
  <docs-pill href="guide/animations" title="Introduction to Angular animations"/>
  <docs-pill href="guide/animations/transition-and-triggers" title="Transition and triggers"/>
  <docs-pill href="guide/animations/reusable-animations" title="Reusable animations"/>
  <docs-pill href="guide/animations/route-animations" title="Route transition animations"/>
</docs-pill-row>

---


(From css.md)

## Animating your Application with CSS

CSS offers a robust set of tools for you to create beautiful and engaging animations within your application.

### How to write animations in native CSS

If you've never written any native CSS animations, there are a number of excellent guides to get you started. Here's a few of them:  
[MDN's CSS Animations guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations)  
[W3Schools CSS3 Animations guide](https://www.w3schools.com/css/css3_animations.asp)  
[The Complete CSS Animations Tutorial](https://www.lambdatest.com/blog/css-animations-tutorial/)  
[CSS Animation for Beginners](https://thoughtbot.com/blog/css-animation-for-beginners)  

and a couple of videos:  
[Learn CSS Animation in 9 Minutes](https://www.youtube.com/watch?v=z2LQYsZhsFw)  
[Net Ninja CSS Animation Tutorial Playlist](https://www.youtube.com/watch?v=jgw82b5Y2MU&list=PL4cUxeGkcC9iGYgmEd2dm3zAKzyCGDtM5)

Check some of these various guides and tutorials out, and then come back to this guide.

### Creating Reusable Animations

You can create reusable animations that can be shared across your application using `@keyframes`. Define keyframe animations in a shared CSS file, and you'll be able to re-use those keyframe animations wherever you want within your application.

<docs-code header="src/app/animations.css" path="adev/src/content/examples/animations/src/app/animations.css" visibleRegion="animation-shared"/>

Adding the class `animated-class` to an element would trigger the animation on that element.

### Animating a Transition

#### Animating State and Styles

You may want to animate between two different states, for example when an element is opened or closed. You can accomplish this by using CSS classes either using a keyframe animation or transition styling.

<docs-code header="src/app/animations.css" path="adev/src/content/examples/animations/src/app/animations.css" visibleRegion="animation-states"/>

Triggering the `open` or `closed` state is done by toggling classes on the element in your component. You can find examples of how to do this in our [template guide](guide/templates/binding#css-class-and-style-property-bindings).

You can see similar examples in the template guide for [animating styles directly](guide/templates/binding#css-style-properties).

#### Transitions, Timing, and Easing

Animating often requires adjusting timing, delays and easeing behaviors. This can be done using several css properties or shorthand properties.

Specify `animation-duration`, `animation-delay`, and `animation-timing-function` for a keyframe animation in CSS, or alternatively use the `animation` shorthand property.

<docs-code header="src/app/animations.css" path="adev/src/content/examples/animations/src/app/animations.css" visibleRegion="animation-timing"/>

Similarly, you can use `transition-duration`, `transition-delay`, and `transition-timing-function` and the `transition` shorthand for animations that are not using `@keyframes`.

<docs-code header="src/app/animations.css" path="adev/src/content/examples/animations/src/app/animations.css" visibleRegion="transition-timing"/>

#### Triggering an Animation

Animations can be triggered by toggling CSS styles or classes. Once a class is present on an element, the animation will occur. Removing the class will revert the element back to whatever CSS is defined for that element. Here's an example:

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/open-close.component.ts">
    <docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/native-css/open-close.component.ts" />
    <docs-code header="src/app/open-close.component.html" path="adev/src/content/examples/animations/src/app/native-css/open-close.component.html" />
    <docs-code header="src/app/open-close.component.css" path="adev/src/content/examples/animations/src/app/native-css/open-close.component.css"/>
</docs-code-multifile>

### Transition and Triggers

#### Animating Auto Height

You can use css-grid to animate to auto height.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/auto-height.component.ts">
    <docs-code header="src/app/auto-height.component.ts" path="adev/src/content/examples/animations/src/app/native-css/auto-height.component.ts" />
    <docs-code header="src/app/auto-height.component.html" path="adev/src/content/examples/animations/src/app/native-css/auto-height.component.html" />
    <docs-code header="src/app/auto-height.component.css" path="adev/src/content/examples/animations/src/app/native-css/auto-height.component.css"  />
</docs-code-multifile>

If you don't have to worry about supporting all browsers, you can also check out `calc-size()`, which is the true solution to animating auto height. See [MDN's docs](https://developer.mozilla.org/en-US/docs/Web/CSS/calc-size) and (this tutorial)[https://frontendmasters.com/blog/one-of-the-boss-battles-of-css-is-almost-won-transitioning-to-auto/] for more information.

#### Animate entering and leaving a view

You can create animations for when an item enters a view or leaves a view. Let's start by looking at how to animate an element leaving a view.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/insert.component.ts">
    <docs-code header="src/app/insert.component.ts" path="adev/src/content/examples/animations/src/app/native-css/insert.component.ts" />
    <docs-code header="src/app/insert.component.html" path="adev/src/content/examples/animations/src/app/native-css/insert.component.html" />
    <docs-code header="src/app/insert.component.css" path="adev/src/content/examples/animations/src/app/native-css/insert.component.css"  />
</docs-code-multifile>

Leaving a view is slightly more complex. The element removal needs to be delayed until the exit animation is complete. This requires a bit of extra code in your component class to accomplish.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/remove.component.ts">
    <docs-code header="src/app/remove.component.ts" path="adev/src/content/examples/animations/src/app/native-css/remove.component.ts" />
    <docs-code header="src/app/remove.component.html" path="adev/src/content/examples/animations/src/app/native-css/remove.component.html" />
    <docs-code header="src/app/remove.component.css" path="adev/src/content/examples/animations/src/app/native-css/remove.component.css"  />
</docs-code-multifile>

#### Animating increment and decrement

Animating on increment and decrement is a common pattern in applications. Here's an example of how you can accomplish that behavior.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.component.ts">
    <docs-code header="src/app/increment-decrement.component.ts" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.component.ts" />
    <docs-code header="src/app/increment-decrement.component.html" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.component.html" />
    <docs-code header="src/app/increment-decrement.component.css" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.component.css" />
</docs-code-multifile>

#### Disabling an animation or all animations

If you'd like to disable the animations that you've specified, you have multiple options.

1. Create a custom class that forces animation and transition to `none`.

```css
.no-animation {
  animation: none !important;
  transition: none !important;
}
```

Applying this class to an element prevents any animation from firing on that element. You could alternatively scope this to your entire DOM or section of your DOM to enforce this behavior. However, this prevents animation events from firing. If you are awaiting animation events for element removal, this solution won't work. A workaround is to set durations to 1 millisecond instead.

2. Use the [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) media query to ensure no animations play for users that prefer less animation.

3. Prevent adding animation classes programatically

#### Animation Callbacks

If you have actions you would like to execute at certain points during animations, there are a number of available events you can listen to. Here's a few of them.

[`OnAnimationStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationstart_event)  
[`OnAnimationEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event)  
[`OnAnimationIteration`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationitration_event)  
[`OnAnimationCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationcancel_event)  

[`OnTransitionStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionstart_event)  
[`OnTransitionRun`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionrun_event)  
[`OnTransitionEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event)  
[`OnTransitionCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitioncancel_event)  

The Web Animations API has a lot of additional functionality. [Take a look at the documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) to see all the available animation APIs.

NOTE: Be aware of bubbling issues with these callbacks. If you are animating children and parents, the events bubble up from children to parents. Consider stopping propagation or looking at more details within the event to determine if you're responding to the desired event target rather than an event bubbling up from a child node. You can examine the `animationname` property or the properties being transitioned to verify you have the right nodes.

### Complex Sequences

Animations are often more complicated than just a simple fade in or fade out. You may have lots of complicated sequences of animations you may want to run. Let's take a look at some of those possible scenarios.

#### Staggering animations in a list

One common effect is to stagger the animations of each item in a list to create a cascade effect. This can be accomplished by utilizing `animation-delay` or `transition-delay`. Here is an example of what that CSS might look like.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/stagger.component.ts">
    <docs-code header="src/app/stagger.component.ts" path="adev/src/content/examples/animations/src/app/native-css/stagger.component.ts" />
    <docs-code header="src/app/stagger.component.html" path="adev/src/content/examples/animations/src/app/native-css/stagger.component.html" />
    <docs-code header="src/app/stagger.component.css" path="adev/src/content/examples/animations/src/app/native-css/stagger.component.css" />
</docs-code-multifile>

#### Parallel Animations

You can apply multiple animations to an element at once using the `animation` shorthand property. Each can have their own durations and delays. This allows you to compose animations together and create complicated effects.

```css
.target-element {
  animation: rotate 3s, fade-in 2s;
}
```

In this example, the `rotate` and `fade-in` animations fire at the same time, but have different durations.

#### Animating the items of a reordering list

Items in a `@for` loop will be removed and re-added, which will fire off animations using `@starting-styles` for entry animations. Removal animations will require additional code to add the event listener, as seen in the example above.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/reorder.component.ts">
    <docs-code header="src/app/reorder.component.ts" path="adev/src/content/examples/animations/src/app/native-css/reorder.component.ts" />
    <docs-code header="src/app/reorder.component.html" path="adev/src/content/examples/animations/src/app/native-css/reorder.component.html" />
    <docs-code header="src/app/reorder.component.css" path="adev/src/content/examples/animations/src/app/native-css/reorder.component.css" />
</docs-code-multifile>

### Programmatic control of animations

You can retrieve animations off an element directly using [`Element.getAnimations()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations). This returns an array of every [`Animation`](https://developer.mozilla.org/en-US/docs/Web/API/Animation) on that element. You can use the `Animation` API to do much more than you could with what the `AnimationPlayer` from the animations package offered. From here you can `cancel()`, `play()`, `pause()`, `reverse()` and much more. This native API should provide everything you need to control your animations.

---


(From migration.md)

## Migrating away from Angular's Animations package

Almost all the features supported by `@angular/animations` have simpler alternatives with native CSS. Consider removing the Angular Animations package from your application, as the package can contribute around 60 kilobytes to your JavaScript bundle. Native CSS animations offer superior performance, as they can benefit from hardware acceleration. Animations defined in the animations package lack that ability. This guide walks through the process of refactoring your code from `@angular/animations` to native CSS animations.

### How to write animations in native CSS

If you've never written any native CSS animations, there are a number of excellent guides to get you started. Here's a few of them:  
[MDN's CSS Animations guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations)  
[W3Schools CSS3 Animations guide](https://www.w3schools.com/css/css3_animations.asp)  
[The Complete CSS Animations Tutorial](https://www.lambdatest.com/blog/css-animations-tutorial/)  
[CSS Animation for Beginners](https://thoughtbot.com/blog/css-animation-for-beginners)  

and a couple of videos:  
[Learn CSS Animation in 9 Minutes](https://www.youtube.com/watch?v=z2LQYsZhsFw)  
[Net Ninja CSS Animation Tutorial Playlist](https://www.youtube.com/watch?v=jgw82b5Y2MU&list=PL4cUxeGkcC9iGYgmEd2dm3zAKzyCGDtM5)

Check some of these various guides and tutorials out, and then come back to this guide.

### Creating Reusable Animations

Just like with the animations package, you can create reusable animations that can be shared across your application. The animations package version of this had you using the `animation()` function in a shared typescript file. The native CSS version of this is similar, but lives in a shared CSS file.

##### With Animations Package
<docs-code header="src/app/animations.ts" path="adev/src/content/examples/animations/src/app/animations.1.ts" visibleRegion="animation-example"/>

##### With Native CSS
<docs-code header="src/app/animations.css" path="adev/src/content/examples/animations/src/app/animations.css" visibleRegion="animation-shared"/>

Adding the class `animated-class` to an element would trigger the animation on that element.

### Animating a Transition

#### Animating State and Styles

The animations package allowed you to define various states using the [`state()`](api/animations/state) function within a component. Examples might be an `open` or `closed` state containing the styles for each respective state within the definition. For example:

##### With Animations Package
<docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.ts" visibleRegion="state1"/>

This same behavior can be accomplished natively by using CSS classes either using a keyframe animation or transition styling.

##### With Native CSS
<docs-code header="src/app/animations.css" path="adev/src/content/examples/animations/src/app/animations.css" visibleRegion="animation-states"/>

Triggering the `open` or `closed` state is done by toggling classes on the element in your component. You can find examples of how to do this in our [template guide](guide/templates/binding#css-class-and-style-property-bindings).

You can see similar examples in the template guide for [animating styles directly](guide/templates/binding#css-style-properties).

#### Transitions, Timing, and Easing

The animations package `animate()` function allows for providing timing, like duration, delays and easing. This can be done natively with CSS using several css properties or shorthand properties.

Specify `animation-duration`, `animation-delay`, and `animation-timing-function` for a keyframe animation in CSS, or alternatively use the `animation` shorthand property.

<docs-code header="src/app/animations.css" path="adev/src/content/examples/animations/src/app/animations.css" visibleRegion="animation-timing"/>

Similarly, you can use `transition-duration`, `transition-delay`, and `transition-timing-function` and the `transition` shorthand for animations that are not using `@keyframes`.

<docs-code header="src/app/animations.css" path="adev/src/content/examples/animations/src/app/animations.css" visibleRegion="transition-timing"/>

#### Triggering an Animation

The animations package required specifying triggers using the `trigger()` function and nesting all of your states within it. With native CSS, this is unnecessary. Animations can be triggered by toggling CSS styles or classes. Once a class is present on an element, the animation will occur. Removing the class will revert the element back to whatever CSS is defined for that element. This results in significantly less code to do the same animation. Here's an example:

##### With Animations Package
<docs-code-multifile>
    <docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/animations-package/open-close.component.ts" />
    <docs-code header="src/app/open-close.component.html" path="adev/src/content/examples/animations/src/app/animations-package/open-close.component.html" />
    <docs-code header="src/app/open-close.component.css" path="adev/src/content/examples/animations/src/app/animations-package/open-close.component.css"/>
</docs-code-multifile>

##### With Native CSS
<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/open-close.component.ts">
    <docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/native-css/open-close.component.ts" />
    <docs-code header="src/app/open-close.component.html" path="adev/src/content/examples/animations/src/app/native-css/open-close.component.html" />
    <docs-code header="src/app/open-close.component.css" path="adev/src/content/examples/animations/src/app/native-css/open-close.component.css"/>
</docs-code-multifile>

### Transition and Triggers

#### Predefined State and wildcard matching

The animations package offers the ability to match your defined states to a transition via strings. For example, animating from open to closed would be `open => closed`. You can use wildcards to match any state to a target state, like `* => closed` and the `void` keyword can be used for entering and exiting states. For example: `* => void` for when an element leaves a view or `void => *` for when the element enters a view.

These state matching patterns are not needed at all when animating with CSS directly. You can manage what transitions and `@keyframes` animations apply based on whatever classes you set and / or styles you set on the elements. You can also add `@starting-style` to control how the element looks upon immediately entering the DOM.

#### Automatic Property Calculation with Wildcards

The animations package offers the ability to animate things that have been historically difficult to animate, like animating a set height to `height: auto`. You can now do this with pure CSS as well.

##### With Animations Package
<docs-code-multifile>
    <docs-code header="src/app/auto-height.component.ts" path="adev/src/content/examples/animations/src/app/animations-package/auto-height.component.ts" />
    <docs-code header="src/app/auto-height.component.html" path="adev/src/content/examples/animations/src/app/animations-package/auto-height.component.html" />
    <docs-code header="src/app/auto-height.component.css" path="adev/src/content/examples/animations/src/app/animations-package/auto-height.component.css" />
</docs-code-multifile>

You can use css-grid to animate to auto height.

##### With Native CSS
<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/auto-height.component.ts">
    <docs-code header="src/app/auto-height.component.ts" path="adev/src/content/examples/animations/src/app/native-css/auto-height.component.ts" />
    <docs-code header="src/app/auto-height.component.html" path="adev/src/content/examples/animations/src/app/native-css/auto-height.component.html" />
    <docs-code header="src/app/auto-height.component.css" path="adev/src/content/examples/animations/src/app/native-css/auto-height.component.css"  />
</docs-code-multifile>

If you don't have to worry about supporting all browsers, you can also check out `calc-size()`, which is the true solution to animating auto height. See [MDN's docs](https://developer.mozilla.org/en-US/docs/Web/CSS/calc-size) and (this tutorial)[https://frontendmasters.com/blog/one-of-the-boss-battles-of-css-is-almost-won-transitioning-to-auto/] for more information.

#### Animate entering and leaving a view

The animations package offered the previously mentioned pattern matching for entering and leaving but also included the shorthand aliases of `:enter` and `:leave`.

##### With Animations Package
<docs-code-multifile>
    <docs-code header="src/app/insert-remove.component.ts" path="adev/src/content/examples/animations/src/app/animations-package/insert-remove.component.ts" />
    <docs-code header="src/app/insert-remove.component.html" path="adev/src/content/examples/animations/src/app/animations-package/insert-remove.component.html" />
    <docs-code header="src/app/insert-remove.component.css" path="adev/src/content/examples/animations/src/app/animations-package/insert-remove.component.css" />
</docs-code-multifile>

Here's how the same thing can be accomplished without the animations package.

##### With Native CSS
<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/insert.component.ts">
    <docs-code header="src/app/insert.component.ts" path="adev/src/content/examples/animations/src/app/native-css/insert.component.ts" />
    <docs-code header="src/app/insert.component.html" path="adev/src/content/examples/animations/src/app/native-css/insert.component.html" />
    <docs-code header="src/app/insert.component.css" path="adev/src/content/examples/animations/src/app/native-css/insert.component.css"  />
</docs-code-multifile>

Leaving a view is slightly more complex. The element removal needs to be delayed until the exit animation is complete. This requires a bit of extra code in your component class to accomplish.

##### With Native CSS
<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/remove.component.ts">
    <docs-code header="src/app/remove.component.ts" path="adev/src/content/examples/animations/src/app/native-css/remove.component.ts" />
    <docs-code header="src/app/remove.component.html" path="adev/src/content/examples/animations/src/app/native-css/remove.component.html" />
    <docs-code header="src/app/remove.component.css" path="adev/src/content/examples/animations/src/app/native-css/remove.component.css"  />
</docs-code-multifile>

#### Animating increment and decrement

Along with the aforementioned `:enter` and `:leave`, there's also `:increment` and `:decrement`. You can animate these also by adding and removing classes. Unlike the animation package built-in aliases, there is no automatic application of classes when the values go up or down. You can apply the appropriate classes programmatically. Here's an example:

##### With Animations Package
<docs-code-multifile>
    <docs-code header="src/app/increment-decrement.component.ts" path="adev/src/content/examples/animations/src/app/animations-package/increment-decrement.component.ts" />
    <docs-code header="src/app/increment-decrement.component.html" path="adev/src/content/examples/animations/src/app/animations-package/increment-decrement.component.html" />
    <docs-code header="src/app/increment-decrement.component.css" path="adev/src/content/examples/animations/src/app/animations-package/increment-decrement.component.css" />
</docs-code-multifile>

##### With Native CSS
<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.component.ts">
    <docs-code header="src/app/increment-decrement.component.ts" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.component.ts" />
    <docs-code header="src/app/increment-decrement.component.html" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.component.html" />
    <docs-code header="src/app/increment-decrement.component.css" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.component.css" />
</docs-code-multifile>

#### Parent / Child Animations

Unlike the animations package, when multiple animations are specified within a given component, no animation has priority over another and nothing blocks any animation from firing. Any sequencing of animations would have to be handled by your definition of your CSS animation, using animation / transition delay, and / or using `animationend` or `transitionend` to handle adding the next css to be animated.

#### Disabling an animation or all animations

With native CSS animations, if you'd like to disable the animations that you've specified, you have multiple options.

1. Create a custom class that forces animation and transition to `none`.

```css
.no-animation {
  animation: none !important;
  transition: none !important;
}
```

Applying this class to an element prevents any animation from firing on that element. You could alternatively scope this to your entire DOM or section of your DOM to enforce this behavior. However, this prevents animation events from firing. If you are awaiting animation events for element removal, this solution won't work. A workaround is to set durations to 1 millisecond instead.

2. Use the [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) media query to ensure no animations play for users that prefer less animation.

3. Prevent adding animation classes programatically

#### Animation Callbacks

The animations package exposed callbacks for you to use in the case that you want to do something when the animation has finished. Native CSS animations also have these callbacks.

[`OnAnimationStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationstart_event)  
[`OnAnimationEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event)  
[`OnAnimationIteration`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationitration_event)  
[`OnAnimationCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationcancel_event)  

[`OnTransitionStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionstart_event)  
[`OnTransitionRun`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionrun_event)  
[`OnTransitionEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event)  
[`OnTransitionCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitioncancel_event)  

The Web Animations API has a lot of additional functionality. [Take a look at the documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) to see all the available animation APIs.

NOTE: Be aware of bubbling issues with these callbacks. If you are animating children and parents, the events bubble up from children to parents. Consider stopping propagation or looking at more details within the event to determine if you're responding to the desired event target rather than an event bubbling up from a child node. You can examine the `animationname` property or the properties being transitioned to verify you have the right nodes.

### Complex Sequences

The animations package has built-in functionality for creating complex sequences. These sequences are all entirely possible without the animations package.

#### Targeting specific elements

In the animations package, you could target specific elements by using the `query()` function to find specific elements by a CSS class name, similar to [`document.querySelector()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector). This is unnecessary in a native CSS animation world. Instead, you can use your CSS selectors to target sub-classes and apply any desired `transform` or `animation`.

To toggle classes for child nodes within a template, you can use class and style bindings to add the animations at the right points.

#### Stagger()

The `stagger()` function allowed you to delay the animation of each item in a list of items by a specified time to create a cascade effect. You can replicate this behavior in native CSS by utilizing `animation-delay` or `transition-delay`. Here is an example of what that CSS might look like.

##### With Animations Package
<docs-code-multifile>
    <docs-code header="src/app/stagger.component.ts" path="adev/src/content/examples/animations/src/app/animations-package/stagger.component.ts" />
    <docs-code header="src/app/stagger.component.html" path="adev/src/content/examples/animations/src/app/animations-package/stagger.component.html" />
    <docs-code header="src/app/stagger.component.css" path="adev/src/content/examples/animations/src/app/animations-package/stagger.component.css" />
</docs-code-multifile>

##### With Native CSS
<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/stagger.component.ts">
    <docs-code header="src/app/stagger.component.ts" path="adev/src/content/examples/animations/src/app/native-css/stagger.component.ts" />
    <docs-code header="src/app/stagger.component.html" path="adev/src/content/examples/animations/src/app/native-css/stagger.component.html" />
    <docs-code header="src/app/stagger.component.css" path="adev/src/content/examples/animations/src/app/native-css/stagger.component.css" />
</docs-code-multifile>

#### Parallel Animations

The animations package has a `group()` function to play multiple animations at the same time. In CSS, you have full control over animation timing. If you have multiple animations defined, you can apply all of them at once.

```css
.target-element {
  animation: rotate 3s, fade-in 2s;
}
```

In this example, the `rotate` and `fade-in` animations fire at the same time.

#### Animating the items of a reordering list

Items reordering in a list works out of the box using the previously described techniques. No additional special work is required. Items in a `@for` loop will be removed and re-added properly, which will fire off animations using `@starting-styles` for entry animations. Removal animations will require additional code to add the event listener, as seen in the example above.

##### With Animations Package<
<docs-code-multifile>
    <docs-code header="src/app/reorder.component.ts" path="adev/src/content/examples/animations/src/app/animations-package/reorder.component.ts" />
    <docs-code header="src/app/reorder.component.html" path="adev/src/content/examples/animations/src/app/animations-package/reorder.component.html" />
    <docs-code header="src/app/reorder.component.css" path="adev/src/content/examples/animations/src/app/animations-package/reorder.component.css" />
</docs-code-multifile>

##### With Native CSS
<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/reorder.component.ts">
    <docs-code header="src/app/reorder.component.ts" path="adev/src/content/examples/animations/src/app/native-css/reorder.component.ts" />
    <docs-code header="src/app/reorder.component.html" path="adev/src/content/examples/animations/src/app/native-css/reorder.component.html" />
    <docs-code header="src/app/reorder.component.css" path="adev/src/content/examples/animations/src/app/native-css/reorder.component.css" />
</docs-code-multifile>


### Migrating usages of AnimationPlayer

The `AnimationPlayer` class allows access to an animation to do more advanced things like pause, play, restart, and finish an animation through code. All of these things can be handled natively as well.

You can retrieve animations off an element directly using [`Element.getAnimations()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations). This returns an array of every [`Animation`](https://developer.mozilla.org/en-US/docs/Web/API/Animation) on that element. You can use the `Animation` API to do much more than you could with what the `AnimationPlayer` from the animations package offered. From here you can `cancel()`, `play()`, `pause()`, `reverse()` and much more. This native API should provide everything you need to control your animations.

### Route Transitions

You can use view transitions to animate between routes. See the [Route Transition Animations Guide](guide/animations/route-animations) to get started.

---


(From overview.md)

## Introduction to Angular animations

IMPORTANT: The Angular team recommends using native CSS for animations instead of the Animations package for all new code. Use this guide to understand existing code built with the Animations Package. See [Migrating away from Angular's Animations package](guide/animations/migration) to learn how you can start using pure CSS animations in your apps.

Animation provides the illusion of motion: HTML elements change styling over time.
Well-designed animations can make your application more fun and straightforward to use, but they aren't just cosmetic.
Animations can improve your application and user experience in a number of ways:

* Without animations, web page transitions can seem abrupt and jarring
* Motion greatly enhances the user experience, so animations give users a chance to detect the application's response to their actions
* Good animations intuitively call the user's attention to where it is needed

Typically, animations involve multiple style *transformations* over time.
An HTML element can move, change color, grow or shrink, fade, or slide off the page.
These changes can occur simultaneously or sequentially. You can control the timing of each transformation.

Angular's animation system is built on CSS functionality, which means you can animate any property that the browser considers animatable.
This includes positions, sizes, transforms, colors, borders, and more.
The W3C maintains a list of animatable properties on its [CSS Transitions](https://www.w3.org/TR/css-transitions-1) page.

### About this guide

This guide covers the basic Angular animation features to get you started on adding Angular animations to your project.

### Getting started

The main Angular modules for animations are `@angular/animations` and `@angular/platform-browser`.

To get started with adding Angular animations to your project, import the animation-specific modules along with standard Angular functionality.

<docs-workflow>
<docs-step title="Enabling the animations module">
Import `provideAnimationsAsync` from `@angular/platform-browser/animations/async` and add it to the providers list in the `bootstrapApplication` function call.

<docs-code header="Enabling Animations" language="ts" linenums>
bootstrapApplication(AppComponent, {
  providers: [
    provideAnimationsAsync(),
  ]
});
</docs-code>

<docs-callout important title="If you need immediate animations in your application">
  If you need to have an animation happen immediately when your application is loaded,
  you will want to switch to the eagerly loaded animations module. Import `provideAnimations`
  from `@angular/platform-browser/animations` instead, and use `provideAnimations` **in place of**
  `provideAnimationsAsync` in the `bootstrapApplication` function call.
</docs-callout>

For `NgModule` based applications import `BrowserAnimationsModule`, which introduces the animation capabilities into your Angular root application module.

<docs-code header="src/app/app.module.ts" path="adev/src/content/examples/animations/src/app/app.module.1.ts"/>
</docs-step>
<docs-step title="Importing animation functions into component files">
If you plan to use specific animation functions in component files, import those functions from `@angular/animations`.

<docs-code header="src/app/app.component.ts" path="adev/src/content/examples/animations/src/app/app.component.ts" visibleRegion="imports"/>

See all [available animation functions](guide/animations#animations-api-summary) at the end of this guide.

</docs-step>
<docs-step title="Adding the animation metadata property">
In the component file, add a metadata property called `animations:` within the `@Component()` decorator.
You put the trigger that defines an animation within the `animations` metadata property.

<docs-code header="src/app/app.component.ts" path="adev/src/content/examples/animations/src/app/app.component.ts" visibleRegion="decorator"/>
</docs-step>
</docs-workflow>

### Animating a transition

Let's animate a transition that changes a single HTML element from one state to another.
For example, you can specify that a button displays either **Open** or **Closed** based on the user's last action.
When the button is in the `open` state, it's visible and yellow.
When it's the `closed` state, it's translucent and blue.

In HTML, these attributes are set using ordinary CSS styles such as color and opacity.
In Angular, use the `style()` function to specify a set of CSS styles for use with animations.
Collect a set of styles in an animation state, and give the state a name, such as `open` or `closed`.

HELPFUL: Let's create a new `open-close` component to animate with simple transitions.

Run the following command in terminal to generate the component:

<docs-code language="shell">

ng g component open-close

</docs-code>

This will create the component at `src/app/open-close.component.ts`.

#### Animation state and styles

Use Angular's [`state()`](api/animations/state) function to define different states to call at the end of each transition.
This function takes two arguments:
A unique name like `open` or `closed` and a `style()` function.

Use the `style()` function to define a set of styles to associate with a given state name.
You must use *camelCase* for style attributes that contain dashes, such as `backgroundColor` or wrap them in quotes, such as `'background-color'`.

Let's see how Angular's [`state()`](api/animations/state) function works with the `style⁣­(⁠)` function to set CSS style attributes.
In this code snippet, multiple style attributes are set at the same time for the state.
In the `open` state, the button has a height of 200 pixels, an opacity of 1, and a yellow background color.

<docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.ts" visibleRegion="state1"/>

In the following `closed` state, the button has a height of 100 pixels, an opacity of 0.8, and a background color of blue.

<docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.ts" visibleRegion="state2"/>

#### Transitions and timing

In Angular, you can set multiple styles without any animation.
However, without further refinement, the button instantly transforms with no fade, no shrinkage, or other visible indicator that a change is occurring.

To make the change less abrupt, you need to define an animation *transition* to specify the changes that occur between one state and another over a period of time.
The `transition()` function accepts two arguments:
The first argument accepts an expression that defines the direction between two transition states, and the second argument accepts one or a series of `animate()` steps.

Use the `animate()` function to define the length, delay, and easing of a transition, and to designate the style function for defining styles while transitions are taking place.
Use the `animate()` function to define the `keyframes()` function for multi-step animations.
These definitions are placed in the second argument of the `animate()` function.

##### Animation metadata: duration, delay, and easing

The `animate()` function \(second argument of the transition function\) accepts the `timings` and `styles` input parameters.

The `timings` parameter takes either a number or a string defined in three parts.

<docs-code language="typescript">

animate (duration)

</docs-code>

or

<docs-code language="typescript">

animate ('duration delay easing')

</docs-code>

The first part, `duration`, is required.
The duration can be expressed in milliseconds as a number without quotes, or in seconds with quotes and a time specifier.
For example, a duration of a tenth of a second can be expressed as follows:

* As a plain number, in milliseconds:
    `100`

* In a string, as milliseconds:
    `'100ms'`

* In a string, as seconds:
    `'0.1s'`

The second argument, `delay`, has the same syntax as `duration`.
For example:

* Wait for 100ms and then run for 200ms: `'0.2s 100ms'`

The third argument, `easing`, controls how the animation [accelerates and decelerates](https://easings.net) during its runtime.
For example, `ease-in` causes the animation to begin slowly, and to pick up speed as it progresses.

* Wait for 100ms, run for 200ms.
    Use a deceleration curve to start out fast and slowly decelerate to a resting point:
    `'0.2s 100ms ease-out'`

* Run for 200ms, with no delay.
    Use a standard curve to start slow, accelerate in the middle, and then decelerate slowly at the end:
    `'0.2s ease-in-out'`

* Start immediately, run for 200ms.
    Use an acceleration curve to start slow and end at full velocity:
    `'0.2s ease-in'`

HELPFUL: See the Material Design website's topic on [Natural easing curves](https://material.io/design/motion/speed.html#easing) for general information on easing curves.

This example provides a state transition from `open` to `closed` with a 1-second transition between states.

<docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.ts" visibleRegion="transition1"/>

In the preceding code snippet, the `=>` operator indicates unidirectional transitions, and `<=>` is bidirectional.
Within the transition, `animate()` specifies how long the transition takes.
In this case, the state change from `open` to `closed` takes 1 second, expressed here as `1s`.

This example adds a state transition from the `closed` state to the `open` state with a 0.5-second transition animation arc.

<docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.ts" visibleRegion="transition2"/>

HELPFUL: Some additional notes on using styles within [`state`](api/animations/state) and `transition` functions.

* Use [`state()`](api/animations/state) to define styles that are applied at the end of each transition, they persist after the animation completes
* Use `transition()` to define intermediate styles, which create the illusion of motion during the animation
* When animations are disabled, `transition()` styles can be skipped, but [`state()`](api/animations/state) styles can't
* Include multiple state pairs within the same `transition()` argument:

    <docs-code language="typescript">

    transition( 'on => off, off => void' )

    </docs-code>

#### Triggering the animation

An animation requires a *trigger*, so that it knows when to start.
The `trigger()` function collects the states and transitions, and gives the animation a name, so that you can attach it to the triggering element in the HTML template.

The `trigger()` function describes the property name to watch for changes.
When a change occurs, the trigger initiates the actions included in its definition.
These actions can be transitions or other functions, as we'll see later on.

In this example, we'll name the trigger `openClose`, and attach it to the `button` element.
The trigger describes the open and closed states, and the timings for the two transitions.

HELPFUL: Within each `trigger()` function call, an element can only be in one state at any given time.
However, it's possible for multiple triggers to be active at once.

#### Defining animations and attaching them to the HTML template

Animations are defined in the metadata of the component that controls the HTML element to be animated.
Put the code that defines your animations under the `animations:` property within the `@Component()` decorator.

<docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.ts" visibleRegion="component"/>

When you've defined an animation trigger for a component, attach it to an element in that component's template by wrapping the trigger name in brackets and preceding it with an `@` symbol.
Then, you can bind the trigger to a template expression using standard Angular property binding syntax as shown below, where `triggerName` is the name of the trigger, and `expression` evaluates to a defined animation state.

<docs-code language="typescript">

<div [@triggerName]="expression">…</div>;

</docs-code>

The animation is executed or triggered when the expression value changes to a new state.

The following code snippet binds the trigger to the value of the `isOpen` property.

<docs-code header="src/app/open-close.component.html" path="adev/src/content/examples/animations/src/app/open-close.component.1.html" visibleRegion="trigger"/>

In this example, when the `isOpen` expression evaluates to a defined state of `open` or `closed`, it notifies the trigger `openClose` of a state change.
Then it's up to the `openClose` code to handle the state change and kick off a state change animation.

For elements entering or leaving a page \(inserted or removed from the DOM\), you can make the animations conditional.
For example, use `*ngIf` with the animation trigger in the HTML template.

HELPFUL: In the component file, set the trigger that defines the animations as the value of the `animations:` property in the `@Component()` decorator.

In the HTML template file, use the trigger name to attach the defined animations to the HTML element to be animated.

#### Code review

Here are the code files discussed in the transition example.

<docs-code-multifile>
    <docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.ts" visibleRegion="component"/>
    <docs-code header="src/app/open-close.component.html" path="adev/src/content/examples/animations/src/app/open-close.component.1.html" visibleRegion="trigger"/>
    <docs-code header="src/app/open-close.component.css" path="adev/src/content/examples/animations/src/app/open-close.component.css"/>
</docs-code-multifile>

#### Summary

You learned to add animation to a transition between two states, using `style()` and [`state()`](api/animations/state) along with `animate()` for the timing.

Learn about more advanced features in Angular animations under the Animation section, beginning with advanced techniques in [transition and triggers](guide/animations/transition-and-triggers).

### Animations API summary

The functional API provided by the `@angular/animations` module provides a domain-specific language \(DSL\) for creating and controlling animations in Angular applications.
See the [API reference](api#animations) for a complete listing and syntax details of the core functions and related data structures.

| Function name                     | What it does                                                                                                                                                                                                |
|:---                               |:---                                                                                                                                                                                                         |
| `trigger()`                       | Kicks off the animation and serves as a container for all other animation function calls. HTML template binds to `triggerName`. Use the first argument to declare a unique trigger name. Uses array syntax. |
| `style()`                         | Defines one or more CSS styles to use in animations. Controls the visual appearance of HTML elements during animations. Uses object syntax.                                                                 |
| [`state()`](api/animations/state) | Creates a named set of CSS styles that should be applied on successful transition to a given state. The state can then be referenced by name within other animation functions.                              |
| `animate()`                       | Specifies the timing information for a transition. Optional values for `delay` and `easing`. Can contain `style()` calls within.                                                                            |
| `transition()`                    | Defines the animation sequence between two named states. Uses array syntax.                                                                                                                                 |
| `keyframes()`                     | Allows a sequential change between styles within a specified time interval. Use within `animate()`. Can include multiple `style()` calls within each `keyframe()`. Uses array syntax.                       |
| [`group()`](api/animations/group) | Specifies a group of animation steps \(*inner animations*\) to be run in parallel. Animation continues only after all inner animation steps have completed. Used within `sequence()` or `transition()`.     |
| `query()`                         | Finds one or more inner HTML elements within the current element.                                                                                                                                           |
| `sequence()`                      | Specifies a list of animation steps that are run sequentially, one by one.                                                                                                                                  |
| `stagger()`                       | Staggers the starting time for animations for multiple elements.                                                                                                                                            |
| `animation()`                     | Produces a reusable animation that can be invoked from elsewhere. Used together with `useAnimation()`.                                                                                                      |
| `useAnimation()`                  | Activates a reusable animation. Used with `animation()`.                                                                                                                                                    |
| `animateChild()`                  | Allows animations on child components to be run within the same timeframe as the parent.                                                                                                                    |

</table>

### More on Angular animations

HELPFUL: Check out this [presentation](https://www.youtube.com/watch?v=rnTK9meY5us), shown at the AngularConnect conference in November 2017, and the accompanying [source code](https://github.com/matsko/animationsftw.in).

You might also be interested in the following:

<docs-pill-row>
  <docs-pill href="guide/animations/transition-and-triggers" title="Transition and triggers"/>
  <docs-pill href="guide/animations/complex-sequences" title="Complex animation sequences"/>
  <docs-pill href="guide/animations/reusable-animations" title="Reusable animations"/>
  <docs-pill href="guide/animations/route-animations" title="Route transition animations"/>
</docs-pill-row>

---


(From reusable-animations.md)

## Reusable animations

IMPORTANT: The Angular team recommends using native CSS for animations instead of the Animations package for all new code. Use this guide to understand existing code built with the Animations Package. See [Migrating away from Angular's Animations package](guide/animations/migration#creating-reusable-animations) to learn how you can start using pure CSS animations in your apps.

This topic provides some examples of how to create reusable animations.

### Create reusable animations

To create a reusable animation, use the [`animation()`](api/animations/animation) function to define an animation in a separate `.ts` file and declare this animation definition as a `const` export variable.
You can then import and reuse this animation in any of your application components using the [`useAnimation()`](api/animations/useAnimation) function.

<docs-code header="src/app/animations.ts" path="adev/src/content/examples/animations/src/app/animations.1.ts" visibleRegion="animation-const"/>

In the preceding code snippet, `transitionAnimation` is made reusable by declaring it as an export variable.

HELPFUL: The `height`, `opacity`, `backgroundColor`, and `time` inputs are replaced during runtime.

You can also export a part of an animation.
For example, the following snippet exports the animation `trigger`.

<docs-code header="src/app/animations.1.ts" path="adev/src/content/examples/animations/src/app/animations.1.ts" visibleRegion="trigger-const"/>

From this point, you can import reusable animation variables in your component class.
For example, the following code snippet imports the `transitionAnimation` variable and uses it via the `useAnimation()` function.

<docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.3.ts" visibleRegion="reusable"/>

### More on Angular animations

You might also be interested in the following:

<docs-pill-row>
  <docs-pill href="guide/animations" title="Introduction to Angular animations"/>
  <docs-pill href="guide/animations/transition-and-triggers" title="Transition and triggers"/>
  <docs-pill href="guide/animations/complex-sequences" title="Complex animation sequences"/>
  <docs-pill href="guide/animations/route-animations" title="Route transition animations"/>
</docs-pill-row>

---


(From route-animations.md)

## Route transition animations

When a user navigates from one route to another, the Angular Router maps the URL path to the relevant component and displays its view. Animating this route transition can greatly enhance the user experience. The Router has support for the View Transitions API when navigating between routes in Chrome/Chromium browsers.

HELPFUL: The Router's native View Transitions integration is currently in [developer preview](/reference/releases#developer-preview). Native View Transitions are also a relatively new feature so there may be limited support in some browsers.

### How View Transitions work

The native browser method that’s used for view transitions is `document.startViewTransition`. When `startViewTransition()` is called, the browser captures the current state of the page which includes taking a screenshot. The method takes a callback that updates the DOM and this function can be asynchronous. The new state is captured and the transition begins in the next animation frame when the promise returned by the callback resolves.

Here’s an example of the startViewTransition api:

```ts
document.startViewTransition(async () => {
  await updateTheDOMSomehow();
});
```

If you’re curious to read more about the details of the browser API, the [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions) is an invaluable resource.

### How the Router uses view transitions

Several things happen after navigation starts in the router: route matching, loading lazy routes and components, executing guards and resolvers to name a few. Once these have completed successfully, the new routes are ready to be activated. This route activation is the DOM update that we want to perform as part of the view transition.

When the view transition feature is enabled, navigation “pauses” and a call is made to the browser’s `startViewTransition` method. Once the `startViewTransition` callback executes (this happens asynchronously, as outlined in the spec here), navigation “resumes”. The remaining steps for the router navigation include updating the browser URL and activating or deactivating the matched routes (the DOM update).

Finally, the callback passed to `startViewTransition` returns a Promise that resolves once Angular has finished rendering. As described above, this indicates to the browser that the new DOM state should be captured and the transition should begin.

View transitions are a [progressive enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement). If the browser does not support the API, the Router will perform the DOM updates without calling `startViewTransition` and the navigation will not be animated.

### Enabling View Transitions in the Router

To enable this feature, simply add `withViewTransitions` to the `provideRouter` or set `enableViewTransitions: true` in `RouterModule.forRoot`:

```ts
// Standalone bootstrap
bootstrapApplication(MyApp, {providers: [
  provideRouter(ROUTES, withViewTransitions()),
]});

// NgModule bootstrap
@NgModule({
  imports: [RouterModule.forRoot(routes, {enableViewTransitions: true})]
})
export class AppRouting {}
```

[Try the “count” example on StackBlitz](https://stackblitz.com/edit/stackblitz-starters-2dnvtm?file=src%2Fmain.ts)

This example uses the counter application from the Chrome explainer and replaces the direct call to startViewTransition when the counter increments with a router navigation.

### Using CSS to customize transitions

View transitions can be customized with CSS. We can also instruct the browser to create separate elements for the transition by setting a view-transition-name. We can expand the first example by adding view-transition-name: count to the .count style in the Counter component. Then, in the global styles, we can define a custom animation for this view transition:

```css
/* Custom transition */
@keyframes rotate-out {
 to {
   transform: rotate(90deg);
 }
}
@keyframes rotate-in {
 from {
   transform: rotate(-90deg);
 }
}
::view-transition-old(count),
::view-transition-new(count) {
 animation-duration: 200ms;
 animation-name: -ua-view-transition-fade-in, rotate-in;
}
::view-transition-old(count) {
 animation-name: -ua-view-transition-fade-out, rotate-out;
}
```

It is important that the view transition animations are defined in a global style file. They cannot be defined in the component styles because the default view encapsulation will scope the styles to the component.

[Try the updated “count” example on StackBlitz](https://stackblitz.com/edit/stackblitz-starters-fwn4i7?file=src%2Fmain.ts)

### Controlling transitions with onViewTransitionCreated

The `withViewTransitions` router feature can also be called with an options object that includes an `onViewTransitionCreated` callback. This callback is run in an [injection context](/guide/di/dependency-injection-context#run-within-an-injection-context) and receives a [ViewTransitionInfo](/api/router/ViewTransitionInfo) object that includes the `ViewTransition` returned from `startViewTransition`, as well as the `ActivatedRouteSnapshot` that the navigation is transitioning from and the new one that it is transitioning to.

This callback can be used for any number of customizations. For example, you might want to skip transitions under certain conditions. We use this on the new angular.dev docs site:

```ts
withViewTransitions({
 onViewTransitionCreated: ({transition}) => {
   const router = inject(Router);
   const targetUrl = router.getCurrentNavigation()!.finalUrl!;
   // Skip the transition if the only thing 
   // changing is the fragment and queryParams
   const config = { 
     paths: 'exact', 
     matrixParams: 'exact',
     fragment: 'ignored',
     queryParams: 'ignored',
   };

   if (router.isActive(targetUrl, config)) {
     transition.skipTransition();
   }
 },
}),
```

In this code snippet, we create a `UrlTree` from the `ActivatedRouteSnapshot` the navigation is going to. We then check with the Router to see if this `UrlTree` is already active, ignoring any differences in the fragment or query parameters. If it is already active, we call skipTransition which will skip the animation portion of the view transition. This is the case when clicking on an anchor link that will only scroll to another location in the same document.

### Examples from the Chrome explainer adapted to Angular

We’ve recreated some of the great examples from the Chrome Team in Angular for you to explore.

#### Transitioning elements don’t need to be the same DOM element

* [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#transitioning_elements_dont_need_to_be_the_same_dom_element)
* [Angular Example on StackBlitz](https://stackblitz.com/edit/stackblitz-starters-dh8npr?file=src%2Fmain.ts)

#### Custom entry and exit animations

* [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#custom_entry_and_exit_transitions)
* [Angular Example on StackBlitz](https://stackblitz.com/edit/stackblitz-starters-8kly3o)

#### Async DOM updates and waiting for content

* [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#async_dom_updates_and_waiting_for_content)

> During this time, the page is frozen, so delays here should be kept to a minimum…in some cases it’s better to avoid the delay altogether, and use the content you already have.

The view transition feature in the Angular router does not provide a way to delay the animation. For the moment, our stance is that it’s always better to use the content you have rather than making the page non-interactive for any additional amount of time.

#### Handle multiple view transition styles with view transition types

* [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#view-transition-types)
* [Angular Example on StackBlitz](https://stackblitz.com/edit/stackblitz-starters-vxzcam)

#### Handle multiple view transition styles with a class name on the view transition root (deprecated)

* [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#changing-on-navigation-type)
* [Angular Example on StackBlitz](https://stackblitz.com/edit/stackblitz-starters-nmnzzg?file=src%2Fmain.ts)

#### Transitioning without freezing other animations

* [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#transitioning-without-freezing)
* [Angular Example on StackBlitz](https://stackblitz.com/edit/stackblitz-starters-76kgww)

#### Animating with Javascript

* [Chrome Explainer](https://developer.chrome.com/docs/web-platform/view-transitions/same-document#animating-with-javascript)
* [Angular Example on StackBlitz](https://stackblitz.com/edit/stackblitz-starters-cklnkm)

### Native View Transitions Alternative

Animating the transition between routes can also be done with the `@angular/animations` package. 
The animation [triggers and transitions](/guide/animations/transition-and-triggers)
can be derived from the router state, such as the current URL or `ActivatedRoute`.

---


(From transition-and-triggers.md)

## Animation transitions and triggers

IMPORTANT: The Angular team recommends using native CSS for animations instead of the Animations package for all new code. Use this guide to understand existing code built with the Animations Package. See [Migrating away from Angular's Animations package](guide/animations/migration#transition-and-triggers) to learn how you can start using pure CSS animations in your apps.

This guide goes into depth on special transition states such as the `*` wildcard and `void`. It shows how these special states are used for elements entering and leaving a view.
This section also explores multiple animation triggers, animation callbacks, and sequence-based animation using keyframes.

### Predefined states and wildcard matching

In Angular, transition states can be defined explicitly through the [`state()`](api/animations/state) function, or using the predefined `*` wildcard and `void` states.

#### Wildcard state

An asterisk `*` or *wildcard* matches any animation state.
This is useful for defining transitions that apply regardless of the HTML element's start or end state.

For example, a transition of `open => *` applies when the element's state changes from open to anything else.

<img alt="wildcard state expressions" src="assets/images/guide/animations/wildcard-state-500.png">

The following is another code sample using the wildcard state together with the previous example using the `open` and `closed` states.
Instead of defining each state-to-state transition pair, any transition to `closed` takes 1 second, and any transition to `open` takes 0.5 seconds.

This allows the addition of new states without having to include separate transitions for each one.

<docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.ts" visibleRegion="trigger-wildcard1"/>

Use a double arrow syntax to specify state-to-state transitions in both directions.

<docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.ts" visibleRegion="trigger-wildcard2"/>

#### Use wildcard state with multiple transition states

In the two-state button example, the wildcard isn't that useful because there are only two possible states, `open` and `closed`.
In general, use wildcard states when an element has multiple potential states that it can change to.
If the button can change from `open` to either `closed` or something like `inProgress`, using a wildcard state could reduce the amount of coding needed.

<img alt="wildcard state with 3 states" src="assets/images/guide/animations/wildcard-3-states.png">

<docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.ts" visibleRegion="trigger-transition"/>

The `* => *` transition applies when any change between two states takes place.

Transitions are matched in the order in which they are defined.
Thus, you can apply other transitions on top of the `* => *` transition.
For example, define style changes or animations that would apply just to `open => closed`, then use `* => *` as a fallback for state pairings that aren't otherwise called out.

To do this, list the more specific transitions *before* `* => *`.

#### Use wildcards with styles

Use the wildcard `*` with a style to tell the animation to use whatever the current style value is, and animate with that.
Wildcard is a fallback value that's used if the state being animated isn't declared within the trigger.

<docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.ts" visibleRegion="transition4"/>

#### Void state

Use the `void` state to configure transitions for an element that is entering or leaving a page.
See [Animating entering and leaving a view](guide/animations/transition-and-triggers#aliases-enter-and-leave).

#### Combine wildcard and void states

Combine wildcard and void states in a transition to trigger animations that enter and leave the page:

* A transition of `* => void` applies when the element leaves a view, regardless of what state it was in before it left
* A transition of `void => *` applies when the element enters a view, regardless of what state it assumes when entering
* The wildcard state `*` matches to *any* state, including `void`

### Animate entering and leaving a view

This section shows how to animate elements entering or leaving a page.

Add a new behavior:

* When you add a hero to the list of heroes, it appears to fly onto the page from the left
* When you remove a hero from the list, it appears to fly out to the right

<docs-code header="src/app/hero-list-enter-leave.component.ts" path="adev/src/content/examples/animations/src/app/hero-list-enter-leave.component.ts" visibleRegion="animationdef"/>

In the preceding code, you applied the `void` state when the HTML element isn't attached to a view.

### Aliases :enter and :leave

`:enter` and `:leave` are aliases for the `void => *` and `* => void` transitions.
These aliases are used by several animation functions.

<docs-code hideCopy language="typescript">

transition ( ':enter', [ … ] );  // alias for void => *
transition ( ':leave', [ … ] );  // alias for * => void

</docs-code>

It's harder to target an element that is entering a view because it isn't in the DOM yet.
Use the aliases `:enter` and `:leave` to target HTML elements that are inserted or removed from a view.

#### Use `*ngIf` and `*ngFor` with :enter and :leave

The `:enter` transition runs when any `*ngIf` or `*ngFor` views are placed on the page, and `:leave` runs when those views are removed from the page.

IMPORTANT: Entering/leaving behaviors can sometime be confusing.
As a rule of thumb consider that any element being added to the DOM by Angular passes via the `:enter` transition. Only elements being directly removed from the DOM by Angular pass via the `:leave` transition. For example, an element's view is removed from the DOM because its parent is being removed from the DOM.

This example has a special trigger for the enter and leave animation called `myInsertRemoveTrigger`.
The HTML template contains the following code.

<docs-code header="src/app/insert-remove.component.html" path="adev/src/content/examples/animations/src/app/insert-remove.component.html" visibleRegion="insert-remove"/>

In the component file, the `:enter` transition sets an initial opacity of 0. It then animates it to change that opacity to 1 as the element is inserted into the view.

<docs-code header="src/app/insert-remove.component.ts" path="adev/src/content/examples/animations/src/app/insert-remove.component.ts" visibleRegion="enter-leave-trigger"/>

Note that this example doesn't need to use [`state()`](api/animations/state).

### Transition :increment and :decrement

The `transition()` function takes other selector values, `:increment` and `:decrement`.
Use these to kick off a transition when a numeric value has increased or decreased in value.

HELPFUL: The following example uses `query()` and `stagger()` methods.
For more information on these methods, see the [complex sequences](guide/animations/complex-sequences) page.

<docs-code header="src/app/hero-list-page.component.ts" path="adev/src/content/examples/animations/src/app/hero-list-page.component.ts" visibleRegion="increment"/>

### Boolean values in transitions

If a trigger contains a Boolean value as a binding value, then this value can be matched using a `transition()` expression that compares `true` and `false`, or `1` and `0`.

<docs-code header="src/app/open-close.component.html" path="adev/src/content/examples/animations/src/app/open-close.component.2.html" visibleRegion="trigger-boolean"/>

In the code snippet above, the HTML template binds a `<div>` element to a trigger named `openClose` with a status expression of `isOpen`, and with possible values of `true` and `false`.
This pattern is an alternative to the practice of creating two named states like `open` and `close`.

Inside the `@Component` metadata under the `animations:` property, when the state evaluates to `true`, the associated HTML element's height is a wildcard style or default.
In this case, the animation uses whatever height the element already had before the animation started.
When the element is `closed`, the element gets animated to a height of 0, which makes it invisible.

<docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.2.ts" visibleRegion="trigger-boolean"/>

### Multiple animation triggers

You can define more than one animation trigger for a component.
Attach animation triggers to different elements, and the parent-child relationships among the elements affect how and when the animations run.

#### Parent-child animations

Each time an animation is triggered in Angular, the parent animation always gets priority and child animations are blocked.
For a child animation to run, the parent animation must query each of the elements containing child animations. It then lets the animations run using the [`animateChild()`](api/animations/animateChild) function.

##### Disable an animation on an HTML element

A special animation control binding called `@.disabled` can be placed on an HTML element to turn off animations on that element, as well as any nested elements.
When true, the `@.disabled` binding prevents all animations from rendering.

The following code sample shows how to use this feature.

<docs-code-multifile>
    <docs-code header="src/app/open-close.component.html" path="adev/src/content/examples/animations/src/app/open-close.component.4.html" visibleRegion="toggle-animation"/>
    <docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.4.ts" visibleRegion="toggle-animation" language="typescript"/>
</docs-code-multifile>

When the `@.disabled` binding is true, the `@childAnimation` trigger doesn't kick off.

When an element within an HTML template has animations turned off using the `@.disabled` host binding, animations are turned off on all inner elements as well.
You can't selectively turn off multiple animations on a single element.<!-- vale off -->

A selective child animations can still be run on a disabled parent in one of the following ways:

* A parent animation can use the [`query()`](api/animations/query) function to collect inner elements located in disabled areas of the HTML template.
    Those elements can still animate.
<!-- vale on -->

* A child animation can be queried by a parent and then later animated with the `animateChild()` function

##### Disable all animations

To turn off all animations for an Angular application, place the `@.disabled` host binding on the topmost Angular component.

<docs-code header="src/app/app.component.ts" path="adev/src/content/examples/animations/src/app/app.component.ts" visibleRegion="toggle-app-animations"/>

HELPFUL: Disabling animations application-wide is useful during end-to-end \(E2E\) testing.

### Animation callbacks

The animation `trigger()` function emits *callbacks* when it starts and when it finishes.
The following example features a component that contains an `openClose` trigger.

<docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.ts" visibleRegion="events1"/>

In the HTML template, the animation event is passed back via `$event`, as `@triggerName.start` and `@triggerName.done`, where `triggerName` is the name of the trigger being used.
In this example, the trigger `openClose` appears as follows.

<docs-code header="src/app/open-close.component.html" path="adev/src/content/examples/animations/src/app/open-close.component.3.html" visibleRegion="callbacks"/>

A potential use for animation callbacks could be to cover for a slow API call, such as a database lookup.
For example, an **InProgress** button can be set up to have its own looping animation while the backend system operation finishes.

Another animation can be called when the current animation finishes.
For example, the button goes from the `inProgress` state to the `closed` state when the API call is completed.

An animation can influence an end user to *perceive* the operation as faster, even when it is not.

Callbacks can serve as a debugging tool, for example in conjunction with `console.warn()` to view the application's progress in a browser's Developer JavaScript Console.
The following code snippet creates console log output for the original example, a button with the two states of `open` and `closed`.

<docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.ts" visibleRegion="events"/>

### Keyframes

To create an animation with multiple steps run in sequence, use *keyframes*.

Angular's `keyframe()` function allows several style changes within a single timing segment.
For example, the button, instead of fading, could change color several times over a single 2-second time span.

<img alt="keyframes" src="assets/images/guide/animations/keyframes-500.png">

The code for this color change might look like this.

<docs-code header="src/app/status-slider.component.ts" path="adev/src/content/examples/animations/src/app/status-slider.component.ts" visibleRegion="keyframes"/>

#### Offset

Keyframes include an `offset` that defines the point in the animation where each style change occurs.
Offsets are relative measures from zero to one, marking the beginning and end of the animation. They should be applied to each of the keyframe steps if used at least once.

Defining offsets for keyframes is optional.
If you omit them, evenly spaced offsets are automatically assigned.
For example, three keyframes without predefined offsets receive offsets of 0, 0.5, and 1.
Specifying an offset of 0.8 for the middle transition in the preceding example might look like this.

<img alt="keyframes with offset" src="assets/images/guide/animations/keyframes-offset-500.png">

The code with offsets specified would be as follows.

<docs-code header="src/app/status-slider.component.ts" path="adev/src/content/examples/animations/src/app/status-slider.component.ts" visibleRegion="keyframesWithOffsets"/>

You can combine keyframes with `duration`, `delay`, and `easing` within a single animation.

#### Keyframes with a pulsation

Use keyframes to create a pulse effect in your animations by defining styles at specific offset throughout the animation.

Here's an example of using keyframes to create a pulse effect:

* The original `open` and `closed` states, with the original changes in height, color, and opacity, occurring over a timeframe of 1 second
* A keyframes sequence inserted in the middle that causes the button to appear to pulsate irregularly over the course of that same 1 second timeframe

<img alt="keyframes with irregular pulsation" src="assets/images/guide/animations/keyframes-pulsation.png">

The code snippet for this animation might look like this.

<docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.1.ts" visibleRegion="trigger"/>

#### Animatable properties and units

Angular animations support builds on top of web animations, so you can animate any property that the browser considers animatable.
This includes positions, sizes, transforms, colors, borders, and more.
The W3C maintains a list of animatable properties on its [CSS Transitions](https://www.w3.org/TR/css-transitions-1) page.

For properties with a numeric value, define a unit by providing the value as a string, in quotes, with the appropriate suffix:

* 50 pixels:
    `'50px'`

* Relative font size:
    `'3em'`

* Percentage:
    `'100%'`

You can also provide the value as a number. In such cases Angular assumes a default unit of pixels, or `px`.
Expressing 50 pixels as `50` is the same as saying `'50px'`.

HELPFUL: The string `"50"` would instead not be considered valid\).

#### Automatic property calculation with wildcards

Sometimes, the value of a dimensional style property isn't known until runtime.
For example, elements often have widths and heights that depend on their content or the screen size.
These properties are often challenging to animate using CSS.

In these cases, you can use a special wildcard `*` property value under `style()`. The value of that particular style property is computed at runtime and then plugged into the animation.

The following example has a trigger called `shrinkOut`, used when an HTML element leaves the page.
The animation takes whatever height the element has before it leaves, and animates from that height to zero.

<docs-code header="src/app/hero-list-auto.component.ts" path="adev/src/content/examples/animations/src/app/hero-list-auto.component.ts" visibleRegion="auto-calc"/>

#### Keyframes summary

The `keyframes()` function in Angular allows you to specify multiple interim styles within a single transition. An optional `offset` can be used to define the point in the animation where each style change should occur.

### More on Angular animations

You might also be interested in the following:

<docs-pill-row>
  <docs-pill href="guide/animations" title="Introduction to Angular animations"/>
  <docs-pill href="guide/animations/complex-sequences" title="Complex animation sequences"/>
  <docs-pill href="guide/animations/reusable-animations" title="Reusable animations"/>
  <docs-pill href="guide/animations/route-animations" title="Route transition animations"/>
</docs-pill-row>

---