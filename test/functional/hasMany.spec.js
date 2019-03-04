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

describe('hasMany Relation', () => {
  it('related new instance is scoped to tenant when saved', async () => {
    const Feud = ioc.use('Feud')
    Feud.setTenant(1)

    const Post = require('../unit/helpers/Post')
    Post._bootIfNotBooted()

    const Comment = require('../unit/helpers/Comment')
    Comment._bootIfNotBooted()

    const post = await Post.create({ title: 'First post' })

    const comment = new Comment()
    comment.body = 'Foo'
    await post.comments().save(comment)

    expect(comment.getTenant()).toEqual(1)
    expect(await post.comments().first()).toMatchObject(comment)
  })

  it('query returns only scoped results', async () => {
    const Feud = ioc.use('Feud')
    Feud.setTenant(1)

    const Post = require('../unit/helpers/Post')
    Post._bootIfNotBooted()

    const post = await Post.create({ title: 'Another post' })

    await ioc.use('Database').table('comments').insert([
      { id: 1, tenant_id: 2, post_id: post.id, body: 'foo' },
      { id: 2, tenant_id: 1, post_id: post.id, body: 'bar' }
    ])

    const comment = await post.comments().first()

    expect(comment.toJSON()).toMatchObject(
      { id: 2, tenant_id: 1, post_id: post.id, body: 'bar' }
    )
  })

  it('related instance is correctly updated', async () => {
    const Feud = ioc.use('Feud')
    Feud.setTenant(1)

    const Post = require('../unit/helpers/Post')
    Post._bootIfNotBooted()

    const post = await Post.create({ title: 'Third post' })

    await post.comments().create({ body: 'foo' })
    await post.comments().where('body', 'foo').update({ body: 'bar' })

    const comment = await post.comments().first()

    expect(comment.toJSON()).toMatchObject({ body: 'bar' })
  })
})
