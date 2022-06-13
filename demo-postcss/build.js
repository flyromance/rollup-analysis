/**
 * https://github.com/egoist/rollup-plugin-postcss
 */
const path = require('path')
const del = require('del')
const { rollup } = require('rollup')
const postcss = require('rollup-plugin-postcss')

function resolve(v) {
  return path.join(__dirname, v)
}

// 为什么不用node-resolve插件不会报错，因为是相对路径！
// TODO: 压缩css怎么弄
async function build() {
  await del(resolve('output'))

  const bundle = await rollup({
    input: resolve('./index.js'),
    plugins: [
      postcss({
        // minimize: true, // default is false
        extract: true // default is false; toggle
      })
    ]
  })

  await bundle.write({
    file: resolve('./output/index.js')
  })
}

build()
