const fs = require('fs-extra')
const path = require('path')
fs.copySync(path.resolve(process.cwd(), 'src', 'template'), path.resolve(process.cwd(), 'dist', 'template'))
