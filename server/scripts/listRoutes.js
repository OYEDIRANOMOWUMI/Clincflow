const app = require('../index')

function listRoutes() {
  const routes = []
  app._router.stack.forEach(mw => {
    if (!mw.route && mw.name === 'router') {
      // router middleware
      mw.handle.stack.forEach(r => {
        const method = Object.keys(r.route.methods)[0].toUpperCase()
        routes.push(`${method} ${mw.regexp} -> ${r.route.path}`)
      })
    } else if (mw.route) {
      const methods = Object.keys(mw.route.methods).map(m => m.toUpperCase()).join(',')
      routes.push(`${methods} ${mw.route.path}`)
    }
  })
  console.log('Registered routes:')
  console.log(routes.join('\n'))
}

listRoutes()
