var router = require('koa-router')();
var Order = require('../model').Order;
var checkLogin = require('../ware/auth.js').checkLogin;
let fs = require('fs');
let https = require('https');
router.get('/order',checkLogin,async (ctx, next) => {
    let total = await Order.count({user:ctx.user});
    let orders = await Order.find({user:ctx.user}).sort({paytime:-1}).populate('course');
    ctx.body = {code: 0, data: {total, orders}};
});
//参考文章  http://www.jb51.net/article/102190.htm
//参考文档 https://doc.open.alipay.com/docs/doc.htm?spm=a219a.7629140.0.0.nNOmiW&treeId=204&articleId=105297&docType=1
router.post('/order/sign/alipay', checkLogin,async(ctx, next) => {
    let alipayConfig = req.query;
    var code = ""
    for(var i = 0; i < 4; i++) {
        code += Math.floor(Math.random() * 10);
    }
    //订单号暂时由时间戳与四位随机码生成
    alipayConfig.out_trade_no = Date.now().toString() + code;
    alipayConfig.notifyURL = 'https://ketang.zhufengpeixun.cn/order/notice';
    var orderSpec = getParams(alipayConfig);
    var sign = getSign(alipayConfig)
    ctx.body = {
        code:1000,
        data:{
            orderSpec,
            sign
        }
    };
});

function getParams(params){
    var sPara = [];
    if(!params) return null;
    for(var key in params){
        if(!params[key] || key == 'sign' || key=="sign_type"){
            continue;
        };
        sPara.push([key,params[key]]);
    }
    sPara = sPara.sort();
    var prestr = '';
    for(var i2=0;i2<sPara.length;i2++){
        var obj = sPara[i2];
        if(i2 == sPara.length -1){
            prestr = prestr + obj[0]+'="'+obj[1]+'"';
        }else{
            prestr = prestr + obj[0]+'="'+obj[1]+'"&';
        }
    }
    return prestr;
}


function getSign(params) {
    try {
       var privatePem = fs.readFileSync('./rsa_private_key.pem');
       var key = privatePem.toString();
       var prestr = getParams(params);
       var crypto = require('crypto');
       var sign = crypto.createSign('RSA-SHA1');
       sign.update(prestr);
       sign = sign.sign(key,'base64');
       return encodeURIComponent(sign);
    } catch(err) {
        console.log('veriSign err', err)
    }
}
//将支付宝发来的数据生成有序数列
function getVerifyParams(params) {
    var sPara = [];
    if(!params) return null;
    for(var key in params) {
        if((!params[key]) || key == "sign" || key == "sign_type") {
            continue;
        };
        sPara.push([key, params[key]]);
    }
    sPara = sPara.sort();
    var prestr = '';
    for(var i2 = 0; i2 < sPara.length; i2++) {
        var obj = sPara[i2];
        if(i2 == sPara.length - 1) {
            prestr = prestr + obj[0] + '=' + obj[1] + '';
        } else {
            prestr = prestr + obj[0] + '=' + obj[1] + '&';
        }
    }
    return prestr;
}

//验签
function veriySign(params) {
    try {
        var publicPem = fs.readFileSync('./rsa_public_key.pem');
        var publicKey = publicPem.toString();
        var prestr = getVerifyParams(params);
        var sign = params['sign'] ? params['sign'] : "";
        var verify = crypto.createVerify('RSA-SHA1');
        verify.update(prestr);
        return verify.verify(publicKey, sign, 'base64')

    } catch(err) {
        console.log('veriSign err', err)
    }
}


//验签
function veriySign(params) {
    try {
        var publicPem = fs.readFileSync('./rsa_public_key.pem');
        var publicKey = publicPem.toString();
        var prestr = getVerifyParams(params);
        var sign = params['sign'] ? params['sign'] : "";
        var verify = crypto.createVerify('RSA-SHA1');
        verify.update(prestr);
        return verify.verify(publicKey, sign, 'base64')

    } catch(err) {
        console.log('veriSign err', err)
    }
}


router.post('/order/notice', checkLogin,async(ctx, next) => {
    var params = req.body
    var mysign = veriySign(params);
    //验证支付宝签名mysign为true表示签名正确
    try {
        //验签成功
        if(mysign) {
            if(params['notify_id']) {
                var partner = AlipayConfig.partner;
                //生成验证支付宝通知的url
                var url = 'https://mapi.alipay.com/gateway.do?service=notify_verify&' + 'partner=' + partner + '¬ify_id=' + params['notify_id'];
                //验证是否是支付宝发来的通知
                https.get(url, function(text) {
                    //有数据表示是由支付宝发来的通知
                    if(text) {
                        //交易成功
                        console.log('success')
                    } else {
                        //交易失败
                        console.log('err')
                    }
                })
            }
        }
    } catch(err) {
        console.log(err);
    }
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
