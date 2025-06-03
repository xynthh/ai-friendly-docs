# Guide Routing

(From common-router-tasks.md)

## Other common Routing Tasks

This guide covers some other common tasks associated with using Angular router in your application.

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

---


(From define-routes.md)

## Define routes

Routes serve as the fundamental building blocks for navigation within an Angular app.

### What are routes?

In Angular, a **route** is an object that defines which component should render for a specific URL path or pattern, as well as additional configuration options about what happens when a user navigates to that URL.

Here is a basic example of a route:

```angular-ts
import { AdminPage } from './app-admin/app-admin.component';

const adminPage = {
  path: 'admin',
  component: AdminPage
}
```

For this route, when a user visits the `/admin` path, the app will display the `AdminPage` component.

#### Managing routes in your application

Most projects define routes in a separate file that contains `routes` in the filename.

A collection of routes looks like this:

```angular-ts
import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page.component';
import { AdminPage } from './about-page/admin-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'admin',
    component: AdminPage,
  },
];
```

Tip: If you generated a project with Angular CLI, your routes are defined in `src/app/app.routes.ts`.

#### Adding the router to your application

When bootstrapping an Angular application without the Angular CLI, you can pass a configuration object that includes a `providers` array.

Inside of the `providers` array, you can add the Angular router to your application by adding a `provideRouter` function call with your routes.

```angular-ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // ...
  ]
};
```

### Route URL Paths

#### Static URL Paths

Static URL Paths refer to routes with predefined paths that don't change based on dynamic parameters. These are routes that match a `path` string exactly and have a fixed outcome.

Examples of this include:

- "/admin"
- "/blog"
- "/settings/account"

#### Define URL Paths with Route Parameters

Parameterized URLs allow you to define dynamic paths that allow multiple URLs to the same component while dynamically displaying data based on parameters in the URL.

You can define this type of pattern by adding parameters to your route’s `path` string and prefixing each parameter with the colon (`:`) character.

IMPORTANT: Parameters are distinct from information in the URL's [query string](https://en.wikipedia.org/wiki/Query_string).
Learn more about [query parameters in Angular in this guide](/guide/routing/read-route-state#query-parameters).

The following example displays a user profile component based on the user id passed in through the URL.

```angular-ts
import { Routes } from '@angular/router';
import { UserProfile } from './user-profile/user-profile;

const routes: Routes = [
  { path: 'user/:id', component: UserProfile }
];
```

In this example, URLs such as `/user/leeroy` and `/user/jenkins` render the `UserProfile` component. This component can then read the `id` parameter and use it to perform additional work, such as fetching data. See [reading route state guide](/guide/routing/read-route-state) for details on reading route parameters.

Valid route parameter names must start with a letter (a-z, A-Z) and can only contain:

- Letters (a-z, A-Z)
- Numbers (0-9)
- Underscore (\_)
- Hyphen (-)

You can also define paths with multiple parameters:

```angular-ts
import { Routes } from '@angular/router';
import { UserProfile } from './user-profile/user-profile.component';
import { SocialMediaFeed } from './user-profile/social–media-feed.component';

const routes: Routes = [
  { path: 'user/:id/:social-media', component: SocialMediaFeed },
  { path: 'user/:id/', component: UserProfile },
];
```

With this new path, users can visit `/user/leeroy/youtube` and `/user/leeroy/bluesky` and see respective social media feeds based on the parameter for the user leeroy.

See [Reading route state](/guide/router/reading-route-state) for details on reading route parameters.

#### Wildcards

When you need to catch all routes for a specific path, the solution is a wildcard route which is defined with the double asterisk (`**`).

A common example is defining a Page Not Found component.

```angular-ts
import { Home } from './home/home.component';
import { UserProfile } from './user-profile/user-profile.component';
import { NotFound } from './not-found/not-found.component';

const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'user/:id', component: UserProfile },
  { path: '**', component: NotFound }
];
```

In this routes array, the app displays the `NotFound` component when the user visits any path outside of `home` and `user/:id`.

Tip: Wildcard routes are typically placed at the end of a routes array.

### How Angular matches URLs

When you define routes, the order is important because Angular uses a first-match wins strategy. This means that once Angular matches a URL with a route `path`, it stops checking any further routes. As a result, always put more specific routes before less specific routes.

The following example shows routes defined from most-specific to least specific:

```angular-ts
const routes: Routes = [
  { path: '', component: HomeComponent },              // Empty path
  { path: 'users/new', component: NewUserComponent },  // Static, most specific
  { path: 'users/:id', component: UserDetailComponent }, // Dynamic
  { path: 'users', component: UsersComponent },        // Static, less specific
  { path: '**', component: NotFoundComponent }         // Wildcard - always last
];
```

If a user visits `/users/new`, Angular router would go through the following steps:

1. Checks `''` - doesn't match
1. Checks `users/new` - matches! Stops here
1. Never reaches `users/:id` even though it could match
1. Never reaches `users`
1. Never reaches `**`

### Loading Route Component Strategies

Understanding how and when components load in Angular routing is crucial for building responsive web applications. Angular offers two primary strategies to control component loading behavior:

1. **Eagerly loaded**: Components that are loaded immediately
2. **Lazily loaded**: Components loaded only when needed

Each approach offers distinct advantages for different scenarios.

#### Eagerly loaded components

When you define a route with the `component` property, the referenced component is eagerly loaded as part of the same JavaScript bundle as the route configuration.

```angular-ts
import { Routes } from "@angular/router";
import { HomePage } from "./components/home/home-page"
import { LoginPage } from "./components/auth/login-page"

export const routes: Routes = [
  // HomePage and LoginPage are both directly referenced in this config,
  // so their code is eagerly included in the same JavaScript bundle as this file.
  {
    path: "",
    component: HomePage
  },
  {
    path: "login",
    component: LoginPage
  }
]
```

Eagerly loading route components like this means that the browser has to download and parse all of the JavaScript for these components as part of your initial page load, but the components are available to Angular immediately.

While including more JavaScript in your initial page load leads to slower initial load times, this can lead to more seamless transitions as the user navigates through an application.

#### Lazily loaded components

You can use the `loadComponent` property to lazily load the JavaScript for a route only at the point at which that route would become active.

```angular-ts
import { Routes } from "@angular/router";

export const routes: Routes = [
  // The HomePage and LoginPage components are loaded lazily at the point at which
  // their corresponding routes become active.
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login-page')
  },
  {
    path: ',
    loadComponent: () => import('./components/home/home-page')
  }
]
```

The `loadComponent` property accepts a loader function that returns a Promise that resolves to an Angular component. In most cases, this function uses the standard [JavaScript dynamic import API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import). You can, however, use any arbitrary async loader function.

Lazily loading routes can significantly improve the load speed of your Angular application by removing large portions of JavaScript from the initial bundle. These portions of your code compile into separate JavaScript "chunks" that the router requests only when the user visits the corresponding route.

#### Should I use an eager or a lazy route?

There are many factors to consider when deciding on whether a route should be eager or lazy.

In general, eager loading is recommended for primary landing page(s) while other pages would be lazy-loaded.

Note: While lazy routes have the upfront performance benefit of reducing the amount of initial data requested by the user, it adds future data requests that could be undesirable. This is particularly true when dealing with nested lazy loading at multiple levels, which can significantly impact performance.

### Redirects

You can define a route that redirects to another route instead of rendering a component:

```angular-ts
import { BlogComponent } from './home/blog.component';

const routes: Routes = [
  {
    path: 'articles',
    redirectTo: '/blog',
  },
  {
    path: 'blog',
    component: BlogComponent
  },
];
```

If you modify or remove a route, some users may still click on out-of-date links or bookmarks to that route. You can add a redirect to direct those users to an appropriate alternative route instead of a "not found" page.

### Page titles

You can associate a **title** with each route. Angular automatically updates the [page title](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title) when a route activates. Always define appropriate page titles for your application, as these titles are necessary to create an accessible experience.

```angular-ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ProductsComponent } from './products/products.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home Page'
  },
  {
    path: 'about',
    component: AboutComponent,
    title: 'About Us'
  },
  {
    path: 'products',
    component: ProductsComponent,
    title: 'Our Products'
  }
];
```

### Route-level providers for dependency injection

Each route has a `providers` property that lets you provide dependencies to that route's content via [dependency injection](/guide/di).

Common scenarios where this can be helpful include applications that have different services based on whether the user is an admin or not.

```angular-ts
export const ROUTES: Route[] = [
  {
    path: 'admin',
    providers: [
      AdminService,
      {provide: ADMIN_API_KEY, useValue: '12345'},
    ],
    children: [
      {path: 'users', component: AdminUsersComponent},
      {path: 'teams', component: AdminTeamsComponent},
    ],
  },
  // ... other application routes that don't
  //     have access to ADMIN_API_KEY or AdminService.
];
```

In this code sample, the `admin` path contains a protected data property of `ADMIN_API_KEY` that is only available to children within its section. As a result, no other paths will be able to access the data provided via `ADMIN_AP

See the [Dependency injection guide](/guide/di) for more information about providers and injection in Angular.

### Associating data with routes

Route data enables you to attach additional information to routes. You are able to configure how components behave based on this data.

There are two ways to work with route data: static data that remains constant, and dynamic data that can change based on runtime conditions.

#### Static data

You can associate arbitrary static data with a route via the `data` property in order to centralize things like route-specific metadata (e.g., analytics tracking, permissions, etc.):

```angular-ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ProductsComponent } from './products/products.component';

const routes: Routes = [
  {
    path: 'about',
    component: AboutComponent,
    data: { analyticsId: '456' }
  },
  {
    path: '',
    component: HomeComponent,
    data: { analyticsId: '123' }
  }
];
```

In this code sample, the home and about page are configured with specific `analyticsId` which would then be used in their respective components for page tracking analytics.

You can read this static data by injecting the `ActivatedRoute`. See [Reading route state](/guide/router/reading-route-state) for details.

#### Dynamic data with data resolvers

When you need to provide dynamic data to a route, check out the [guide on route data resolvers](/guide/router/route-data-resolvers).

### Nested Routes

Nested routes, also known as child routes, are a common technique for managing more complex navigation routes where a component has a sub-view that changes based on the URL.

<img alt="Diagram to illustrate nested routes" src="assets/images/guide/router/nested-routing-diagram.svg">

You can add child routes to any route definition with the `children` property:

```angular-ts
const routes: Routes = [
  path: 'product/:id',
  component: 'ProductComponent',
  children: [
    {
      path: 'info',
      component: ProductInfoComponent
    },
    {
      path: 'reviews',
      component: ProductReviewsComponent
    }
  ]
]
```

The above example defines a route for a product page that allows a user to change whether the product info or reviews are displayed based on the url.

The `children` property accepts an array of `Route` objects.

To display child routes, the parent component (`ProductComponent` in the example above) includes its own `<router-outlet>`.

```angular-html
<!-- ProductComponent -->
<article>
  <h1>Product {{ id }}</h1>
  <router-outlet />
</article>
```

After adding child routes to the configuration and adding a `<router-outlet>` to the component, navigation between URLs that match the child routes updates only the nested outlet.

### Next steps

Learn how to [display the contents of your routes with Outlets](/guide/routing/show-routes-with-outlets).

---


(From navigate-to-routes.md)

## Navigate to routes

The RouterLink directive is Angular's declarative approach to navigation. It allows you to use standard anchor elements (`<a>`) that seamlessly integrate with Angular's routing system.

### How to use RouterLink

Instead of using regular anchor elements `<a>` with an `href` attribute, you add a RouterLink directive with the appropriate path in order to leverage Angular routing.

```angular-html
<nav>
  <a routerLink="/user-profile">User profile</a>
  <a routerLink="/settings">Settings</a>
</nav>
```

#### Using absolute or relative links

**Relative URLs** in Angular routing allow you to define navigation paths relative to the current route's location. This is in contrast to **absolute URLs** which contain the full path with the protocol (e.g., `http://`) and the **root domain** (e.g., `google.com`).

```angular-html
<!-- Absolute URL -->
<a href="https://www.angular.dev/essentials">Angular Essentials Guide</a>

<!-- Relative URL -->
<a href="/essentials">Angular Essentials Guide</a>
```

In this example, the first example contains the full path with the protocol (i.e., `https://`) and the root domain (i.e., `angular.dev`) explicitly defined for the essentials page. In contrast, the second example assumes the user is already on the correct root domain for `/essentials`.

Generally speaking, relative URLs are preferred because they are more maintainable across applications because they don’t need to know their absolute position within the routing hierarchy.

#### How relative URLs work

Angular routing has two syntaxes for defining relative URLs: strings and arrays.

```angular-html
<!-- Navigates user to /dashboard -->
<a routerLink="dashboard">Dashboard</a>
<a [routerLink]="['dashboard']">Dashboard</a>
```

HELPFUL: Passing a string is the most common way to define relative URLs.

When you need to define dynamic parameters in a relative URL, use the array syntax:

```angular-html
<a [routerLink]="['user', currentUserId]">Current User</a>
```

In addition, Angular routing allows you specify whether you want the path to be relative to the current URL or to the root domain based on whether the relative path is prefixed with a forward slash (`/`) or not.

For example, if the user is on `example.com/settings`, here is how different relative paths can be defined for various scenarios:

```angular-html
<!-- Navigates to /settings/notifications -->
<a routerLink="notifications">Notifications</a>
<a routerLink="/settings/notifications">Notifications</a>

<!-- Navigates to /team/:teamId/user/:userId -->
<a routerLink="/team/123/user/456">User 456</a>
<a [routerLink]="['/team', teamId, 'user', userId]">Current User</a>”
```

### Programmatic navigation to routes

While `RouterLink` handles declarative navigation in templates, Angular provides programmatic navigation for scenarios where you need to navigate based on logic, user actions, or application state. By injecting `Router`, you can dynamically navigate to routes, pass parameters, and control navigation behavior in your TypeScript code.

#### `router.navigate()`

You can use the `router.navigate()` method to programmatically navigate between routes by specifying a URL path array.

```angular-ts
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  template: `
    <button (click)="navigateToProfile()">View Profile</button>
  `
})
export class AppDashboard {
  private router = inject(Router);

  navigateToProfile() {
    // Standard navigation
    this.router.navigate(['/profile']);

    // With route parameters
    this.router.navigate(['/users', userId]);

    // With query parameters
    this.router.navigate(['/search'], {
      queryParams: { category: 'books', sort: 'price' }
    });
  }
}
```

`router.navigate()` supports both simple and complex routing scenarios, allowing you to pass route parameters, [query parameters](/guide/routing/read-route-state#query-parameters), and control navigation behavior.

You can also build dynamic navigation paths relative to your component’s location in the routing tree using the `relativeTo` option.

```angular-ts
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-detail',
  template: `
    <button (click)="navigateToEdit()">Edit User</button>
    <button (click)="navigateToParent()">Back to List</button>
  `
})
export class UserDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {}

  // Navigate to a sibling route
  navigateToEdit() {
    // From: /users/123
    // To:   /users/123/edit
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  // Navigate to parent
  navigateToParent() {
    // From: /users/123
    // To:   /users
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
```

#### `router.navigateByUrl()`

The `router.navigateByUrl()` method provides a direct way to programmatically navigate using URL path strings rather than array segments. This method is ideal when you have a full URL path and need to perform absolute navigation, especially when working with externally provided URLs or deep linking scenarios.

```angular-ts
// Standard route navigation
router.navigateByUrl('/products);

// Navigate to nested route
router.navigateByUrl('/products/featured');

// Complete URL with parameters and fragment
router.navigateByUrl('/products/123?view=details#reviews');

// Navigate with query parameters
router.navigateByUrl('/search?category=books&sortBy=price');
```

In the event you need to replace the current URL in history, `navigateByUrl` also accepts a configuration object that has a `replaceUrl` option.

```angular-ts
// Replace current URL in history
router.navigateByUrl('/checkout', {
  replaceUrl: true
});
```

### Next steps

Learn how to [read route state](/guide/routing/read-route-state) to create responsive and context-aware components.

---


(From overview.md)

<docs-decorative-header title="Angular Routing" imgSrc="adev/src/assets/images/routing.svg"> <!-- markdownlint-disable-line -->
Routing helps you change what the user sees in a single-page app.
</docs-decorative-header>

Angular Router (`@angular/router`) is the official library for managing navigation in Angular applications and a core part of the framework. It is included by default in all projects created by Angular CLI.

### Installation

Angular Router is included by default in all Angular projects setup with the Angular CLI `ng new` command.

#### Prerequisite

- Angular CLI

#### Add to an existing project

If your project does not have routing, you can install it manually with the following command:

```bash
ng add @angular/router
```

The Angular CLI will then install all the necessary dependencies.

### Why is routing necessary in a SPA?

When you navigate to a URL in your web browser, the browser normally makes a network request to a web server and displays the returned HTML page. When you navigate to a different URL, such as clicking a link, the browser makes another network request and replaces the entire page with a new one.

A single-page application (SPA) differs in that the browser only makes a request to a web server for the first page, the `index.html`. After that, a client-side router takes over, controlling which content displays based on the URL. When a user navigates to a different URL, the router updates the page's content in place without triggering a full-page reload.

### How Angular manages routing

Routing in Angular is comprised of three primary parts:

1. **Routes** define which component displays when a user visits a specific URL.
2. **Outlets** are placeholders in your templates that dynamically load and render components based on the active route.
3. **Links** provide a way for users to navigate between different routes in your application without triggering a full page reload.

In addition, the Angular Routing library offers additional functionality such as:

- Nested routes
- Programmatic navigation
- Route params, queries and wildcards
- Activated route information with `ActivatedRoute`
- View transition effects
- Navigation guards

### Next steps

Learn about how you can [define routes using Angular router](/guide/routing/define-routes).

---


(From read-route-state.md)

## Read route state

Angular Router allows you to read and use information associated with a route to create responsive and context-aware components.

### Get information about the current route with ActivatedRoute

`ActivatedRoute` is a service from `@angular/router` that provides all the information associated with the current route.

```angular-ts
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product',
})
export class ProductComponent {
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    console.log(this.activatedRoute);
  }
}
```

The `ActivatedRoute` can provide different information about the route. Some common properties include:

| Property      | Details                                                                                                                           |
| :------------ | :-------------------------------------------------------------------------------------------------------------------------------- |
| `url`         | An `Observable` of the route paths, represented as an array of strings for each part of the route path.                           |
| `data`        | An `Observable` that contains the `data` object provided for the route. Also contains any resolved values from the resolve guard. |
| `params`      | An `Observable` that contains the required and optional parameters specific to the route.                                         |
| `queryParams` | An `Observable` that contains the query parameters available to all routes.                                                       |

Check out the [`ActivatedRoute` API docs](/api/router/ActivatedRoute) for a complete list of what you can access with in the route.

### Understanding route snapshots

Page navigations are events over time, and you can access the router state at a given time by retrieving a route snapshot.

Route snapshots contain essential information about the route, including its parameters, data, and child routes. In addition, snapshots are static and will not reflect future changes.

Here’s an example of how you’d access a route snapshot:

```angular-ts
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

@Component({ ... })
export class UserProfileComponent {
  readonly userId: string;
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    // Example URL: https://www.angular.dev/users/123?role=admin&status=active#contact

    // Access route parameters from snapshot
    this.userId = this.route.snapshot.paramMap.get('id');

    // Access multiple route elements
    const snapshot = this.route.snapshot;
    console.log({
      url: snapshot.url,           // https://www.angular.dev
      // Route parameters object: {id: '123'}
      params: snapshot.params,
      // Query parameters object: {role: 'admin', status: 'active'}
      queryParams: snapshot.queryParams,  // Query parameters
    });
  }
}
```

Check out the [`ActivatedRoute` API docs](/api/router/ActivatedRoute) and [`ActivatedRouteSnapshot` API docs](/api/router/ActivatedRouteSnapshot) for a complete list of all properties you can access.

### Reading parameters on a route

There are two types of parameters that developers can utilize from a route: route and query parameters.

#### Route Parameters

Route parameters allow you to pass data to a component through the URL. This is useful when you want to display specific content based on an identifier in the URL, like a user ID or a product ID.

You can [define route parameters](/guide/routing/define-routes#define-url-paths-with-route-parameters) by prefixing the parameter name with a colon (`:`).

```angular-ts
import { Routes } from '@angular/router';
import { ProductComponent } from './product/product.component';

const routes: Routes = [
  { path: 'product/:id', component: ProductComponent }
];
```

You can access parameters by subscribing to `route.params`.

```angular-ts
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  template: `<h1>Product Details: {{ productId() }}</h1>`,
})
export class ProductDetailComponent {
  productId = signal('');
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    // Access route parameters
    this.activatedRoute.params.subscribe((params) => {
      this.productId.set(params['id']);
    });
  }
}
```

#### Query Parameters

[Query parameters](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) provide a flexible way to pass optional data through URLs without affecting the route structure. Unlike route parameters, query parameters can persist across navigation events and are perfect for handling filtering, sorting, pagination, and other stateful UI elements.

```angular-ts
// Single parameter structure
// /products?category=electronics
router.navigate(['/products'], {
  queryParams: { category: 'electronics' }
});

// Multiple parameters
// /products?category=electronics&sort=price&page=1
router.navigate(['/products'], {
  queryParams: {
    category: 'electronics',
    sort: 'price',
    page: 1
  }
});
```

You can access query parameters with `route.queryParams`.

Here is an example of a `ProductListComponent` that updates the query parameters that affect how it displays a list of products:

```angular-ts
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  template: `
    <div>
      <select (change)="updateSort($event)">
        <option value="price">Price</option>
        <option value="name">Name</option>
      </select>
      <!-- Products list -->
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
    // Access query parameters reactively
    this.route.queryParams.subscribe(params => {
      const sort = params['sort'] || 'price';
      const page = Number(params['page']) || 1;
      this.loadProducts(sort, page);
    });
  }

  updateSort(event: Event) {
    const sort = (event.target as HTMLSelectElement).value;
    // Update URL with new query parameter
    this.router.navigate([], {
      queryParams: { sort },
      queryParamsHandling: 'merge' // Preserve other query parameters
    });
  }
}
```

In this example, users can use a select element to sort the product list by name or price. The associated change handler updates the URL’s query parameters, which in turn triggers a change event that can read the updated query parameters and update the product list.

For more information, check out the [official docs on QueryParamsHandling](/api/router/QueryParamsHandling).

### Detect active current route with RouterLinkActive

You can use the `RouterLinkActive` directive to dynamically style navigation elements based on the current active route. This is common in navigation elements to inform users what the active route is.

```angular-html
<nav>
  <a class="button"
     routerLink="/about"
     routerLinkActive="active-button"
     ariaCurrentWhenActive="page">
    About
  </a> |
  <a class="button"
     routerLink="/settings"
     routerLinkActive="active-button"
     ariaCurrentWhenActive="page">
    Settings
  </a>
</nav>
```

In this example, Angular Router will apply the `active-button` class to the correct anchor link and `ariaCurrentWhenActive` to `page` when the URL matches the corresponding `routerLink`.

If you need to add multiple classes onto the element, you can use either a space-separated string or an array:

```angular-html
<!-- Space-separated string syntax -->
<a routerLink="/user/bob" routerLinkActive="class1 class2">Bob</a>

<!-- Array syntax -->
<a routerLink="/user/bob" [routerLinkActive]="['class1', 'class2']">Bob</a>
```

When you specify a value for routerLinkActive, you are also defining the same value for `ariaCurrentWhenActive`. This makes sure that visually impaired users (which may not perceive the different styling being applied) can also identify the active button.

If you want to define a different value for aria, you’ll need to explicitly set the value using the `ariaCurrentWhenActive` directive.

#### Route matching strategy

By default, `RouterLinkActive` considers any ancestors in the route a match.

```angular-html
<a [routerLink]="['/user/jane']" routerLinkActive="active-link">
  User
</a>
<a [routerLink]="['/user/jane/role/admin']" routerLinkActive="active-link">
  Role
</a>
```

When the user visits `/user/jane/role/admin`, both links would have the `active-link` class.

#### Only apply RouterLinkActive on exact route matches

If you only want to apply the class on an exact match, you need to provide the `routerLinkActiveOptions` directive with a configuration object that contains the value `exact: true`.

```angular-html
<a [routerLink]="['/user/jane']"
  routerLinkActive="active-link"
  [routerLinkActiveOptions]="{exact: true}"
>
  User
</a>
<a [routerLink]="['/user/jane/role/admin']"
  routerLinkActive="active-link"
  [routerLinkActiveOptions]="{exact: true}"
>
  Role
</a>
```

If you want to be more precise in how a route is matched, it’s worth noting that `exact: true` is actually syntactic sugar for the full set of matching options:

```angular-ts
// `exact: true` is equivalent to
{
  paths: 'exact',
  fragment: 'ignored',
  matrixParams: 'ignored',
  queryParams: 'exact',
}

// `exact: false` is equivalent
{
  paths: 'subset',
  fragment: 'ignored',
  matrixParams: 'ignored',
  queryParams: 'subset',
}
```

For more information, check out the official docs for [isActiveMatchOptions](/api/router/IsActiveMatchOptions).

#### Apply RouterLinkActive to an ancestor

The RouterLinkActive directive can also be applied to an ancestor element in order to allow developers to style the elements as desired.

```angular-html
<div routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
  <a routerLink="/user/jim">Jim</a>
  <a routerLink="/user/bob">Bob</a>
</div>
```

For more information, check out the [API docs for RouterLinkActive](/api/router/RouterLinkActive).

---


(From router-reference.md)

## Router reference

The following sections highlight some core router concepts and terminology.

### Router events

During each navigation, the `Router` emits navigation events through the `Router.events` property.
These events are shown in the following table.

| Router event                                              | Details                                                                                                                                                                |
| :-------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`NavigationStart`](api/router/NavigationStart)           | Triggered when navigation starts.                                                                                                                                      |
| [`RouteConfigLoadStart`](api/router/RouteConfigLoadStart) | Triggered before the `Router` lazy loads a route configuration.                                                                                                        |
| [`RouteConfigLoadEnd`](api/router/RouteConfigLoadEnd)     | Triggered after a route has been lazy loaded.                                                                                                                          |
| [`RoutesRecognized`](api/router/RoutesRecognized)         | Triggered when the Router parses the URL and the routes are recognized.                                                                                                |
| [`GuardsCheckStart`](api/router/GuardsCheckStart)         | Triggered when the Router begins the Guards phase of routing.                                                                                                          |
| [`ChildActivationStart`](api/router/ChildActivationStart) | Triggered when the Router begins activating a route's children.                                                                                                        |
| [`ActivationStart`](api/router/ActivationStart)           | Triggered when the Router begins activating a route.                                                                                                                   |
| [`GuardsCheckEnd`](api/router/GuardsCheckEnd)             | Triggered when the Router finishes the Guards phase of routing successfully.                                                                                           |
| [`ResolveStart`](api/router/ResolveStart)                 | Triggered when the Router begins the Resolve phase of routing.                                                                                                         |
| [`ResolveEnd`](api/router/ResolveEnd)                     | Triggered when the Router finishes the Resolve phase of routing successfully.                                                                                          |
| [`ChildActivationEnd`](api/router/ChildActivationEnd)     | Triggered when the Router finishes activating a route's children.                                                                                                      |
| [`ActivationEnd`](api/router/ActivationEnd)               | Triggered when the Router finishes activating a route.                                                                                                                 |
| [`NavigationEnd`](api/router/NavigationEnd)               | Triggered when navigation ends successfully.                                                                                                                           |
| [`NavigationCancel`](api/router/NavigationCancel)         | Triggered when navigation is canceled. This can happen when a Route Guard returns false during navigation, or redirects by returning a `UrlTree` or `RedirectCommand`. |
| [`NavigationError`](api/router/NavigationError)           | Triggered when navigation fails due to an unexpected error.                                                                                                            |
| [`Scroll`](api/router/Scroll)                             | Represents a scrolling event.                                                                                                                                          |

When you enable the `withDebugTracing` feature, Angular logs these events to the console.

### Router terminology

Here are the key `Router` terms and their meanings:

| Router part           | Details                                                                                                                                                                                                                                   |
| :-------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Router`              | Displays the application component for the active URL. Manages navigation from one component to the next.                                                                                                                                 |
| `provideRouter`       | provides the necessary service providers for navigating through application views.                                                                                                                                                        |
| `RouterModule`        | A separate NgModule that provides the necessary service providers and directives for navigating through application views.                                                                                                                |
| `Routes`              | Defines an array of Routes, each mapping a URL path to a component.                                                                                                                                                                       |
| `Route`               | Defines how the router should navigate to a component based on a URL pattern. Most routes consist of a path and a component type.                                                                                                         |
| `RouterOutlet`        | The directive \(`<router-outlet>`\) that marks where the router displays a view.                                                                                                                                                          |
| `RouterLink`          | The directive for binding a clickable HTML element to a route. Clicking an element with a `routerLink` directive that's bound to a _string_ or a _link parameters array_ triggers a navigation.                                           |
| `RouterLinkActive`    | The directive for adding/removing classes from an HTML element when an associated `routerLink` contained on or inside the element becomes active/inactive. It can also set the `aria-current` of an active link for better accessibility. |
| `ActivatedRoute`      | A service that's provided to each route component that contains route specific information such as route parameters, static data, resolve data, global query parameters, and the global fragment.                                         |
| `RouterState`         | The current state of the router including a tree of the currently activated routes together with convenience methods for traversing the route tree.                                                                                       |
| Link parameters array | An array that the router interprets as a routing instruction. You can bind that array to a `RouterLink` or pass the array as an argument to the `Router.navigate` method.                                                                 |
| Routing component     | An Angular component with a `RouterOutlet` that displays views based on router navigations.                                                                                                                                               |

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


(From show-routes-with-outlets.md)

## Show routes with outlets

The `RouterOutlet` directive is a placeholder that marks the location where the router should render the component for the current URL.

```angular-html
<app-header />
<router-outlet />  <!-- Angular inserts your route content here -->
<app-footer />
```

```angular-ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {}
```

In this example, if an application has the following routes defined:

```angular-ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home Page'
  },
  {
    path: 'products',
    component: ProductsComponent,
    title: 'Our Products'
  }
];
```

When a user visits `/products`, Angular renders the following:

```angular-html
<app-header></app-header>
<app-products></app-products>
<app-footer></app-footer>
```

If the user goes back to the home page, then Angular renders:

```angular-html
<app-header></app-header>
<app-home></app-home>
<app-footer></app-footer>
```

When displaying a route, the `<router-outlet>` element remains present in the DOM as a reference point for future navigations. Angular inserts routed content just after the outlet element as a sibling.

```angular-html
<!-- Contents of the component's template -->
<app-header />
<router-outlet />
<app-footer />
```

```angular-html
<!-- Content rendered on the page when the user visits /admin -->
<app-header>...</app-header>
<router-outlet></router-outlet>
<app-admin-page>...</app-admin-page>
<app-footer>...</app-footer>
```

### Nesting routes with child routes

As your application grows more complex, you might want to create routes that are relative to a component other than your root component. This enables you to create experiences where only part of the application changes when the URL changes, as opposed to the users feeling like the entire page is refreshed.

These types of nested routes are called child routes. This means you're adding a second `<router-outlet>` to your app, because it is in addition to the `<router-outlet>` in AppComponent.

In this example, the `Settings` component will display the desired panel based on what the user selects. One of the unique things you’ll notice about child routes is that the component often has its own `<nav>` and `<router-outlet>`.

```angular-html
<h1>Settings</h1>
<nav>
  <ul>
    <li><a routerLink="profile">Profile</a></li>
    <li><a routerLink="security">Security</a></li>
  </ul>
</nav>
<router-outlet />
```

A child route is like any other route, in that it needs both a `path` and a `component`. The one difference is that you place child routes in a children array within the parent route.

```angular-ts
const routes: Routes = [
  {
    path: 'settings-component',
    component: SettingsComponent, // this is the component with the <router-outlet> in the template
    children: [
      {
        path: 'profile', // child route path
        component: ProfileComponent, // child route component that the router renders
      },
      {
        path: 'security',
        component: SecurityComponent, // another child route component that the router renders
      },
    ],
  },
];
```

Once both the `routes` and `<router-outlet>` are configured correctly, your application is now using nested routes!

### Secondary routes with named outlets

Pages may have multiple outlets— you can assign a name to each outlet to specify which content belongs to which outlet.

```angular-html
<app-header />
<router-outlet />
<router-outlet name='read-more' />
<router-outlet name='additional-actions' />
<app-footer />
```

Each outlet must have a unique name. The name cannot be set or changed dynamically. By default, the name is `'primary'`.

Angular matches the outlet's name to the `outlet` property defined on each route:

```angular-ts
{
  path: 'user/:id',
  component: UserDetails,
  outlet: 'additional-actions'
}
```

### Outlet lifecycle events

There are four lifecycle events that a router outlet can emit:

| Event        | Description                                                              |
| ------------ | ------------------------------------------------------------------------ |
| `activate`   | When a new component is instantiated                                     |
| `deactivate` | When a component is destroyed                                            |
| `attach`     | When the `RouteReuseStrategy` instructs the outlet to attach the subtree |
| `detach`     | When the `RouteReuseStrategy` instructs the outlet to detach the subtree |

You can add event listeners with the standard event binding syntax:

```angular-html
<router-outlet
  (activate)='onActivate($event)'
  (deactivate)='onDeactivate($event)'
  (attach)='onAttach($event)'
  (detach)='onDetach($event)'
/>
```

Check out the [API docs for RouterOutlet](/api/router/RouterOutlet?tab=api) if you’d like to learn more.

### Next steps

Learn how to [navigate to routes](/guide/routing/navigate-to-routes) with Angular Router.

---