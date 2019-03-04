'use strict'

const { ioc } = require('@adonisjs/fold')

const Feud = ioc.use('Feud')
const ModelHook = require('./ModelHook')
const HasOne = require('./Relations/HasOne')
const HasMany = require('./Relations/HasMany')
const BelongsToMany = require('./Relations/BelongsToMany')

class TenantAware {
  register (Model) {
    /**
     * Simply boot the trait to scope the model queries.
     */
    this.constructor.bootTenantAware(Model)

    /**
     * Get the tenant for the model.
     *
     * @return {*}
     */
    Model.prototype.getTenant = function () {
      return this.$attributes[Feud.getTenantColumn()]
    }

    /**
     * Returns an instance of @ref('HasOne') relation.
     *
     * @method hasOne
     *
     * @param  {String|Class}  relatedModel
     * @param  {String}        primaryKey
     * @param  {String}        foreignKey
     *
     * @return {HasOne}
     */
    Model.prototype.hasOne = function (relatedModel, primaryKey, foreignKey) {
      relatedModel = typeof relatedModel === 'string'
        ? ioc.use(relatedModel)
        : relatedModel

      primaryKey = primaryKey || this.constructor.primaryKey
      foreignKey = foreignKey || this.constructor.foreignKey

      return new HasOne(this, relatedModel, primaryKey, foreignKey)
    }

    /**
     * Returns an instance of @ref('HasMany') relation
     *
     * @method hasMany
     *
     * @param  {String|Class}  relatedModel
     * @param  {String}        primaryKey
     * @param  {String}        foreignKey
     *
     * @return {HasMany}
     */
    Model.prototype.hasMany = function (relatedModel, primaryKey, foreignKey) {
      relatedModel =
        typeof relatedModel === 'string' ? ioc.use(relatedModel) : relatedModel

      primaryKey = primaryKey || this.constructor.primaryKey
      foreignKey = foreignKey || this.constructor.foreignKey

      return new HasMany(this, relatedModel, primaryKey, foreignKey)
    }

    /**
     * Returns an instance of @ref('BelongsToMany') relation
     *
     * @method belongsToMany
     *
     * @param  {Class|String}      relatedModel
     * @param  {String}            foreignKey
     * @param  {String}            relatedForeignKey
     * @param  {String}            primaryKey
     * @param  {String}            relatedPrimaryKey
     *
     * @return {BelongsToMany}
     */
    Model.prototype.belongsToMany = function (
      relatedModel,
      foreignKey,
      relatedForeignKey,
      primaryKey,
      relatedPrimaryKey
    ) {
      relatedModel =
        typeof relatedModel === 'string' ? ioc.use(relatedModel) : relatedModel

      foreignKey = foreignKey || this.constructor.foreignKey
      relatedForeignKey = relatedForeignKey || relatedModel.foreignKey
      primaryKey = primaryKey || this.constructor.primaryKey
      relatedPrimaryKey = relatedPrimaryKey || relatedModel.primaryKey

      return new BelongsToMany(
        this,
        relatedModel,
        primaryKey,
        foreignKey,
        relatedPrimaryKey,
        relatedForeignKey
      )
    }
  }

  /**
   * Boot the trait.
   *
   * @param {Model} Model
   *
   * @return {void}
   */
  static bootTenantAware (Model) {
    this.registerObservers(Model)

    /**
     * Adds global scope to restrict all model queries to the current tenant.
     */
    Model.addGlobalScope(query => {
      if (Feud.hasTenant() === false) {
        throw new Error('Tenant must be set before querying the model')
      }

      query.where(`${Model.table}.${Feud.getTenantColumn()}`, Feud.getTenant())
    }, 'TenantAware')
  }

  /**
   * Register model event observers to automatically scope
   * new/existing instances.
   *
   * @param {Model} Model
   *
   * @return {void}
   */
  static registerObservers (Model) {
    Model.addHook('beforeSave', ModelHook.addTenantScope)
  }
}

module.exports = TenantAware
