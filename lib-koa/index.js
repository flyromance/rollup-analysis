/** 
 * 洋葱模型
 * const fn = createFn(fn1, fn2, fn3)
 * fn(ctx).then();
 */
function mergeMiddlewares() {
  const fns = Array.from(arguments).filter((v) => typeof v === 'function')

  return function (ctx) {
    let preIdx = -1
    function next(i) {
      if (i <= preIdx) {
        console.log('不能重复调用')
        return
      }
      preIdx = i
      const fn = fns[i]
      if (!fn) return
      return new Promise(fn(ctx, next.bind(null, i + 1)))
    }

    return next(0)
  }
}

/**
 * ctx 代理模型
 * 
 * response => { app, ctx, request, res, req, }
 *
 * reponse.__proto__ => app.response
 *
 * app.response.__proto__ => { get xx() {},   set xx() {},   method() {} }
 */
class A {
  constructor(obj, pKey) {
    this.obj = obj // ctx
    this.pKey = pKey // response || request
  }

  method(name) {
    const { pKey, obj } = this
    Object.defineProperty(obj, name, {
      value: function (...args) {
        return obj[pKey][name](...args)
      },
      enumerable: false,
      writable: true,
      configurable: true
    })
    return this
  }

  getter(name) {
    const { pKey, obj } = this
    Object.defineProperty(obj, name, {
      get() {
        return this[pKey][name]
      }
    })
    return this
  }

  access(name) {
    const { pKey } = this
    Object.defineProperty(this.obj, name, {
      get() {
        return this[pKey][name]
      },
      set(val) {
        this[pKey][name] = val
      }
    })
    return this
  }
}

function delegate(proto, name) {
  return new A(proto, name)
}

/**
 * router 匹配
 * 
 */