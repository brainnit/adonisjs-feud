'use strict'

const { ioc } = require('@adonisjs/fold')
const Model = ioc.use('Model')

class Comment extends Model {
  static get traits () {
    return ['@provider:TenantAware']
  }
}

module.exports = Comment
