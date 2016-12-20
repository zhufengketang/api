var router = require('koa-router')();

/**
 * 注册
 *   name 姓名
 *   password 密码
 *   mobile 手机号
 *   vcode 验证码
 */
router.post('/user', function (ctx, next) {
    ctx.body = {code: 0};
});

/**
 *
 */
router.get('/user/indentity', function (ctx, next) {
    ctx.body = {code: 0};
});

/**
 * 获取短信验证码
 * 参数说明
 *    mobile : 手机号
 *    type : register或者forget, type=register代表注册验证码 type=forget忘记密码验证码
 *    img_code : 图片验证码
 */
router.get('/vcode', function (ctx, next) {
    ctx.body = {code: 0};
});


/**
 * 图片验证码
 * 每次请求返回一张6位数字的图片
 * 服务端大致流程如下
 *   1. 客户端提交请求 GET /imgcode 和 HEADERS={token : "XXXXXXXXX" }
 *   2. 服务器接受请求,然后生成图片, 将验证码结果和token绑定, 存储成为一条记录, 加上过期时间
 *   3. 任何需要验证图片的地方从数据库中进行校验
 */
router.get('/imgcode', function (ctx, next) {
    ctx.body ={code: 0};
});


module.exports = router;
