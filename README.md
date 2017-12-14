# x-validator

因为 [parameter](https://github.com/node-modules/parameter) 不够好用，所以按我的想法改进了一版。

`parameter` 最大的问题是无法定制错误消息，包括无法 i18n 和每种类型的错误。

从实际使用角度来看，只有具有业务名词的字段才需要错误提示，比如 password 需要提示”密码错误“。

因此，x-validator 把 `id`, `url`, `email`, `password` 等类型从内置类型中删掉了，因为它们属于业务字段。

现在内置字段只有纯粹的语言类型，比如 `int`, `integer`, `string` 等。

```js
const {
  Validator,
  checkString,
} = require('x-validator')

const validator = new Validator()

// 扩展规则
validator.add(
  {
    nickname(rule, value) {

      rule = {
        required: rule.required,
        empty: rule.empty,
        type: 'string',
        min: NICKNAME_MIN_LENGTH,
        max: NICKNAME_MAX_LENGTH,
      }

      return checkString(rule, value)

    }
  },
  {
    nickname: {
      required: '请输入昵称',
      empty: '请输入昵称',
      type: '请输入昵称',
      min: '昵称请不要少于' + NICKNAME_MIN_LENGTH + '个字',
      max: '昵称请不要超过' + NICKNAME_MAX_LENGTH + '个字',
    }
  }
)

var errors = validator.validate(
    {
        nickname: 'xxx',
    },
    {
        nickname: 'nickname',
    }
);
// 如果没有错误，errors 为 undefined
// 如果有错误，格式如下：
{
  key1: '错误提示',
  key2: '错误提示'
}
```

文档不全之处，请看 [parameter](https://github.com/node-modules/parameter) 的。