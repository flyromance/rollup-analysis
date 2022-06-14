function series() {
  const fns = Array.from(arguments).filter((v) => typeof v === 'function')

  return function (cb) {
    const p = new Promise((resolve, reject) => {
      function next(i) {
        if (i >= fns.length) {
          cb && cb(null)
          resolve()
          return
        }
        const fn = fns[i++]
        Promise.resolve(fn())
          .then(() => {
            next(i)
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

module.exports = {
  series,
  parallel
}
