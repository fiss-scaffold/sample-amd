//发布路径设置
fis.set('release', {
    'dir': 'output',
    /*'watch': true,
    'live': true,*/
    /*'lint': true,*/
    'clean': true,
    //每次release的时候是否把release目录清空，
    //注意，如果启动watch/live时，需要把clean设置为true，因为默认只是增量release，而每次清空目录，每次只会重新构建变动的文件
    'clear': true
});

fis.set('project.files', [
    'src/**',
]);
fis.set('release.jsPkgDir','js');

var pageFiles = ['index.html', 'page1.html'];
var page_config = {
    'src/index.html': 'index',
    'src/page1.html': 'page1'
};


//package 设置
fis.match('::package', {
    spriter: fis.plugin('csssprites-plus', {
        margin: 10,
        layout: 'matrix',
        to: '/img'
    })
});


/**
 * 开发阶段(dev)打包配置
 * 不对css/js/img进行合并，一切都是按需加载
 * scss之类的文件会编译成最终产物css等
 * inline内嵌的资源会被自动合并进宿主文件
 * 为了防止缓存，所有资源打包时添加hash值（只用于开发阶段，上线时通过版本系统来控制更新)
 * 打开html/css/js的语法检查提示
 * 默认开启文件修改自动刷新浏览器机制
 * 默认的构建后的文件放在系统默认的输出路径（通过fiss server open查看）
 */

//资源预处理
//通用资源处理
fis.match('src/(**)', {
    release: '$1',
    useHash: true,
});

fis.match('{*.html,manifest.json}', {
    useHash: false
});

//特殊路径下的资源处理
fis.match('src/(test/**)', {
    useHash: false
});

fis.match('scss/(*.scss)', {
    parser: fis.plugin('node-sass-x'),
    rExt: '.css',
    release:'/css/$1'
});

fis.match('/src/test/server.conf', {
    release: '/config/server.conf'
});

fis.match('src/js/(lib/**)', {
    useHash: false
});

fis.match('src/fragment/**', {
    release: false,
});

fis.match('js/(mod/**/*).js', {
    isMod: true,
    moduleId: '$1'
});

fis.match('js/(pkg/*).js', {
    isMod: true,
    moduleId: '$1'
});

//------------------------------------代码校验BEGIN----------------------------

fis
//html 校验
    .match('*.html', {
        lint: fis.plugin('html-hint', {
            // HTMLHint Options
            ignoreFiles: [],
            rules: {
                "tag-pair": true,
                "doctype-first": true,
                "spec-char-escape": true,
                "id-unique": true,
            }
        })
    })
    // css 校验
    .match('*.css', {
        lint: fis.plugin('csslint', {
            ignoreFiles: [],
            rules: {
                "known-properties": 2,
                "empty-rules": 1,
                "duplicate-properties": 2
            }
        })
    })
    //js 校验
    .match('*.js', {
        lint: fis.plugin('eslint', {
            ignoreFiles: ['lib/**.js', 'fis-conf.js', 'test/**.js'],
            rules: {
                "no-unused-expressions": 1,
                "no-unused-vars": 0,
                "no-use-before-define": 2,
                "no-undef": 2,
            },
            //envs:[],
            globals: [ //这里配置你自己的全局变量
                'define',
                'require'
            ]
        })
    });
//------------------------------------代码校验END---------------------------
// 使用符合AMD规范的requirejs
// 配置详解：
// baseUrl: 默认为. 即项目根目录,用来配置模块查找根目录
// paths: 用来设置别名,路径基于baseUrl设置
// packages: 用来配置包信息,方便项目中引用
// shim: 可以达到不改目标文件,指定其依赖和暴露内容的效果,注意只对不满足amd的js有效
fis.hook('amd', {
    baseUrl: 'src/js',
   /* paths: {

    },
    packages: [

    ],
    shim: {

    }*/
});

// 利用fis的loader进行模块依赖加载
fis.match('::package', {
    packager: fis.plugin('wn-pack', {
        resourceConfigFile: function(defaultConfigFile, page) {
            var configFile = page_config[page.id];
            if (!configFile) {
                fis.log.error('page_config[' + page.id + '] is not set!');
                return defaultConfigFile;
            }
            return '/js/conf/boot_' + configFile + '.js';
        },
        // 内联 `require.config`
        inlineResourceConfig: false,
        outputNotPackPathMap: true,
        page: {
            files: pageFiles,
            // 打包页面异步入口模块
            packAsync: false,
            packCss: {
                target:function(defaultPackFile, page){
                    var configFile = page_config[page.id];
                    if (!configFile) {
                        fis.log.error('page_config[' + page.id + '] is not set!');
                        return defaultConfigFile;
                    }
                    return '/css/' + configFile + '.css';
                }
            }

        },
        amdConfig: {
            baseUrl:'/js/'
        },
        //是否需要把合成后的js文件输出到页面上，缺省是true
        outputMergeJsFile:false
    }),
    /*postpackager: fis.plugin('loader', {
        resourceType: 'amd',
        useInlineMap: true,
        allInOne: {
            includeAsyncs: true,
        }
    })*/
});



fis.media('prod')
.set('release.packAsync',true)
.set('release.outputNotPackPathMap',false);





