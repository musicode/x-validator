var assert = require('assert');

const Validator = require('../index')

const validator = new Validator(
  function (rule, value, errorReason) {
    return errorReason
  }
)

describe('x-validator', function() {
  describe('validate', function() {
    it('int', function() {

      let errors = validator.validate(
        {
          age1: 10,
          age2: 20,
          age3: 30,
          age4: 10.5,
          age5: '123',
        },
        {
          age1: 'int',
          age2: {
            type: 'int',
            min: 22,
            max: 30,
          },
          age3: {
            type: 'int',
            max: 20,
          },
          age4: 'int',
          age5: 'int',
          age6: 'int',
          age7: {
            type: 'int',
          }
        }
      )

      assert(errors.age1 === undefined)
      assert(errors.age2 === 'min')
      assert(errors.age3 === 'max')
      assert(errors.age4 === 'type')
      assert(errors.age5 === 'type')
      assert(errors.age6 === 'required')
      assert(errors.age7 === 'required')

    })

    it('integer', function() {

      let errors = validator.validate(
        {
          age1: 10,
          age2: 20,
          age3: 30,
          age4: 10.5,
          age5: '123',
        },
        {
          age1: 'integer',
          age2: {
            type: 'integer',
            min: 22,
            max: 30,
          },
          age3: {
            type: 'integer',
            max: 20,
          },
          age4: 'integer',
          age5: 'integer',
          age6: 'integer',
          age7: {
            type: 'integer',
          }
        }
      )

      assert(errors.age1 === undefined)
      assert(errors.age2 === 'min')
      assert(errors.age3 === 'max')
      assert(errors.age4 === 'type')
      assert(errors.age5 === 'type')
      assert(errors.age6 === 'required')
      assert(errors.age7 === 'required')

    })


    it('number', function() {

      let errors = validator.validate(
        {
          age1: 10,
          age2: 20,
          age3: 30,
          age4: 10.5,
          age5: '123',
          age8: NaN,
        },
        {
          age1: 'number',
          age2: {
            type: 'number',
            min: 22,
            max: 30,
          },
          age3: {
            type: 'number',
            max: 20,
          },
          age4: 'number',
          age5: 'number',
          age6: 'number',
          age7: {
            type: 'number',
          },
          age8: 'number',
        }
      )

      assert(errors.age1 === undefined)
      assert(errors.age2 === 'min')
      assert(errors.age3 === 'max')
      assert(errors.age4 === undefined)
      assert(errors.age5 === 'type')
      assert(errors.age6 === 'required')
      assert(errors.age7 === 'required')
      assert(errors.age8 === 'type')
    })


    it('string', function() {

      let errors = validator.validate(
        {
          name2: '',
          name3: '',
          name4: 30,
          name5: '123456',
          name6: '123456',
          name7: '111',
        },
        {
          name0: 'string',
          name1: {
            type: 'string',
          },
          name2: 'string',
          name3: {
            type: 'string',
          },
          name4: 'string',
          name5: {
            type: 'string',
            min: 10,
          },
          name6: {
            type: 'string',
            max: 3,
          },
          name7: {
            type: 'string',
            pattern: /^[a-z]$/
          }
        }
      )

      assert(errors.name0 === 'required')
      assert(errors.name1 === 'required')
      assert(errors.name2 === 'empty')
      assert(errors.name3 === 'empty')
      assert(errors.name4 === 'type')

      assert(errors.name5 === 'min')
      assert(errors.name6 === 'max')
      assert(errors.name7 === 'pattern')
    })




  })
})
