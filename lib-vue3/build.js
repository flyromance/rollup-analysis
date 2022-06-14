/**
 * https://github.com/vuejs/rollup-plugin-vue
 *
 * v6.x 对应于 vue3
 *
 * @手动安装 @vue/compiler-sfc，它依赖 @vue/comipler-core @vue/comipler-dom 等
 *
 * 一个完整的vue包括以下三个部分
 * template  由@vue/comipler-core @vue/comipler-dom完成
 * script    @手动安装 rollup-babel babel等
 * style     @手动安装 rollup-postcss css-processor等
 **/

const path = require('path')
const { rollup } = require('rollup')
const vue = require('rollup-plugin-vue')
const { babel } = require('@rollup/plugin-babel')
const postcss = require('rollup-plugin-postcss')

function resolve(v) {
  return path.join(__dirname, v)
}

// 为什么不用node-resolve插件不会报错，因为是相对路径！
// TODO: 压缩css怎么弄
async function build() {
  const bundle = await rollup({
    input: resolve('./index.js'),
    external(id) {
      return id === 'vue' ? true : false
    },
    plugins: [
      vue({}), // TODO: 一定要放在第一个
      babel({
        babelHelpers: 'bundled'
      }),
      postcss({
        extract: true // 默认是false
      })
    ]
  })

  await bundle.write({
    file: resolve('./output/index.js')
  })
}

build()
