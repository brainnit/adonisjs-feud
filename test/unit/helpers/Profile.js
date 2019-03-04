'use strict'

const { ioc } = require('@adonisjs/fold')
const Model = ioc.use('Model')

class Profile extends Model {
  static get traits () {
    return ['@provider:TenantAware']
  }
}

module.exports = Profile
