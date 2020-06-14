const promiseFinallyInject = `
if (!Promise.prototype.finally) {
    Promise.prototype.finally = function (callback) {
        let P = this.constructor;
        return this.then(
            value  => P.resolve(callback()).then(() => value),
            reason => P.resolve(callback()).then(() => { throw reason })
        );
    };
}
`

function polyfillPlugin (content, {relative}) {
    if (process.env.PACK_TYPE === 'toutiao' && relative.match(/^\/app.js$/i)) {
        return `${promiseFinallyInject};\n${content}`
    }
    return content
}

module.exports = polyfillPlugin
