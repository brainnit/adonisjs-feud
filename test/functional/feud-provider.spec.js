'use strict'

const path = require('path')
const { ioc, registrar } = require('@adonisjs/fold')
const { Config, Env, setupResolver } = require('@adonisjs/sink')

beforeAll(async () => {
  ioc.singleton('Adonis/Src/Env', () => new Env())
  ioc.alias('Adonis/Src/Env', 'Env')

  ioc.singleton('Adonis/Src/Config', function () {
    const config = new Config()
    config.set('feud', {
      tenantColumn: 'tenant_id'
    })
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
})

describe('FeudProvider', () => {
  it('Feud should be registered just fine', () => {
    const Feud = require('../../src/Feud')
    expect(ioc.use('Adonis/Addons/Feud')).toBeInstanceOf(Feud)
    expect(ioc.use('Feud')).toBeInstanceOf(Feud)
  })

  it('TenantAware midleware should be registered just fine', () => {
    const TenantAware = require('../../src/Middleware/TenantAware')
    expect(ioc.use('Adonis/Middleware/TenantAware')).toBeInstanceOf(TenantAware)
  })

  it('TenantAware trait should be registered just fine', () => {
    const TenantAware = require('../../src/TenantAware')
    expect(ioc.use('Adonis/Traits/TenantAware')).toBeInstanceOf(TenantAware)
    expect(ioc.use('TenantAware')).toBeInstanceOf(TenantAware)
  })
})
