const path = require('path')
const del = require('del')
const { rollup } = require('rollup')
const ts = require('@rollup/plugin-typescript')
const dts = require('rollup-plugin-dts')
const { series, parallel } = require('../utils')

const dtsPlugin = dts.default || dts

function resolve(v) {
  return path.join(__dirname, v)
}

async function clean() {
  return del(resolve('./output'))
}

async function buildJs() {
  const bundle = await rollup({
    input: resolve('index.ts'),
    plugins: [ts()]
  })
  await bundle.write({
    file: resolve('./output/index.js'),
    format: 'esm'
  })
  await bundle.close()
}

async function buildTypes() {
  const bundle = await rollup({
    input: resolve('index.ts'),
    plugins: [dtsPlugin()]
  })
  await bundle.write({
    file: resolve('./output/index.d.ts'),
    format: 'esm'
  })
  await bundle.close()
}

const build = series(clean, parallel(buildJs, buildTypes))
build(() => {
  console.log('build success!')
})
