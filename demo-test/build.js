const path = require('path')
const del = require('del')
const { rollup } = require('rollup')
const commonjs = require('@rollup/plugin-commonjs')
const { nodeResolve } = require('@rollup/plugin-node-resolve')

const testPlugin = require('../plugin-test')

const { series, parallel } = require('../utils')

function resolve(v) {
  return path.isAbsolute(v) ? v : path.join(__dirname, v)
}

async function clean() {
  return del(resolve('./output'))
}

async function build() {
  const bundle = await rollup({
    input: resolve('./index.js'),
    plugins: [testPlugin()]
  })

  await bundle.write({
    file: resolve('./output/index.js')
  })
}

series(clean, build)()
