// 替换代码中的变量
import replace from 'rollup-plugin-replace'
// 输出打包后的文件大小
import filesize from 'rollup-plugin-filesize'
// ES6 转 ES5
import buble from 'rollup-plugin-buble'
// 压缩
import { terser } from 'rollup-plugin-terser'

import { name, version, author, license } from './package.json'

const banner =
  `${'/**\n' + ' * '}${name}.js v${version}\n` +
  ` * (c) 2017-${new Date().getFullYear()} ${author}\n` +
  ` * Released under the ${license} License.\n` +
  ` */\n`;

const sourcemap = true

let suffix = '.js'

const env = process.env.NODE_ENV
const minify = process.env.NODE_MINIFY === 'true'

const replaces = {
  'process.env.NODE_ENV': JSON.stringify(env),
  'process.env.NODE_VERSION': JSON.stringify(version)
}

let plugins = [
  replace(replaces),
]

if (minify) {
  suffix = '.min' + suffix
}

const output = []

plugins.push(
  buble({
    namedFunctionExpressions: false
  })
)
output.push({
  file: `dist/index${suffix}`,
  format: 'umd',
  name: 'Validator',
  banner,
  sourcemap,
})

if (minify) {
  plugins.push(
    terser()
  )
}

plugins.push(
  filesize(),
)

module.exports = [
  {
    input: 'index.js',
    output,
    plugins
  }
]