//发布路径设置
fis.set('release', {
    //构建结果输出的路径
    /*'dir': 'output',*/
    'watch': true,
    'live': true,
    'lint': true,
    'clean': true,
    //每次release的时候是否把release目录清空，
    //注意，如果启动watch/live时，需要把clean设置为true，因为默认只是增量release，而每次清空目录，每次只会重新构建变动的文件
    'clear': true
});

fis.set('project.files', [
    'src/**',
]);
fis.set('release.jsPkgDir','js');

//---------------需要自己修改的配置 START -----------------
//根据你自己打包的文件进行配置
var pageFiles = ['index.html', 'page1.html'];
var page_config = {
    'src/index.html': 'index',
    'src/page1.html': 'page1'
};

// 项目路径前缀 
var urlPre = '/your/project/path'; 
//js pkg 的baseUrl,例如
var jsPkgBaseUrl = 'http://j2.58cdn.com.cn/xxx/js/';


//---------------需要自己修改的配置 END -----------------

//合并雪碧图的配置
fis.match('::package', {
    spriter: fis.plugin('csssprites-plus', {
        //合并雪碧图时每一个小图片之间的空隙
        margin: 10,
        layout: 'matrix',
        //合成后的雪碧图存放的路径
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
fis.match('src/test/**', {
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

fis.match('src/js/lib/**', {
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
            ignoreFiles: ['src/fragment/*'],
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
            globals: [ 
                //这里配置你自己的全局变量
                'define',
                'require'
            ]
        })
    });
//------------------------------------代码校验END---------------------------

// AMD模块配置详解：
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


/*
    利用fis3-packager-wn-pack进行css/amd模块的js/外链的js的构建，
    dev阶段对css和js不进行合并，但是会在html中生成内联的require.config配置，
    确保能够按需加载对应的模块文件
 */
// https://github.com/winnieBear/fis3-packager-wn-pack
fis.match('::package', {
    packager: fis.plugin('wn-pack', {
        page: {
            files: pageFiles,
            //dev阶段异步请求的js不打包，按需加载
            packAsync: false,
            //dev阶段外链的css不需要打包
            packCss:false,
            //dev阶段外链的js不需要打包
            packJs:false,
        },
        // dev阶段生成内联 `require.config`
        inlineResourceConfig: true,
        //最终生成的require.config的配置项
        amdConfig: {
            baseUrl:'/js/'
        },
        //dev阶段也生成pathmap，为了按需加载到正确的文件，因为每一个模块文件也进行hash处理了，直接加载模块的名字，文件是不存在的
        outputNotPackPathMap: function(file){
            return file.isJsLike && file.isMod;
        }
    })
   
});




/**
 *  test/preqa/qa/prod media在 package 阶段的配置对象
 *  
 * 利用fis3-packager-wn-pack进行css/amd模块的js/外链的js的构建，
 * 每一个页面会生成一个boot文件，文件是该页面的require.config配置
 * 同时每一个页面会生成一个或多个pkg文件
 */

var fis3_packager_wn_pack_options = {
    //多个页面公共的css和js打包配置，可以配置多个合成规则
    //注意异步的公共模块合成到异步的公共pkg里，同步的公共js合成到同步的公共pkg里面，不要混到一块
    bundles:[
        {
            files: ['/src/js/mod/base/base.js'],
            target: '/js/pkg/common.js',
            load:true
        },{
            files: ['/src/scss/reset.scss'],
            target: '/css/pkg_common.css',
            load:true
        }
    ],
    page: {
        files: pageFiles,
        //异步请求的js(排除bundles已经合成过的文件)进行合并
        packAsync: true,
        //外链的css(排除bundles已经合成过的文件)合成为一个css文件，合成后的文件名字通过packCss.target函数生成
        packCss: {
            target:function(defaultPackFile, page){
                var configFile = page_config[page.id];
                if (!configFile) {
                    fis.log.error('page_config[' + page.id + '] is not set!');
                    return defaultConfigFile;
                }
                return '/css/pkg_'+configFile+'.css'
            }
        },
        //外链的js(排除bundles已经合成过的文件)合成为一个js文件，合成后的文件名字通过packJs.target函数生成
        packJs:{
            target:function(defaultPackFile, page){
                var configFile = page_config[page.id];
                if (!configFile) {
                    fis.log.error('page_config[' + page.id + '] is not set!');
                    return defaultConfigFile;
                }
                return '/js/pkg/pkg_'+configFile+'.js'
            }
        }
    },
    //生成的boot文件外链
    inlineResourceConfig: false,
    //最终生成的require.config的配置项
    amdConfig: {
        //baseUrl:'http://j2.58cdn.com.cn/js/'
        baseUrl:'/js/'
    },
    //最终生成的config文件的名字可以通过resourceConfigFile函数修改
    resourceConfigFile: function(defaultConfigFile, page) {
        var configFile = page_config[page.id];
        if (!configFile) {
            fis.log.error('page_config[' + page.id + '] is not set!');
            return defaultConfigFile;
        }
        return '/js/conf/boot_' + configFile + '.js';
    },
    //在非dev环节，没有被打包的资源在boot文件中不生成pathmap
    outputNotPackPathMap: false,
    //异步请求js文件打包后不通过外链的方式输出到页面上，而是让它异步自动加载
    outputAsynPkg:false
};
// end proPackageOptions



/**
 * 自测(test)打包配置
 * 对css/js/img进行合并，对已合并的资源不删除
 * 默认的构建后的文件放在系统默认的输出路径（通过fiss server open查看）
 */
fis.media('test')
    .match('/css/**.{css,scss}', {
        useSprite: true,
    })
    .match('::package', {
        packager: fis.plugin('wn-pack', fis3_packager_wn_pack_options)
    });


/**
 * 预提测(pre-qa)打包配置，在本地能进行完整的测试，保留模拟配置，提测前最后的检查
 * 对css/js/img进行合并，对已合并的资源进行删除，
 * 默认的构建后的文件放在系统默认的输出路径（通过fiss server open查看）
 */
fis.media('pre-qa')
    .match('/css/**.{css,scss}', {
        useSprite: true,
    })
    .match('::package', {
        packager: fis.plugin('wn-pack', fis3_packager_wn_pack_options)
    })
    .match('*', {
        deploy: [
            // 过滤掉已经被打包的资源.
            fis.plugin('skip-packed-x', {
                // 配置项
            }),
            //发布到output目录
            fis.plugin('local-deliver', {
                to: 'preview'
            })
        ]
    });



/**
 * 提测(qa)打包配置，除了资源不压缩，其他跟prod一样
 * 对css/js/img进行合并，对已合并的资源进行删除
 * 所有资源的引用地址替换domain/url/hash
 * 移除test下面的东西
 * 所有资源发布到publish路径
 * 所有资源不压缩
 */
var _ = fis.util;
var fis3_packager_wn_pack_options_qa = _.clone(fis3_packager_wn_pack_options,true);
fis3_packager_wn_pack_options_qa['amdConfig']['baseUrl'] = jsPkgBaseUrl;

fis.media('qa')
    .set('release.dir','publish')
    .match('{test/*,config/*,manifest.json}', {
        release: false
    })
    .match('/css/**.{css,scss}', {
        useSprite: true,
        domain: 'http://c.58cdn.com.cn' + urlPre
    })
    .match('*{.png,.jpg,.gif}', {
        domain: 'http://img.58cdn.com.cn' + urlPre
    })
    .match('*.js', {
        domain: 'http://j1.58cdn.com.cn' + urlPre
    })
    .match('lib/*.js', {
        useHash:false,
        domain: 'http://j1.58cdn.com.cn' + urlPre
    })
    .match('::package', {
        packager: fis.plugin('wn-pack', fis3_packager_wn_pack_options_qa)
    })
    .match('*', {
        deploy: [
            fis.plugin('skip-packed-x', {
                // 配置项
            }),
            //发布到output目录
            fis.plugin('local-deliver', {
                to: 'publish'
            })
        ]
    });



/**
 * 上线(prod)打包配置
 * 对css/js/img进行合并，对已合并的资源进行删除
 * 所有资源的引用地址替换domain/url/hash
 * 移除test下面的东西
 * 所有资源发布到publish路径
 * 所有资源压缩
 */
fis.media('prod')
    .set('release.dir','publish')
    .match('{test/*,config/*,manifest.json}', {
            release: false
        })
    .match('/css/**.{css,scss}', {
        useSprite: true,
        optimizer: fis.plugin('clean-css'),
        domain: 'http://c.58cdn.com.cn' + urlPre
    })
    .match('*{.png,.jpg,.gif}', {
        domain: 'http://img.58cdn.com.cn' + urlPre
    })
    .match('*.png', {
        optimizer: fis.plugin('png-compressor'),
    })
    .match('*.js', {
        // fis-optimizer-uglify-js 插件进行压缩，已内置
        optimizer: fis.plugin('uglify-js'),
        domain: 'http://j1.58cdn.com.cn' + urlPre
    })
    .match('lib/*.js', {
        useHash:false,
        domain: 'http://j1.58cdn.com.cn' + urlPre
    })
    .match('::package', {
        packager: fis.plugin('wn-pack', fis3_packager_wn_pack_options_qa)
    })
    .match('*', {
        deploy: [
            fis.plugin('skip-packed-x', {
                // 配置项
            }),
            //发布到output目录
            fis.plugin('local-deliver', {
                to: 'publish'
            })
        ]
    });



/**
 * 上线(deploy-ftp)配置，并部署到ftp服务器
 * 对css/js/img进行合并，对已合并的资源进行删除
 * 所有资源的引用地址替换domain/url/hash
 * 移除test下面的东西
 * 所有资源压缩
 * 所有资源发布到ftp
 */
fis.media('deploy-ftp')
    .set('release.dir','publish')
    .match('{test/*,config/*,manifest.json}', {
        release: false
    })
    .match('/css/**.{css,scss}', {
        useSprite: true,
        optimizer: fis.plugin('clean-css'),
        domain: 'http://c.58cdn.com.cn' + urlPre
    })
    .match('*{.png,.jpg,.gif}', {
        domain: 'http://img.58cdn.com.cn' + urlPre
    })
    .match('*.png', {
        optimizer: fis.plugin('png-compressor'),
    })
    .match('*.js', {
        // fis-optimizer-uglify-js 插件进行压缩，已内置
        optimizer: fis.plugin('uglify-js'),
        domain: 'http://j1.58cdn.com.cn' + urlPre
    })
    .match('lib/*.js', {
        useHash:false,
        domain: 'http://j1.58cdn.com.cn' + urlPre
    })
    .match('::package', {
        packager: fis.plugin('wn-pack', fis3_packager_wn_pack_options_qa)
    })
    /* .match('*.html', {
         //需要自己安装fis-optimizer-html-minifier插件
         optimizer: fis.plugin('html-minifier')
     });*/
    .match('*', {
        deploy: [
            fis.plugin('skip-packed-x', {
                // 配置项
                //ignore:[]
            }),
            fis.plugin('ftp-x', {
                //'console':true,
                remoteDir: '/static.58.com/remote/path/xxx/',
                exclude: ['/img/'],
                connect: {
                    host: '192.168.119.5',
                    port: '21',
                    user: 'qatest',
                    password: 'ftp@fe'
                }
            }),
            fis.plugin('ftp-x', {
                //'console':true,
                remoteDir: '/pic2.58.com/remote/path/xxx/',
                include: ['/img/'],
                connect: {
                    host: '192.168.*',
                    port: '21',
                    user: 'xxx',
                    password: 'xxx'
                }
            })
        ]
    });



