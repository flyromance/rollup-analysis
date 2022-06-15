function series() {
  const fns = Array.from(arguments).filter((v) => typeof v === 'function')

  return function (cb) {
    const results = []
    const p = new Promise((resolve, reject) => {
      function next(i) {
        if (i >= fns.length) {
          cb && cb(null, results)
          resolve(results)
          return
        }
        const fn = fns[i]
        const nextIdx = i + 1
        Promise.resolve(fn())
          .then((ret) => {
            results[i] = ret
            next(nextIdx)
          })
          .catch((e) => {
            cb && cb(e)
            reject(e)
          })
      }
      next(0)
    })

    if (!cb) {
      return p
    }
  }
}

function parallel() {
  const fns = Array.from(arguments).filter((v) => typeof v === 'function')

  return function (cb) {
    const p = new Promise((resolve, reject) => {
      Promise.all(fns.map((fn) => fn()))
        .then((results) => {
          cb && cb(null, results)
          resolve(results)
        })
        .catch((e) => {
          cb && cb(e)
          reject(e)
        })
    })

    if (!cb) {
      return p
    }
  }
}

// fn(() => {})
// promisify(fn)()
function promisify(fn) {
  return function (cb) {
    return new Promise((resolve, reject) => {
      fn((e, ret) => {
        cb && cb()
        if (e) {
          return reject(e)
        }
        resolve(ret)
      })
    })
  }
}

function cache(fn) {
  const map = new Map()

  function innerFn(o) {
    if (map.has(o)) return map.get(o)
    const ret = fn(o)
    map.set(o, ret)
    return ret
  }

  innerFn.clear = function () {
    map.clear()
  }

  return innerFn
}

function curry(fn) {
  return function innerFn() {
    const args = Array.from(arguments)
    if (args.length >= fn.length) {
      return fn(args.slice(0, fn.length))
    } else {
      return innerFn.bind(null, ...args)
    }
  }
}

// [1,2,[3,4]]
function flatArray(arr, num = Infinity) {
  if (!arguments.length) return
  if (!Array.isArray(arr)) return [arr]
  if (num <= 0) return arr
  return arr.reduce((buf, item) => {
    return [...buf, ...flat(item, num - 1)]
  }, [])
}

function deepFlatArray(arr) {
  return flat(arr, Infinity)
}

function metaType(o) {
  return Object.prototype.toString.call(o).slice(8, -1).toLowerCase()
}

function isPlainObject(o) {
  return metaType(o) === 'object'
}

function isArray(o) {
  return metaType(o) === 'array'
}

function isMap(o) {
  return metaType(o) === 'map'
}

function isWeakMap(o) {
  return metaType(o) === 'weakmap'
}

function isSet(o) {
  return metaType(o) === 'set'
}

function isWeakSet(o) {
  return metaType(o) === 'weakset'
}

function isDate(o) {
  return metaType(o) === 'date'
}

function isRegExp(o) {
  return metaType(o) === 'regexp'
}

function mockInstanceof(t, Ctor) {
  const prototype = Ctor.prototype
  if (!prototype) return false
  let proto = Object.getPrototypeOf(t)
  while (proto) {
    if (proto === prototype) return true
    proto = Object.getPrototypeOf(proto)
  }
  return false
}

function clone(o) {
  // function  null undefined  primitive-type(5)
  if (typeof o !== 'object' || o === null) {
    return o
  }

  if (o instanceof Date) {
    return new Date(o)
  }

  if (o instanceof RegExp) {
    return new RegExp(o)
  }

  // 防止循环引用
  if (clone.map.has(o)) {
    return o
  } else {
    clone.map.set(o, 1)
  }

  if (isMap(o)) {
    const map = new Map()
    for (const [key, value] of o) {
      map.set(key, clone(value))
    }
    return map
  }

  if (isSet(o)) {
    const set = new Set()
    for (const value of o) {
      set.add(clone(value))
    }
    return set
  }

  if (isArray(o)) {
    return o.map((item) => clone(item))
  }

  if (isPlainObject(o)) {
    return Object.keys(o).reduce((buf, key) => {
      buf[key] = clone(o[key])
      return buf
    }, {})
  }

  return o
}
clone.map = new WeakMap()

function canRecursion(o) {
  return isPlainObject(o) || isArray(o)
}

function extend() {
  const rawArgs = Array.from(arguments)
  const hasDeepArg = typeof rawArgs[0] === 'boolean'
  const deep = hasDeepArg ? rawArgs[0] : false
  let target = hasDeepArg ? rawArgs[1] : rawArgs[0]

  if (!canRecursion(target)) {
    return target
  }

  const sources = (hasDeepArg ? rawArgs.slice(2) : rawArgs.slice(1)).filter((o) => canRecursion(o))

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i]
    if (source === target) continue
    const keys = Object.keys(source)
    for (let j = 0; j < keys.length; j++) {
      const key = keys[i]
      const tV = target[key]
      const sV = source[key]

      // 跳出死循环
      if (tV === target && sV === source) {
        continue
      }

      const tIsObj = isPlainObject(tV)
      const tIsArr = isArray(tV)
      const sIsObj = isPlainObject(sV)
      const sIsArr = isArray(sV)
      if (deep && ((tIsObj && sIsObj) || (tIsArr && sIsArr))) {
        target[key] = extend(true, tV, sV)
      } else if (typeof sV !== 'undefined') {
        source[key] = sV
      }
    }
  }
}

function isEqual(a, b) {
  if (a === b || (a !== a && b !== b)) {
    return true
  }

  if (isDate(a) && isDate(b)) {
    return +a === +b
  }

  if (isRegExp(a) && isRegExp(b)) {
    return a.source === b.source && a.flags === b.flags
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)
    if (aKeys.length !== bKeys.length) return false
    return aKeys.every((key) => isEqual(a[key], b[key]))
  }

  if (isArray(a) && isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, idx) => isDeepEqual(item, b[idx]))
  }

  if (isMap(a) && isMap(b)) {
    if (a.size !== b.size) return false
    for (const [key, value] of a) {
      if (!b.has(key)) return false
      if (!isDeepEqual(value, b.get(key))) return false
    }
    return true
  }

  if (isSet(a) && isSet(b)) {
    if (a.size !== b.size) return false
    const aArr = Array.from(a)
    const bArr = Array.from(b)
    return aArr.every((item, idx) => isDeepEqual(item, bArr[idx]))
  }

  return false
}

module.exports = {
  series,
  parallel,
  promisify,
  cache,
  curry,
  deepFlatArray,
  flatArray,
  isPlainObject,
  isArray,
  isMap,
  isSet,
  isWeakMap,
  isWeakSet,
  isDate,
  isRegExp,
  clone,
  extend,
  isEqual,
  isDeepEqual,
  mockInstanceof
}
