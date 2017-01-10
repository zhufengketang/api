/**
 * Created by weimin on 17-1-9.
 */
var Waterline = require("waterline");
var config = require("./config");

 exports.courseCollection = Waterline.Collection.extend({
    identity:"course",
    connection:"mongoConn",
    attributes:{
        id:{type:"integer",required:false},
        title: {type: "string", required: false},//课程标题
        author: {type: "string", required: false},//课程作者
        description: {type: "string", required: false},//描述
        price: {type: "float", required: false},//价格
        start: {type: "date", required: false},//开始时间
        address: {type: "string", required: false},//地址
        image: {type: "string", required: false},//图片
        auth_profile: {type: "string", required: false},//老师简介
        hours: {type: "float", required: false},//课时
        contents: {type: "array", required: false}//图片
    }
});

exports.userCollection = Waterline.Collection.extend({
    entity:"user",
    connection:"mongoConn",
    attributes:{
        id:"integer",
        name: "string",//用户名
        password: "string",//密码
        mobile: "string",//手机号
    }

});

exports.orderCollection = Waterline.Collection.extend({
    entity:"order",
    connection:"mongoConn",
    attributes:{
        id:"integer",
        course:{
            model:"course"
        },
        user:{
            model:"user"
        },
        price: "float",//价格
        paytime: "date",//购买时间
        status: "integer",//订单状态 0-新订单 1-已支付 2-支付失败
        flowno: "string",//外部交易流水号
        paymethod: "string" //支付方式 alipay(支付宝) offline(线下) other(其它)
    }
});

exports.imgcodeCollection = Waterline.Collection.extend({
    entity:"imgcode",
    connection:"mongoConn",
    attributes:{
        token: "string",//token字符串
        code: "string",//图片验证码
        expire: "date"//过期时间
    }
});

exports.vcodeCollection = Waterline.Collection.extend({
    entity:"vcode",
    connection:"mongoConn",
    attributes:{
        token: {type: "string"},//token字符串
        code: {type: "string"},//手机验证码
        expire: "date"//过期时间
    }
});
exports.tokenCollection = Waterline.Collection.extend({
    entity:"token",
    connection:"mongoConn",
    attributes:{
        id:"string",
        user: {model:"user"},//此token对应的用户
        token: {type: "string"},//token字符串
        expire: "date"//过期时间
    }
});










