'use strict'

const { InvalidArgumentException } = require('@adonisjs/generic-exceptions')

class Feud {
  /**
   * @param {typeof Adonis/Src/Config} Config
   */
  constructor (Config) {
    this.Config = Config

    this._tenantColumn = Config.get('feud.tenantColumn', 'tenant_id')
    this._tenant = null
  }

  /**
   * Get the tenant column name to scope models.
   *
   * @return {String}
   */
  getTenantColumn () {
    return this._tenantColumn
  }

  /**
   * Set current tenant.
   *
   * @param {*} tenant
   */
  setTenant (tenant) {
    if (!tenant) {
      throw InvalidArgumentException.invalidParameter(
        'Tenant cannot be null',
        tenant
      )
    }

    this._tenant = tenant
  }

  /**
   * Get current tenant.
   *
   * @return {*}
   */
  getTenant () {
    return this._tenant
  }

  /**
   * Determine if a tenant set.
   *
   * @return {Boolean}
   */
  hasTenant () {
    return !!this.getTenant()
  }
}

module.exports = Feud
