# sample-amd

一个基于 fiss 的 AMD 模块化开发工程模板。

## 适用场景
* js采用AMD方式进行模块化开发
* js模块想打包成公共和页面独有两个pkg


## 采用此模版的项目推荐采用如下约定
* 把css/js/img都拆分成最小化模块开发
* 样式用scss来开发和管理依赖
* js采用AMD模块化管理
* 除了外链的css和js，页面中用到的js都应该用amd方式来写代码，样式都用scss来写




## 安装方法
>注意：因为部分插件不支持最新的nodejs，建议**nodejs <= 4.x**

```bash
#首先安装fiss
npm install fiss -g
```

### init一个模版的方法
```bash
#通过模版的名字安装本模版
fiss init sample-amd

#或通过github的名字来安装模版
fiss init github:fiss-scaffold/sample-amd

#或者你本地自定义了一个模版，放在/localpath/myamdtpl
fiss init /localpath/myamdtpl
```
### 也可以把模版下载下来，自己安装依赖
```bash
# git clone之后，用npm安装，因为gfw，非常建议使用cnpm来安装，否则某些模块安装不了
git clone https://github.com/fiss-scaffold/sample-amd.git

#安装cnpm，如果已经安装跳过此步
npm install cnpm -g

#安装需要的插件
cnpm intall

```

## 打包方法
考虑到开发过程各阶段的需求，本模版的配置文件默认配置好了几种打包方案，分别如下：
### dev (默认打包配置)
dev是默认的打包配置
```bash
# 不带参数，默认用dev配置
fiss release
```

dev（开发阶段）打包时：
 * 不对 css/img 进行打包处理（inline 除外），根据需要按需加载
 * 对js进行打包及依赖处理，自动生成 require.config 并内嵌
 * scss之类的文件会编译成最终产物css等
 * inline内嵌的资源会被自动合并进宿主文件
 * 为了防止缓存，所有资源打包时添加hash值（从开发到上线都应保持通过构建系统来进行版本控制)
 * 打开html/css/js的语法检查提示，当修改文件时，你可以马上得到是否有语法错误的反馈
 * 默认开启文件修改自动刷新浏览器机制，自动刷新浏览器，看到修改后的效果
 * 默认的构建后的文件放在系统默认的输出路径（通过fiss server open查看）

### test (自测环节)
```bash
#打包test配置
fiss release test
```
test（自测环节）打包时在dev配置的基础上增加：
 * 对css/img进行合并，对已合并的资源不删除
 * 根据对 js 进行打包及依赖处理，自动生成 boot 文件
 * 默认的构建后的文件放在系统默认的输出路径（通过fiss server open查看）

### pre-qa (提交qa测试之前本地确认)
```bash
#打包pre-qa配置
fiss release pre-qa
```
pre-qa(提交qa测试之前本地确认)打包时在test配置的基础上增加：
 * css/js/img进行合并后，`对已合并的资源进行删除`，
 * 默认的构建后的文件放在系统默认的输出路径（通过fiss server open查看）

pre-qa 跟下面的qa的配置*不同的*是没有把所有资源的引用路径换成线上的路径，方便在本地测试下完整的版本。


### qa (提交qa测试的配置)
```bash
#打包qa配置
fiss release qa
```
qa(提交qa测试的配置)打包时在pre-qa配置的基础上增加：
 * 所有资源的引用地址替换domain/url/hash
 * 移除test下面的东西
 * 所有资源发布到publish路径
 * 所有资源不压缩

qa的版本跟prod的区别就是`静态资源没有压缩`，是为了方便qa测试，定位问题，。


### prod (上线打包配置)
```bash
#打包prod配置
fiss release prod
```
prod(上线打包配置)打包时在qa配置的基础上增加：
 * 所有资源压缩

### deploy-ftp (把prod版本部署到ftp服务器)
```bash
#打包deploy-ftp配置
fiss release deploy-ftp
```
**请注意**测试时需要先修改ftp的配置信息才能运行此配置。

deploy-ftp(把prod版本部署到ftp服务器)是把prod版本部署到ftp服务器上，不建议使用，建议在本地测试，只有有必要时才需要这么做。




