### Manufac CLI Scripts:

1. `yarn compile`: Compiles the TS source code into JS using `tsc`.
2. `yarn start`: Deploys the bundled code in a demo app on localhost.
3. `yarn build`: Compiles, bundles, and minifies the source code for production.
4. `yarn dev`: Compiles and bundles the source code for development. It doesn't minify the bundle. It also emits relevant source-maps too to recreate JS/TS source files. Both these features are helpful for debugging.
5. `yarn refresh`: Deletes all the build/docs artifacts and caches. Example: `dist`, `storybook-static`, `.eslintcache` etc.
6. `yarn lint`: Lints the source code.
7. `yarn pretty`: Prettifies the source code.
8. `yarn clean`: Deletes all the build/docs artifacts, caches, and other relatively-less-sensitive artifacts like `node_modules`.
9. `yarn prepare`: Enable Git hooks. [Source](https://typicode.github.io/husky/getting-started.html#automatic-recommended)
10. `yarn test`: Run unit tests via Jest.