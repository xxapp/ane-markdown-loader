var loaderUtils = require('loader-utils');
var MarkdownIt = require('markdown-it');
var hljs = require('highlight.js');
var path = require('path');

module.exports = function (source) {
    // this.cacheable();

    var options = {
        html: true,
        highlight: function (code) {
            return hljs.highlightAuto(code).value;
        }
    };
    var md = MarkdownIt(options);

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
                    if (importScript.indexOf($0.replace(/\s|\n/g, '')) < 0) {
                        importScript.push($0);
                    }
                    return '';
                })
                script.push(token.content);
                
                token.attrSet(':skip', true);
            }
        }
        newTokens.push(token);
    });
    var result = md.renderer.render(newTokens, md.options);
    // ['{', '}'].forEach(function (l) {
    //     var re = RegExp('\\' + l + '\\' + l, 'g');
    //     var hex = '&#x' + l.charCodeAt(0).toString(16).toUpperCase() + ';';
    //     result = result.replace(re, hex + hex);
    // });
    result = result.replace(/\n/g, '<br>');
    var component = [
        importScript.join(''),
        'export const name = \'component-demo-input\';' +
        'avalon.component(name, {' +
        '    template: `<div>' + result + '</div>`' +
        '});' +
        script.join('\n')
    ];
    console.log(component.join('\n'));
    return component.join('\n');
}

function heredoc(fn) {
    return fn.toString().replace(/^[^\/]+\/\*!?\s?/, '').
    replace(/\*\/[^\/]+$/, '').trim().replace(/>\s*</g, '><')
}

var mdContent = heredoc(function () {
    /*
# 输入组件

基本用法

<div :skip="true"></div>

``` html
<div :controller="doc-input-basic">
    <xmp is="ms-form" :widget="{$form: @$form}">
        <ms-form-item :widget="{label:'名字'}">
            <ms-input :widget="{id:'test-value',col:'name',value:@value,$rules:{required:true,message:'请输入名字'}}"></ms-input>
        </ms-form-item>
    </xmp>
    <pre>{{@json}}</pre>
</div>
```

``` js
import * as avalon from 'avalon2';
import { createForm } from 'ane';

const vm = avalon.define({
    $id: 'doc-input-basic',
    value: '123',
    json: '',
    $form: createForm({
        onFieldsChange(fields, record) {
            vm.json = JSON.stringify(record);
        }
    })
});
```
    */
});

// module.exports(mdContent);