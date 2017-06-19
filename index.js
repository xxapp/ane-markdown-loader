var loaderUtils = require('loader-utils');
var path = require('path');

module.exports = function (source) {
    this.cacheable && this.cacheable();

    var markdownCompilerPath = path.resolve(__dirname, './compiler.js');
    var result = 'module.exports = require(' +
        loaderUtils.stringifyRequest(this, '!!ts-loader!' + markdownCompilerPath + '!' + this.resourcePath) +
    ');';

    return result;
}