# LaBienvenida

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.15.

## Sitio público de la protectora

El sitio estático de `protectora-la-bienvenida-netlify` forma parte de este proyecto en
`public/protectora-la-bienvenida-netlify`. Angular lo copia íntegramente al compilar.

Con el servidor de desarrollo iniciado, la portada está disponible en:

```text
http://localhost:4200/
```

Las rutas públicas son `/`, `/adopta`, `/nosotros`, `/como-ayudar`, `/contacto` y
`/animal?id=nombre`. El dashboard administrativo está disponible, por ahora sin autenticación,
en `/admin`.

El panel principal también incluye el enlace **Ver sitio público** en su navegación lateral.

## Acceso de administración

La ruta `/admin` está protegida en Netlify mediante una Edge Function y una contraseña
compartida. Las dos personas administradoras usan la misma contraseña, pero cada navegador
recibe su propia sesión de 24 horas.

Antes de desplegar, crea esta variable en **Netlify → Project configuration →
Environment variables** y márcala como secreta:

```text
ADMIN_PASSWORD=una-contraseña-larga-y-segura
```

La variable debe estar disponible para el ámbito **Functions**. Después de crearla,
realiza un nuevo despliegue. Cambiar `ADMIN_PASSWORD` modifica la clave compartida e
invalida automáticamente todas las sesiones abiertas.

El botón **Cerrar sesión** elimina únicamente la sesión del navegador actual.

La protección se ejecuta en la infraestructura de Netlify. Para probarla localmente debe
usarse Netlify Dev; `ng serve` sirve únicamente la aplicación Angular y no ejecuta Edge
Functions.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
