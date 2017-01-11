const Koa = require('koa');
const app = new Koa();
const convert = require('koa-convert');//将koa1的中间封装为koa2的中间件
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');//在控制台输出日志
const views = require("koa-views");//配置koa的模版引擎
app.use(convert(bodyParser()));
app.use(convert(logger()));
app.use(convert(require("koa-static")(__dirname+"/public")));//静态文件地址
app.use(views(__dirname+"/views",{  //选择ejs作为模版引擎，但是可以用html作为后缀
map:{
    html:"ejs"
}
}));
app.use(async (ctx,next)=>{
    ctx.request.models = app.models;
    ctx.request.connections = app.connections;
    await next();
});
require('./init')();
var index = require("./routes/index");
var course = require('./routes/course');
var order = require('./routes/order');
var user = require('./routes/user');

app.use(index.routes(),index.allowedMethods());
app.use(course.routes(), course.allowedMethods());
app.use(order.routes(), order.allowedMethods());
app.use(user.routes(), user.allowedMethods());


app.on('error', function (err, ctx) {
    console.log(err);
});

module.exports = app;