'use strict'

const { ioc } = require('@adonisjs/fold')
const Model = ioc.use('Model')
const Profile = require('./Profile')
const Group = require('./Group')

class User extends Model {
  static get traits () {
    return ['@provider:TenantAware']
  }

  profile () {
    return this.hasOne(Profile)
  }

  groups () {
    return this.belongsToMany(Group).pivotTable('group_members')
  }
}

module.exports = User
