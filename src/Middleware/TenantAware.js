'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */

const { ioc } = require('@adonisjs/fold')
const { HttpException } = require('@adonisjs/generic-exceptions')

class TenantAware {
  /**
   * Make sure the tenant can be identified or fail.
   *
   * @throws {HttpException}
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request }, next) {
    const Feud = ioc.use('Feud')

    const tenant = request.header('Tenant')

    if (!tenant) {
      throw new HttpException(
        `The request Tenant is missing or invalid`,
        403,
        'E_UNKOWN_TENANT'
      )
    }

    Feud.setTenant(tenant)

    // call next to advance with the request
    await next()
  }
}

module.exports = TenantAware
