# Guide Di

(From creating-injectable-service.md)

## Creating an injectable service

Service is a broad category encompassing any value, function, or feature that an application needs.
A service is typically a class with a narrow, well-defined purpose.
A component is one type of class that can use DI.

Angular distinguishes components from services to increase modularity and reusability.
By separating a component's view-related features from other kinds of processing, you can make your component classes lean and efficient.

Ideally, a component's job is to enable the user experience and nothing more.
A component should present properties and methods for data binding, to mediate between the view (rendered by the template) and the application logic (which often includes some notion of a model).

A component can delegate certain tasks to services, such as fetching data from the server, validating user input, or logging directly to the console.
By defining such processing tasks in an injectable service class, you make those tasks available to any component.
You can also make your application more adaptable by configuring different providers of the same kind of service, as appropriate in different circumstances.

Angular does not enforce these principles.
Angular helps you follow these principles by making it easy to factor your application logic into services and make those services available to components through DI.

### Service examples

Here's an example of a service class that logs to the browser console:

<docs-code header="src/app/logger.service.ts (class)" language="typescript">
export class Logger {
  log(msg: unknown) { console.log(msg); }
  error(msg: unknown) { console.error(msg); }
  warn(msg: unknown) { console.warn(msg); }
}
</docs-code>

Services can depend on other services.
For example, here's a `HeroService` that depends on the `Logger` service, and also uses `BackendService` to get heroes.
That service in turn might depend on the `HttpClient` service to fetch heroes asynchronously from a server:

<docs-code header="src/app/hero.service.ts" language="typescript"
           highlight="[7,8,12,13]">
import { inject } from "@angular/core";

export class HeroService {
  private heroes: Hero[] = [];

  private backend = inject(BackendService);
  private logger = inject(Logger);

  async getHeroes() {
    // Fetch
    this.heroes = await this.backend.getAll(Hero);
    // Log
    this.logger.log(`Fetched ${this.heroes.length} heroes.`);
    return this.heroes;
  }
}
</docs-code>

### Creating an injectable service

The Angular CLI provides a command to create a new service. In the following example, you add a new service to an existing application.

To generate a new `HeroService` class in the `src/app/heroes` folder, follow these steps:

1. Run this [Angular CLI](/tools/cli) command:

<docs-code language="sh">
ng generate service heroes/hero
</docs-code>

This command creates the following default `HeroService`:

<docs-code header="src/app/heroes/hero.service.ts (CLI-generated)" language="typescript">
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HeroService {}
</docs-code>

The `@Injectable()` decorator specifies that Angular can use this class in the DI system.
The metadata, `providedIn: 'root'`, means that the `HeroService` is provided throughout the application.

Add a `getHeroes()` method that returns the heroes from `mock.heroes.ts` to get the hero mock data:

<docs-code header="src/app/heroes/hero.service.ts" language="typescript">
import { Injectable } from '@angular/core';
import { HEROES } from './mock-heroes';

@Injectable({
  // declares that this service should be created
  // by the root application injector.
  providedIn: 'root',
})
export class HeroService {
  getHeroes() {
    return HEROES;
  }
}
</docs-code>

For clarity and maintainability, it is recommended that you define components and services in separate files.

### Injecting services

To inject a service as a dependency into a component, you can declare a class field representing the dependency and use Angular's `inject` function to initialize it.

The following example specifies the `HeroService` in the `HeroListComponent`.
The type of `heroService` is `HeroService`.

<docs-code header="src/app/heroes/hero-list.component.ts" language="typescript">
import { inject } from "@angular/core";

export class HeroListComponent {
  private heroService = inject(HeroService);
}
</docs-code>

It is also possible to inject a service into a component using the component's constructor:

<docs-code header="src/app/heroes/hero-list.component.ts (constructor signature)" language="typescript">
  constructor(private heroService: HeroService)
</docs-code>

The `inject` method can be used in both classes and functions, while the constructor method can naturally only be used in a class constructor. However, in either case a dependency may only be injected in a valid [injection context](guide/di/dependency-injection-context), usually in the construction or initialization of a component.

### Injecting services in other services

When a service depends on another service, follow the same pattern as injecting into a component.
In the following example, `HeroService` depends on a `Logger` service to report its activities:

<docs-code header="src/app/heroes/hero.service.ts" language="typescript"
           highlight="[3,9,12]">
import { inject, Injectable } from '@angular/core';
import { HEROES } from './mock-heroes';
import { Logger } from '../logger.service';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private logger = inject(Logger);

  getHeroes() {
    this.logger.log('Getting heroes.');
    return HEROES;
  }
}
</docs-code>

In this example, the `getHeroes()` method uses the `Logger` service by logging a message when fetching heroes.

### What's next

<docs-pill-row>
  <docs-pill href="/guide/di/dependency-injection-providers" title="Configuring dependency providers"/>
  <docs-pill href="/guide/di/dependency-injection-providers#using-an-injectiontoken-object" title="`InjectionTokens`"/>
</docs-pill-row>

---


(From dependency-injection-context.md)

## Injection context

The dependency injection (DI) system relies internally on a runtime context where the current injector is available.
This means that injectors can only work when code is executed in such a context.

The injection context is available in these situations:

* During construction (via the `constructor`) of a class being instantiated by the DI system, such as an `@Injectable` or `@Component`.
* In the initializer for fields of such classes.
* In the factory function specified for `useFactory` of a `Provider` or an `@Injectable`.
* In the `factory` function specified for an `InjectionToken`.
* Within a stack frame that runs in an injection context.

Knowing when you are in an injection context will allow you to use the [`inject`](api/core/inject) function to inject instances.

### Class constructors

Every time the DI system instantiates a class, it does so in an injection context. This is handled by the framework itself. The constructor of the class is executed in that runtime context, which also allows injection of a token using the [`inject`](api/core/inject) function.

<docs-code language="typescript" highlight="[[3],[6]]">
class MyComponent  {
  private service1: Service1;
  private service2: Service2 = inject(Service2); // In context

  constructor() {
    this.service1 = inject(Service1) // In context
  }
}
</docs-code>

### Stack frame in context

Some APIs are designed to be run in an injection context. This is the case, for example, with router guards. This allows the use of [`inject`](api/core/inject) within the guard function to access a service.

Here is an example for `CanActivateFn`

<docs-code language="typescript" highlight="[3]">
const canActivateTeam: CanActivateFn =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
      return inject(PermissionsService).canActivate(inject(UserToken), route.params.id);
    };
</docs-code>

### Run within an injection context

When you want to run a given function in an injection context without already being in one, you can do so with `runInInjectionContext`.
This requires access to a given injector, like the `EnvironmentInjector`, for example:

<docs-code header="src/app/heroes/hero.service.ts" language="typescript"
           highlight="[9]">
@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private environmentInjector = inject(EnvironmentInjector);

  someMethod() {
    runInInjectionContext(this.environmentInjector, () => {
      inject(SomeService); // Do what you need with the injected service
    });
  }
}
</docs-code>

Note that `inject` will return an instance only if the injector can resolve the required token.

### Asserts the context

Angular provides the `assertInInjectionContext` helper function to assert that the current context is an injection context.

### Using DI outside of a context

Calling [`inject`](api/core/inject) or calling `assertInInjectionContext` outside of an injection context will throw [error NG0203](/errors/NG0203).

---


(From dependency-injection-providers.md)

## Configuring dependency providers

The previous sections described how to use class instances as dependencies.
Aside from classes, you can also use values such as `boolean`, `string`, `Date`, and objects as dependencies.
Angular provides the necessary APIs to make the dependency configuration flexible, so you can make those values available in DI.

### Specifying a provider token

If you specify the service class as the provider token, the default behavior is for the injector to instantiate that class using the `new` operator.

In the following example, the app component provides a `Logger` instance:

<docs-code header="src/app/app.component.ts" language="typescript">
providers: [Logger],
</docs-code>

You can, however, configure DI to associate the `Logger` provider token with a different class or any other value.
So when the `Logger` is injected, the configured value is used instead.

In fact, the class provider syntax is a shorthand expression that expands into a provider configuration, defined by the `Provider` interface.
Angular expands the `providers` value in this case into a full provider object as follows:

<docs-code header="src/app/app.component.ts" language="typescript">
[{ provide: Logger, useClass: Logger }]
</docs-code>

The expanded provider configuration is an object literal with two properties:

- The `provide` property holds the token that serves as the key for consuming the dependency value.
- The second property is a provider definition object, which tells the injector **how** to create the dependency value. The provider-definition can be one of the following:
  - `useClass` - this option tells Angular DI to instantiate a provided class when a dependency is injected
  - `useExisting` - allows you to alias a token and reference any existing one.
  - `useFactory` - allows you to define a function that constructs a dependency.
  - `useValue` - provides a static value that should be used as a dependency.

The sections below describe how to use the different provider definitions.

#### Class providers: useClass

The `useClass` provider key lets you create and return a new instance of the specified class.

You can use this type of provider to substitute an alternative implementation for a common or default class.
The alternative implementation can, for example, implement a different strategy, extend the default class, or emulate the behavior of the real class in a test case.

In the following example, `BetterLogger` would be instantiated when the `Logger` dependency is requested in a component or any other class:

<docs-code header="src/app/app.component.ts" language="typescript">
[{ provide: Logger, useClass: BetterLogger }]
</docs-code>

If the alternative class providers have their own dependencies, specify both providers in the providers metadata property of the parent module or component:

<docs-code header="src/app/app.component.ts" language="typescript">
[
  UserService, // dependency needed in `EvenBetterLogger`.
  { provide: Logger, useClass: EvenBetterLogger },
]
</docs-code>

In this example, `EvenBetterLogger` displays the user name in the log message. This logger gets the user from an injected `UserService` instance:

<docs-code header="src/app/even-better-logger.component.ts" language="typescript"
           highlight="[[3],[6]]">
@Injectable()
export class EvenBetterLogger extends Logger {
  private userService = inject(UserService);

  override log(message: string) {
    const name = this.userService.user.name;
    super.log(`Message to ${name}: ${message}`);
  }
}
</docs-code>

Angular DI knows how to construct the `UserService` dependency, since it has been configured above and is available in the injector.

#### Alias providers: useExisting

The `useExisting` provider key lets you map one token to another.
In effect, the first token is an alias for the service associated with the second token, creating two ways to access the same service object.

In the following example, the injector injects the singleton instance of `NewLogger` when the component asks for either the new or the old logger:
In this way, `OldLogger` is an alias for `NewLogger`.

<docs-code header="src/app/app.component.ts" language="typescript" highlight="[4]">
[
  NewLogger,
  // Alias OldLogger w/ reference to NewLogger
  { provide: OldLogger, useExisting: NewLogger},
]
</docs-code>

NOTE: Ensure you do not alias `OldLogger` to `NewLogger` with `useClass`, as this creates two different `NewLogger` instances.

#### Factory providers: useFactory

The `useFactory` provider key lets you create a dependency object by calling a factory function.
With this approach, you can create a dynamic value based on information available in the DI and elsewhere in the app.

In the following example, only authorized users should see secret heroes in the `HeroService`.
Authorization can change during the course of a single application session, as when a different user logs in .

To keep security-sensitive information in `UserService` and out of `HeroService`, give the `HeroService` constructor a boolean flag to control display of secret heroes:

<docs-code header="src/app/heroes/hero.service.ts" language="typescript"
           highlight="[[4],[7]]">
class HeroService {
  constructor(
    private logger: Logger,
    private isAuthorized: boolean) { }

  getHeroes() {
    const auth = this.isAuthorized ? 'authorized' : 'unauthorized';
    this.logger.log(`Getting heroes for ${auth} user.`);
    return HEROES.filter(hero => this.isAuthorized || !hero.isSecret);
  }
}
</docs-code>

To implement the `isAuthorized` flag, use a factory provider to create a new logger instance for `HeroService`.
This is necessary as we need to manually pass `Logger` when constructing the hero service:

<docs-code header="src/app/heroes/hero.service.provider.ts" language="typescript">
const heroServiceFactory = (logger: Logger, userService: UserService) =>
  new HeroService(logger, userService.user.isAuthorized);
</docs-code>

The factory function has access to `UserService`.
You inject both `Logger` and `UserService` into the factory provider so the injector can pass them along to the factory function:

<docs-code header="src/app/heroes/hero.service.provider.ts" language="typescript"
           highlight="[3,4]">
export const heroServiceProvider = {
  provide: HeroService,
  useFactory: heroServiceFactory,
  deps: [Logger, UserService]
};
</docs-code>

- The `useFactory` field specifies that the provider is a factory function whose implementation is `heroServiceFactory`.
- The `deps` property is an array of provider tokens.
The `Logger` and `UserService` classes serve as tokens for their own class providers.
The injector resolves these tokens and injects the corresponding services into the matching `heroServiceFactory` factory function parameters, based on the order specified.

Capturing the factory provider in the exported variable, `heroServiceProvider`, makes the factory provider reusable.

#### Value providers: useValue

The `useValue` key lets you associate a static value with a DI token.

Use this technique to provide runtime configuration constants such as website base addresses and feature flags.
You can also use a value provider in a unit test to provide mock data in place of a production data service.

The next section provides more information about the `useValue` key.

### Using an `InjectionToken` object

Use an `InjectionToken` object as provider token for non-class dependencies.
The following example defines a token, `APP_CONFIG`. of the type `InjectionToken`:

<docs-code header="src/app/app.config.ts" language="typescript" highlight="[3]">
import { InjectionToken } from '@angular/core';

export interface AppConfig {
  title: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config description');
</docs-code>

The optional type parameter, `<AppConfig>`, and the token description, `app.config description`, specify the token's purpose.

Next, register the dependency provider in the component using the `InjectionToken` object of `APP_CONFIG`:

<docs-code header="src/app/app.component.ts" language="typescript">
const MY_APP_CONFIG_VARIABLE: AppConfig = {
  title: 'Hello',
};

providers: [{ provide: APP_CONFIG, useValue: MY_APP_CONFIG_VARIABLE }]
</docs-code>

Now, inject the configuration object in the constructor body with the `inject` function:

<docs-code header="src/app/app.component.ts" language="typescript" highlight="[2]">
export class AppComponent {
  constructor() {
    const config = inject(APP_CONFIG);
    this.title = config.title;
  }
}
</docs-code>

#### Interfaces and DI

Though the TypeScript `AppConfig` interface supports typing within the class, the `AppConfig` interface plays no role in DI.
In TypeScript, an interface is a design-time artifact, and does not have a runtime representation, or token, that the DI framework can use.

When the TypeScript transpiles to JavaScript, the interface disappears because JavaScript doesn't have interfaces.
Because there is no interface for Angular to find at runtime, the interface cannot be a token, nor can you inject it:

<docs-code header="src/app/app.component.ts" language="typescript">
// Can't use interface as provider token
[{ provide: AppConfig, useValue: MY_APP_CONFIG_VARIABLE })]
</docs-code>

<docs-code header="src/app/app.component.ts" language="typescript" highlight="[3]">
export class AppComponent {
  // Can't inject using the interface as the parameter type
  private config = inject(AppConfig);
}
</docs-code>

---


(From dependency-injection.md)

## Understanding dependency injection

Dependency injection, or DI, is one of the fundamental concepts in Angular. DI is wired into the Angular framework and allows classes with Angular decorators, such as Components, Directives, Pipes, and Injectables, to configure dependencies that they need.

Two main roles exist in the DI system: dependency consumer and dependency provider.

Angular facilitates the interaction between dependency consumers and dependency providers using an abstraction called `Injector`. When a dependency is requested, the injector checks its registry to see if there is an instance already available there. If not, a new instance is created and stored in the registry. Angular creates an application-wide injector (also known as the "root" injector) during the application bootstrap process. In most cases you don't need to manually create injectors, but you should know that there is a layer that connects providers and consumers.

This topic covers basic scenarios of how a class can act as a dependency. Angular also allows you to use functions, objects, primitive types such as string or Boolean, or any other types as dependencies. For more information, see [Dependency providers](guide/di/dependency-injection-providers).

### Providing a dependency

Consider a class called `HeroService` that needs to act as a dependency in a component.

The first step is to add the `@Injectable` decorator to show that the class can be injected.

<docs-code language="typescript" highlight="[1]">
@Injectable()
class HeroService {}
</docs-code>

The next step is to make it available in the DI by providing it.
A dependency can be provided in multiple places:

- [**Preferred**: At the application root level using `providedIn`](#preferred-at-the-application-root-level-using-providedin)
- [At the Component level](#at-the-component-level)
- [At the application root level using `ApplicationConfig`](#at-the-application-root-level-using-applicationconfig)
- [`NgModule` based applications](#ngmodule-based-applications)

#### **Preferred**: At the application root level using `providedIn`

Providing a service at the application root level using `providedIn` allows injecting the service into all other classes.
Using `providedIn` enables Angular and JavaScript code optimizers to effectively remove services that are unused (known as tree-shaking).

You can provide a service by using `providedIn: 'root'` in the `@Injectable` decorator:

<docs-code language="typescript" highlight="[2]">
@Injectable({
  providedIn: 'root'
})
class HeroService {}
</docs-code>

When you provide the service at the root level, Angular creates a single, shared instance of the `HeroService` and injects it into any class that asks for it.

#### At the Component level

You can provide services at `@Component` level by using the `providers` field of the `@Component` decorator.
In this case the `HeroService` becomes available to all instances of this component and other components and directives used in the template.

For example:

<docs-code language="typescript" highlight="[4]">
@Component({
  selector: 'hero-list',
  template: '...',
  providers: [HeroService]
})
class HeroListComponent {}
</docs-code>

When you register a provider at the component level, you get a new instance of the service with each new instance of that component.

NOTE: Declaring a service like this causes `HeroService` to always be included in your application— even if the service is unused.

#### At the application root level using `ApplicationConfig`

You can use the `providers` field of the `ApplicationConfig` (passed to the `bootstrapApplication` function) to provide a service or other `Injectable` at the application level.

In the example below, the `HeroService` is available to all components, directives, and pipes:

<docs-code language="typescript" highlight="[3]">
export const appConfig: ApplicationConfig = {
    providers: [
      { provide: HeroService },
    ]
};
</docs-code>

Then, in `main.ts`:

<docs-code language="typescript">
bootstrapApplication(AppComponent, appConfig)
</docs-code>

NOTE: Declaring a service like this causes `HeroService` to always be included in your application— even if the service is unused.

#### `NgModule` based applications

`@NgModule`-based applications use the `providers` field of the `@NgModule` decorator to provide a service or other `Injectable` available at the application level.

A service provided in a module is available to all declarations of the module, or to any other modules which share the same `ModuleInjector`.
To understand all edge-cases, see [Hierarchical injectors](guide/di/hierarchical-dependency-injection).

NOTE: Declaring a service using `providers` causes the service to be included in your application— even if the service is unused.

### Injecting/consuming a dependency

Use Angular's `inject` function to retrieve dependencies.

```ts
import {inject, Component} from 'angular/core';

@Component({/* ... */})
export class UserProfile {
  // You can use the `inject` function in property initializers.
  private userClient = inject(UserClient);

  constructor() {
    // You can also use the `inject` function in a constructor.
    const logger = inject(Logger);
  }
}
```

You can use the `inject` function in any [injection context](guide/di/dependency-injection-context). Most of the time, this is in a class property initializer or a class constructor for components, directives, services, and pipes.

When Angular discovers that a component depends on a service, it first checks if the injector has any existing instances of that service. If a requested service instance doesn't yet exist, the injector creates one using the registered provider, and adds it to the injector before returning the service to Angular.

When all requested services have been resolved and returned, Angular can call the component's constructor with those services as arguments.

```mermaid
graph TD;
subgraph Injector
serviceA[Service A]
heroService[HeroService]
serviceC[Service C]
serviceD[Service D]
end
direction TB
componentProperty["Component <br> heroService = inject(HeroService)"]
heroService-->componentProperty
style componentProperty text-align: left
```

### What's next

<docs-pill-row>
  <docs-pill href="/guide/di/creating-injectable-service" title="Creating an injectable service"/>
</docs-pill-row>

---


(From di-in-action.md)

## DI in action

This guide explores additional features of dependency injection in Angular.

### Custom providers with `@Inject`

Using a custom provider allows you to provide a concrete implementation for implicit dependencies, such as built-in browser APIs.
The following example uses an `InjectionToken` to provide the [localStorage](https://developer.mozilla.org/docs/Web/API/Window/localStorage) browser API as a dependency in the `BrowserStorageService`:

<docs-code header="src/app/storage.service.ts" language="typescript"
           highlight="[[3,6],[12]]">
import { Inject, Injectable, InjectionToken } from '@angular/core';

export const BROWSER_STORAGE = new InjectionToken<Storage>('Browser Storage', {
  providedIn: 'root',
  factory: () => localStorage
});

@Injectable({
  providedIn: 'root'
})
export class BrowserStorageService {
  public storage = inject(BROWSER_STORAGE);

  get(key: string) {
    return this.storage.getItem(key);
  }

  set(key: string, value: string) {
    this.storage.setItem(key, value);
  }
}
</docs-code>

The `factory` function returns the `localStorage` property that is attached to the browser's window object.
The `inject` function initializes the `storage` property with an instance of the token.

This custom provider can now be overridden during testing with a mock API of `localStorage` instead of interacting with real browser APIs.

### Inject the component's DOM element

Although developers strive to avoid it, some visual effects and third-party tools require direct DOM access.
As a result, you might need to access a component's DOM element.

Angular exposes the underlying element of a `@Component` or `@Directive` via injection using the `ElementRef` injection token:

<docs-code language="typescript" highlight="[7]">
import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {
  private element = inject(ElementRef)

  update() {
    this.element.nativeElement.style.color = 'red';
  }
}
</docs-code>

### Resolve circular dependencies with a forward reference

The order of class declaration matters in TypeScript.
You can't refer directly to a class until it's been defined.

This isn't usually a problem, especially if you adhere to the recommended *one class per file* rule.
But sometimes circular references are unavoidable.
For example, when class 'A' refers to class 'B' and 'B' refers to 'A', one of them has to be defined first.

The Angular `forwardRef()` function creates an *indirect* reference that Angular can resolve later.

You face a similar problem when a class makes *a reference to itself*.
For example, in its `providers` array.
The `providers` array is a property of the `@Component()` decorator function, which must appear before the class definition.
You can break such circular references by using `forwardRef`.

<docs-code header="app.component.ts" language="typescript" highlight="[4]">
providers: [
  {
    provide: PARENT_MENU_ITEM,
    useExisting: forwardRef(() => MenuItem),
  },
],
</docs-code>

---


(From hierarchical-dependency-injection.md)

## Hierarchical injectors

Injectors in Angular have rules that you can leverage to achieve the desired visibility of injectables in your applications.
By understanding these rules, you can determine whether to declare a provider at the application level, in a Component, or in a Directive.

The applications you build with Angular can become quite large, and one way to manage this complexity is to split up the application into a well-defined tree of components.

There can be sections of your page that work in a completely independent way than the rest of the application, with its own local copies of the services and other dependencies that it needs.
Some of the services that these sections of the application use might be shared with other parts of the application, or with parent components that are further up in the component tree, while other dependencies are meant to be private.

With hierarchical dependency injection, you can isolate sections of the application and give them their own private dependencies not shared with the rest of the application, or have parent components share certain dependencies with its child components only but not with the rest of the component tree, and so on. Hierarchical dependency injection enables you to share dependencies between different parts of the application only when and if you need to.

### Types of injector hierarchies

Angular has two injector hierarchies:

| Injector hierarchies        | Details |
|:---                         |:---     |
| `EnvironmentInjector` hierarchy | Configure an `EnvironmentInjector` in this hierarchy using `@Injectable()` or `providers` array in `ApplicationConfig`. |
| `ElementInjector` hierarchy | Created implicitly at each DOM element. An `ElementInjector` is empty by default unless you configure it in the `providers` property on `@Directive()` or `@Component()`. |

<docs-callout title="NgModule Based Applications">
For `NgModule` based applications, you can provide dependencies with the `ModuleInjector` hierarchy using an `@NgModule()` or `@Injectable()` annotation.
</docs-callout>

#### `EnvironmentInjector`

The `EnvironmentInjector` can be configured in one of two ways by using:

* The `@Injectable()` `providedIn` property to refer to `root` or `platform`
* The `ApplicationConfig` `providers` array

<docs-callout title="Tree-shaking and @Injectable()">

Using the `@Injectable()` `providedIn` property is preferable to using the `ApplicationConfig` `providers` array. With `@Injectable()` `providedIn`, optimization tools can perform tree-shaking, which removes services that your application isn't using. This results in smaller bundle sizes.

Tree-shaking is especially useful for a library because the application which uses the library may not have a need to inject it.

</docs-callout>

`EnvironmentInjector` is configured by the `ApplicationConfig.providers`.

Provide services using `providedIn` of `@Injectable()` as follows:

<docs-code language="typescript" highlight="[4]">
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'  // <--provides this service in the root EnvironmentInjector
})
export class ItemService {
  name = 'telephone';
}

</docs-code>

The `@Injectable()` decorator identifies a service class.
The `providedIn` property configures a specific `EnvironmentInjector`, here `root`, which makes the service available in the `root` `EnvironmentInjector`.

#### ModuleInjector

In the case of `NgModule` based applications, the ModuleInjector can be configured in one of two ways by using:

* The `@Injectable()` `providedIn` property to refer to `root` or `platform`
* The `@NgModule()` `providers` array

`ModuleInjector` is configured by the `@NgModule.providers` and `NgModule.imports` property. `ModuleInjector` is a flattening of all the providers arrays that can be reached by following the `NgModule.imports` recursively.

Child `ModuleInjector` hierarchies are created when lazy loading other `@NgModules`.

#### Platform injector

There are two more injectors above `root`, an additional `EnvironmentInjector` and `NullInjector()`.

Consider how Angular bootstraps the application with the following in `main.ts`:

<docs-code language="javascript">
bootstrapApplication(AppComponent, appConfig);
</docs-code>

The `bootstrapApplication()` method creates a child injector of the platform injector which is configured by the `ApplicationConfig` instance.
This is the `root` `EnvironmentInjector`.

The `platformBrowserDynamic()` method creates an injector configured by a `PlatformModule`, which contains platform-specific dependencies.
This allows multiple applications to share a platform configuration.
For example, a browser has only one URL bar, no matter how many applications you have running.
You can configure additional platform-specific providers at the platform level by supplying `extraProviders` using the `platformBrowser()` function.

The next parent injector in the hierarchy is the `NullInjector()`, which is the top of the tree.
If you've gone so far up the tree that you are looking for a service in the `NullInjector()`, you'll get an error unless you've used `@Optional()` because ultimately, everything ends at the `NullInjector()` and it returns an error or, in the case of `@Optional()`, `null`.
For more information on `@Optional()`, see the [`@Optional()` section](#optional) of this guide.

The following diagram represents the relationship between the `root` `ModuleInjector` and its parent injectors as the previous paragraphs describe.

```mermaid
stateDiagram-v2
    elementInjector: EnvironmentInjector<br>(configured by Angular)<br>has special things like DomSanitizer => providedIn 'platform'
    rootInjector: root EnvironmentInjector<br>(configured by AppConfig)<br>has things for your app => bootstrapApplication(..., AppConfig)
    nullInjector: NullInjector<br>always throws an error unless<br>you use @Optional()

    direction BT
    rootInjector --> elementInjector
    elementInjector --> nullInjector
```

While the name `root` is a special alias, other `EnvironmentInjector` hierarchies don't have aliases.
You have the option to create `EnvironmentInjector` hierarchies whenever a dynamically loaded component is created, such as with the Router, which will create child `EnvironmentInjector` hierarchies.

All requests forward up to the root injector, whether you configured it with the `ApplicationConfig` instance passed to the `bootstrapApplication()` method, or registered all providers with `root` in their own services.

<docs-callout title="@Injectable() vs. ApplicationConfig">

If you configure an app-wide provider in the `ApplicationConfig` of `bootstrapApplication`, it overrides one configured for `root` in the `@Injectable()` metadata.
You can do this to configure a non-default provider of a service that is shared with multiple applications.

Here is an example of the case where the component router configuration includes a non-default [location strategy](guide/routing#location-strategy) by listing its provider in the `providers` list of the `ApplicationConfig`.

```ts
providers: [
  { provide: LocationStrategy, useClass: HashLocationStrategy }
]
```

For `NgModule` based applications, configure app-wide providers in the `AppModule` `providers`.

</docs-callout>

#### `ElementInjector`

Angular creates `ElementInjector` hierarchies implicitly for each DOM element.

Providing a service in the `@Component()` decorator using its `providers` or `viewProviders` property configures an `ElementInjector`.
For example, the following `TestComponent` configures the `ElementInjector` by providing the service as follows:

<docs-code language="typescript" highlight="[3]">
@Component({
  …
  providers: [{ provide: ItemService, useValue: { name: 'lamp' } }]
})
export class TestComponent
</docs-code>

HELPFUL: See the [resolution rules](#resolution-rules) section to understand the relationship between the `EnvironmentInjector` tree, the `ModuleInjector` and the `ElementInjector` tree.

When you provide services in a component, that service is available by way of the `ElementInjector` at that component instance.
It may also be visible at child component/directives based on visibility rules described in the [resolution rules](#resolution-rules) section.

When the component instance is destroyed, so is that service instance.

##### `@Directive()` and `@Component()`

A component is a special type of directive, which means that just as `@Directive()` has a `providers` property, `@Component()` does too.
This means that directives as well as components can configure providers, using the `providers` property.
When you configure a provider for a component or directive using the `providers` property, that provider belongs to the `ElementInjector` of that component or directive.
Components and directives on the same element share an injector.

### Resolution rules

When resolving a token for a component/directive, Angular resolves it in two phases:

1. Against its parents in the `ElementInjector` hierarchy.
2. Against its parents in the `EnvironmentInjector` hierarchy.

When a component declares a dependency, Angular tries to satisfy that dependency with its own `ElementInjector`.
If the component's injector lacks the provider, it passes the request up to its parent component's `ElementInjector`.

The requests keep forwarding up until Angular finds an injector that can handle the request or runs out of ancestor `ElementInjector` hierarchies.

If Angular doesn't find the provider in any `ElementInjector` hierarchies, it goes back to the element where the request originated and looks in the `EnvironmentInjector` hierarchy.
If Angular still doesn't find the provider, it throws an error.

If you have registered a provider for the same DI token at different levels, the first one Angular encounters is the one it uses to resolve the dependency.
If, for example, a provider is registered locally in the component that needs a service,
Angular doesn't look for another provider of the same service.

HELPFUL: For `NgModule` based applications, Angular will search the `ModuleInjector` hierarchy if it cannot find a provider in the `ElementInjector` hierarchies.

### Resolution modifiers

Angular's resolution behavior can be modified with `optional`, `self`, `skipSelf` and `host`.
Import each of them from `@angular/core` and use each in the `inject` configuration when you inject your service.

#### Types of modifiers

Resolution modifiers fall into three categories:

* What to do if Angular doesn't find what you're looking for, that is `optional`
* Where to start looking, that is `skipSelf`
* Where to stop looking, `host` and `self`

By default, Angular always starts at the current `Injector` and keeps searching all the way up.
Modifiers allow you to change the starting, or _self_, location and the ending location.

Additionally, you can combine all of the modifiers except:

* `host` and `self`
* `skipSelf` and `self`.

#### `optional`

`optional` allows Angular to consider a service you inject to be optional.
This way, if it can't be resolved at runtime, Angular resolves the service as `null`, rather than throwing an error.
In the following example, the service, `OptionalService`, isn't provided in the service, `ApplicationConfig`, `@NgModule()`, or component class, so it isn't available anywhere in the app.

<docs-code header="src/app/optional/optional.component.ts" language="typescript">
export class OptionalComponent {
  public optional? = inject(OptionalService, {optional: true});
}
</docs-code>

#### `self`

Use `self` so that Angular will only look at the `ElementInjector` for the current component or directive.

A good use case for `self` is to inject a service but only if it is available on the current host element.
To avoid errors in this situation, combine `self` with `optional`.

For example, in the following `SelfNoDataComponent`, notice the injected `LeafService` as a property.

<docs-code header="src/app/self-no-data/self-no-data.component.ts" language="typescript"
           highlight="[7]">
@Component({
  selector: 'app-self-no-data',
  templateUrl: './self-no-data.component.html',
  styleUrls: ['./self-no-data.component.css']
})
export class SelfNoDataComponent {
  public leaf = inject(LeafService, {optional: true, self: true});
}
</docs-code>

In this example, there is a parent provider and injecting the service will return the value, however, injecting the service with `self` and `optional` will return `null` because `self` tells the injector to stop searching in the current host element.

Another example shows the component class with a provider for `FlowerService`.
In this case, the injector looks no further than the current `ElementInjector` because it finds the `FlowerService` and returns the tulip <code>&#x1F337;</code>.

<docs-code header="src/app/self/self.component.ts" path="adev/src/content/examples/resolution-modifiers/src/app/self/self.component.ts" visibleRegion="self-component"/>

#### `skipSelf`

`skipSelf` is the opposite of `self`.
With `skipSelf`, Angular starts its search for a service in the parent `ElementInjector`, rather than in the current one.
So if the parent `ElementInjector` were using the fern <code>&#x1F33F;</code> value for `emoji`, but you had maple leaf <code>&#x1F341;</code> in the component's `providers` array, Angular would ignore maple leaf <code>&#x1F341;</code> and use fern <code>&#x1F33F;</code>.

To see this in code, assume that the following value for `emoji` is what the parent component were using, as in this service:

<docs-code header="src/app/leaf.service.ts" language="typescript">
export class LeafService {
  emoji = '🌿';
}
</docs-code>

Imagine that in the child component, you had a different value, maple leaf <code>&#x1F341;</code> but you wanted to use the parent's value instead.
This is when you'd use `skipSelf`:

<docs-code header="src/app/skipself/skipself.component.ts" language="typescript"
           highlight="[[6],[10]]">
@Component({
  selector: 'app-skipself',
  templateUrl: './skipself.component.html',
  styleUrls: ['./skipself.component.css'],
  // Angular would ignore this LeafService instance
  providers: [{ provide: LeafService, useValue: { emoji: '🍁' } }]
})
export class SkipselfComponent {
  // Use skipSelf as inject option
  public leaf = inject(LeafService, {skipSelf: true});
}
</docs-code>

In this case, the value you'd get for `emoji` would be fern <code>&#x1F33F;</code>, not maple leaf <code>&#x1F341;</code>.

##### `skipSelf` option with `optional`

Use the `skipSelf` option with `optional` to prevent an error if the value is `null`.

In the following example, the `Person` service is injected during property initialization.
`skipSelf` tells Angular to skip the current injector and `optional` will prevent an error should the `Person` service be `null`.

<docs-code language="typescript">
class Person {
  parent = inject(Person, {optional: true, skipSelf: true})
}
</docs-code>

#### `host`

<!-- TODO: Remove ambiguity between host and self. -->

`host` lets you designate a component as the last stop in the injector tree when searching for providers.

Even if there is a service instance further up the tree, Angular won't continue looking.
Use `host` as follows:

<docs-code header="src/app/host/host.component.ts" language="typescript"
           highlight="[[6],[10]]">
@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css'],
  //  provide the service
  providers: [{ provide: FlowerService, useValue: { emoji: '🌷' } }]
})
export class HostComponent {
  // use host when injecting the service
  flower = inject(FlowerService, {host: true, optional: true});
}
</docs-code>

Since `HostComponent` has the `host` option , no matter what the parent of `HostComponent` might have as a `flower.emoji` value, the `HostComponent` will use tulip <code>&#x1F337;</code>.

#### Modifiers with constructor injection  

Similarly as presented before, the behavior of constructor injection can be modified with `@Optional()`, `@Self()`, `@SkipSelf()` and `@Host()`.

Import each of them from `@angular/core` and use each in the component class constructor when you inject your service.

<docs-code header="src/app/self-no-data/self-no-data.component.ts" language="typescript" highlight="[3]">
export class SelfNoDataComponent {
  constructor(@Self() @Optional() public leaf?: LeafService) { }
}
</docs-code>

### Logical structure of the template

When you provide services in the component class, services are visible within the `ElementInjector` tree relative to where and how you provide those services.

Understanding the underlying logical structure of the Angular template will give you a foundation for configuring services and in turn control their visibility.

Components are used in your templates, as in the following example:

<docs-code language="html">
<app-root>
  <app-child></app-child>;
</app-root>
</docs-code>

HELPFUL: Usually, you declare the components and their templates in separate files.
For the purposes of understanding how the injection system works, it is useful to look at them from the point of view of a combined logical tree.
The term _logical_ distinguishes it from the render tree, which is your application's DOM tree.
To mark the locations of where the component templates are located, this guide uses the `<#VIEW>` pseudo-element, which doesn't actually exist in the render tree and is present for mental model purposes only.

The following is an example of how the `<app-root>` and `<app-child>` view trees are combined into a single logical tree:

<docs-code language="html">
<app-root>
  <#VIEW>
    <app-child>
     <#VIEW>
       …content goes here…
     </#VIEW>
    </app-child>
  </#VIEW>
</app-root>
</docs-code>

Understanding the idea of the `<#VIEW>` demarcation is especially significant when you configure services in the component class.

### Example: Providing services in `@Component()`

How you provide services using a `@Component()` (or `@Directive()`) decorator determines their visibility.
The following sections demonstrate `providers` and `viewProviders` along with ways to modify service visibility with `skipSelf` and `host`.

A component class can provide services in two ways:

| Arrays                       | Details |
|:---                          |:---     |
| With a `providers` array     | `@Component({ providers: [SomeService] })`     |
| With a `viewProviders` array | `@Component({ viewProviders: [SomeService] })` |

In the examples below, you will see the logical tree of an Angular application.
To illustrate how the injector works in the context of templates, the logical tree will represent the HTML structure of the application.
For example, the logical tree will show that `<child-component>` is a direct children of `<parent-component>`.

In the logical tree, you will see special attributes: `@Provide`, `@Inject`, and `@ApplicationConfig`.
These aren't real attributes but are here to demonstrate what is going on under the hood.

| Angular service attribute                                                                                          | Details |
|:---                                                                                                                |:---     |
| `@Inject(Token)=>Value`     | If `Token` is injected at this location in the logical tree, its value would be `Value`.     |
| `@Provide(Token=Value)`     | Indicates that `Token` is provided with `Value` at this location in the logical tree.        |
| `@ApplicationConfig` | Demonstrates that a fallback `EnvironmentInjector` should be used at this location.          |

#### Example app structure

The example application has a `FlowerService` provided in `root` with an `emoji` value of red hibiscus <code>&#x1F33A;</code>.

<docs-code header="src/app/flower.service.ts" language="typescript">
@Injectable({
  providedIn: 'root'
})
export class FlowerService {
  emoji = '🌺';
}
</docs-code>

Consider an application with only an `AppComponent` and a `ChildComponent`.
The most basic rendered view would look like nested HTML elements such as the following:

<docs-code language="html">

<app-root> <!-- AppComponent selector -->
  <app-child> <!-- ChildComponent selector -->
  </app-child>
</app-root>

</docs-code>

However, behind the scenes, Angular uses a logical view representation as follows when resolving injection requests:

<docs-code language="html">
<app-root> <!-- AppComponent selector -->
  <#VIEW>
    <app-child> <!-- ChildComponent selector -->
      <#VIEW>
      </#VIEW>
    </app-child>
  </#VIEW>
</app-root>
</docs-code>

The `<#VIEW>` here represents an instance of a template.
Notice that each component has its own `<#VIEW>`.

Knowledge of this structure can inform how you provide and inject your services, and give you complete control of service visibility.

Now, consider that `<app-root>` injects the `FlowerService`:

<docs-code header="src/app/app.component.ts" language="typescript">
export class AppComponent  {
  flower = inject(FlowerService);
}
</docs-code>

Add a binding to the `<app-root>` template to visualize the result:

<docs-code header="src/app/app.component.html" language="html">
<p>Emoji from FlowerService: {{flower.emoji}}</p>
</docs-code>

The output in the view would be:

<docs-code language="shell">
Emoji from FlowerService: &#x1F33A;
</docs-code>

In the logical tree, this would be represented as follows:

<docs-code language="html" highlight="[[1],[2],[4]]">
<app-root @ApplicationConfig
        @Inject(FlowerService) flower=>"&#x1F33A;">
  <#VIEW>
    <p>Emoji from FlowerService: {{flower.emoji}} (&#x1F33A;)</p>
    <app-child>
      <#VIEW>
      </#VIEW>
    </app-child>
  </#VIEW>
</app-root>

</docs-code>

When `<app-root>` requests the `FlowerService`, it is the injector's job to resolve the `FlowerService` token.
The resolution of the token happens in two phases:

1. The injector determines the starting location in the logical tree and an ending location of the search.
    The injector begins with the starting location and looks for the token at each view level in the logical tree.
    If the token is found it is returned.

1. If the token is not found, the injector looks for the closest parent `EnvironmentInjector` to delegate the request to.

In the example case, the constraints are:

1. Start with `<#VIEW>` belonging to `<app-root>` and end with `<app-root>`.

    * Normally the starting point for search is at the point of injection.
        However, in this case `<app-root>` is a component. `@Component`s are special in that they also include their own `viewProviders`, which is why the search starts at `<#VIEW>` belonging to `<app-root>`.
        This would not be the case for a directive matched at the same location.
    * The ending location happens to be the same as the component itself, because it is the topmost component in this application.

1. The `EnvironmentInjector` provided by the `ApplicationConfig` acts as the fallback injector when the injection token can't be found in the `ElementInjector` hierarchies.

#### Using the `providers` array

Now, in the `ChildComponent` class, add a provider for `FlowerService` to demonstrate more complex resolution rules in the upcoming sections:

<docs-code header="src/app/child.component.ts" language="typescript"
           highlight="[[5,6],[10]]">
@Component({
  selector: 'app-child',
  templateUrl: './child.component.html',
  styleUrls: ['./child.component.css'],
  // use the providers array to provide a service
  providers: [{ provide: FlowerService, useValue: { emoji: '🌻' } }]
})
export class ChildComponent {
  // inject the service
  flower = inject(FlowerService);
}
</docs-code>

Now that the `FlowerService` is provided in the `@Component()` decorator, when the `<app-child>` requests the service, the injector has only to look as far as the `ElementInjector` in the `<app-child>`.
It won't have to continue the search any further through the injector tree.

The next step is to add a binding to the `ChildComponent` template.

<docs-code header="src/app/child.component.html" language="html">
<p>Emoji from FlowerService: {{flower.emoji}}</p>
</docs-code>

To render the new values, add `<app-child>` to the bottom of the `AppComponent` template so the view also displays the sunflower:

<docs-code language="shell">
Child Component
Emoji from FlowerService: &#x1F33B;
</docs-code>

In the logical tree, this is represented as follows:

<docs-code language="html">

<app-root @ApplicationConfig
        @Inject(FlowerService) flower=>"&#x1F33A;">
  <#VIEW>
    <p>Emoji from FlowerService: {{flower.emoji}} (&#x1F33A;)</p>
    <app-child @Provide(FlowerService="&#x1F33B;")
               @Inject(FlowerService)=>"&#x1F33B;"> <!-- search ends here -->
      <#VIEW> <!-- search starts here -->
        <h2>Child Component</h2>
        <p>Emoji from FlowerService: {{flower.emoji}} (&#x1F33B;)</p>
      </#VIEW>
    </app-child>
  </#VIEW>
</app-root>

</docs-code>

When `<app-child>` requests the `FlowerService`, the injector begins its search at the `<#VIEW>` belonging to `<app-child>` \(`<#VIEW>` is included because it is injected from `@Component()`\) and ends with `<app-child>`.
In this case, the `FlowerService` is resolved in the `providers` array with sunflower <code>&#x1F33B;</code> of the `<app-child>`.
The injector doesn't have to look any further in the injector tree.
It stops as soon as it finds the `FlowerService` and never sees the red hibiscus <code>&#x1F33A;</code>.

#### Using the `viewProviders` array

Use the `viewProviders` array as another way to provide services in the `@Component()` decorator.
Using `viewProviders` makes services visible in the `<#VIEW>`.

HELPFUL: The steps are the same as using the `providers` array, with the exception of using the `viewProviders` array instead.

For step-by-step instructions, continue with this section.
If you can set it up on your own, skip ahead to [Modifying service availability](#visibility-of-provided-tokens).

For demonstration, we are building an `AnimalService` to demonstrate `viewProviders`.
First, create an `AnimalService` with an `emoji` property of whale <code>&#x1F433;</code>:

<docs-code header="src/app/animal.service.ts" language="typescript">
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  emoji = '🐳';
}
</docs-code>

Following the same pattern as with the `FlowerService`, inject the `AnimalService` in the `AppComponent` class:

<docs-code header="src/app/app.component.ts" language="typescript" highlight="[4]">
export class AppComponent {
    public flower = inject(FlowerService);
    public animal = inject(AnimalService);
}
</docs-code>

HELPFUL: You can leave all the `FlowerService` related code in place as it will allow a comparison with the `AnimalService`.

Add a `viewProviders` array and inject the `AnimalService` in the `<app-child>` class, too, but give `emoji` a different value.
Here, it has a value of dog <code>&#x1F436;</code>.

<docs-code header="src/app/child.component.ts" language="typescript"
           highlight="[[7],[11]]">
@Component({
  selector: 'app-child',
  templateUrl: './child.component.html',
  styleUrls: ['./child.component.css'],
  // provide services
  providers: [{ provide: FlowerService, useValue: { emoji: '🌻' } }],
  viewProviders: [{ provide: AnimalService, useValue: { emoji: '🐶' } }]
})
export class ChildComponent {
  // inject services
  flower = inject(FlowerService); 
  animal = inject(AnimalService)
...
}
</docs-code>

Add bindings to the `ChildComponent` and the `AppComponent` templates.
In the `ChildComponent` template, add the following binding:

<docs-code header="src/app/child.component.html" language="html">
<p>Emoji from AnimalService: {{animal.emoji}}</p>
</docs-code>

Additionally, add the same to the `AppComponent` template:

<docs-code header="src/app/app.component.html" language="html">
<p>Emoji from AnimalService: {{animal.emoji}}</p>s
</docs-code>

Now you should see both values in the browser:

<docs-code hideCopy language="shell">

AppComponent
Emoji from AnimalService: &#x1F433;

Child Component
Emoji from AnimalService: &#x1F436;

</docs-code>

The logic tree for this example of `viewProviders` is as follows:

<docs-code language="html">

<app-root @ApplicationConfig
         @Inject(AnimalService) animal=>"&#x1F433;">
  <#VIEW>
    <app-child>
      <#VIEW @Provide(AnimalService="&#x1F436;")
            @Inject(AnimalService=>"&#x1F436;")>
       <!-- ^^using viewProviders means AnimalService is available in <#VIEW>-->
       <p>Emoji from AnimalService: {{animal.emoji}} (&#x1F436;)</p>
      </#VIEW>
    </app-child>
  </#VIEW>
</app-root>

</docs-code>

Just as with the `FlowerService` example, the `AnimalService` is provided in the `<app-child>` `@Component()` decorator.
This means that since the injector first looks in the `ElementInjector` of the component, it finds the `AnimalService` value of dog <code>&#x1F436;</code>.
It doesn't need to continue searching the `ElementInjector` tree, nor does it need to search the `ModuleInjector`.

#### `providers` vs. `viewProviders`

The `viewProviders` field is conceptually similar to `providers`, but there is one notable difference.
Configured providers in `viewProviders` are not visible to projected content that ends up as a logical children of the component.

To see the difference between using `providers` and `viewProviders`, add another component to the example and call it `InspectorComponent`.
`InspectorComponent` will be a child of the `ChildComponent`.
In `inspector.component.ts`, inject the `FlowerService` and `AnimalService` during property initialization:

<docs-code header="src/app/inspector/inspector.component.ts" language="typescript">
export class InspectorComponent {
  flower = inject(FlowerService);
  animal = inject(AnimalService);
}
</docs-code>

You do not need a `providers` or `viewProviders` array.
Next, in `inspector.component.html`, add the same markup from previous components:

<docs-code header="src/app/inspector/inspector.component.html" language="html">
<p>Emoji from FlowerService: {{flower.emoji}}</p>
<p>Emoji from AnimalService: {{animal.emoji}}</p>
</docs-code>

Remember to add the `InspectorComponent` to the `ChildComponent` `imports` array.

<docs-code header="src/app/child/child.component.ts" language="typescript"
           highlight="[3]">
@Component({
  ...
  imports: [InspectorComponent]
})

</docs-code>

Next, add the following to `child.component.html`:

<docs-code header="src/app/child/child.component.html" language="html"
           highlight="[3,9]">
...

<div class="container">
  <h3>Content projection</h3>
  <ng-content></ng-content>
</div>
<h3>Inside the view</h3>

<app-inspector></app-inspector>
</docs-code>

`<ng-content>` allows you to project content, and `<app-inspector>` inside the `ChildComponent` template makes the `InspectorComponent` a child component of `ChildComponent`.

Next, add the following to `app.component.html` to take advantage of content projection.

<docs-code header="src/app/app.component.html" language="html" highlight="[2]">
<app-child>
  <app-inspector></app-inspector>
</app-child>
</docs-code>

The browser now renders the following, omitting the previous examples for brevity:

<docs-code hideCopy language="shell">
...
Content projection

Emoji from FlowerService: &#x1F33B;
Emoji from AnimalService: &#x1F433;

Emoji from FlowerService: &#x1F33B;
Emoji from AnimalService: &#x1F436;

</docs-code>

These four bindings demonstrate the difference between `providers` and `viewProviders`.
Remember that the dog emoji <code>&#x1F436;</code> is declared inside the `<#VIEW>` of `ChildComponent` and isn't visible to the projected content.
Instead, the projected content sees the whale <code>&#x1F433;</code>.

However, in the next output section though, the `InspectorComponent` is an actual child component of `ChildComponent`, `InspectorComponent` is inside the `<#VIEW>`, so when it asks for the `AnimalService`, it sees the dog <code>&#x1F436;</code>.

The `AnimalService` in the logical tree would look like this:

<docs-code language="html">

<app-root @ApplicationConfig
         @Inject(AnimalService) animal=>"&#x1F433;">
  <#VIEW>
    <app-child>
      <#VIEW @Provide(AnimalService="&#x1F436;")
            @Inject(AnimalService=>"&#x1F436;")>
        <!-- ^^using viewProviders means AnimalService is available in <#VIEW>-->
        <p>Emoji from AnimalService: {{animal.emoji}} (&#x1F436;)</p>

        <div class="container">
          <h3>Content projection</h3>
          <app-inspector @Inject(AnimalService) animal=>"&#x1F433;">
            <p>Emoji from AnimalService: {{animal.emoji}} (&#x1F433;)</p>
          </app-inspector>
        </div>

        <app-inspector>
          <#VIEW @Inject(AnimalService) animal=>"&#x1F436;">
            <p>Emoji from AnimalService: {{animal.emoji}} (&#x1F436;)</p>
          </#VIEW>
        </app-inspector>
      </#VIEW>
    </app-child>
  </#VIEW>
</app-root>

</docs-code>

The projected content of `<app-inspector>` sees the whale <code>&#x1F433;</code>, not the dog <code>&#x1F436;</code>, because the dog <code>&#x1F436;</code> is inside the `<app-child>` `<#VIEW>`.
The `<app-inspector>` can only see the dog <code>&#x1F436;</code> if it is also within the `<#VIEW>`.

#### Visibility of provided tokens

Visibility decorators influence where the search for the injection token begins and ends in the logic tree.
To do this, place visibility configuration at the point of injection, that is, when invoking `inject()`, rather than at a point of declaration.

To alter where the injector starts looking for `FlowerService`, add `skipSelf` to the `<app-child>` `inject()` invocation where `FlowerService` is injected.
This invocation is a property initializer the `<app-child>` as shown in `child.component.ts`:

<docs-code language="typescript">
flower = inject(FlowerService, { skipSelf: true })
</docs-code>

With `skipSelf`, the `<app-child>` injector doesn't look to itself for the `FlowerService`.
Instead, the injector starts looking for the `FlowerService` at the `ElementInjector` of the `<app-root>`, where it finds nothing.
Then, it goes back to the `<app-child>` `ModuleInjector` and finds the red hibiscus <code>&#x1F33A;</code> value, which is available because `<app-child>` and `<app-root>` share the same `ModuleInjector`.
The UI renders the following:

<docs-code hideCopy language="shell">

Emoji from FlowerService: &#x1F33A;

</docs-code>

In a logical tree, this same idea might look like this:

<docs-code language="html">

<app-root @ApplicationConfig
        @Inject(FlowerService) flower=>"&#x1F33A;">
  <#VIEW>
    <app-child @Provide(FlowerService="&#x1F33B;")>
      <#VIEW @Inject(FlowerService, SkipSelf)=>"&#x1F33A;">
        <!-- With SkipSelf, the injector looks to the next injector up the tree (app-root) -->
      </#VIEW>
    </app-child>
  </#VIEW>
</app-root>

</docs-code>

Though `<app-child>` provides the sunflower <code>&#x1F33B;</code>, the application renders the red hibiscus <code>&#x1F33A;</code> because `skipSelf` causes the current injector (`app-child`) to skip itself and look to its parent.

If you now add `host` (in addition to the `skipSelf`), the result will be `null`.
This is because `host` limits the upper bound of the search to the `app-child` `<#VIEW>`.
Here's the idea in the logical tree:

<docs-code language="html">

<app-root @ApplicationConfig
        @Inject(FlowerService) flower=>"&#x1F33A;">
  <#VIEW> <!-- end search here with null-->
    <app-child @Provide(FlowerService="&#x1F33B;")> <!-- start search here -->
      <#VIEW inject(FlowerService, {skipSelf: true, host: true, optional:true})=>null>
      </#VIEW>
      </app-parent>
  </#VIEW>
</app-root>

</docs-code>

Here, the services and their values are the same, but `host` stops the injector from looking any further than the `<#VIEW>` for `FlowerService`, so it doesn't find it and returns `null`.

#### `skipSelf` and `viewProviders`

Remember, `<app-child>` provides the `AnimalService` in the `viewProviders` array with the value of dog <code>&#x1F436;</code>.
Because the injector has only to look at the `ElementInjector` of the `<app-child>` for the `AnimalService`, it never sees the whale <code>&#x1F433;</code>.

As in the `FlowerService` example, if you add `skipSelf` to the `inject()` of `AnimalService`, the injector won't look in the  `ElementInjector` of the current `<app-child>` for the `AnimalService`.
Instead, the injector will begin at the `<app-root>` `ElementInjector`.

<docs-code language="typescript" highlight="[5]">
@Component({
  selector: 'app-child',
  …
  viewProviders: [
    { provide: AnimalService, useValue: { emoji: '&#x1F436;' } },
  ],
})
</docs-code>

The logical tree looks like this with `skipSelf` in `<app-child>`:

<docs-code language="html">

<app-root @ApplicationConfig
          @Inject(AnimalService=>"&#x1F433;")>
  <#VIEW><!-- search begins here -->
    <app-child>
      <#VIEW @Provide(AnimalService="&#x1F436;")
             @Inject(AnimalService, SkipSelf=>"&#x1F433;")>
        <!--Add skipSelf -->
      </#VIEW>
    </app-child>
  </#VIEW>
</app-root>

</docs-code>

With `skipSelf` in the `<app-child>`, the injector begins its search for the `AnimalService` in the `<app-root>` `ElementInjector` and finds whale <code>&#x1F433;</code>.

#### `host` and `viewProviders`

If you just use `host` for the injection of `AnimalService`, the result is dog <code>&#x1F436;</code> because the injector finds the `AnimalService` in the `<app-child>` `<#VIEW>` itself.
The `ChildComponent` configures the `viewProviders` so that the dog emoji is provided as `AnimalService` value.
You can also see `host` the `inject()`:

<docs-code language="typescript" highlight="[[5],[9]]">
@Component({
  selector: 'app-child',
  …
  viewProviders: [
    { provide: AnimalService, useValue: { emoji: '&#x1F436;' } },
  ]
})
export class ChildComponent {
  animal = inject(AnimalService, { host: true })
}
</docs-code>

`host: true` causes the injector to look until it encounters the edge of the `<#VIEW>`.

<docs-code language="html">

<app-root @ApplicationConfig
          @Inject(AnimalService=>"&#x1F433;")>
  <#VIEW>
    <app-child>
      <#VIEW @Provide(AnimalService="&#x1F436;")
             inject(AnimalService, {host: true}=>"&#x1F436;")> <!-- host stops search here -->
      </#VIEW>
    </app-child>
  </#VIEW>
</app-root>

</docs-code>

Add a `viewProviders` array with a third animal, hedgehog <code>&#x1F994;</code>, to the `app.component.ts` `@Component()` metadata:

<docs-code language="typescript" highlight="[6]">
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ],
  viewProviders: [
    { provide: AnimalService, useValue: { emoji: '&#x1F994;' } },
  ],
})

</docs-code>

Next, add `skipSelf` along with `host` to the `inject()` for the `AnimalService` injection in `child.component.ts`.
Here are `host` and `skipSelf` in the `animal` property initialization:

<docs-code language="typescript" highlight="[4]">
export class ChildComponent {
  animal = inject(AnimalService, { host: true, skipSelf: true });
}

</docs-code>

<!-- TODO: This requires a rework. It seems not well explained what `viewProviders`/`injectors` is here
  and how `host` works.
 -->

When `host` and `skipSelf` were applied to the `FlowerService`, which is in the `providers` array, the result was `null` because `skipSelf` starts its search in the `<app-child>` injector, but `host` stops searching at `<#VIEW>` —where there is no `FlowerService`
In the logical tree, you can see that the `FlowerService` is visible in `<app-child>`, not its `<#VIEW>`.

However, the `AnimalService`, which is provided in the `AppComponent` `viewProviders` array, is visible.

The logical tree representation shows why this is:

<docs-code language="html">

<app-root @ApplicationConfig
        @Inject(AnimalService=>"&#x1F433;")>
  <#VIEW @Provide(AnimalService="&#x1F994;")
         @Inject(AnimalService, @Optional)=>"&#x1F994;">
    <!-- ^^skipSelf starts here,  host stops here^^ -->
    <app-child>
      <#VIEW @Provide(AnimalService="&#x1F436;")
             inject(AnimalService, {skipSelf:true, host: true, optional: true})=>"&#x1F994;">
               <!-- Add skipSelf ^^-->
      </#VIEW>
      </app-child>
  </#VIEW>
</app-root>

</docs-code>

`skipSelf`, causes the injector to start its search for the `AnimalService` at the `<app-root>`, not the `<app-child>`, where the request originates, and `host` stops the search at the `<app-root>` `<#VIEW>`.
Since `AnimalService` is provided by way of the `viewProviders` array, the injector finds hedgehog <code>&#x1F994;</code> in the `<#VIEW>`.

### Example: `ElementInjector` use cases

The ability to configure one or more providers at different levels opens up useful possibilities.

#### Scenario: service isolation

Architectural reasons may lead you to restrict access to a service to the application domain where it belongs.
For example, consider we build a `VillainsListComponent` that displays a list of villains.
It gets those villains from a `VillainsService`.

If you provide `VillainsService` in the root `AppModule`, it will make `VillainsService` visible everywhere in the application.
If you later modify the `VillainsService`, you could break something in other components that started depending this service by accident.

Instead, you should provide the `VillainsService` in the `providers` metadata of the `VillainsListComponent` like this:

<docs-code header="src/app/villains-list.component.ts (metadata)" language="typescript"
           highlight="[4]">
@Component({
  selector: 'app-villains-list',
  templateUrl: './villains-list.component.html',
  providers: [VillainsService]
})
export class VillainsListComponent {}
</docs-code>

By providing `VillainsService` in the `VillainsListComponent` metadata and nowhere else, the service becomes available only in the `VillainsListComponent` and its subcomponent tree.

`VillainService` is a singleton with respect to `VillainsListComponent` because that is where it is declared.
As long as `VillainsListComponent` does not get destroyed it will be the same instance of `VillainService` but if there are multiple instances of `VillainsListComponent`, then each instance of `VillainsListComponent` will have its own instance of `VillainService`.

#### Scenario: multiple edit sessions

Many applications allow users to work on several open tasks at the same time.
For example, in a tax preparation application, the preparer could be working on several tax returns, switching from one to the other throughout the day.

To demonstrate that scenario, imagine a `HeroListComponent` that displays a list of super heroes.

To open a hero's tax return, the preparer clicks on a hero name, which opens a component for editing that return.
Each selected hero tax return opens in its own component and multiple returns can be open at the same time.

Each tax return component has the following characteristics:

* Is its own tax return editing session
* Can change a tax return without affecting a return in another component
* Has the ability to save the changes to its tax return or cancel them

Suppose that the `HeroTaxReturnComponent` had logic to manage and restore changes.
That would be a straightforward task for a hero tax return.
In the real world, with a rich tax return data model, the change management would be tricky.
You could delegate that management to a helper service, as this example does.

The `HeroTaxReturnService` caches a single `HeroTaxReturn`, tracks changes to that return, and can save or restore it.
It also delegates to the application-wide singleton `HeroService`, which it gets by injection.

<docs-code header="src/app/hero-tax-return.service.ts" language="typescript">
import { Injectable } from '@angular/core';
import { HeroTaxReturn } from './hero';
import { HeroesService } from './heroes.service';

@Injectable()
export class HeroTaxReturnService {
  private currentTaxReturn!: HeroTaxReturn;
  private originalTaxReturn!: HeroTaxReturn;

  private heroService = inject(HeroesService);

  set taxReturn(htr: HeroTaxReturn) {
    this.originalTaxReturn = htr;
    this.currentTaxReturn  = htr.clone();
  }

  get taxReturn(): HeroTaxReturn {
    return this.currentTaxReturn;
  }

  restoreTaxReturn() {
    this.taxReturn = this.originalTaxReturn;
  }

  saveTaxReturn() {
    this.taxReturn = this.currentTaxReturn;
    this.heroService.saveTaxReturn(this.currentTaxReturn).subscribe();
  }
}
</docs-code>

Here is the `HeroTaxReturnComponent` that makes use of `HeroTaxReturnService`.

<docs-code header="src/app/hero-tax-return.component.ts" language="typescript">
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HeroTaxReturn } from './hero';
import { HeroTaxReturnService } from './hero-tax-return.service';

@Component({
  selector: 'app-hero-tax-return',
  templateUrl: './hero-tax-return.component.html',
  styleUrls: [ './hero-tax-return.component.css' ],
  providers: [ HeroTaxReturnService ]
})
export class HeroTaxReturnComponent {
  message = '';

  @Output() close = new EventEmitter<void>();

  get taxReturn(): HeroTaxReturn {
    return this.heroTaxReturnService.taxReturn;
  }

  @Input()
  set taxReturn(htr: HeroTaxReturn) {
    this.heroTaxReturnService.taxReturn = htr;
  }

  private heroTaxReturnService = inject(HeroTaxReturnService);

  onCanceled()  {
    this.flashMessage('Canceled');
    this.heroTaxReturnService.restoreTaxReturn();
  }

  onClose() { this.close.emit(); }

  onSaved() {
    this.flashMessage('Saved');
    this.heroTaxReturnService.saveTaxReturn();
  }

  flashMessage(msg: string) {
    this.message = msg;
    setTimeout(() => this.message = '', 500);
  }
}
</docs-code>

The _tax-return-to-edit_ arrives by way of the `@Input()` property, which is implemented with getters and setters.
The setter initializes the component's own instance of the `HeroTaxReturnService` with the incoming return.
The getter always returns what that service says is the current state of the hero.
The component also asks the service to save and restore this tax return.

This won't work if the service is an application-wide singleton.
Every component would share the same service instance, and each component would overwrite the tax return that belonged to another hero.

To prevent this, configure the component-level injector of `HeroTaxReturnComponent` to provide the service, using the `providers` property in the component metadata.

<docs-code header="src/app/hero-tax-return.component.ts (providers)" language="typescript">
providers: [HeroTaxReturnService]
</docs-code>

The `HeroTaxReturnComponent` has its own provider of the `HeroTaxReturnService`.
Recall that every component _instance_ has its own injector.
Providing the service at the component level ensures that _every_ instance of the component gets a private instance of the service. This makes sure that no tax return gets overwritten.

HELPFUL: The rest of the scenario code relies on other Angular features and techniques that you can learn about elsewhere in the documentation.

#### Scenario: specialized providers

Another reason to provide a service again at another level is to substitute a _more specialized_ implementation of that service, deeper in the component tree.

For example, consider a `Car` component that includes tire service information and depends on other services to provide more details about the car.

The root injector, marked as (A), uses _generic_ providers for details about `CarService` and `EngineService`.

1. `Car` component (A).  Component (A) displays tire service data about a car and specifies generic services to provide more information about the car.

2. Child component (B). Component (B) defines its own, _specialized_ providers for `CarService` and `EngineService` that have special capabilities suitable for what's going on in component (B).

3. Child component (C) as a child of Component (B). Component (C) defines its own, even _more specialized_ provider for `CarService`.

```mermaid
graph TD;
subgraph COMPONENT_A[Component A]
subgraph COMPONENT_B[Component B]
COMPONENT_C[Component C]
end
end

style COMPONENT_A fill:#BDD7EE
style COMPONENT_B fill:#FFE699
style COMPONENT_C fill:#A9D18E,color:#000
classDef noShadow filter:none
class COMPONENT_A,COMPONENT_B,COMPONENT_C noShadow
```

Behind the scenes, each component sets up its own injector with zero, one, or more providers defined for that component itself.

When you resolve an instance of `Car` at the deepest component (C), its injector produces:

* An instance of `Car` resolved by injector (C)
* An `Engine` resolved by injector (B)
* Its `Tires` resolved by the root injector (A).

```mermaid
graph BT;

subgraph A[" "]
direction LR
RootInjector["(A) RootInjector"]
ServicesA["CarService, EngineService, TiresService"]
end

subgraph B[" "]
direction LR
ParentInjector["(B) ParentInjector"]
ServicesB["CarService2, EngineService2"]
end

subgraph C[" "]
direction LR
ChildInjector["(C) ChildInjector"]
ServicesC["CarService3"]
end

direction LR
car["(C) Car"]
engine["(B) Engine"]
tires["(A) Tires"]

direction BT
car-->ChildInjector
ChildInjector-->ParentInjector-->RootInjector

class car,engine,tires,RootInjector,ParentInjector,ChildInjector,ServicesA,ServicesB,ServicesC,A,B,C noShadow
style car fill:#A9D18E,color:#000
style ChildInjector fill:#A9D18E,color:#000
style engine fill:#FFE699,color:#000
style ParentInjector fill:#FFE699,color:#000
style tires fill:#BDD7EE,color:#000
style RootInjector fill:#BDD7EE,color:#000
```

### More on dependency injection

<docs-pill-row>
  <docs-pill href="/guide/di/dependency-injection-providers" title="DI Providers"/>
</docs-pill-row>

---


(From lightweight-injection-tokens.md)

## Optimizing client application size with lightweight injection tokens

This page provides a conceptual overview of a dependency injection technique that is recommended for library developers.
Designing your library with *lightweight injection tokens* helps optimize the bundle size of client applications that use your library.

You can manage the dependency structure among your components and injectable services to optimize bundle size by using tree-shakable providers.
This normally ensures that if a provided component or service is never actually used by the application, the compiler can remove its code from the bundle.

Due to the way Angular stores injection tokens, it is possible that such an unused component or service can end up in the bundle anyway.
This page describes a dependency injection design pattern that supports proper tree-shaking by using lightweight injection tokens.

The lightweight injection token design pattern is especially important for library developers.
It ensures that when an application uses only some of your library's capabilities, the unused code can be eliminated from the client's application bundle.

When an application uses your library, there might be some services that your library supplies which the client application doesn't use.
In this case, the application developer should expect that service to be tree-shaken, and not contribute to the size of the compiled application.
Because the application developer cannot know about or remedy a tree-shaking problem in the library, it is the responsibility of the library developer to do so.
To prevent the retention of unused components, your library should use the lightweight injection token design pattern.

### When tokens are retained

To better explain the condition under which token retention occurs, consider a library that provides a library-card component.
This component contains a body and can contain an optional header:

<docs-code language="html">

<lib-card>;
  <lib-header>…</lib-header>;
</lib-card>;

</docs-code>

In a likely implementation, the `<lib-card>` component uses `@ContentChild()` or `@ContentChildren()` to get `<lib-header>` and `<lib-body>`, as in the following:

<docs-code language="typescript" highlight="[12]">
@Component({
  selector: 'lib-header',
  …,
})
class LibHeaderComponent {}

@Component({
  selector: 'lib-card',
  …,
})
class LibCardComponent {
  @ContentChild(LibHeaderComponent) header: LibHeaderComponent|null = null;
}

</docs-code>

Because `<lib-header>` is optional, the element can appear in the template in its minimal form, `<lib-card></lib-card>`.
In this case, `<lib-header>` is not used and you would expect it to be tree-shaken, but that is not what happens.
This is because `LibCardComponent` actually contains two references to the `LibHeaderComponent`:

<docs-code language="typescript">
@ContentChild(LibHeaderComponent) header: LibHeaderComponent;
</docs-code>

* One of these reference is in the *type position*-- that is, it specifies `LibHeaderComponent` as a type: `header: LibHeaderComponent;`.
* The other reference is in the *value position*-- that is, LibHeaderComponent is the value of the `@ContentChild()` parameter decorator: `@ContentChild(LibHeaderComponent)`.

The compiler handles token references in these positions differently:

* The compiler erases *type position* references after conversion from TypeScript, so they have no impact on tree-shaking.
* The compiler must keep *value position* references at runtime, which **prevents** the component from being tree-shaken.

In the example, the compiler retains the `LibHeaderComponent` token that occurs in the value position.
This prevents the referenced component from being tree-shaken, even if the application does not actually use `<lib-header>` anywhere.
If `LibHeaderComponent` 's code, template, and styles combine to become too large, including it unnecessarily can significantly increase the size of the client application.

### When to use the lightweight injection token pattern

The tree-shaking problem arises when a component is used as an injection token.
There are two cases when that can happen:

* The token is used in the value position of a [content query](guide/components/queries#content-queries).
* The token is used as a type specifier for constructor injection.

In the following example, both uses of the `OtherComponent` token cause retention of `OtherComponent`, preventing it from being tree-shaken when it is not used:

<docs-code language="typescript" highlight="[[2],[4]]">
class MyComponent {
  constructor(@Optional() other: OtherComponent) {}

  @ContentChild(OtherComponent) other: OtherComponent|null;
}
</docs-code>

Although tokens used only as type specifiers are removed when converted to JavaScript, all tokens used for dependency injection are needed at runtime.
These effectively change `constructor(@Optional() other: OtherComponent)` to `constructor(@Optional() @Inject(OtherComponent) other)`.
The token is now in a value position, which causes the tree-shaker to keep the reference.

HELPFUL: Libraries should use [tree-shakable providers](guide/di/dependency-injection#providing-dependency) for all services, providing dependencies at the root level rather than in components or modules.

### Using lightweight injection tokens

The lightweight injection token design pattern consists of using a small abstract class as an injection token, and providing the actual implementation at a later stage.
The abstract class is retained, not tree-shaken, but it is small and has no material impact on the application size.

The following example shows how this works for the `LibHeaderComponent`:

<docs-code language="typescript" language="[[1],[6],[17]]">
abstract class LibHeaderToken {}

@Component({
  selector: 'lib-header',
  providers: [
    {provide: LibHeaderToken, useExisting: LibHeaderComponent}
  ]
  …,
})
class LibHeaderComponent extends LibHeaderToken {}

@Component({
  selector: 'lib-card',
  …,
})
class LibCardComponent {
  @ContentChild(LibHeaderToken) header: LibHeaderToken|null = null;
}
</docs-code>

In this example, the `LibCardComponent` implementation no longer refers to `LibHeaderComponent` in either the type position or the value position.
This lets full tree-shaking of `LibHeaderComponent` take place.
The `LibHeaderToken` is retained, but it is only a class declaration, with no concrete implementation.
It is small and does not materially impact the application size when retained after compilation.

Instead, `LibHeaderComponent` itself implements the abstract `LibHeaderToken` class.
You can safely use that token as the provider in the component definition, allowing Angular to correctly inject the concrete type.

To summarize, the lightweight injection token pattern consists of the following:

1. A lightweight injection token that is represented as an abstract class.
1. A component definition that implements the abstract class.
1. Injection of the lightweight pattern, using `@ContentChild()` or `@ContentChildren()`.
1. A provider in the implementation of the lightweight injection token which associates the lightweight injection token with the implementation.

#### Use the lightweight injection token for API definition

A component that injects a lightweight injection token might need to invoke a method in the injected class.
The token is now an abstract class. Since the injectable component implements that class, you must also declare an abstract method in the abstract lightweight injection token class.
The implementation of the method, with all its code overhead, resides in the injectable component that can be tree-shaken.
This lets the parent communicate with the child, if it is present, in a type-safe manner.

For example, the `LibCardComponent` now queries `LibHeaderToken` rather than `LibHeaderComponent`.
The following example shows how the pattern lets `LibCardComponent` communicate with the `LibHeaderComponent` without actually referring to `LibHeaderComponent`:

<docs-code language="typescript" highlight="[[3],[13,16],[27]]">
abstract class LibHeaderToken {
  abstract doSomething(): void;
}

@Component({
  selector: 'lib-header',
  providers: [
    {provide: LibHeaderToken, useExisting: LibHeaderComponent}
  ]
  …,
})
class LibHeaderComponent extends LibHeaderToken {
  doSomething(): void {
    // Concrete implementation of `doSomething`
  }
}

@Component({
  selector: 'lib-card',
  …,
})
class LibCardComponent implement AfterContentInit {
  @ContentChild(LibHeaderToken) header: LibHeaderToken|null = null;

  ngAfterContentInit(): void {
    if (this.header !== null) {
      this.header?.doSomething();
    }
  }
}
</docs-code>

In this example, the parent queries the token to get the child component, and stores the resulting component reference if it is present.
Before calling a method in the child, the parent component checks to see if the child component is present.
If the child component has been tree-shaken, there is no runtime reference to it, and no call to its method.

#### Naming your lightweight injection token

Lightweight injection tokens are only useful with components.
The Angular style guide suggests that you name components using the "Component" suffix.
The example "LibHeaderComponent" follows this convention.

You should maintain the relationship between the component and its token while still distinguishing between them.
The recommended style is to use the component base name with the suffix "`Token`" to name your lightweight injection tokens: "`LibHeaderToken`."

---


(From overview.md)

<docs-decorative-header title="Dependency injection in Angular" imgSrc="adev/src/assets/images/dependency_injection.svg"> <!-- markdownlint-disable-line -->
"DI" is a design pattern and mechanism for creating and delivering some parts of an app to other parts of an app that require them.
</docs-decorative-header>

TIP: Check out Angular's [Essentials](essentials/dependency-injection) before diving into this comprehensive guide.

When you develop a smaller part of your system, like a module or a class, you may need to use features from other classes. For example, you may need an HTTP service to make backend calls. Dependency Injection, or DI, is a design pattern and mechanism for creating and delivering some parts of an application to other parts of an application that require them. Angular supports this design pattern and you can use it in your applications to increase flexibility and modularity.

In Angular, dependencies are typically services, but they also can be values, such as strings or functions. An injector for an application (created automatically during bootstrap) instantiates dependencies when needed, using a configured provider of the service or value.

### Learn about Angular dependency injection

<docs-card-container>
  <docs-card title="Understanding dependency injection" href="/guide/di/dependency-injection">
    Learn basic principles of dependency injection in Angular.
  </docs-card>
  <docs-card title="Creating and injecting service" href="/guide/di/creating-injectable-service">
    Describes how to create a service and inject it in other services and components.
  </docs-card>
  <docs-card title="Configuring dependency providers" href="/guide/di/dependency-injection-providers">
    Describes how to configure dependencies using the providers field on the @Component and @NgModule decorators. Also describes how to use InjectionToken to provide and inject values in DI, which can be helpful when you want to use a value other than classes as dependencies.
  </docs-card>
    <docs-card title="Injection context" href="/guide/di/dependency-injection-context">
    Describes what an injection context is and how to use the DI system where you need it.
  </docs-card>
  <docs-card title="Hierarchical injectors" href="/guide/di/hierarchical-dependency-injection">
    Hierarchical DI enables you to share dependencies between different parts of the application only when and if you need to. This is an advanced topic.
  </docs-card>
</docs-card-container>

---