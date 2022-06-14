/**
 * @如何自动注入 import React from 'react';
 * 因为转render后代码是 React.createElement('div')，如果没有import React回报错
 * 配置preset-react => runtime: 'automatic'，这样转render时，是从react/jsx-runtime中导出的jsx，jsx('div')
 *
 **/

const path = require('path')
const del = require('del')
const { rollup } = require('rollup')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const { babel } = require('@rollup/plugin-babel')
const postcss = require('rollup-plugin-postcss')

function resolve(v) {
  return path.join(__dirname, v)
}

function match(id) {
  return ['react', '@babel/runtime'].some((key) => id.startsWith(key))
}

async function build() {
  await del(resolve('output'))

  const bundle = await rollup({
    input: resolve('./index.js'),
    external(id) {
      return match(id)
    },
    plugins: [
      nodeResolve({
        extensions: ['.js', '.jsx']
      }),
      babel({
        // https://babeljs.io/docs/en/babel-preset-react#both-runtimes
        presets: ['@babel/preset-env', ['@babel/preset-react', { runtime: 'automatic' }]],
        plugins: [['@babel/plugin-transform-runtime', { corejs: 3 }]],
        babelHelpers: 'runtime'
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
