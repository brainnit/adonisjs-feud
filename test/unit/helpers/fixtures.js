'use strict'

module.exports = {
  setupTables (db) {
    const tables = [
      db.schema.createTable('users', function (table) {
        table.increments()
        table.integer('tenant_id').notNullable()
        table.string('name')
        table.timestamps()
      }),
      db.schema.createTable('profiles', function (table) {
        table.increments()
        table.integer('tenant_id').notNullable()
        table.integer('user_id').references('id').inTable('users')
        table.string('bio')
        table.timestamps()
      }),
      db.schema.createTable('groups', function (table) {
        table.increments()
        table.integer('tenant_id').notNullable()
        table.string('name')
        table.timestamps()
      }),
      db.schema.createTable('group_members', function (table) {
        table.increments()
        table.integer('tenant_id').notNullable()
        table.integer('group_id').references('id').inTable('groups')
        table.integer('user_id').references('id').inTable('users')
        table.timestamps()
      }),
      db.schema.createTable('posts', function (table) {
        table.increments()
        table.integer('tenant_id').notNullable()
        table.integer('user_id').references('id').inTable('users')
        table.string('title')
        table.timestamps()
      }),
      db.schema.createTable('comments', function (table) {
        table.increments()
        table.integer('tenant_id').notNullable()
        table.integer('post_id').references('id').inTable('posts')
        table.string('body')
        table.timestamps()
      })
    ]
    return Promise.all(tables)
  },
  truncateTables (db) {
    const tables = [
      db.truncate('users'),
      db.truncate('profiles'),
      db.truncate('groups'),
      db.truncate('group_members'),
      db.truncate('posts'),
      db.truncate('comments')
    ]
    return Promise.all(tables)
  },
  dropTables (db) {
    const tables = [
      db.schema.dropTable('users'),
      db.schema.dropTable('profiles'),
      db.schema.dropTable('groups'),
      db.schema.dropTable('group_members'),
      db.schema.dropTable('posts'),
      db.schema.dropTable('comments')
    ]
    return Promise.all(tables)
  }
}
