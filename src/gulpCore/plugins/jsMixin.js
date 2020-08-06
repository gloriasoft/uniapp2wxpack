const {mixinsEnvCode} = require('../mixinAllEnv')
function jsMixinPlugin (content, {relative}) {
    if (relative.match(/\.js$/i)) {
        return mixinsEnvCode() + content
    }
    return content
}

module.exports = jsMixinPlugin
