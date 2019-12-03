# x-validator

```js
import {
  Validator,
} from 'x-validator'

const validator = new Validator()

const errors = validator.validate(
  // 表单数据
  {
    nickname: 'xx',
    age: 101
  },
  // 校验规则
  {
    nickname: {
      type: 'string',
      min: 5,
      max: 10
    },
    age: {
      type: 'int',
      min: 18,
      max: 100
    }
  },
  // 错误信息
  {
    nickname: {
      type: '昵称类型错误',
      min: '昵称请不要少于 5 个字',
      max: '昵称请不要超过 10 个字'
    },
    age: {
      type: '年龄类型错误',
      min: '年龄最小为 18 岁',
      max: '年龄最大为 100 岁'
    }
  }
)

// 如果没有错误，errors 为 undefined
// 如果有错误，格式如下：
{
  nickname: '昵称请不要少于 5 个字',
  age: '年龄最大为 100 岁'
}
```

## 内置验证规则

每种规则都支持 `required` 规则，即数据是否包含某个字段，默认为 `true`。

### string

* `type`：必须是字符串类型
* `empty`：可选，是否可以是 `""`，默认为 `false`
* `min`: 可选，字符串长度的下限，类似至少输入 n 个字符
* `max`: 可选，字符串长度的上限，类似最多输入 n 个字符
* `pattern`: 可选，正则校验

```js
{
  type: 'string',
  empty: true,
  min: 5,
  max: 10000,
  pattern: /^\d+$/
}
```

### integer（别名：`int`）

* `type`：必须是整数，浮点数会验证失败
* `min`: 可选，整数的下限
* `max`: 可选，整数的上限

```js
{
  type: 'integer',
  min: 1,
  max: 100
}
```

### number

* `type`：可以是整数或浮点数，`NaN` 会验证失败
* `min`: 可选，数字的下限
* `max`: 可选，数字的上限

```js
{
  type: 'number',
  min: 1,
  max: 100
}
```

### boolean（别名：`bool`）

* `type`：必须是布尔类型
* `value`: 可选，强制为 `true` 或 `false`

```js
{
  type: 'boolean',
  value: true
}
```

### enum

* `type`：必须是 `values` 中的某一个
* `values`: 枚举值

```js
{
  type: 'enum',
  values: [1, 2, 3]
}
```

### array

* `type`：必须是数组类型
* `min`: 可选，数组长度的下限
* `max`: 可选，数组长度的上限
* `itemType`: 可选，数组项的类型，常见的类型包括 `string`、`number`、`boolean`

```js
{
  type: 'array',
  values: [1, 2, 3]
}
```

### object

* `type`：必须是对象类型

```js
{
  type: 'object'
}
```

## 自定义校验规则

我们可以把一些业务常用的规则，注册到 `Validator` 实例中，这样可以避免同一个规则配置重复出现在多个地方，提高代码的可维护性。

```js

import {
  Validator,
  checkString,
  checkInteger,
} from 'x-validator'

const validator = new Validator()

// 添加业务字段
validator.add(
  // 校验规则
  {
    name(rule, value) {

      return checkString(
        {
          required: rule.required,
          empty: rule.empty,
          type: 'string',
          min: 5,
          max: 10,
        },
        value
      )

    },
    age(rule, value) {

    	return checkInteger(
    	  {
    	    required: rule.required,
    	    type: 'integer',
    	    min: 18,
    	    max: 100
    	  },
    	  value
    	)

    }
  },
  // 报错信息
  {
    name: {
      required: '请输入用户名',
      empty: '请输入用户名',
      type: '用户名类型错误',
      min: '用户名请不要少于 5 个字',
      max: '用户名请不要超过 10 个字'
    },
    age: {
      required: '请输入年龄',
      type: '年龄类型错误',
      min: '年龄最小为 18 岁',
      max: '年龄最大为 100 岁'
    }
  }
)

// 使用场景
const errors = validator.validate(
  // 表单数据
  {
    nickname: 'this is a long name',
    age: 101
  },
  // 指定 nickname 对应的校验规则为 name
  {
    nickname: 'name',
    age: 'age'
  }
)
```
