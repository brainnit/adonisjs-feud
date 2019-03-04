'use strict'

const { ioc } = require('@adonisjs/fold')
const Model = ioc.use('Model')
const User = require('./User')
const Comment = require('./Comment')

class Post extends Model {
  static get traits () {
    return ['@provider:TenantAware']
  }

  author () {
    return this.belongsTo(User)
  }

  comments () {
    return this.hasMany(Comment)
  }
}

module.exports = Post
