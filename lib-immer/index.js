function canRecursion(o) {
  return ['array', 'object'].includes(Object.prototype.toString.call(o).slice(8, -1).toLowerCase())
}

function makeChange(target, key, val) {
  let m = target.__m
  m.isChanged = true
  m.value = { ...m.raw, [key]: val }
  m.parent && makeChange(m.parent.raw, m.key, m.value)
}

const traps = {
  get(target, key, receiver) {
    const a = Reflect.get(target, key, receiver)
    if (!canRecursion(a)) {
      return a
    }
    return makeProxy(a, key, target.__m)
  },
  set(target, key, val, receiver) {
    const preVal = Reflect.get(target, key, receiver)
    if (preVal === val) return

    makeChange(target, key, val)
  }
}

function makeProxy(obj, key, parent) {
  const p = new Proxy(obj, traps)
  Object.defineProperty(obj, '__p', {
    value: p
  })
  Object.defineProperty(obj, '__m', {
    value: {
      parent,
      raw: obj,
      isChanged: false,
      key
    }
  })
  return p
}

// { a: 1, b: { c: 1 }, c: { d: 0 } }
// (p) => { p.a = 2 }
// (p) => { p.b.c = 2 }
function immer(obj, handler) {
  const p = makeProxy(obj)
  handler(p)
  return obj.__m.value
}
