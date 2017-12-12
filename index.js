
'use strict'

const alias = require('./alias')

const PATTERN_ID = /^\d+$/

const PATTERN_DATE = /^\d{4}\-\d{2}\-\d{2}$/
const PATTERN_DATE_TIME = /^\d{4}\-\d{2}\-\d{2} \d{2}:\d{2}:\d{2}$/

// http://www.regular-expressions.info/email.html
const PATTERN_EMAIL = /^[a-z0-9\!\#\$\%\&\'\*\+\/\=\?\^\_\`\{\|\}\~\-]+(?:\.[a-z0-9\!\#\$\%\&\'\*\+\/\=\?\^\_\`\{\|\}\~\-]+)*@(?:[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?$/

// https://gist.github.com/dperini/729294
const PATTERN_URL = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i


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

function checkId(rule, value) {

  let props = {
    type: 'string',
    pattern: PATTERN_ID,
  }

  return checkString(extend(rule, props), value)

}

function checkUrl(rule, value) {

  let props = {
    type: 'string',
    pattern: PATTERN_URL,
  }

  return checkString(extend(rule, props), value)

}

function checkEmail(rule, value) {

  let props = {
    type: 'string',
    pattern: PATTERN_EMAIL,
  }

  return checkString(extend(rule, props), value)

}

function checkPassword(rule, value, data) {

  let props = {
    type: 'string',
  }

  let error = checkString(extend(rule, props), value)
  if (error) {
    return error
  }

  if (rule.compare && data[ rule.compare ] !== value) {
    return 'compare'
  }

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
      id: checkId,
      url: checkUrl,
      email: checkEmail,
      password: checkPassword,
    }
    this.translate = translate
  }

  add(name, handler) {
    this.rules[ name ] = handler
  }

  validate(data, rules, messages) {

    const errors = { }

    for (let key in rules) {

      let rule = rules[ key ]

      switch (type(rule)) {
        case 'string':
          rule = alias[ rule ]
          break

        case 'array':
          rule = extend(alias.enum, { values: rule })
          break

        case 'regexp':
          rule = extend(alias.pattern, { pattern: rule })
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
        if (type(message) === 'string') {
          errors[ key ] = message
        }
        // else 必须有 translate 函数
        // 否则提示个毛啊
        else {
          errors[ key ] = this.translate(key, data[ key ], errorReason, rule)
        }
      }

    }

    if (Object.keys(errors).length > 0) {
      return errors
    }

  }

}

module.exports = Validator
