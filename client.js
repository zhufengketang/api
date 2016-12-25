/**
 * 插入测试数据
 */
var model = require('./model');
var rp = require('request-promise');
var fs = require('fs');
var util = require('util');
var User = require('./model').User;
var host = 'http://ketang.zhufengpeixun.cn';
//清空数据库
function resetDb() {
    return model.Course.remove({})
        .then(() => {
            return model.ImgCode.remove();
        }).then(() => {
            return model.Order.remove();
        }).then(() => {
            return model.Token.remove();
        }).then(() => {
            return model.User.remove();
        }).then(() => {
            return model.VCode.remove();
        });
}
function getToken() {
    return rp({
        uri: host+'/token',
        json: true
    }).then(function (body) {
        return body.token;
    }).catch(function (err) {
        console.log(err);
    });
}
//getToken();

//获取验证码图片
async function getImgCode(token){
    return rp({
        uri: host+'/imgcode',
        headers: {
            token
        },
        encoding:null,
        json: true
    }).then(function (body) {
        //fs.writeFile('./img.png',body); //9479
        console.log(body);
        return body;
    }).catch(function (err) {
        console.log(err);
    });
}
//获取验证码图片
//getImgCode();


//获取短信验证码
async function getVCode(token){
    return rp({
        uri: host+'/user/vcode?mobile=15718856132&type=register&img_code=9479',
        headers: {
            token
        },
        json: true
    }).then(function (body) {
        return body;
    }).catch(function (err) {
        console.log(err);
    });
}
//getVCode();

//注册用户 user
async function createUser(token){
    return rp({
        uri: host+'/user',
        method: 'POST',
        body: {
            vcode: "1234",
            name:"珠峰课堂",
            password:"123456",
            mobile:"15718856132"
        },
        headers: {
            token
        },
        json: true
    }).then(function (body) {
        return body;
    }).catch(function (err) {
        console.log(err);
    });
}

//createUser();


//用户登录
async function identity(token){
    return rp({
        uri: host+'/user/identity?mobile=15718856132&password=123456',
        headers: {
            token
        },
        json: true
    }).then(function (body) {
        return body;
    }).catch(function (err) {
        console.log(err);
    });
}
//identity();

//发布课程
async function createCourse(token){
    return rp({
        uri: host+'/course',
        method: 'POST',
        body: {
            title:'node.js实战',
            author:'老师',
            description:'从零开始,循序渐进',
            price: 3000.00,
            start:"2016-10-30",
            address: '珠峰',
            image: 'http://7xjf2l.com1.z0.glb.clouddn.com/reactnative.png',
            auth_profile:'教师简介',
            hours: 24,
            contents: [
                "1.课程概览",
                "2.开发环境搭建",
                "3.node基础",
                "4.koa2"
            ],
        },
        headers: {
            token
        },
        json: true
    }).then(function (body) {
        return body;
    }).catch(function (err) {
        console.log(err);
    });
}
//createCourse();

//查看课程
async function getCourse(token){
    return rp({
        uri: host+'/course',
        headers: {
            token
        },
        json: true
    }).then(function (body) {
        console.log(util.inspect(body,{depth:3}));
        return body.data.courses;
    }).catch(function (err) {
        console.log(err);
    });
}
//getCourse();

//下单
async function createOrder(token,course){
    return rp({
        uri: host+`/order/${course._id}`,
        method: 'POST',
        body: {
            price:3000,
            paytime:new Date(),
            status:0,
            flowno:'pay001',
            paymethod:'alipay'
        },
        headers: {
            token
        },
        json: true
    }).then(function (body) {
        //console.log(body);
        return body;
    }).catch(function (err) {
        console.log(err);
    });
}
//createOrder();


//获取用户订单
async function getOrder(token){
    return rp({
        uri: host+'/order',
        headers: {
            token
        },
        json: true
    }).then(function (body) {
        //console.log(util.inspect(body,{depth:100}));
        return body;
    }).catch(function (err) {
        console.log(err);
    });
}
//getOrder();

async function mock(){
    //删除数据库
    await resetDb();
    //获取token
    var token = await getToken();
    console.log('token',token);
    var imgCode = await getImgCode(token);
    console.log('imgCode',imgCode);
    var vCode = await getVCode(token);
    console.log('vCode',vCode);
    var user = await createUser(token);
    console.log('user',user);
    var user = await identity(token);
    console.log('user',user);
    var course = await createCourse(token);
    console.log('course',course);
    var courses = await getCourse(token);
    console.log('courses',courses);
    var order = await createOrder(token,courses[0]);
    console.log('order',order);
    var orders = await getOrder(token);
    console.log('orders',orders);
}
mock();

/*
User.findOne({mobile:'15718856132',password:'123456'}).then((data)=>{
    console.log(data);
})*/
