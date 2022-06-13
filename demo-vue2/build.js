/**
 * https://github.com/vuejs/rollup-plugin-vue/tree/v5.1.9
 *
 * v5.x 对应于 vue2
 *
 * @自动安装 @vue/component-compiler @vue/component-compiler-utils，用于把sfc拆分为以下三个部分
 *
 * @自动安装 vue-runtime-helpers 运行时的代码，比如注入css的方法、标准化对象组件的方法
 *
 * template   @手动安装 vue-template-compiler 用于处理tempalte到render函数，需要与vue版本保持一致
 * script     @手动安装 babel rollup-babel等
 * jsx        @手动安装 @vue/babel-preset-jsx
 * style      @手动安装 css-processor rollup-postcss等
 * 
 * @问题 在.vue文件中写 jsx 语法会报错
 **/

const path = require('path')
const { rollup } = require('rollup')
const vue = require('rollup-plugin-vue')
const { babel } = require('@rollup/plugin-babel')
const postcss = require('rollup-plugin-postcss')

function resolve(v) {
  return path.join(__dirname, v)
}

async function build() {
  const bundle = await rollup({
    input: resolve('./index.js'),
    external(id) {
      return id === 'vue' ? true : false
    },
    plugins: [
      // TODO: 一定要放在第一个
      vue({
        // exposeFilename: true,
        css: false // defalut is ture，表示inline形式插入脚本
      }),
      babel({
        presets: ['@vue/babel-preset-jsx'],
        babelHelpers: 'bundled'
      }),
      postcss({
        // minimize: true,
        extract: true // 默认是false
      })
    ]
  })

  await bundle.write({
    file: resolve('./output/index.js')
  })
}

build()
