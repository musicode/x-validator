
'use strict'

const PATTERN_DATE = /^\d{4}\-\d{2}\-\d{2}$/
const PATTERN_DATE_TIME = /^\d{4}\-\d{2}\-\d{2} \d{2}:\d{2}:\d{2}$/

function type(value) {
  return Object.prototype.toString.call(value).toLowerCase().slice(8, -1)
}

function extend(source, props) {
  return Object.assign({ }, source, props)
}

function checkInteger(rule, value) {
  if (type(value) !== 'number' || value % 1 !== 0) {
    return 'type'
  }

  if (rule.hasOwnProperty('min') && value < rule.min) {
    return 'min'
  }

  if (rule.hasOwnProperty('max') && value > rule.max) {
    return 'max'
  }
}

function checkNumber(rule, value) {
  if (type(value) !== 'number' || isNaN(value)) {
    return 'type'
  }

  if (rule.hasOwnProperty('min') && value < rule.min) {
    return 'min'
  }

  if (rule.hasOwnProperty('max') && value > rule.max) {
    return 'max'
  }
}

function checkString(rule, value) {

  if (value === '') {
    // 是否允许为空，默认不允许
    if (rule.empty === true) {
      return
    }
    else {
      return 'empty'
    }
  }

  if (type(value) !== 'string') {
    return 'type'
  }

  if (rule.hasOwnProperty('min') && value.length < rule.min) {
    return 'min'
  }

  if (rule.hasOwnProperty('max') && value.length > rule.max) {
    return 'max'
  }

  if (rule.hasOwnProperty('pattern')
    && !rule.pattern.test(value)
  ) {
    return 'pattern'
  }

}

function checkBoolean(rule, value) {
  if (type(value) !== 'boolean') {
    return 'type'
  }
}

function checkEnum(rule, value) {
  if (rule.values.indexOf(value) < 0) {
    return 'type'
  }
}

function checkArray(rule, value) {

  if (!value || type(value) !== 'array') {
    return 'type'
  }

  const { length } = value

  if (rule.hasOwnProperty('min') && length < rule.min) {
    return 'min'
  }

  if (rule.hasOwnProperty('max') && length < rule.max) {
    return 'max'
  }

  const { itemType } = rule
  if (!itemType) {
    return
  }

  for (let i = 0; i < length; i++) {
    if (type(value[ i ]) !== itemType) {
      return 'itemType'
    }
  }

}

function checkObject(rule, value) {
  if (!value || type(value) !== 'object') {
    return 'type'
  }
}

function checkDate(rule, value) {

  let props = {
    type: 'string',
    pattern: PATTERN_DATE,
  }

  return checkString(extend(rule, props), value)

}

function checkDateTime(rule, value) {

  let props = {
    type: 'string',
    pattern: PATTERN_DATE_TIME,
  }

  return checkString(extend(rule, props), value)

}

class Validator {

  constructor(translate) {
    this.rules = {
      int: checkInteger,
      integer: checkInteger,
      number: checkNumber,
      string: checkString,
      bool: checkBoolean,
      boolean: checkBoolean,
      enum: checkEnum,
      array: checkArray,
      object: checkObject,
      date: checkDate,
      dateTime: checkDateTime,
    }
    this.messages = { }
    this.translate = translate
  }

  add(name, handler, messages) {

    if (type(name) === 'object') {
      Object.assign(this.rules, name)
      if (type(handler) === 'object') {
        Object.assign(this.messages, handler)
      }
    }
    else {
      this.rules[ name ] = handler
      this.messages[ name ] = messages
    }

  }

  validate(data, rules, messages) {

    const errors = { }

    for (let key in rules) {

      let rule = rules[ key ]

      switch (type(rule)) {
        case 'string':
          rule = {
            type: rule,
          }
          break

        case 'array':
          rule = {
            type: 'enum',
            values: rule,
          }
          break

        case 'regexp':
          rule = {
            type: 'string',
            pattern: rule,
          }
          break
      }

      if (type(rule) !== 'object' || !rule.type) {
        throw new TypeError(`${key}'s rule is not found.`)
      }

      let errorReason

      if (data.hasOwnProperty(key)) {
        errorReason = this.rules[ rule.type ](rule, data[ key ], data)
      }
      else {
        // 默认必传
        if (rule.required !== false) {
          errorReason = 'required'
        }
        else {
          continue
        }
      }

      if (errorReason) {

        let message = messages && messages[ key ] && messages[ key ][ errorReason ]
        if (type(message) !== 'string') {
          message = this.messages[ rule.type ] && this.messages[ rule.type ][ errorReason ]
        }

        if (type(message) === 'string') {
          errors[ key ] = message
        }
        else if (this.translate) {
          errors[ key ] = this.translate(key, data[ key ], errorReason, rule)
        }
        else {
          errors[ key ] = errorReason
        }

      }

    }

    if (Object.keys(errors).length > 0) {
      return errors
    }

  }

}

module.exports = {
  Validator,
  checkInteger,
  checkNumber,
  checkString,
  checkBoolean,
  checkDate,
  checkDateTime,
  checkEnum,
  checkObject,
  checkArray,
}
