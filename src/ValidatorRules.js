
'use strict'

class ValidatorRules {
  constructor (Feud, Database) {
    this.Feud = Feud
    this.Database = Database
  }

  /**
   * Verifica se determinado valor é único na base de dados
   * no escopo de um Tenant.
   *
   * @method unique
   *
   * @param {Object} data Input
   * @param {String} field Nome do campo
   * @param {String} message Mensagem de erro
   * @param {Array} args Opções
   * @param {Function} get Função get
   *
   * @return {Promise}
   *
   * @example
   * ```js
   * email: 'feud_unique:users' // define table
   * email: 'feud_unique:users,user_email' // define table + field
   * email: 'feud_unique:users,user_email,id:1' // where id !== 1
   *
   * // Via new rule method
   * email: [rule('feud_unique', ['users', 'user_email', 'id', 1])]
   * ```
   */
  unique (data, field, message, args, get) {
    return new Promise((resolve, reject) => {
      const value = get(data, field)

      if (!value) {
        /**
         * Pula validação caso value não tenha sido definido.
         * A regra `required` deve cuidar disso.
         */
        return resolve('validation skipped')
      }

      // Extraio valores da lista de argumentos
      const [table, fieldName, ignoreKey, ignoreValue] = args

      // Query base para selecionar where key=value no escopo do tenant atual
      const query = this.Database.table(table)
        .where(this.Feud.getTenantColumn(), this.Feud.getTenant())
        .where(fieldName || field, value)

      // Se a chave de ignorar estiver definida, adiciona whereNot
      if (ignoreKey && ignoreValue) {
        query.whereNot(ignoreKey, ignoreValue)
      }

      query
        .then(rows => {
          /**
           * Unique validation fails when a row has been found
           */
          if (rows && rows.length) {
            return reject(message)
          }
          return resolve('validation passed')
        })
        .catch(reject)

      return this
    })
  }

  /**
   * Verifica se determinado valor existe na base de dados
   * no escopo de um tenant.
   *
   * @method exists
   *
   * @param {Object} data Input
   * @param {String} field Nome do campo
   * @param {String} message Mensagem de erro
   * @param {Array} args Opções
   * @param {Function} get Função get
   *
   * @return {Promise}
   *
   * @example
   * ```js
   * email: 'feud_exists:users' // define table
   * email: 'feud_exists:users,user_email' // define table + field
   *
   * // Via new rule method
   * email: [rule('feud_exists', ['users', 'user_email'])]
   * ```
   */
  exists (data, field, message, args, get) {
    return new Promise((resolve, reject) => {
      const value = get(data, field)

      if (!value) {
        /**
         * Pula validação caso value não tenha sido definido.
         * A regra `required` deve cuidar disso.
         */
        return resolve('validation skipped')
      }

      // Extraio valores da lista de argumentos
      const [table, fieldName] = args

      // Query base para selecionar where key=value no escopo do tenant atual
      const query = this.Database.table(table)
        .where(this.Feud.getTenantColumn(), this.Feud.getTenant())
        .where(fieldName || field, value)

      query
        .then(rows => {
          /**
           * Unique validation fails when a row has NOT been found
           */
          if (!rows || rows.length === 0) {
            return reject(message)
          }
          return resolve('validation passed')
        })
        .catch(reject)

      return this
    })
  }
}

module.exports = ValidatorRules
