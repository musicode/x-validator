# x-validator

因为 [parameter](https://github.com/node-modules/parameter) 不够好用，所以按我的想法改进了一版。

文档不全之处，请看 [parameter](https://github.com/node-modules/parameter) 的。

```js

// 传一个函数定制错误消息，否则返回错误原因字段，如 required/min/max/pattern 等
var validator = new Validator(function (key, value, errorReason, rule) {
    switch (errorReason) {
        case 'required':
            return '缺少' + key;

        case 'type':
            return type + '类型错误';

        case 'empty':
            return key + '不能为空字符串';

        case 'pattern':
            return key + '格式错误';

        case 'min':
            if (typeof value === 'number') {
                return key + '不能小余' + rule.min;
            }
            else {
                return key + '长度不能小余' + rule.min;
            }

        case 'max':
            if (typeof value === 'number') {
                return key + '不能小余' + rule.min;
            }
            else {
                return key + '长度不能小余' + rule.min;
            }

        case 'itemType':
            return key + '数组类型错误';
    }
});

// 扩展规则
validator.add('name', function (rule, value) {

  // 没有错误不用返回
  // 有错误，返回错误的类型，如上面列举的那些

})

// 第三个参数传入错误信息
// 如果找不到，则调 translate 函数获取
var errors = validator.validate(
    {
        name: 'xxx',
        age: 20,
        desc: 'xxx'
    },
    {
        name: 'string',
        age: 'int',
        desc: {
          // 不允许为空字符串
          empty: false,
          type: 'string',
          min: 5,
          max: 100
        }
    },
    {
        name: {
            required: '缺少 name',
            empty: '不能为空字符串',
            type: '必须是字符串',
        },
        age: {
            required: '缺少 name',
            type: '必须是整型',
        },
        desc: {
            required: '缺少 name',
            empty: '不能为空字符串',
            type: '必须是字符串',
            min: '不能少于5个字符',
            max: '不能多余100个字符'
        }
    }
);
// 如果没有错误，errors 为 undefined
// 如果有错误，格式如下：
{
  key1: '错误提示',
  key2: '错误提示'
}
```