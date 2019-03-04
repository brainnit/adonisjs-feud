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
    this._registerTenantAwareMiddleware()
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
   * Register auth middleware under `Adonis/Middleware/TenantAware` namespace.
   *
   * @method _registerTenantAwareMiddleware
   *
   * @return {void}
   *
   * @private
   */
  _registerTenantAwareMiddleware () {
    this.app.bind('Adonis/Middleware/TenantAware', (app) => {
      return new (require('../src/Middleware/TenantAware'))()
    })
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

  /**
   * Extends the Validator adding rules scoped to Feud.
   *
   * @method _registerValidatorRules
   *
   * @return {void}
   *
   * @private
   */
  _registerValidatorRules () {
    try {
      const { extend } = this.app.use('Adonis/Addons/Validator')
      const Feud = this.app.use('Feud')
      const Database = this.app.use('Adonis/Src/Database')
      const validatorRules = new (require('../src/ValidatorRules'))(
        Feud,
        Database
      )

      /**
       * Adds `feudUnique` rule.
       */
      extend(
        'feudUnique',
        validatorRules.unique.bind(validatorRules),
        '{{field}} has already been taken by someone else'
      )

      /**
       * Adds `feudExists` rule.
       */
      extend(
        'feudExists',
        validatorRules.exists.bind(validatorRules),
        '{{field}} has not been found'
      )
    } catch (error) {
      // fails silently
    }
  }

  /**
   * Attach context getter when all providers have
   * been registered
   *
   * @method boot
   *
   * @return {void}
   */
  boot () {
    this._registerValidatorRules()
  }
}

module.exports = FeudProvider
