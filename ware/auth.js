var uuid = require('uuid');
let util = require('util');
let debug = require('debug')('zhufengketang:auth');
var Token  = require('../model').Token;
/**
 * 必须拥有token,如果没有的话会返回一个新的token
 * @param ctx
 * @param next
 */
exports.mustHaveToken = async (ctx, next) => {
    if (ctx.header.token) {
        await next();
    }else{
        var token = uuid.v4();
        Token.create({token,expire:Date.AfterOneHour()});
        ctx.body = {code:100,token:token};
    }
}
/**
 * 此用户必须已经登录，即token和用户ID进行绑定
 * @param ctx
 * @param next
 */
exports.checkLogin = async (ctx, next) => {
    if (ctx.header.token) {
        const tokenObj = await Token.findOne({token:ctx.header.token});
        if(tokenObj){
            const user = tokenObj.user;
            if(user){
                ctx.user = user;
                await next();
            }else{
                debug('user= '+util.inspect(user));
                ctx.body = {code:201};
            }
        }else{
            debug('tokenObj= '+util.inspect(tokenObj));
            ctx.body = {code:201};
        }
    }else{
        debug('ctx.header.token= '+ctx.header.token);
        ctx.body = {code:201};
    }
}