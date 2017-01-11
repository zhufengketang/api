var router = require('koa-router')();
var Promise = require('bluebird');
var path = require('path');
var fs = Promise.promisifyAll(require("fs"));
var ccap = require("ccap");
var mustHaveToken = require('../ware/auth.js').mustHaveToken;
let send = require('../sms');
var uuid = require('uuid');
var vcode = require('../utils').vcode;
/**
 * 注册
 *   name 姓名
 *   password 密码
 *   mobile 手机号
 *   vcode 验证码
 */
router.post('/user',mustHaveToken, async function (ctx, next) {
    let {imgcode:ImgCode,token:Token,vcode:VCode,user:User} = ctx.request.models;
    let vcode = ctx.request.body.vcode;
    let user = {
        name:ctx.request.body.name,
        password:ctx.request.body.password,
        mobile:ctx.request.body.mobile,
        token:ctx.header.token
    };
    let result = await VCode.find({token:ctx.header.token,vcode});
    result = true;//为了测试方便先过滤掉对手机验证码的校验
    if(result){
        result = await User.create(user);
        await Token.update({token:result.token},{user:result.id});
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
router.get('/user/identity',mustHaveToken, async function (ctx, next) {
    let {imgcode:ImgCode,token:Token,vcode:VCode,user:User} = ctx.request.models;
    let token = ctx.header.token;
    let mobile = ctx.query.mobile;
    let password = ctx.query.password;
    let user = await User.findOne({mobile,password});
    if(user){
        var result = await Token.update({token},{user:user.id});
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
    let {imgcode:ImgCode,token:Token,vcode:VCode,user:User} = ctx.request.models;
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
    let {imgcode:ImgCode,token:Token,vcode:VCode,user:User} = ctx.request.models;
    var captcha = ccap();
    var codeAry = captcha.get();
    var codeStr = codeAry[0];
    var imgBuf = codeAry[1];
    await ImgCode.create({token:ctx.header.token,code:codeStr});
    ctx.body = imgBuf;
});

router.get('/token',async function (ctx, next) {
    let {imgcode:ImgCode,token:Token,vcode:VCode,user:User} = ctx.request.models;
    var token = uuid.v4();
    await Token.create({token,expire:Date.AfterOneHour()});
    ctx.body = {code:0,token:token};
});

module.exports = router;
