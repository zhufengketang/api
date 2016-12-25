const Koa = require('koa');
const app = new Koa();
const convert = require('koa-convert');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');
app.use(convert(bodyParser()));
app.use(convert(logger()));
require('./init')();
var course = require('./routes/course');
var order = require('./routes/order');
var user = require('./routes/user');

app.use(course.routes(), course.allowedMethods());
app.use(order.routes(), order.allowedMethods());
app.use(user.routes(), user.allowedMethods());

app.on('error', function (err, ctx) {
    console.log(err);
});

module.exports = app;