//发布路径设置
fis.set('release', {
    /*'dir': 'output',*/
    'watch': true,
    'live': true,
    'lint': true,
    'clean': true,
    //每次release的时候是否把release目录清空，
    //注意，如果启动watch/live时，需要把clean设置为true，因为默认只是增量release，而每次清空目录，每次只会重新构建变动的文件
    'clear': true
});

var pageFiles = ['index.html', 'page1.html'];
var boot_config = {
    'src/index.html': 'boot_index',
    'src/page1.html': 'boot_page1'
};

/*// less 编译为 css
fis.match('src/(css/*.less)', {
    parser: fis.plugin('less'),
    rExt: '.css',
});*/



fis.match('src/css/*.scss', {
    parser: fis.plugin('node-sass'),
    rExt: '.css',
});
fis.match('src/(**)', {
    release: '/static/$1'
});

fis.match('src/js/mod/**/*.js', {
    isMod: true,
});
fis.match('src/js/pkg/**/*.js', {
    isMod: true,
});




// 使用符合AMD规范的requirejs
// 配置详解：
// baseUrl: 默认为. 即项目根目录,用来配置模块查找根目录
// paths: 用来设置别名,路径基于baseUrl设置
// packages: 用来配置包信息,方便项目中引用
// shim: 可以达到不改目标文件,指定其依赖和暴露内容的效果,注意只对不满足amd的js有效
fis.hook('amd', {
    baseUrl: './src/js',
    paths: {

    },
    packages: [

    ],
    shim: {

    }

});



// 利用fis的loader进行模块依赖加载
fis.match('::package', {
    packager: fis.plugin('wn-pack', {
        resourceConfigFile: function(defaultConfigFile, page) {
            var configFile = boot_config[page.id];
            if (!configFile) {
                fis.log.error('boot_config[' + page.id + '] is not set!');
                return defaultConfigFile;
            }
            return 'static/js/conf/' + configFile + '.js';
        },
        // 内联 `require.config`
        inlineResourceConfig: false,
        outputNotPackPathMap: false,
        page: {
            files: pageFiles,
            // 打包页面异步入口模块
            packAsync: true,
            packCss: true,

        },
        amdConfig: {
            //baseUrl:'/static/js/'
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

// 生产环境下的配置
// js,css,png使用内置插件优化，加上md5戳


fis.media('prod')
    .match('*.{scss,css}', {
        useSprite: true,
        optimizer: fis.plugin('clean-css'),
        domain: 'http://c.58cdn.com.cn'
    })
    .match('*.png', {
        optimizer: fis.plugin('png-compressor')
    })
    .match('*.js', {
        // fis-optimizer-uglify-js 插件进行压缩，已内置
        optimizer: fis.plugin('uglify-js'),
        domain: 'http://j2.58cdn.com.cn'
    })
    .match('lib/*.js', {
        domain: 'http://j1.58cdn.com.cn'
    })
    //.match('*.{js,scss,png}', {
    .match('*.{scss,png}', {
        useHash: true
    })
    .match('::package', {
        spriter: fis.plugin('csssprites')
    })
