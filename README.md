# 搜读阅读器

## 这个项目是为了解决阅读网络小说的几个痛点：

* “免费”网站广告太多
* 有些不能收藏，有些能，但是有bug，或者有收藏数量限制
* 阅读不便，总是要弹开新窗口
* 追更新不便，需要手动刷新
* 不能在PC和手机之间同步进度
* 不能离线查看

## 因此，这个项目的路线图如下：

* 抓取网络小说及章节内容（DONE）
* 展示小说列表（DONE）
* 小说章节阅读器（TODO）
* 本地收藏（TODO）
* 云端同步收藏、进度信息（TODO）
* 封装electron客户端（TODO）
* APP版（TODO）

## 本地安装使用方法：

1. 安装nodejs环境
2. 安装node依赖包：在命令行进入项目目录，执行
> npm install

或者，使用yarn
> yarn

3. 执行抓取代码
> node crawler.js

4. 打开小说阅读器：直接双击index.html在浏览器打开

---------
请注意，由于使用了ng-admin来自动生成阅读器页面，目前还有些展示问题：

1. 搜索小说必须使用全部名称
2. 查看章节内容时，html标签全部显示出来了，而且字体太小
3. 显示章节列表时，打开modal窗口显示章节内容的功能还有问题：要么无法显示内容，要么显示带html标签的内容

## 项目采用了以下技术：

1. parse-server: https://github.com/ParsePlatform/parse-server-example
2. ng-admin: https://www.gitbook.com/book/marmelab/ng-admin/details
3. cheerio: https://github.com/cheeriojs/cheerio
4. js-crawler: https://github.com/antivanov/js-crawler
5. heroku: https://www.heroku.com
6. nodejs: https://nodejs.org
7. 其他使用到的开源项目，请看package.json

## 有人问框架是什么，我大概总结了一下：

1. 后台API+存储：parse-server（部署在Heroku）
2. 爬虫（Nodejs）：js-crawler（crawler.js）
3. 前端展示（JS）：ng-admin（admin.js、index.html）
4. 实体（JS）：models目录下面的两个js文件
5. 全部代码就是以上五个文件，其他要么是配置文件（Nodejs）、要么就是废弃而没删的代码（也许以后用得着？）


### 欢迎大家提出宝贵意见，反馈直接发到issue，有兴趣参与开发的可以提pull request，我会尽快处理。
