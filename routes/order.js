var router = require('koa-router')();
var Order = require('../model').Order;

router.get('/order', async(ctx, next) => {
    ctx.body = await getOrders();
});

function getOrders() {
    let total = Order.count({});
    let orders = Order.find({});
    return Promise.all([total, orders]).then(result => {
        return {code: 0, data: {total: result[0], orders: result[1]}};
    }, error => {
        return {code: 1000, data: error};
    });
}

/**
 * 下单/报名
 * 路径参数说明
 *    course_id:课程ID
 */
router.post('/order/:course_id', async(ctx, next) => {
    var course_id = ctx.params.course_id;
    ctx.body = await buy(course_id);
});

function buy(course_id) {
    return Order.create({course_id}).then(doc => {
        return {code: 0};
    }, error => {
        return {code: 1000, errorMessage: error};
    });
}

module.exports = router;
