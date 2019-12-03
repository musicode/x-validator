
'use strict'

// 日期的格式： 2019-11-11
const PATTERN_DATE = /^\d{4}\-\d{2}\-\d{2}$/
// 日期时间的格式：2019-11-11 11:11:11
const PATTERN_DATE_TIME = /^\d{4}\-\d{2}\-\d{2} \d{2}:\d{2}:\d{2}$/

// 获取变量类型，返回小写格式
function getType(value) {
  return Object.prototype.toString.call(value).toLowerCase().slice(8, -1)
}

function extend(source, props) {
  for (let key in props) {
    source[key] = props[key]
  }
}

export function checkInteger(rule, value) {
  if (getType(value) !== 'number' || value % 1 !== 0) {
    return 'type'
  }

  if (rule.hasOwnProperty('min') && value < rule.min) {
    return 'min'
  }

  if (rule.hasOwnProperty('max') && value > rule.max) {
    return 'max'
  }
}

export function checkNumber(rule, value) {
  if (getType(value) !== 'number' || isNaN(value)) {
    return 'type'
  }

  if (rule.hasOwnProperty('min') && value < rule.min) {
    return 'min'
  }

  if (rule.hasOwnProperty('max') && value > rule.max) {
    return 'max'
  }
}

export function checkString(rule, value) {

  if (getType(value) !== 'string') {
    return 'type'
  }

  if (value === '') {
    // 是否允许为空，默认不允许
    if (rule.empty === true) {
      return
    }
    else {
      return 'empty'
    }
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

export function checkBoolean(rule, value) {

  if (getType(value) !== 'boolean') {
    return 'type'
  }

  if (rule.hasOwnProperty('value')
    && rule.value !== value
  ) {
    return 'value'
  }

}

export function checkEnum(rule, value) {
  if (rule.values.indexOf(value) < 0) {
    return 'type'
  }
}

export function checkArray(rule, value) {

  if (!value || getType(value) !== 'array') {
    return 'type'
  }

  const { length } = value

  if (rule.hasOwnProperty('min') && length < rule.min) {
    return 'min'
  }

  if (rule.hasOwnProperty('max') && length > rule.max) {
    return 'max'
  }

  const { itemType } = rule
  if (!itemType) {
    return
  }

  for (let i = 0; i < length; i++) {
    if (getType(value[ i ]) !== itemType) {
      return 'itemType'
    }
  }

}

export function checkObject(rule, value) {
  if (!value || getType(value) !== 'object') {
    return 'type'
  }
}

export function checkDate(rule, value) {

  let props = {
    type: 'string',
    pattern: PATTERN_DATE,
  }

  let newRule = {}
  extend(newRule, rule)
  extend(newRule, props)

  return checkString(newRule, value)

}

export function checkDateTime(rule, value) {

  let props = {
    type: 'string',
    pattern: PATTERN_DATE_TIME,
  }

  let newRule = {}
  extend(newRule, rule)
  extend(newRule, props)

  return checkString(newRule, value)

}

export class Validator {

  constructor() {
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
  }

  add(name, handler, messages) {

    if (getType(name) === 'object') {
      extend(this.rules, name)
      if (getType(handler) === 'object') {
        extend(this.messages, handler)
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

      switch (getType(rule)) {
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

      if (getType(rule) !== 'object' || !rule.type) {
        throw new Error(`${key}'s rule is not found.`)
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
        if (getType(message) !== 'string') {
          message = this.messages[ rule.type ] && this.messages[ rule.type ][ errorReason ]
        }

        errors[key] = getType(message) === 'string'
          ? message
          : errorReason

      }

    }

    if (Object.keys(errors).length > 0) {
      return errors
    }

  }

}
