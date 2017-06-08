var loaderUtils = require('loader-utils');
var unified = require('unified');
var markdown = require('remark-parse');
var stringify = require('remark-stringify');
var html = require('remark-html');
var path = require('path');

module.exports = function (source) {
    // this.cacheable();

    var node = unified()
        .use(markdown, { commonmark: true })
        .parse(source);
    
    var importScript = [];
    var script = [];
    var newNodeChildren = [];
    node.children.forEach(function (child) {
        if (child.type === 'code') {
            if (child.lang === 'html') {
                newNodeChildren.push({
                    type: 'html',
                    value: child.value
                });
            }
            if (child.lang === 'js') {
                child.value = child.value.replace(/import[\s\S]*?from[\s\S]*?\n/g, function ($0) {
                    if (importScript.indexOf($0.replace(/\s|\n/g, '')) < 0) {
                        importScript.push($0);
                    }
                    return '';
                })
                script.push(child.value);
            }
        }
        newNodeChildren.push(child);
    });
    node.children = newNodeChildren;

    var processed = unified()
        .use(stringify)
        .stringify(node);
    var result = unified()
        .use(markdown, { commonmark: true })
        .use(html)
        .processSync(processed).toString()
    var component = [
        `${importScript.join('')}
        export const name = 'component-demo-input';
        avalon.component(name, {
            template: \`${result}\`
        });
        ${script.join('\n')}
        `
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

avalon.define({
    $id: 'doc-input-basic',
    value: '123',
    json: '',
    $form: createForm(),
    onInit() {
        this.$form.onFieldsChange = (fields, record) => {
            this.json = JSON.stringify(record);
        }
    }
});
```
    */
});

//module.exports(mdContent);