var router = require('koa-router')();
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require("fs"));
var mustHaveToken = require('../ware/auth.js').mustHaveToken;
var ImgCode = require('../model').ImgCode;
var Token = require('../model').Token;
var VCode = require('../model').VCode;
var User = require('../model').User;
let send = require('../sms');
var vcode = require('../utils').vcode;
/**
 * 注册
 *   name 姓名
 *   password 密码
 *   mobile 手机号
 *   vcode 验证码
 */
router.post('/user',mustHaveToken, async function (ctx, next) {
    let vcode = ctx.request.body.vcode;
    let user = {
        name:ctx.request.body.name,
        password:ctx.request.body.password,
        mobile:ctx.request.body.mobile
    };
    let result = await VCode.find({token:ctx.header.token,vcode})
    if(result){
        result = await User.create(user);
        if(result){
            ctx.body = {code: 0};
        }else{
            ctx.body = {code: 1000,errorMessage:"注册失败"};
        }
    }else{
        ctx.body = {code: 1000,errorMessage:"短信验证码错误或失效"};
    }

});

/**
 * 用户登录
 */
router.get('/user/indentity',mustHaveToken, async function (ctx, next) {
    let token = ctx.header.token;
    let mobile = ctx.query.mobile;
    let password = ctx.query.password;
    let user = await User.findOne({mobile,password});
    if(user){
        var result = await Token.update({token},{user_id:user._id});
        ctx.body = {code: 0};
    }else{
        ctx.body = {code: 201};
    }

});

/**
 * 获取短信验证码
 * 参数说明
 *    mobile : 手机号
 *    type : register或者forget, type=register代表注册验证码 type=forget忘记密码验证码
 *    img_code : 图片验证码
 *    http://localhost:3000/user/vcode?mobile=15718856132&img_code=9479
 */
router.get('/user/vcode', mustHaveToken, async function (ctx, next) {
    let mobile = ctx.query.mobile;
    let img_code = ctx.query.img_code;
    let result =  await ImgCode.find({token:ctx.header.token,code:img_code});
    if(result){
        let code = vcode();
         result = await send(code,mobile);
        if(result =='success'){
            result = await VCode.create({token:ctx.header.token,code});
           ctx.body = {code: 0,data:'短信已发送'}
        }else{
            ctx.body = {code: 1000,data:'注册短信发送失败'}
        }
    }else{
        ctx.body = {code: 1000,errorMessage:'图片验证码输入不正确!'};
    }
});

/**
 * 图片验证码
 * 每次请求返回一张6位数字的图片
 * 服务端大致流程如下
 *   1. 客户端提交请求 GET /imgcode 和 HEADERS={token : "XXXXXXXXX" }
 *   2. 服务器接受请求,然后生成图片, 将验证码结果和token绑定, 存储成为一条记录, 加上过期时间
 *   3. 任何需要验证图片的地方从数据库中进行校验
 */
router.get('/imgcode',mustHaveToken, async function (ctx, next) {
    await ImgCode.create({token:ctx.header.token,code:'9479'});
    ctx.set('Content-Type','image/png');
    ctx.body = await fs.readFileAsync('../public/images/capture.png');
});

module.exports = router;
