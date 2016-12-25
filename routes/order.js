var router = require('koa-router')();
var Order = require('../model').Order;
var checkLogin = require('../ware/auth.js').checkLogin;
router.get('/order',checkLogin,async (ctx, next) => {
    let total = await Order.count({user:ctx.user});
    let orders = await Order.find({user:ctx.user}).populate('course');
    console.log();                              // CAUTION:待处理
    ctx.body = {code: 0, data: {total, orders}};
});


/**
 * 下单/报名
 * 路径参数说明
 *    course:课程ID
 */
router.post('/order/:course', checkLogin,async(ctx, next) => {
    var course = ctx.params.course;
    let user = ctx.user;
    var order = ctx.request.body;
    ctx.body = await buy({
        course:course,
        user:user,
        price:order.price,
        paytime:order.paytime,
        status:order.status,
        flowno:order.flowno,
        paymethod:order.paymethod
    });
});

function buy(course) {
    return Order.create(course).then(doc => {
        return {code: 0};
    }, error => {
        return {code: 1000, errorMessage: error};
    });
}

module.exports = router;
