/**
 * 如果源码是cjs形式的，需要用commonjs插件把源码转esm形式
 * @问题1 如果require是写在内部函数中，rollup把他们提升到顶部
 */

const path = require('path')
const del = require('del')
const rollup = require('rollup')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')

const externalIds = ['vue', 'rollup', 'vue-template-compiler']

function resolve(v) {
  return path.join(__dirname, v)
}

async function start() {
  await del(resolve('./output'))

  const bundle = await rollup.rollup({
    input: path.join(__dirname, 'index.js'),
    external(name) {
      return externalIds.includes(name) ? true : false
    },
    plugins: [commonjs(), nodeResolve()]
  })

  await bundle.write({
    file: path.join(__dirname, 'output/index.esm.js'),
    format: "es"
  })

  await bundle.write({
    file: path.join(__dirname, 'output/index.cjs.js'),
    format: 'cjs'
  })
}

start()
