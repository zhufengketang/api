// CAUTION：建议采用es6写法，用bable转一下吧，es6引入包语法比较清晰
// TODO：加一下eslint，部分编码并不规范（如：去掉所有的console.log，改成logger打印日志）。
const Koa = require('koa');
const app = new Koa();
const convert = require('koa-convert');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');

/*
* CAUTION: 抽取到init文件里，非主流程不要暴露在主流程中
* @init.js Pseudo Code
*
* export const connect = app => (convert, ...proxys) => proxys.map(proxy => app.use(convert, proxy()))
*
* @here Eseudo Code
* connect(app)(context, bodyParser, logger)     //其他代理平铺到参数后面
* */
app.use(convert(bodyParser()));
app.use(convert(logger()));

/*
*  TODO：change this line to the top of this file ，this is not init, change module name to：common or util
*  CAUTION:尽量不要破坏JS原生对象。
* */
require('./init')();


/* 建议：使用 index.js 一起导入，逻辑比较清晰
 * @index.js Pseudo Code
 * import { course, order, user } from './routes/index'
 * */
var course = require('./routes/course');
var order = require('./routes/order');
var user = require('./routes/user');

app.use(course.routes(), course.allowedMethods());
app.use(order.routes(), order.allowedMethods());
app.use(user.routes(), user.allowedMethods());

// CAUTION：所有action监听，抽取高阶函数单独定义，写成redux的reducer方式统一管理比较清晰。优点：声明式而不是命令式，在事件多了以后很好维护
app.on('error', function (err, ctx) {
    console.log(err);
});

module.exports = app;