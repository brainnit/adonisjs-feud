'use strict'

const { ioc } = require('@adonisjs/fold')

const Feud = ioc.use('Feud')
const BaseBelongsToMany = require('@adonisjs/lucid/src/Lucid/Relations/BelongsToMany')

class BelongsToMany extends BaseBelongsToMany {
  /**
   * Saves the relationship to the pivot table
   *
   * @method _attachSingle
   * @async
   *
   * @param  {Number|String}      value
   * @param  {Function}           [pivotCallback]
   * @param  {Object}             [trx]
   *
   * @return {Object}                    Instance of pivot model
   *
   * @private
   */
  async _attachSingle (value, pivotCallback, trx) {
    /**
     * The relationship values
     *
     * @type {Object}
     */
    const pivotValues = {
      [this.relatedForeignKey]: value,
      [Feud.getTenantColumn()]: this.parentInstance.getTenant(),
      [this.foreignKey]: this.$primaryKeyValue
    }
    const pivotModel = this._newUpPivotModel()
    this._existingPivotInstances.push(pivotModel)
    pivotModel.fill(pivotValues)

    /**
     * Set $table, $timestamps, $connection when there
     * is no pre-defined pivot model.
     */
    if (!this._PivotModel) {
      pivotModel.$table = this.$pivotTable
      pivotModel.$connection = this.RelatedModel.connection
      pivotModel.$withTimestamps = this._pivot.withTimestamps
      pivotModel.$primaryKey = this._pivot.pivotPrimaryKey
    }

    /**
     * If pivot callback is defined, do call it. This gives
     * chance to the user to set additional fields to the
     * model.
     */
    if (typeof pivotCallback === 'function') {
      pivotCallback(pivotModel)
    }

    await pivotModel.save(trx)
    return pivotModel
  }
}

module.exports = BelongsToMany
