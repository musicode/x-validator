/**
 * x-validator.js v0.1.2
 * (c) 2017-2021 musicode
 * Released under the MIT License.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.Validator = {}));
}(this, (function (exports) { 'use strict';

  // 日期的格式： 2019-11-11
  var PATTERN_DATE = /^\d{4}\-\d{2}\-\d{2}$/;
  // 日期时间的格式：2019-11-11 11:11:11
  var PATTERN_DATE_TIME = /^\d{4}\-\d{2}\-\d{2} \d{2}:\d{2}:\d{2}$/;

  // 获取变量类型，返回小写格式
  function getType(value) {
    return Object.prototype.toString.call(value).toLowerCase().slice(8, -1)
  }

  function extend(source, props) {
    for (var key in props) {
      source[key] = props[key];
    }
  }

  function checkInteger(rule, value) {
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

  function checkNumber(rule, value) {
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

  function checkString(rule, value) {

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

    if (rule.hasOwnProperty('custom')) {
      var result = rule.custom(value);
      if (result) {
        return result
      }
    }

  }

  function checkBoolean(rule, value) {

    if (getType(value) !== 'boolean') {
      return 'type'
    }

    if (rule.hasOwnProperty('value')
      && rule.value !== value
    ) {
      return 'value'
    }

  }

  function checkEnum(rule, value) {
    if (rule.values.indexOf(value) < 0) {
      return 'type'
    }
  }

  function checkArray(rule, value) {

    if (!value || getType(value) !== 'array') {
      return 'type'
    }

    var length = value.length;

    if (rule.hasOwnProperty('min') && length < rule.min) {
      return 'min'
    }

    if (rule.hasOwnProperty('max') && length > rule.max) {
      return 'max'
    }

    var itemType = rule.itemType;
    if (!itemType) {
      return
    }

    for (var i = 0; i < length; i++) {
      if (getType(value[ i ]) !== itemType) {
        return 'itemType'
      }
    }

  }

  function checkObject(rule, value) {
    if (!value || getType(value) !== 'object') {
      return 'type'
    }
  }

  function checkDate(rule, value) {

    var props = {
      type: 'string',
      pattern: PATTERN_DATE,
    };

    var newRule = {};
    extend(newRule, rule);
    extend(newRule, props);

    return checkString(newRule, value)

  }

  function checkDateTime(rule, value) {

    var props = {
      type: 'string',
      pattern: PATTERN_DATE_TIME,
    };

    var newRule = {};
    extend(newRule, rule);
    extend(newRule, props);

    return checkString(newRule, value)

  }

  var Validator = function() {
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
    };
    this.messages = { };
  };

  Validator.prototype.add = function (name, handler, messages) {

    if (getType(name) === 'object') {
      extend(this.rules, name);
      if (getType(handler) === 'object') {
        extend(this.messages, handler);
      }
    }
    else {
      this.rules[ name ] = handler;
      this.messages[ name ] = messages;
    }

  };

  Validator.prototype.validate = function (data, rules, messages) {

    var errors = { };

    for (var key in rules) {

      var rule = rules[ key ];

      switch (getType(rule)) {
        case 'string':
          rule = {
            type: rule,
          };
          break

        case 'array':
          rule = {
            type: 'enum',
            values: rule,
          };
          break

        case 'regexp':
          rule = {
            type: 'string',
            pattern: rule,
          };
          break
      }

      if (getType(rule) !== 'object' || !rule.type) {
        throw new Error((key + "'s rule is not found."))
      }

      var errorReason = (void 0);

      if (data.hasOwnProperty(key)) {
        errorReason = this.rules[ rule.type ](rule, data[ key ], data);
      }
      else {
        // 默认必传
        if (rule.required !== false) {
          errorReason = 'required';
        }
        else {
          continue
        }
      }

      if (errorReason) {

        var message = messages && messages[ key ] && messages[ key ][ errorReason ];
        if (getType(message) !== 'string') {
          message = this.messages[ rule.type ] && this.messages[ rule.type ][ errorReason ];
        }

        errors[key] = getType(message) === 'string'
          ? message
          : errorReason;

      }

    }

    if (Object.keys(errors).length > 0) {
      return errors
    }

  };

  exports.Validator = Validator;
  exports.checkArray = checkArray;
  exports.checkBoolean = checkBoolean;
  exports.checkDate = checkDate;
  exports.checkDateTime = checkDateTime;
  exports.checkEnum = checkEnum;
  exports.checkInteger = checkInteger;
  exports.checkNumber = checkNumber;
  exports.checkObject = checkObject;
  exports.checkString = checkString;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
