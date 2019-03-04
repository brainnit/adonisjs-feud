'use strict'

const path = require('path')
const { ioc, registrar } = require('@adonisjs/fold')
const { Config, setupResolver } = require('@adonisjs/sink')

const fixtures = require('./helpers/fixtures')

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

describe('TenantAware', () => {
  it('new instance is scoped to tenant', async () => {
    // @todo move to functional tests
    const Feud = ioc.use('Feud')
    Feud.setTenant(1)

    const User = require('./helpers/User')
    User._bootIfNotBooted()
    const user = await User.create({ name: 'John Doe' })

    expect(user.isDirty).toBe(false)
    expect(user.tenant_id).toEqual(1)
  })

  it('hooks are registered', () => {
    const User = require('./helpers/User')
    User._bootIfNotBooted()
    expect(User.$hooks.before._handlers.save.length).toBe(1)
  })

  it('getTenant returns model tenant value', async () => {
    const Feud = ioc.use('Feud')
    Feud.setTenant(2)

    const User = require('./helpers/User')
    User._bootIfNotBooted()

    const user = new User()
    user.newUp({ id: 1, tenant_id: 2, name: 'John Doe' })

    expect(user.getTenant()).toEqual(2)
  })

  it('model query is scoped to tenant', async () => {
    const Feud = ioc.use('Feud')
    Feud.setTenant(1)

    const User = require('./helpers/User')
    User._bootIfNotBooted()

    const query = User.query().toString()

    expect(query).toContain('where `users`.`tenant_id` = 1')
  })
})
