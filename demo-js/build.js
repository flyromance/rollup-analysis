/**
 *
 * @问题1 为什么要有commonjs插件
 *       源码是cjs形式的，需要用commonjs插件把源码转esm形式，因为只有esm才能方便转为其他形式
 *       如果require是写在内部函数中，rollup把他们提升到顶部
 *
 * @问题 rollup是如何处理 import xx from 'xxx' 中的 'xxx'，也就是处理模块查找
 *      看xxx是否符合 external ---@步骤00
 *         如果符合，不处理模块解析，done！
 *         如果不符合，往下走
 *      看xxx是否符合 alias，处理后得到xxx1 ---@步骤0
 *         如果xxx1 !== xxx，则回到 @步骤00
 *         否则往下
 *      看xxx1类型来做处理。这就是node-resolve插件的作用，提供了resolveId方法，解析规则比较复杂，涉及到 rootDir 等，对应于该插件的配置
 *      如果 xxx1 是绝对路径 or 相对路径，转为绝对路径 xxx2 ---@步骤1
 *          如果这个路径是文件，根据ext推断文件类型，如果ext不存在，就当成js文件处理，文件解析失败就报错 ---@步骤2
 *          如果这个路径是文件夹 ---@步骤3
 *              如果文件夹内有package.json，并且有main or module字段，拼接出一个路径，回到@步骤1
 *              否则文件就是 xx/index xx/index.js xx/index.jsx，哪个存在就是哪个文件，回到@步骤2
 *      否则 xxx1 是模块
 *          如果是纯模块 'react' || '@scope/react' ---@步骤4
 *              [__dirname/node_modules，path.dirname(__dirname)/node_modules, ...] 这里面每个文件下找 xxx1
 *              如果找到就得到一个文件夹路径dir1， 返回模块的路径 dir2 => path.join(dir1, 'react')
 *              dir2 到回到@步骤3 , 返回一个文件路径，done！
 *              如果没找到就报错
 *          非纯模块 'react/runtime-jsx'
 *              取出纯模块 'react' 回到@步骤4 ，拿到模块的文件夹路径 dir2，join(dir2, 'runtmie-jsx') 得到带验证路径，回到@步骤1
 *
 *      'react'             => /users/xxxxx/node_modeules/react/index.js
 *      'react/runtime-jsx' => /users/xxxxx/node_modeules/react/runtime-jsx.js
 *
 * @问题 为什么要有node-resolve插件
 *       处理模块解析，如果都命中external、alias，这个插件不配置也不会报错
 *
 * @问题 alias 要放在 node-resolve 之前，因为alias也是在修改 importee
 *
 * @问题3 如何把helper函数抽离
 * https://babeljs.io/docs/en/babel-plugin-transform-runtime#helpers
 * 1、引入@babel/plugin-transform-runtime，开启helpers: true，
 *    默认corejs: false，从@babel/runtime中引入
 *    设置corejs: 3，从@babel/runtime-corejs3引入
 * 2、配置external 需要根据不同@babel/runtime来写external逻辑
 * 3、需要在package.json中 dependencies or peerDependencies 声明 @babel/runtime or @babel/runtime-corejs3
 *
 * @问题 如何让babel不编译
 *      rollup-babel插件配置 exclude: 'node_modules/**'
 *
 * @问题 如何生成souremap
 *
 *
 */
const path = require('path')
const del = require('del')
const rollup = require('rollup')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const alias = require('@rollup/plugin-alias')

const testPlugin = require('../plugin-test')

const externalIds = ['vue', 'rollup', 'react-is']

function resolve(v) {
  return path.join(__dirname, v)
}

async function start() {
  await del(resolve('./output'))

  const bundle = await rollup.rollup({
    input: path.join(__dirname, 'index.js'),
    external(name) {
      console.log('external:');
      return externalIds.some((v) => name.startsWith(v)) ? true : false
    },
    plugins: [alias({ entries: { utils: './utils' } }), commonjs(), nodeResolve(), testPlugin()]
  })

  await bundle.write({
    file: path.join(__dirname, 'output/index.esm.js'),
    format: 'es'
  })
}

start()
