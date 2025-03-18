# Guide Routing

(From common-router-tasks.md)

## Common Routing Tasks

This topic describes how to implement many of the common tasks associated with adding the Angular router to your application.

### Generate an application with routing enabled

The following command uses the Angular CLI to generate a basic Angular application with application routes. The application name in the following example is `routing-app`.

```shell
ng new routing-app
```

#### Adding components for routing

To use the Angular router, an application needs to have at least two components so that it can navigate from one to the other. To create a component using the CLI, enter the following at the command line where `first` is the name of your component:

```shell
ng generate component first
```

Repeat this step for a second component but give it a different name. Here, the new name is `second`.

<docs-code language="shell">

ng generate component second

</docs-code>

The CLI automatically appends `Component`, so if you were to write `first-component`, your component would be `FirstComponentComponent`.

<docs-callout title="`base href`">

This guide works with a CLI-generated Angular application. If you are working manually, make sure that you have `<base href="/">` in the `<head>` of your index.html file.
This assumes that the `app` folder is the application root, and uses `"/"`.

</docs-callout>

#### Importing your new components

To use your new components, import them into `app.routes.ts` at the top of the file, as follows:

<docs-code language="ts">

import {FirstComponent} from './first/first.component';
import {SecondComponent} from './second/second.component';

</docs-code>

### Defining a basic route

There are three fundamental building blocks to creating a route.

Import the routes into `app.config.ts` and add it to the `provideRouter` function. The following is the default `ApplicationConfig` using the CLI.

<docs-code language="ts">

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};

</docs-code>

The Angular CLI performs this step for you. However, if you are creating an application manually or working with an existing, non-CLI application, verify that the imports and configuration are correct.

<docs-workflow>

<docs-step title="Set up a `Routes` array for your routes">

The Angular CLI performs this step automatically.

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [];
```

</docs-step>

<docs-step title="Define your routes in your `Routes` array">

Each route in this array is a JavaScript object that contains two properties. The first property, `path`, defines the URL path for the route. The second property, `component`, defines the component Angular should use for the corresponding path.

```ts
const routes: Routes = [
  { path: 'first-component', component: FirstComponent },
  { path: 'second-component', component: SecondComponent },
];
```

</docs-step>

<docs-step title="Add your routes to your application">

Now that you have defined your routes, add them to your application. First, add links to the two components. Assign the anchor tag that you want to add the route to the `routerLink` attribute. Set the value of the attribute to the component to show when a user clicks on each link. Next, update your component template to include `<router-outlet>`. This element informs Angular to update the application view with the component for the selected route.

```angular-html
<h1>Angular Router App</h1>
<nav>
  <ul>
    <li><a routerLink="/first-component" routerLinkActive="active" ariaCurrentWhenActive="page">First Component</a></li>
    <li><a routerLink="/second-component" routerLinkActive="active" ariaCurrentWhenActive="page">Second Component</a></li>
  </ul>
</nav>
<!-- The routed views render in the <router-outlet>-->
<router-outlet />
```

You also need to add the `RouterLink`, `RouterLinkActive`, and `RouterOutlet` to the `imports` array of `AppComponent`.

```ts
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'routing-app';
}
```

</docs-step>

</docs-workflow>

#### Route order

The order of routes is important because the `Router` uses a first-match wins strategy when matching routes, so more specific routes should be placed above less specific routes.
List routes with a static path first, followed by an empty path route, which matches the default route.
The [wildcard route](guide/routing/common-router-tasks#setting-up-wildcard-routes) comes last because it matches every URL and the `Router` selects it only if no other routes match first.

### Getting route information

Often, as a user navigates your application, you want to pass information from one component to another.
For example, consider an application that displays a shopping list of grocery items.
Each item in the list has a unique `id`.
To edit an item, users click an Edit button, which opens an `EditGroceryItem` component.
You want that component to retrieve the `id` for the grocery item so it can display the right information to the user.

Use a route to pass this type of information to your application components.
To do so, you use the [withComponentInputBinding](api/router/withComponentInputBinding) feature with `provideRouter` or the `bindToComponentInputs` option of `RouterModule.forRoot`.

To get information from a route:

<docs-workflow>

<docs-step title="Add `withComponentInputBinding`">

Add the `withComponentInputBinding` feature to the `provideRouter` method.

```ts
providers: [
  provideRouter(appRoutes, withComponentInputBinding()),
]
```

</docs-step>

<docs-step title="Add an `Input` to the component">

Update the component to have an `Input` matching the name of the parameter.

```ts
@Input()
set id(heroId: string) {
  this.hero$ = this.service.getHero(heroId);
}
```

NOTE: You can bind all route data with key, value pairs to component inputs: static or resolved route data, path parameters, matrix parameters, and query parameters.
If you want to use the parent components route info you will need to set the router `paramsInheritanceStrategy` option:
`withRouterConfig({paramsInheritanceStrategy: 'always'})`

</docs-step>

</docs-workflow>

### Setting up wildcard routes

A well-functioning application should gracefully handle when users attempt to navigate to a part of your application that does not exist.
To add this functionality to your application, you set up a wildcard route.
The Angular router selects this route any time the requested URL doesn't match any router paths.

To set up a wildcard route, add the following code to your `routes` definition.

<docs-code>

{ path: '**', component: <component-name> }

</docs-code>

The two asterisks, `**`, indicate to Angular that this `routes` definition is a wildcard route.
For the component property, you can define any component in your application.
Common choices include an application-specific `PageNotFoundComponent`, which you can define to [display a 404 page](guide/routing/common-router-tasks#displaying-a-404-page) to your users; or a redirect to your application's main component.
A wildcard route is the last route because it matches any URL.
For more detail on why order matters for routes, see [Route order](guide/routing/common-router-tasks#route-order).

### Displaying a 404 page

To display a 404 page, set up a [wildcard route](guide/routing/common-router-tasks#setting-up-wildcard-routes) with the `component` property set to the component you'd like to use for your 404 page as follows:

```ts
const routes: Routes = [
  { path: 'first-component', component: FirstComponent },
  { path: 'second-component', component: SecondComponent },
  { path: '**', component: PageNotFoundComponent },  // Wildcard route for a 404 page
];
```

The last route with the `path` of `**` is a wildcard route.
The router selects this route if the requested URL doesn't match any of the paths earlier in the list and sends the user to the `PageNotFoundComponent`.

### Setting up redirects

To set up a redirect, configure a route with the `path` you want to redirect from, the `component` you want to redirect to, and a `pathMatch` value that tells the router how to match the URL.

```ts
const routes: Routes = [
  { path: 'first-component', component: FirstComponent },
  { path: 'second-component', component: SecondComponent },
  { path: '',   redirectTo: '/first-component', pathMatch: 'full' }, // redirect to `first-component`
  { path: '**', component: PageNotFoundComponent },  // Wildcard route for a 404 page
];
```

In this example, the third route is a redirect so that the router defaults to the `first-component` route.
Notice that this redirect precedes the wildcard route.
Here, `path: ''` means to use the initial relative URL \(`''`\).

Sometimes a redirect is not a simple, static redirect. The `redirectTo` property can also be a function
with more complex logic that returns a string or `UrlTree`.

```ts
const routes: Routes = [
  { path: "first-component", component: FirstComponent },
  {
    path: "old-user-page",
    redirectTo: ({ queryParams }) => {
      const errorHandler = inject(ErrorHandler);
      const userIdParam = queryParams['userId'];
      if (userIdParam !== undefined) {
        return `/user/${userIdParam}`;
      } else {
        errorHandler.handleError(new Error('Attempted navigation to user page without user ID.'));
        return `/not-found`;
      }
    },
  },
  { path: "user/:userId", component: OtherComponent },
];
```

### Nesting routes

As your application grows more complex, you might want to create routes that are relative to a component other than your root component.
These types of nested routes are called child routes.
This means you're adding a second `<router-outlet>` to your app, because it is in addition to the `<router-outlet>` in `AppComponent`.

In this example, there are two additional child components, `child-a`, and `child-b`.
Here, `FirstComponent` has its own `<nav>` and a second `<router-outlet>` in addition to the one in `AppComponent`.

```angular-html
<h2>First Component</h2>

<nav>
  <ul>
    <li><a routerLink="child-a">Child A</a></li>
    <li><a routerLink="child-b">Child B</a></li>
  </ul>
</nav>

<router-outlet />
```

A child route is like any other route, in that it needs both a `path` and a `component`.
The one difference is that you place child routes in a `children` array within the parent route.

```ts
const routes: Routes = [
  {
    path: 'first-component',
    component: FirstComponent, // this is the component with the <router-outlet> in the template
    children: [
      {
        path: 'child-a', // child route path
        component: ChildAComponent, // child route component that the router renders
      },
      {
        path: 'child-b',
        component: ChildBComponent, // another child route component that the router renders
      },
    ],
  },
];
```

### Setting the page title

Each page in your application should have a unique title so that they can be identified in the browser history.
The `Router` sets the document's title using the `title` property from the `Route` config.

```ts
const routes: Routes = [
  {
    path: 'first-component',
    title: 'First component',
    component: FirstComponent,  // this is the component with the <router-outlet> in the template
    children: [
      {
        path: 'child-a',  // child route path
        title: resolvedChildATitle,
        component: ChildAComponent,  // child route component that the router renders
      },
      {
        path: 'child-b',
        title: 'child b',
        component: ChildBComponent,  // another child route component that the router renders
      },
    ],
  },
];

const resolvedChildATitle: ResolveFn<string> = () => Promise.resolve('child a');
```

HELPFUL: The `title` property follows the same rules as static route `data` and dynamic values that implement `ResolveFn`.

You can also provide a custom title strategy by extending the `TitleStrategy`.

```ts
@Injectable({ providedIn: 'root' })
export class TemplatePageTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(routerState: RouterStateSnapshot) {
    const title = this.buildTitle(routerState);
    if (title !== undefined) {
      this.title.setTitle(`My Application | ${title}`);
    }
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: TitleStrategy, useClass: TemplatePageTitleStrategy },
  ]
};
```

### Using relative paths

Relative paths let you define paths that are relative to the current URL segment.
The following example shows a relative route to another component, `second-component`.
`FirstComponent` and `SecondComponent` are at the same level in the tree, however, the link to `SecondComponent` is situated within the `FirstComponent`, meaning that the router has to go up a level and then into the second directory to find the `SecondComponent`.
Rather than writing out the whole path to get to `SecondComponent`, use the `../` notation to go up a level.

```angular-html
<h2>First Component</h2>

<nav>
  <ul>
    <li><a routerLink="../second-component">Relative Route to second component</a></li>
  </ul>
</nav>
<router-outlet />
```

In addition to `../`, use `./` or no leading slash to specify the current level.

#### Specifying a relative route

To specify a relative route, use the `NavigationExtras` `relativeTo` property.
In the component class, import `NavigationExtras` from the `@angular/router`.

Then use `relativeTo` in your navigation method.
After the link parameters array, which here contains `items`, add an object with the `relativeTo` property set to the `ActivatedRoute`, which is `this.route`.

```ts
goToItems() {
  this.router.navigate(['items'], { relativeTo: this.route });
}
```

The `navigate()` arguments configure the router to use the current route as a basis upon which to append `items`.

The `goToItems()` method interprets the destination URI as relative to the activated route and navigates to the `items` route.

### Accessing query parameters and fragments

Sometimes, a feature of your application requires accessing a part of a route, such as a query parameter or a fragment.
In this example, the route contains an `id` parameter we can use to target a specific hero page.

```ts
import { ApplicationConfig } from "@angular/core";
import { Routes } from '@angular/router';
import { HeroListComponent } from './hero-list.component';

export const routes: Routes = [
  { path: 'hero/:id', component: HeroDetailComponent }
];

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};
```

First, import the following members in the component you want to navigate from.

```ts
import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
```

Next inject the activated route service:

```ts
private readonly route = inject(ActivatedRoute);
```

Configure the class so that you have an observable, `heroes$`, a `selectedId` to hold the `id` number of the hero, and the heroes in the `ngOnInit()`, add the following code to get the `id` of the selected hero.
This code snippet assumes that you have a heroes list, a hero service, a function to get your heroes, and the HTML to render your list and details, just as in the Tour of Heroes example.

```ts
heroes$: Observable<Hero[]>;
selectedId: number;
heroes = HEROES;

ngOnInit() {
  this.heroes$ = this.route.paramMap.pipe(
    switchMap(params => {
      this.selectedId = Number(params.get('id'));
      return this.service.getHeroes();
    })
  );
}
```

Next, in the component that you want to navigate to, import the following members.

```ts
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
```

Inject `ActivatedRoute` and `Router` in the constructor of the component class so they are available to this component:

```ts
private readonly route = inject(ActivatedRoute);
private readonly router = inject(Router);

hero$: Observable<Hero>;

ngOnInit() {
  const heroId = this.route.snapshot.paramMap.get('id');
  this.hero$ = this.service.getHero(heroId);
}

gotoItems(hero: Hero) {
  const heroId = hero ? hero.id : null;
  // Pass along the hero id if available
  // so that the HeroList component can select that item.
  this.router.navigate(['/heroes', { id: heroId }]);
}
```

### Lazy loading

You can configure your routes to lazy load modules, which means that Angular only loads modules as needed, rather than loading all modules when the application launches.
Additionally, preload parts of your application in the background to improve the user experience.

Any route can lazily load its routed, standalone component by using `loadComponent:`

<docs-code header="Lazy loading a standalone component" language="typescript">

const routes: Routes = [
  {
    path: 'lazy',
    loadComponent: () => import('./lazy.component').then(c => c.LazyComponent)
  }
];
</docs-code>
This works as long as the loaded component is standalone.


For more information on lazy loading and preloading see the dedicated guide [Lazy loading](guide/ngmodules/lazy-loading).

### Preventing unauthorized access

Use route guards to prevent users from navigating to parts of an application without authorization.
The following route guards are available in Angular:

<docs-pill-row>
  <docs-pill href="api/router/CanActivateFn" title="`canActivate`"/>
  <docs-pill href="api/router/CanActivateChildFn" title="`canActivateChild`"/>
  <docs-pill href="api/router/CanDeactivateFn" title="`canDeactivate`"/>
  <docs-pill href="api/router/CanMatchFn" title="`canMatch`"/>
  <docs-pill href="api/router/ResolveFn" title="`resolve`"/>
  <docs-pill href="api/router/CanLoadFn" title="`canLoad`"/>
</docs-pill-row>

To use route guards, consider using [component-less routes](api/router/Route#componentless-routes) as this facilitates guarding child routes.

Create a file for your guard:

```bash
ng generate guard your-guard
```

In your guard file, add the guard functions you want to use.
The following example uses `canActivateFn` to guard the route.

```ts
export const yourGuardFunction: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  // your  logic goes here
}
```

In your routing module, use the appropriate property in your `routes` configuration.
Here, `canActivate` tells the router to mediate navigation to this particular route.

```ts
{
  path: '/your-path',
  component: YourComponent,
  canActivate: [yourGuardFunction],
}
```

### Link parameters array

A link parameters array holds the following ingredients for router navigation:

- The path of the route to the destination component
- Required and optional route parameters that go into the route URL

Bind the `RouterLink` directive to such an array like this:

```angular-html
<a [routerLink]="['/heroes']">Heroes</a>
```

The following is a two-element array when specifying a route parameter:

```angular-html
<a [routerLink]="['/hero', hero.id]">
  <span class="badge">{{ hero.id }}</span>{{ hero.name }}
</a>
```

Provide optional route parameters in an object, as in `{ foo: 'foo' }`:

```angular-html
<a [routerLink]="['/crisis-center', { foo: 'foo' }]">Crisis Center</a>
```

These three examples cover the needs of an application with one level of routing.
However, with a child router, such as in the crisis center, you create new link array possibilities.

The following minimal `RouterLink` example builds upon a specified default child route for the crisis center.

```angular-html
<a [routerLink]="['/crisis-center']">Crisis Center</a>
```

Review the following:

- The first item in the array identifies the parent route \(`/crisis-center`\)
- There are no parameters for this parent route
- There is no default for the child route so you need to pick one
- You're navigating to the `CrisisListComponent`, whose route path is `/`, but you don't need to explicitly add the slash

Consider the following router link that navigates from the root of the application down to the Dragon Crisis:

```angular-html
<a [routerLink]="['/crisis-center', 1]">Dragon Crisis</a>
```

- The first item in the array identifies the parent route \(`/crisis-center`\)
- There are no parameters for this parent route
- The second item identifies the child route details about a particular crisis \(`/:id`\)
- The details child route requires an `id` route parameter
- You added the `id` of the Dragon Crisis as the second item in the array \(`1`\)
- The resulting path is `/crisis-center/1`

You could also redefine the `AppComponent` template with Crisis Center routes exclusively:

```angular-ts
@Component({
  template: `
    <h1 class="title">Angular Router</h1>
    <nav>
      <a [routerLink]="['/crisis-center']">Crisis Center</a>
      <a [routerLink]="['/crisis-center/1', { foo: 'foo' }]">Dragon Crisis</a>
      <a [routerLink]="['/crisis-center/2']">Shark Crisis</a>
    </nav>
    <router-outlet />
  `
})
export class AppComponent {}
```

In summary, you can write applications with one, two or more levels of routing.
The link parameters array affords the flexibility to represent any routing depth and any legal sequence of route paths, \(required\) router parameters, and \(optional\) route parameter objects.

### `LocationStrategy` and browser URL styles

When the router navigates to a new component view, it updates the browser's location and history with a URL for that view.

Modern HTML5 browsers support [history.pushState](https://developer.mozilla.org/docs/Web/API/History_API/Working_with_the_History_API#adding_and_modifying_history_entries 'HTML5 browser history push-state'), a technique that changes a browser's location and history without triggering a server page request.
The router can compose a "natural" URL that is indistinguishable from one that would otherwise require a page load.

Here's the Crisis Center URL in this "HTML5 pushState" style:

```text
localhost:3002/crisis-center
```

Older browsers send page requests to the server when the location URL changes unless the change occurs after a "#" \(called the "hash"\).
Routers can take advantage of this exception by composing in-application route URLs with hashes.
Here's a "hash URL" that routes to the Crisis Center.

```text
localhost:3002/src/#/crisis-center
```

The router supports both styles with two `LocationStrategy` providers:

| Providers              | Details                              |
| :--------------------- | :----------------------------------- |
| `PathLocationStrategy` | The default "HTML5 pushState" style. |
| `HashLocationStrategy` | The "hash URL" style.                |

The `RouterModule.forRoot()` function sets the `LocationStrategy` to the `PathLocationStrategy`, which makes it the default strategy.
You also have the option of switching to the `HashLocationStrategy` with an override during the bootstrapping process.

HELPFUL: For more information on providers and the bootstrap process, see [Dependency Injection](guide/di/dependency-injection-providers).

### Choosing a routing strategy

You must choose a routing strategy early in the development of your project because once the application is in production, visitors to your site use and depend on application URL references.

Almost all Angular projects should use the default HTML5 style.
It produces URLs that are easier for users to understand and it preserves the option to do server-side rendering.

Rendering critical pages on the server is a technique that can greatly improve perceived responsiveness when the application first loads.
An application that would otherwise take ten or more seconds to start could be rendered on the server and delivered to the user's device in less than a second.

This option is only available if application URLs look like normal web URLs without hash \(`#`\) characters in the middle.

### `<base href>`

The router uses the browser's [history.pushState](https://developer.mozilla.org/docs/Web/API/History_API/Working_with_the_History_API#adding_and_modifying_history_entries 'HTML5 browser history push-state') for navigation.
`pushState` lets you customize in-application URL paths; for example, `localhost:4200/crisis-center`.
The in-application URLs can be indistinguishable from server URLs.

Modern HTML5 browsers were the first to support `pushState` which is why many people refer to these URLs as "HTML5 style" URLs.

HELPFUL: HTML5 style navigation is the router default.
In the [LocationStrategy and browser URL styles](#locationstrategy-and-browser-url-styles) section, learn why HTML5 style is preferable, how to adjust its behavior, and how to switch to the older hash \(`#`\) style, if necessary.

You must add a [`<base href>` element](https://developer.mozilla.org/docs/Web/HTML/Element/base 'base href') to the application's `index.html` for `pushState` routing to work.
The browser uses the `<base href>` value to prefix relative URLs when referencing CSS files, scripts, and images.

Add the `<base>` element just after the `<head>` tag.
If the `app` folder is the application root, as it is for this application, set the `href` value in `index.html` as shown here.

<docs-code header="src/index.html (base-href)" path="adev/src/content/examples/router/src/index.html" visibleRegion="base-href"/>

#### HTML5 URLs and the `<base href>`

The guidelines that follow will refer to different parts of a URL.
This diagram outlines what those parts refer to:

<docs-code hideCopy language="text">
foo://example.com:8042/over/there?name=ferret#nose
\_/   \______________/\_________/ \_________/ \__/
 |           |            |            |        |
scheme    authority      path        query   fragment
</docs-code>

While the router uses the [HTML5 pushState](https://developer.mozilla.org/docs/Web/API/History_API#Adding_and_modifying_history_entries 'Browser history push-state') style by default, you must configure that strategy with a `<base href>`.

The preferred way to configure the strategy is to add a [`<base href>` element](https://developer.mozilla.org/docs/Web/HTML/Element/base 'base href') tag in the `<head>` of the `index.html`.

```angular-html
<base href="/">
```

Without that tag, the browser might not be able to load resources \(images, CSS, scripts\) when "deep linking" into the application.

Some developers might not be able to add the `<base>` element, perhaps because they don't have access to `<head>` or the `index.html`.

Those developers can still use HTML5 URLs by taking the following two steps:

1. Provide the router with an appropriate `APP_BASE_HREF` value.
1. Use root URLs \(URLs with an `authority`\) for all web resources: CSS, images, scripts, and template HTML files.

   - The `<base href>` `path` should end with a "/", as browsers ignore characters in the `path` that follow the right-most "`/`"
   - If the `<base href>` includes a `query` part, the `query` is only used if the `path` of a link in the page is empty and has no `query`.
     This means that a `query` in the `<base href>` is only included when using `HashLocationStrategy`.

   - If a link in the page is a root URL \(has an `authority`\), the `<base href>` is not used.
     In this way, an `APP_BASE_HREF` with an authority will cause all links created by Angular to ignore the `<base href>` value.

   - A fragment in the `<base href>` is _never_ persisted

For more complete information on how `<base href>` is used to construct target URIs, see the [RFC](https://tools.ietf.org/html/rfc3986#section-5.2.2) section on transforming references.

#### `HashLocationStrategy`

Use `HashLocationStrategy` by providing the `useHash: true` in an object as the second argument of the `RouterModule.forRoot()` in the `AppModule`.

```ts
providers: [
  provideRouter(appRoutes, withHashLocation())
]
```

When using `RouterModule.forRoot`, this is configured with the `useHash: true` in the second argument: `RouterModule.forRoot(routes, {useHash: true})`.

---


(From overview.md)

<docs-decorative-header title="Angular Routing" imgSrc="adev/src/assets/images/routing.svg"> <!-- markdownlint-disable-line -->
Routing helps you change what the user sees in a single-page app.
</docs-decorative-header>

In a single-page app, you change what the user sees by showing or hiding portions of the display that correspond to particular components, rather than going out to the server to get a new page.

As users perform application tasks, they need to move between the different views that you have defined.

To handle the navigation from one view to the next, you use the Angular **`Router`**.
The **`Router`** enables navigation by interpreting a browser URL as an instruction to change the view.

### Learn about Angular routing

<docs-card-container>
  <docs-card title="Common routing tasks" href="guide/routing/common-router-tasks">
    Learn how to implement many of the common tasks associated with Angular routing.
  </docs-card>
  <docs-card title="Routing SPA tutorial" href="guide/routing/router-tutorial">
    A tutorial that covers patterns associated with Angular routing.
  </docs-card>
  <docs-card title="Creating custom route matches tutorial" href="guide/routing/routing-with-urlmatcher">
    A tutorial that covers how to use custom matching strategy patterns with Angular routing.
  </docs-card>
  <docs-card title="Router reference" href="guide/routing/router-reference">
    Describes some core router API concepts.
  </docs-card>
</docs-card-container>

---


(From router-reference.md)

## Router reference

The following sections highlight some core router concepts.

### Router imports

The Angular Router is an optional service that presents a particular component view for a given URL.
It isn't part of the Angular core and thus is in its own library package, `@angular/router`.

Import what you need from it as you would from any other Angular package.

```ts
import { provideRouter } from '@angular/router';
```

HELPFUL: For more on browser URL styles, see [`LocationStrategy` and browser URL styles](guide/routing/common-router-tasks#browser-url-styles).

### Configuration

A routed Angular application has one singleton instance of the `Router` service.
When the browser's URL changes, that router looks for a corresponding `Route` from which it can determine the component to display.

A router has no routes until you configure it.
The following example creates five route definitions, configures the router via the `provideRouter` method, and adds the result to the `providers` array of the `ApplicationConfig`'.

```ts
const appRoutes: Routes = [
  { path: 'crisis-center', component: CrisisListComponent },
  { path: 'hero/:id',      component: HeroDetailComponent },
  {
    path: 'heroes',
    component: HeroListComponent,
    data: { title: 'Heroes List' }
  },
  { path: '',
    redirectTo: '/heroes',
    pathMatch: 'full'
  },
  { path: '**', component: PageNotFoundComponent }
];
export const appConfig: ApplicationConfig = {
    providers: [provideRouter(appRoutes, withDebugTracing())]
}
```

The `routes` array of routes describes how to navigate.
Pass it to the `provideRouter` method in the `ApplicationConfig` `providers` to configure the router.

Each `Route` maps a URL `path` to a component.
There are no leading slashes in the path.
The router parses and builds the final URL for you, which lets you use both relative and absolute paths when navigating between application views.

The `:id` in the second route is a token for a route parameter.
In a URL such as `/hero/42`, "42" is the value of the `id` parameter.
The corresponding `HeroDetailComponent` uses that value to find and present the hero whose `id` is 42.

The `data` property in the third route is a place to store arbitrary data associated with this specific route.
The data property is accessible within each activated route.
Use it to store items such as page titles, breadcrumb text, and other read-only, static data.
Use the resolve guard to retrieve dynamic data.

The empty path in the fourth route represents the default path for the application —the place to go when the path in the URL is empty, as it typically is at the start.
This default route redirects to the route for the `/heroes` URL and, therefore, displays the `HeroesListComponent`.

If you need to see what events are happening during the navigation lifecycle, there is the `withDebugTracing` feature.
This outputs each router event that took place during each navigation lifecycle to the browser console.
Use `withDebugTracing` only for debugging purposes.
You set the `withDebugTracing` option in the object passed as the second argument to the `provideRouter` method.

### Router outlet

The `RouterOutlet` is a directive from the router library that is used like a component.
It acts as a placeholder that marks the spot in the template where the router should display the components for that outlet.

<docs-code language="html">

<router-outlet></router-outlet>
<!-- Routed components go here -->

</docs-code>

Given the preceding configuration, when the browser URL for this application becomes `/heroes`, the router matches that URL to the route path `/heroes` and displays the `HeroListComponent` as a sibling element to the `RouterOutlet` that you've placed in the host component's template.

### Router links

To navigate as a result of some user action such as the click of an anchor tag, use `RouterLink`.

Consider the following template:

<docs-code header="src/app/app.component.html" path="adev/src/content/examples/router/src/app/app.component.1.html"/>

The `RouterLink` directives on the anchor tags give the router control over those elements.
The navigation paths are fixed, so you can assign a string as a one-time binding to the `routerLink`.

Had the navigation path been more dynamic, you could have bound to a template expression that returned an array of route link parameters; that is, the [link parameters array](guide/routing/common-router-tasks#link-parameters-array).
The router resolves that array into a complete URL.

### Active router links

The `RouterLinkActive` directive toggles CSS classes for active `RouterLink` bindings based on the current `RouterState`.

On each anchor tag, you see a [property binding](guide/templates/property-binding) to the `RouterLinkActive` directive that looks like

<docs-code hideCopy language="html">

routerLinkActive="..."

</docs-code>

The template expression to the right of the equal sign, `=`, contains a space-delimited string of CSS classes that the Router adds when this link is active and removes when the link is inactive.
You set the `RouterLinkActive` directive to a string of classes such as `routerLinkActive="active fluffy"` or bind it to a component property that returns such a string.
For example,

<docs-code hideCopy language="typescript">

[routerLinkActive]="someStringProperty"

</docs-code>

Active route links cascade down through each level of the route tree, so parent and child router links can be active at the same time.
To override this behavior, bind to the `[routerLinkActiveOptions]` input binding with the `{ exact: true }` expression.
By using `{ exact: true }`, a given `RouterLink` is only active if its URL is an exact match to the current URL.

`RouterLinkActive` also allows you to easily apply the `aria-current` attribute to the active element, thus providing a more accessible experience for all users. For more information see the Accessibility Best Practices [Active links identification section](/best-practices/a11y#active-links-identification).

### Router state

After the end of each successful navigation lifecycle, the router builds a tree of `ActivatedRoute` objects that make up the current state of the router.
You can access the current `RouterState` from anywhere in the application using the `Router` service and the `routerState` property.

Each `ActivatedRoute` in the `RouterState` provides methods to traverse up and down the route tree to get information from parent, child, and sibling routes.

### Activated route

The route path and parameters are available through an injected router service called the [ActivatedRoute](api/router/ActivatedRoute).
It has a great deal of useful information including:

| Property        | Details |
|:---             |:---     |
| `url`           | An `Observable` of the route paths, represented as an array of strings for each part of the route path.                                                                                                                                                        |
| `data`          | An `Observable` that contains the `data` object provided for the route. Also contains any resolved values from the resolve guard.                                                                                     |
| `params`        | An `Observable` that contains the required and optional parameters specific to the route.                                                                                                                 |
| `paramMap`      | An `Observable` that contains a [map](api/router/ParamMap) of the required and optional parameters specific to the route. The map supports retrieving single and multiple values from the same parameter. |
| `queryParamMap` | An `Observable` that contains a [map](api/router/ParamMap) of the query parameters available to all routes. The map supports retrieving single and multiple values from the query parameter.                       |
| `queryParams`   | An `Observable` that contains the query parameters available to all routes.                                                                                                                                        |
| `fragment`      | An `Observable` of the URL fragment available to all routes.                                                                                                                                                               |
| `outlet`        | The name of the `RouterOutlet` used to render the route. For an unnamed outlet, the outlet name is primary.                                                                                                                                                      |
| `routeConfig`   | The route configuration used for the route that contains the origin path.                                                                                                                                                                                        |
| `parent`        | The route's parent `ActivatedRoute` when this route is a child route.                                                                                                                                       |
| `firstChild`    | Contains the first `ActivatedRoute` in the list of this route's child routes.                                                                                                                                                                                    |
| `children`      | Contains all the child routes activated under the current route.                                                                                                                                            |

### Router events

During each navigation, the `Router` emits navigation events through the `Router.events` property.
These events are shown in the following table.

| Router event                                              | Details |
|:---                                                       |:---     |
| [`NavigationStart`](api/router/NavigationStart)           | Triggered when navigation starts.                                                                                                                                                     |
| [`RouteConfigLoadStart`](api/router/RouteConfigLoadStart) | Triggered before the `Router` lazy loads a route configuration.                                                                     |
| [`RouteConfigLoadEnd`](api/router/RouteConfigLoadEnd)     | Triggered after a route has been lazy loaded.                                                                                                                                         |
| [`RoutesRecognized`](api/router/RoutesRecognized)         | Triggered when the Router parses the URL and the routes are recognized.                                                                                                               |
| [`GuardsCheckStart`](api/router/GuardsCheckStart)         | Triggered when the Router begins the Guards phase of routing.                                                                                                                         |
| [`ChildActivationStart`](api/router/ChildActivationStart) | Triggered when the Router begins activating a route's children.                                                                                                                       |
| [`ActivationStart`](api/router/ActivationStart)           | Triggered when the Router begins activating a route.                                                                                                                                  |
| [`GuardsCheckEnd`](api/router/GuardsCheckEnd)             | Triggered when the Router finishes the Guards phase of routing successfully.                                                                                                          |
| [`ResolveStart`](api/router/ResolveStart)                 | Triggered when the Router begins the Resolve phase of routing.                                                                                                                        |
| [`ResolveEnd`](api/router/ResolveEnd)                     | Triggered when the Router finishes the Resolve phase of routing successfully.                                                                                                          |
| [`ChildActivationEnd`](api/router/ChildActivationEnd)     | Triggered when the Router finishes activating a route's children.                                                                                                                     |
| [`ActivationEnd`](api/router/ActivationEnd)               | Triggered when the Router finishes activating a route.                                                                                                                                |
| [`NavigationEnd`](api/router/NavigationEnd)               | Triggered when navigation ends successfully.                                                                                                                                          |
| [`NavigationCancel`](api/router/NavigationCancel)         | Triggered when navigation is canceled. This can happen when a Route Guard returns false during navigation, or redirects by returning a `UrlTree` or `RedirectCommand`. |
| [`NavigationError`](api/router/NavigationError)           | Triggered when navigation fails due to an unexpected error.                                                                                                                           |
| [`Scroll`](api/router/Scroll)                             | Represents a scrolling event.                                                                                                                                                         |

When you enable the `withDebugTracing` feature, Angular logs these events to the console.

### Router terminology

Here are the key `Router` terms and their meanings:

| Router part           | Details |
|:---                   |:---     |
| `Router`              | Displays the application component for the active URL. Manages navigation from one component to the next.                                                                                        |
| `provideRouter`       | provides the necessary service providers for navigating through application views.                                                                                        |
| `RouterModule`        | A separate NgModule that provides the necessary service providers and directives for navigating through application views.                                                                       |
| `Routes`              | Defines an array of Routes, each mapping a URL path to a component.                                                                                                                              |
| `Route`               | Defines how the router should navigate to a component based on a URL pattern. Most routes consist of a path and a component type.                                                                |
| `RouterOutlet`        | The directive \(`<router-outlet>`\) that marks where the router displays a view.                                                                                                                 |
| `RouterLink`          | The directive for binding a clickable HTML element to a route. Clicking an element with a `routerLink` directive that's bound to a *string* or a *link parameters array* triggers a navigation. |
| `RouterLinkActive`    | The directive for adding/removing classes from an HTML element when an associated `routerLink` contained on or inside the element becomes active/inactive. It can also set the `aria-current` of an active link for better accessibility.                                       |
| `ActivatedRoute`      | A service that's provided to each route component that contains route specific information such as route parameters, static data, resolve data, global query parameters, and the global fragment.   |
| `RouterState`         | The current state of the router including a tree of the currently activated routes together with convenience methods for traversing the route tree.                                              |
| Link parameters array | An array that the router interprets as a routing instruction. You can bind that array to a `RouterLink` or pass the array as an argument to the `Router.navigate` method.                        |
| Routing component     | An Angular component with a `RouterOutlet` that displays views based on router navigations.                                                                                                      |

---


(From router-tutorial.md)

## Using Angular routes in a single-page application

This tutorial describes how to build a single-page application, SPA that uses multiple Angular routes.

In a Single Page Application \(SPA\), all of your application's functions exist in a single HTML page.
As users access your application's features, the browser needs to render only the parts that matter to the user, instead of loading a new page.
This pattern can significantly improve your application's user experience.

To define how users navigate through your application, you use routes.
Add routes to define how users navigate from one part of your application to another.
You can also configure routes to guard against unexpected or unauthorized behavior.

### Objectives

* Organize a sample application's features into modules.
* Define how to navigate to a component.
* Pass information to a component using a parameter.
* Structure routes by nesting several routes.
* Check whether users can access a route.
* Control whether the application can discard unsaved changes.
* Improve performance by pre-fetching route data and lazy loading feature modules.
* Require specific criteria to load components.

### Create a sample application

Using the Angular CLI, create a new application, *angular-router-sample*.
This application will have two components: *crisis-list* and *heroes-list*.

1. Create a new Angular project, *angular-router-sample*.

    <docs-code language="shell">
    ng new angular-router-sample
    </docs-code>

    When prompted with `Would you like to add Angular routing?`, select `N`.

    When prompted with `Which stylesheet format would you like to use?`, select `CSS`.

    After a few moments, a new project, `angular-router-sample`, is ready.

1. From your terminal, navigate to the `angular-router-sample` directory.
1. Create a component, *crisis-list*.

    <docs-code language="shell">
    ng generate component crisis-list
    </docs-code>

1. In your code editor, locate the file, `crisis-list.component.html` and replace the placeholder content with the following HTML.

    <docs-code header="src/app/crisis-list/crisis-list.component.html" path="adev/src/content/examples/router-tutorial/src/app/crisis-list/crisis-list.component.html"/>

1. Create a second component, *heroes-list*.

    <docs-code language="shell">
    ng generate component heroes-list
    </docs-code>

1. In your code editor, locate the file, `heroes-list.component.html` and replace the placeholder content with the following HTML.

    <docs-code header="src/app/heroes-list/heroes-list.component.html" path="adev/src/content/examples/router-tutorial/src/app/heroes-list/heroes-list.component.html"/>

1. In your code editor, open the file, `app.component.html` and replace its contents with the following HTML.

    <docs-code header="src/app/app.component.html" path="adev/src/content/examples/router-tutorial/src/app/app.component.html" visibleRegion="setup"/>

1. Verify that your new application runs as expected by running the `ng serve` command.

    <docs-code language="shell">
    ng serve
    </docs-code>

1. Open a browser to `http://localhost:4200`.

    You should see a single web page, consisting of a title and the HTML of your two components.

### Define your routes

In this section, you'll define two routes:

* The route `/crisis-center` opens the `crisis-center` component.
* The route `/heroes-list` opens the `heroes-list` component.

A route definition is a JavaScript object.
Each route typically has two properties.
The first property, `path`, is a string that specifies the URL path for the route.
The second property, `component`, is a string that specifies what component your application should display for that path.

1. From your code editor, create and open the `app.routes.ts` file.
1. Create and export a routes list for your application:

    ```ts
    import {Routes} from '@angular/router';

    export const routes = [];
    ```

1. Add two routes for your first two components:

    ```ts
    {path: 'crisis-list', component: CrisisListComponent},
    {path: 'heroes-list', component: HeroesListComponent},
    ```

This routes list is an array of JavaScript objects, with each object defining the properties of a route.

### Import `provideRouter` from `@angular/router`

Routing lets you display specific views of your application depending on the URL path.
To add this functionality to your sample application, you need to update the `app.config.ts` file to use the router providers function, `provideRouter`.
You import this provider function from `@angular/router`.

1. From your code editor, open the `app.config.ts` file.
1. Add the following import statements:

    ```ts
    import { provideRouter } from '@angular/router';
    import { routes } from './app.routes';
    ```

1. Update the providers in the `appConfig`:

    ```ts
    providers: [provideRouter(routes)]
    ```

For `NgModule` based applications, put the `provideRouter` in the `providers` list of the `AppModule`, or whichever module is passed to `bootstrapModule` in the application.

### Update your component with `router-outlet`

At this point, you have defined two routes for your application.
However, your application still has both the `crisis-list` and `heroes-list` components hard-coded in your `app.component.html` template.
For your routes to work, you need to update your template to dynamically load a component based on the URL path.

To implement this functionality, you add the `router-outlet` directive to your template file.

1. From your code editor, open the `app.component.html` file.
1. Delete the following lines.

    <docs-code header="src/app/app.component.html" path="adev/src/content/examples/router-tutorial/src/app/app.component.html" visibleRegion="components"/>

1. Add the `router-outlet` directive.

    <docs-code header="src/app/app.component.html" path="adev/src/content/examples/router-tutorial/src/app/app.component.html" visibleRegion="router-outlet"/>

1. Add `RouterOutlet` to the imports of the `AppComponent` in `app.component.ts`

    ```ts
    imports: [RouterOutlet],
    ```

View your updated application in your browser.
You should see only the application title.
To view the `crisis-list` component, add `crisis-list` to the end of the path in your browser's address bar.
For example:

<docs-code language="http">
http://localhost:4200/crisis-list
</docs-code>

Notice that the `crisis-list` component displays.
Angular is using the route you defined to dynamically load the component.
You can load the `heroes-list` component the same way:

<docs-code language="http">
http://localhost:4200/heroes-list
</docs-code>

### Control navigation with UI elements

Currently, your application supports two routes.
However, the only way to use those routes is for the user to manually type the path in the browser's address bar.
In this section, you'll add two links that users can click to navigate between the `heroes-list` and `crisis-list` components.
You'll also add some CSS styles.
While these styles are not required, they make it easier to identify the link for the currently-displayed component.
You'll add that functionality in the next section.

1. Open the `app.component.html` file and add the following HTML below the title.

    <docs-code header="src/app/app.component.html" path="adev/src/content/examples/router-tutorial/src/app/app.component.html" visibleRegion="nav"/>

    This HTML uses an Angular directive, `routerLink`.
    This directive connects the routes you defined to your template files.

1. Add the `RouterLink` directive to the imports list of `AppComponent` in `app.component.ts`.

1. Open the `app.component.css` file and add the following styles.

    <docs-code header="src/app/app.component.css" path="adev/src/content/examples/router-tutorial/src/app/app.component.css"/>

If you view your application in the browser, you should see these two links.
When you click on a link, the corresponding component appears.

### Identify the active route

While users can navigate your application using the links you added in the previous section, they don't have a straightforward way to identify what the active route is.
Add this functionality using Angular's `routerLinkActive` directive.

1. From your code editor, open the `app.component.html` file.
1. Update the anchor tags to include the `routerLinkActive` directive.

    <docs-code header="src/app/app.component.html" path="adev/src/content/examples/router-tutorial/src/app/app.component.html" visibleRegion="routeractivelink"/>
1. Add the `RouterLinkActive` directive to the `imports` list of `AppComponent` in `app.component.ts`.

View your application again.
As you click one of the buttons, the style for that button updates automatically, identifying the active component to the user.
By adding the `routerLinkActive` directive, you inform your application to apply a specific CSS class to the active route.
In this tutorial, that CSS class is `activebutton`, but you could use any class that you want.

Note that we are also specifying a value for the `routerLinkActive`'s `ariaCurrentWhenActive`. This makes sure that visually impaired users (which may not perceive the different styling being applied) can also identify the active button. For more information see the Accessibility Best Practices [Active links identification section](/best-practices/a11y#active-links-identification).

### Adding a redirect

In this step of the tutorial, you add a route that redirects the user to display the `/heroes-list` component.

1. From your code editor, open the `app.routes.ts` file.
1. Update the `routes` section as follows.

    ```ts
    {path: '', redirectTo: '/heroes-list', pathMatch: 'full'},
    ```

    Notice that this new route uses an empty string as its path.
    In addition, it replaces the `component` property with two new ones:

    | Properties   | Details |
    |:---        |:---    |
    | `redirectTo` | This property instructs Angular to redirect from an empty path to the `heroes-list` path.                                                                                                                                                       |
    | `pathMatch`  | This property instructs Angular on how much of the URL to match. For this tutorial, you should set this property to `full`. This strategy is recommended when you have an empty string for a path. For more information about this property, see the [Route API documentation](api/router/Route). |

Now when you open your application, it displays the `heroes-list` component by default.

### Adding a 404 page

It is possible for a user to try to access a route that you have not defined.
To account for this behavior, the best practice is to display a 404 page.
In this section, you'll create a 404 page and update your route configuration to show that page for any unspecified routes.

1. From the terminal, create a new component, `PageNotFound`.

    <docs-code language="shell">
    ng generate component page-not-found
    </docs-code>

1. From your code editor, open the `page-not-found.component.html` file and replace its contents with the following HTML.

    <docs-code header="src/app/page-not-found/page-not-found.component.html" path="adev/src/content/examples/router-tutorial/src/app/page-not-found/page-not-found.component.html"/>

1. Open the `app.routes.ts` file and add the following route to the routes list:

    ```ts
    {path: '**', component: PageNotFoundComponent}
    ```

    The new route uses a path, `**`.
    This path is how Angular identifies a wildcard route.
    Any route that does not match an existing route in your configuration will use this route.

IMPORTANT: Notice that the wildcard route is placed at the end of the array.
The order of your routes is important, as Angular applies routes in order and uses the first match it finds.

Try navigating to a non-existing route on your application, such as `http://localhost:4200/powers`.
This route doesn't match anything defined in your `app.routes.ts` file.
However, because you defined a wildcard route, the application automatically displays your `PageNotFound` component.

### Next steps

At this point, you have a basic application that uses Angular's routing feature to change what components the user can see based on the URL address.
You have extended these features to include a redirect, as well as a wildcard route to display a custom 404 page.

For more information about routing, see the following topics:

<docs-pill-row>
  <docs-pill href="guide/routing/common-router-tasks" title="In-app Routing and Navigation"/>
  <docs-pill href="api/router/Router" title="Router API"/>
</docs-pill-row>

---


(From routing-with-urlmatcher.md)

## Creating custom route matches

The Angular Router supports a powerful matching strategy that you can use to help users navigate your application.
This matching strategy supports static routes, variable routes with parameters, wildcard routes, and so on.
Also, build your own custom pattern matching for situations in which the URLs are more complicated.

In this tutorial, you'll build a custom route matcher using Angular's `UrlMatcher`.
This matcher looks for a Twitter handle in the URL.

### Objectives

Implement Angular's `UrlMatcher` to create a custom route matcher.

### Create a sample application

Using the Angular CLI, create a new application, *angular-custom-route-match*.
In addition to the default Angular application framework, you will also create a *profile* component.

1. Create a new Angular project, *angular-custom-route-match*.

    ```shell
    ng new angular-custom-route-match
    ```

    When prompted with `Would you like to add Angular routing?`, select `Y`.

    When prompted with `Which stylesheet format would you like to use?`, select `CSS`.

    After a few moments, a new project, `angular-custom-route-match`, is ready.

1. From your terminal, navigate to the `angular-custom-route-match` directory.
1. Create a component, *profile*.

    ```shell
    ng generate component profile
    ```

1. In your code editor, locate the file, `profile.component.html` and replace the placeholder content with the following HTML.

    <docs-code header="src/app/profile/profile.component.html" path="adev/src/content/examples/routing-with-urlmatcher/src/app/profile/profile.component.html"/>

1. In your code editor, locate the file, `app.component.html` and replace the placeholder content with the following HTML.

    <docs-code header="src/app/app.component.html" path="adev/src/content/examples/routing-with-urlmatcher/src/app/app.component.html"/>

### Configure your routes for your application

With your application framework in place, you next need to add routing capabilities to the `app.config.ts` file.
As a part of this process, you will create a custom URL matcher that looks for a Twitter handle in the URL.
This handle is identified by a preceding `@` symbol.

1. In your code editor, open your `app.config.ts` file.
1. Add an `import` statement for Angular's `provideRouter` and `withComponentInputBinding` as well as the application routes.

    ```ts
    import {provideRouter, withComponentInputBinding} from '@angular/router';

    import {routes} from './app.routes';
    ```

1. In the providers array, add a `provideRouter(routes, withComponentInputBinding())` statement.

1. Define the custom route matcher by adding the following code to the application routes.

    <docs-code header="src/app/app.routes.ts" path="adev/src/content/examples/routing-with-urlmatcher/src/app/app.routes.ts" visibleRegion="matcher"/>

This custom matcher is a function that performs the following tasks:

* The matcher verifies that the array contains only one segment
* The matcher employs a regular expression to ensure that the format of the username is a match
* If there is a match, the function returns the entire URL, defining a `username` route parameter as a substring of the path
* If there isn't a match, the function returns null and the router continues to look for other routes that match the URL

HELPFUL: A custom URL matcher behaves like any other route definition. Define child routes or lazy loaded routes as you would with any other route.

### Reading the route parameters

With the custom matcher in place, you can now bind the route parameter in the `profile` component.

In your code editor, open your `profile.component.ts` file and create an `Input` matching the `username` parameter.
We added the `withComponentInputBinding` feature earlier
in `provideRouter`. This allows the `Router` to bind information directly to the route components.

```ts
@Input() username!: string;
```

### Test your custom URL matcher

With your code in place, you can now test your custom URL matcher.

1. From a terminal window, run the `ng serve` command.

    <docs-code language="shell">
    ng serve
    </docs-code>

1. Open a browser to `http://localhost:4200`.

    You should see a single web page, consisting of a sentence that reads `Navigate to my profile`.

1. Click the **my profile** hyperlink.

    A new sentence, reading `Hello, Angular!` appears on the page.

### Next steps

Pattern matching with the Angular Router provides you with a lot of flexibility when you have dynamic URLs in your application.
To learn more about the Angular Router, see the following topics:

<docs-pill-row>
  <docs-pill href="guide/routing/common-router-tasks" title="In-app Routing and Navigation"/>
  <docs-pill href="api/router/Router" title="Router API"/>
</docs-pill-row>

HELPFUL: This content is based on [Custom Route Matching with the Angular Router](https://medium.com/@brandontroberts/custom-route-matching-with-the-angular-router-fbdd48665483), by [Brandon Roberts](https://twitter.com/brandontroberts).

---