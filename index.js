var loaderUtils = require('loader-utils');
var MarkdownIt = require('markdown-it');
var hljs = require('highlight.js');
var path = require('path');

module.exports = function (source) {
    this.cacheable();

    var options = loaderUtils.getOptions(this);
    
    var markdownOptions = {
        html: true,
        highlight: function (code) {
            return hljs.highlightAuto(code).value;
        }
    };
    if (!options.highlight) {
        delete markdownOptions.highlight;
    }

    var md = MarkdownIt(markdownOptions);

    var tokens = md.parse(source);
    
    var importScript = [];
    var script = [];
    var newTokens = [];
    tokens.forEach(function (token) {
        if (token.type === 'fence' && token.tag === 'code') {
            if (token.info.trim() === 'html') {
                var htmlToken = md.parse('<div></div>')[0];
                htmlToken.content = token.content;
                newTokens.push(htmlToken);

                token.attrSet(':skip', true);
            }
            if (token.info.trim() === 'js') {
                token.content = token.content.replace(/import[\s\S]*?from[\s\S]*?\n/g, function ($0) {
                    if (importScript.every(function (s) { return s.replace(/\s|\n/g, '') !== $0.replace(/\s|\n/g, '') })) {
                        importScript.push($0);
                    }
                    return '';
                })
                script.push(token.content);
                
                token.attrSet(':skip', true);
            }
        }
        if (token.type === 'table_open') {
            token.attrSet('class', 'table table-bordered');
        }
        newTokens.push(token);
    });
    var result = md.renderer.render(newTokens, md.options);
    var componentName = 'component-demo-' + this.resourcePath
                                                .match(/.*components\/(.*)\.md/)[1]
                                                .replace(/\//g, '-')
                                                .replace(/ms-/g, '');
    var component = [
        importScript.join(''),
        'export const name = \'' + componentName + '\';' +
        'avalon.component(name, {' +
        '    template: `<div>' + result + '</div>`' +
        '});' +
        script.join('\n')
    ];
    return component.join('\n');
}