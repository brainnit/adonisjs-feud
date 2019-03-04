'use strict'

const { ioc } = require('@adonisjs/fold')

const Feud = ioc.use('Feud')
const BaseHasOne = require('@adonisjs/lucid/src/Lucid/Relations/HasOne')

class HasOne extends BaseHasOne {
  /**
   * Saves the related instance to the database. Foreign
   * key is set automatically.
   *
   * NOTE: This method will persist the parent model if
   * not persisted already.
   *
   * @method save
   *
   * @param  {Object}  relatedInstance
   * @param  {Object}  [trx]
   *
   * @return {Promise}
   */
  async save (relatedInstance, trx) {
    await this._persistParentIfRequired(trx)
    relatedInstance[this.foreignKey] = this.$primaryKeyValue
    relatedInstance[Feud.getTenantColumn()] = this.parentInstance.getTenant()

    return relatedInstance.save(trx)
  }
}

module.exports = HasOne
