'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class FeudProvider extends ServiceProvider {
  /**
   * Register namespaces on IoC container.
   *
   * @method register
   *
   * @return {Elasticsearch}
   */
  register () {
    this._registerFeud()
    this._registerTenantAwareTrait()
  }

  /**
   * Register feud provider under `Adonis/Addons/Feud`
   * namespace and an alias named `Feud`.
   *
   * @method _registerFeud
   *
   * @return {void}
   *
   * @private
   */
  _registerFeud () {
    this.app.singleton('Adonis/Addons/Feud', (app) => {
      const Config = app.use('Adonis/Src/Config')
      const Feud = require('../src/Feud')
      return new Feud(Config)
    })
    this.app.alias('Adonis/Addons/Feud', 'Feud')
  }

  /**
   * Register searchable trait under `Adonis/Traits/TenantAware` namespace
   * and creates an alias named `TenantAware`.
   *
   * Supposed to be used to make your Lucid models searchable.
   *
   * @method _registerTenantAwareTrait
   *
   * @return {void}
   *
   * @private
   */
  _registerTenantAwareTrait () {
    this.app.bind('Adonis/Traits/TenantAware', () => {
      const TenantAware = require('../src/TenantAware')
      return new TenantAware()
    })
    this.app.alias('Adonis/Traits/TenantAware', 'TenantAware')
  }
}

module.exports = FeudProvider
