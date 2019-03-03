# AdonisJs Feud

Adonis Feud provides a driver based solution for searching your Lucid models.

## Instalation

Use npm or yarn to install the package:

```sh
npm -i @brainnit/adonisjs-feud
# or
yarn add @brainnit/adonisjs-feud
```

Add Feud to the list of service providers at `start/app.js`:

```js
const providers = [
  // ...
  '@brainnit/adonisjs-feud/providers/FeudProvider'
];
```

## Setup

Copy `config/index.js` to your app config folder and name it `feud.js`. Don't forget to setup your environment variables.

## Usage

Add `@provider:Feud` trait to your models and define only the methods you want to override to change default behaviour:

```js
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class User extends Model {
  static get traits () {
    return ['@provider:Feud']
  }
}

module.exports = Users
```
