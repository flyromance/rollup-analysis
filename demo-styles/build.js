/**
 * https://github.com/Anidetrix/rollup-plugin-styles
 * 
 * 没有压缩功能
 **/
const path = require('path')
const { rollup } = require('rollup')
const styles = require('rollup-plugin-styles')

function resolve(v) {
  return path.join(__dirname, v)
}

// 为什么不用node-resolve插件不会报错，因为是相对路径！
// TODO: 压缩css怎么弄
async function build() {
  const bundle = await rollup({
    input: resolve('./index.js'),
    plugins: [
      styles({
        // mode: 'extract', // default is inject;  toggle this
        assetFileNames: '[name]-[hash].[extname]'
      })
    ]
  })

  await bundle.write({
    file: resolve('./output/index.js')
  })
}

build()
