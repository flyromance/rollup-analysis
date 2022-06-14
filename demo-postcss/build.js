/**
 * https://github.com/egoist/rollup-plugin-postcss
 *
 * 内置压缩功能
 */
const path = require('path')
const del = require('del')
const { rollup } = require('rollup')
const postcss = require('rollup-plugin-postcss')

function resolve(v) {
  return path.join(__dirname, v)
}

async function build() {
  await del(resolve('output'))

  const bundle = await rollup({
    input: resolve('./index.js'),
    plugins: [
      postcss({
        // autoprefixer px2rem px2viewport
        plugins: [],
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
