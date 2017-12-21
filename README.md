# x-validator

因为 [parameter](https://github.com/node-modules/parameter) 不够好用，所以按我的想法改进了一版。

`parameter` 最大的问题是无法定制错误消息，包括无法 i18n 和每种类型的错误。

举个例子，登录通常需要 `username` 和 `password`，用 `parameter` 的话来说就是：

```js
// 伪码，关注配置对象就好
var errors = validate(data, {
  username: {
     // 是否必传
    required: true,
    // 是否可以是空字符串，当 `type` 是 string 时可用
    empty: false,
    type: 'string',
  },
  password: {
    // 是否必传
    required: true,
    // 是否可以是空字符串，当 `type` 是 string 时可用
    empty: false,
    type: 'string',
  }
})
```

如果验证失败，比如没传 `username`，错误消息是 `{ username: 'is required' }`，可是你是个中国人，给老子看英文是几个意思？！

于是我们想，把 `is required` 翻译成中文不就行了？

可怎么翻译呢，比如这句话还缺少个主语呢，如果碰上检验 `min` 或 `max` 的，这时还涉及插值，更加蛋疼。

这样看起来，翻译错误信息这件事还真不容易。


但是我们从实际使用角度来看，只有具有业务名词的字段才需要错误提示，比如 `password` 需要提示”密码错误“。

因此，`x-validator` 把 `id`, `url`, `email`, `password` 等类型从内置类型中删除了，因为它们属于业务字段。

也就是说，`x-validator` 本身不负责翻译，只告诉你发生了什么类型的错误，比如 `required` 表示必传的你没传，`empty` 表示不能为空的为空了，至于你想怎么提示用户，那是你的逻辑。

## 内置类型

* integer: 整型
* int: 同 integer
* number: 数字，且不是 NaN
* string: 字符串
* boolean: 布尔值，即 true 或 false
* bool: 同 boolean
* enum: 枚举值
* date: string 类型的扩展类型，格式为 YYYY-MM-DD
* dateTime: string 类型的扩展类型，格式为 YYYY-MM-DD HH:mm:SS
* array: 数组类型
* object：对象类型

## 校验规则

所有内置类型都支持的规则：`required`

* integer: `type` `min` `max`
* int: 同 integer
* number: `type`
* string: `empty` `min` `max` `pattern`
* boolean: `type`
* bool: 同 boolean
* enum: `type`
* date: 同 string
* dateTime: 同 string
* array: `type` `min` `max` `itemType`
* object: `type`


## 使用方式

```js
const {
  Validator,
  checkString,
} = require('x-validator')

const validator = new Validator()

// 添加业务字段
validator.add(
  {
    username(rule, value) {

      rule = {
        required: rule.required,
        empty: rule.empty,
        type: 'string',
        min: USERNAME_MIN_LENGTH,
        max: USERNAME_MAX_LENGTH,
      }

      return checkString(rule, value)

    }
  },
  {
    username: {
      required: '请输入用户名',
      empty: '请输入用户名',
      type: '请输入用户名',
      min: '用户名请不要少于' + USERNAME_MIN_LENGTH + '个字',
      max: '用户名请不要超过' + USERNAME_MAX_LENGTH + '个字',
    }
  }
)

var errors = validator.validate(
    {
        username: 'value',
    },
    {
        username: 'nickname',
    }
);
// 如果没有错误，errors 为 undefined
// 如果有错误，格式如下：
{
  username: '请输入用户名',
}
```

文档不全之处，请看 [parameter](https://github.com/node-modules/parameter) 的。