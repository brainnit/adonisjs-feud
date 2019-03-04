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

describe('hasOne Relation', () => {
  it('related new instance is scoped to tenant when saved', async () => {
    const Feud = ioc.use('Feud')
    Feud.setTenant(1)

    const User = require('../unit/helpers/User')
    User._bootIfNotBooted()

    const Profile = require('../unit/helpers/Profile')
    Profile._bootIfNotBooted()

    const user = await User.create({ name: 'John Doe' })

    const profile = new Profile()
    profile.bio = 'About me'
    await user.profile().save(profile)

    expect(profile.getTenant()).toEqual(1)
    expect(await user.profile().first()).toMatchObject(profile)
  })

  it('query returns only scoped results', async () => {
    const Feud = ioc.use('Feud')
    Feud.setTenant(1)

    const User = require('../unit/helpers/User')
    User._bootIfNotBooted()

    const user = await User.create({ name: 'John Doe' })

    await ioc.use('Database').table('profiles').insert([
      { id: 1, tenant_id: 2, user_id: user.id, bio: 'foo' },
      { id: 2, tenant_id: 1, user_id: user.id, bio: 'bar' }
    ])

    const profile = await user.profile().first()

    expect(profile.toJSON()).toMatchObject(
      { id: 2, tenant_id: 1, user_id: user.id, bio: 'bar' }
    )
  })

  it('related instance is correctly updated', async () => {
    const Feud = ioc.use('Feud')
    Feud.setTenant(1)

    const User = require('../unit/helpers/User')
    User._bootIfNotBooted()

    const user = await User.create({ name: 'John Doe' })

    await user.profile().create({ bio: 'foo' })
    await user.profile().where('bio', 'foo').update({ bio: 'bar' })

    const profile = await user.profile().fetch()

    expect(profile.toJSON()).toMatchObject({ bio: 'bar' })
  })
})
