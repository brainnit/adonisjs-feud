'use strict'

const path = require('path')
const { ioc, registrar } = require('@adonisjs/fold')
const { Config, setupResolver } = require('@adonisjs/sink')

const fixtures = require('../unit/helpers/fixtures')

beforeAll(async () => {
  ioc.singleton('Adonis/Src/Config', function () {
    const config = new Config()

    config.set('database', {
      connection: 'sqlite',
      sqlite: {
        client: 'sqlite3',
        connection: {
          filename: './testing.sqlite'
        },
        useNullAsDefault: true,
        debug: false
      }
    })

    config.set('feud', { tenantColumn: 'tenant_id' })

    return config
  })
  ioc.alias('Adonis/Src/Config', 'Config')

  await registrar
    .providers([
      '@adonisjs/lucid/providers/LucidProvider',
      path.join(__dirname, '../../providers/FeudProvider')
    ])
    .registerAndBoot()

  setupResolver()

  await fixtures.setupTables(ioc.use('Database'))
})

afterAll(async () => {
  await fixtures.dropTables(ioc.use('Database'))
})

afterEach(async () => {
  await fixtures.truncateTables(ioc.use('Database'))
})

describe('belongsToMany Relation', () => {
  it('related new instance is scoped to tenant when saved', async () => {
    const Feud = ioc.use('Feud')
    Feud.setTenant(1)

    const User = require('../unit/helpers/User')
    User._bootIfNotBooted()

    const Group = require('../unit/helpers/Group')
    Group._bootIfNotBooted()

    const user = await User.create({ name: 'John Doe' })
    await user.groups().create({ name: 'All users' })

    const group = await user.groups().first()

    expect(group.toJSON()).toMatchObject({
      __meta__: {
        pivot_group_id: 1,
        pivot_user_id: 1
      },
      id: 1,
      name: 'All users',
      tenant_id: 1
    })
  })

  it('query returns only scoped results', async () => {
    const Feud = ioc.use('Feud')
    Feud.setTenant(1)

    const User = require('../unit/helpers/User')
    User._bootIfNotBooted()

    const user = await User.create({ name: 'John Doe' })

    await ioc.use('Database').table('groups').insert([
      { id: 1, tenant_id: 1, name: 'All users' },
      { id: 2, tenant_id: 2, name: 'All users' }
    ])

    await ioc.use('Database').table('group_members').insert([
      { id: 1, tenant_id: 1, group_id: 1, user_id: user.id },
      { id: 2, tenant_id: 2, group_id: 2, user_id: user.id }
    ])

    const groups = await user.groups().fetch()

    expect(groups.toJSON()).toMatchObject([
      {
        pivot: {
          group_id: 1,
          user_id: 1
        },
        id: 1,
        name: 'All users',
        tenant_id: 1
      }
    ])
  })

  it('related instance is correctly updated', async () => {
    const Feud = ioc.use('Feud')
    Feud.setTenant(1)

    const User = require('../unit/helpers/User')
    User._bootIfNotBooted()

    const user = await User.create({ name: 'John Doe' })

    await user.groups().create({ name: 'All users' })
    await user.groups().where('name', 'All users').update({ name: 'foo' })

    const comment = await user.groups().first()

    expect(comment.toJSON()).toMatchObject({ name: 'foo' })
  })
})
