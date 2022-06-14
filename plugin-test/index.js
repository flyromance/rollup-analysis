/**
 * 一般需要pluginutils
 *
 * 插件函数fn，rollup内部获取访问器节点时是直接调用的，如 fn()，所以this是global
 *
 * 访问器节点函数，内部调用时 fn.call(compiler, xx, xxx)，所以在节点函数内可以拿到rollup实例
 *
 */
const { createFilter } = require('@rollup/pluginutils')

const plugin = function (options = {}) {
  // createFilter()

  const isInclude = createFilter(options.include, options.exclude)

  let extracted = []

  return {
    name: 'custom',

    options(userOptions) {
      console.log('options:')
    },

    buildStart(rollupOptions) {
      console.log('buildStart:')
    },

    // ret == null，表示不修改
    // 其他情况表示修改importee
    // alias node-resolve 插件就是提供了这个方法
    resolveId(importee, importer, resolveOptions) {
      // importee 可能是 相对、绝对、模块 形式的字符串
      // const { isEntry } = resolveOptions;
      console.log('resolveId:')
    },

    // ret == null 表示不修改
    // 返回改文件对应的文件内容，默认是内部通过fs.readFile拿到的值
    async load(id) {
      console.log('load:')
    },

    // ret == null 表示不修改
    async transform(code, id) {
      console.log('transform:')
      // 通过id判断需不需要解析
      if (!isInclude(id)) return
      extracted.push(code)
      // return {
      //   code: '(function() { console.log(123); })()',
      //   map: {
      //     mappings: ''
      //   }
      // }
    },

    buildEnd() {
      console.log('buildEnd:')
    },

    renderStart(outputOptions) {
      console.log('renderStart:')
    },

    renderChunk(code, chunk) {
      console.log('renderChunk:')
    },

    //
    augmentChunkHash() {
      console.log('augmentChunkHash:')
    },

    async generateBundle(outputOptions, bundle) {
      console.log('generateBundle:')
      // opt 对应于输出配置，
      // bundle 对应assets
      // this.emitFile(bundle[0])
    }
  }
}

plugin.emit = plugin

module.exports = plugin
