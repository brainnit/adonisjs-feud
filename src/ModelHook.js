'use strict'

const { ioc } = require('@adonisjs/fold')

const Feud = ioc.use('Feud')

/**
 * @typedef {import('@adonisjs/lucid/src/Lucid/Model')} Model
 */

class ModelHook {
  /**
   * Adds the tenant attribute to restrict the new instances to the
   * current tenant scope. Called on the `beforeCreate` event.
   *
   * @param {Model} modelInstance
   *
   * @return {void}
   */
  static addTenantScope (modelInstance) {
    if (!Feud.getTenantColumn()) {
      throw new Error('Tenant must be set before creating the model')
    }

    modelInstance[Feud.getTenantColumn()] = Feud.getTenant()
  }
}

module.exports = ModelHook
