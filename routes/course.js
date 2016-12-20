var router = require('koa-router')();
var Course = require('../model').Course;
/**
 * 获取课程列表
 * URL参数说明
 *     start: 获取课程开始的位置
 *     take: 总共获取多少个课程
 */
router.get('/course', async function (ctx, next) {
    let start = ctx.query.start ? parseInt(ctx.query.start) : 0;
    let take = ctx.query.take ? parseInt(ctx.query.take) : 5;
    ctx.body = await getCourses(start, take);
});


function getCourses(start, take) {
    let getTotal = Course.count();
    let course = Course.find().skip(start).limit(take);
    return Promise.all([getTotal, course]).then(result => {
        return {code: 0, data: {total: result[0], course: result[1]}};
    }, error => {
        return {code: 1000, data: error};
    });
}

/**
 *  增加课程
 *
 */
router.post('/course', async function (ctx, next) {
    ctx.body = await saveCourse(ctx.request.body);
});

function saveCourse(course) {
    return Course.create(course).then(doc => {
        return {code: 0, data: doc};
    }, error => {
        return {code: 1000, data: error};
    });
}

module.exports = router;
