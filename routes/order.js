var router = require('koa-router')();
var Order = require('../model').Order;
var Course=require('../model').Course;
var Token=require('../model').Token;
var checkLogin = require('../ware/auth.js').checkLogin;
let fs = require('fs');
let https = require('https');
router.get('/order',checkLogin,async (ctx, next) => {
    console.log('orderId');
    let tokenObj = await Token.findOne({token:ctx.header.token});
    let userId=tokenObj.user;
    let total = await Order.count({user:userId});
    console.log(total);
    let orders = await Order.find({user:userId}).sort({paytime:-1}).populate('course');
    ctx.body = {code: 0, data: {total, orders}};
});
//参考文章  http://www.jb51.net/article/102190.htm
//参考文档 https://doc.open.alipay.com/docs/doc.htm?spm=a219a.7629140.0.0.nNOmiW&treeId=204&articleId=105297&docType=1
router.get('/order/sign/alipay', checkLogin,async(ctx, next) => {
    let orderId = ctx.query.orderId;
    console.log('orderId',orderId);
    let orderVo = await Order.findById(orderId).populate('course');
    let alipayConfig = {
        partner : "2088221872110871",
        seller_id : "1144709265@qq.com",
        subject:orderVo.course.name,
        body:orderVo.course.description,
        total_fee:orderVo.course.price,
        notify_url:'https://ketang.zhufengpeixun.cn/order/notice',
        service:"mobile.securitypay.pay",
        payment_type:"1",
        input_char_set:"utf-8",
        it_b_pay:"30m",
        show_url:"m.alipay.com"
    };
    var code = "";
    for(var i = 0; i < 4; i++) {
        code += Math.floor(Math.random() * 10);
    }
    //流水号暂时由时间戳与四位随机码生成
    alipayConfig.out_trade_no = Date.now().toString() + code;

    var orderSpec = getPayParams(alipayConfig);
    var sign = getSign(orderSpec)
    ctx.body = {
        code:0,
        data:{
            orderSpec,
            sign
        }
    };
});

function getPayParams(alipayConfig){
    // 签约合作者身份ID
    var orderInfo = "partner=" + "\"" + alipayConfig.partner + "\"";

    // 签约卖家支付宝账号
    orderInfo += "&seller_id=" + "\"" + alipayConfig.seller_id + "\"";

    // 商户网站唯一订单号
    orderInfo += "&out_trade_no=" + "\"" + alipayConfig.out_trade_no + "\"";

    // 商品名称
    orderInfo += "&subject=" + "\"" + alipayConfig.subject + "\"";

    // 商品详情
    orderInfo += "&body=" + "\"" + alipayConfig.body + "\"";

    // 商品金额
    orderInfo += "&total_fee=" + "\"" + alipayConfig.total_fee + "\"";

    // 服务器异步通知页面路径
    orderInfo += "&notify_url=" + "\"" + alipayConfig.notify_url + "\"";

    // 服务接口名称， 固定值
    orderInfo += "&service=\"mobile.securitypay.pay\"";

    // 支付类型， 固定值
    orderInfo += "&payment_type=\"1\"";

    // 参数编码， 固定值
    orderInfo += "&_input_charset=\"utf-8\"";

    // 设置未付款交易的超时时间
    // 默认30分钟，一旦超时，该笔交易就会自动被关闭。
    // 取值范围：1m～15d。
    // m-分钟，h-小时，d-天，1c-当天（无论交易何时创建，都在0点关闭）。
    // 该参数数值不接受小数点，如1.5h，可转换为90m。
    orderInfo += "&it_b_pay=\"30m\"";

    // extern_token为经过快登授权获取到的alipay_open_id,带上此参数用户将使用授权的账户进行支付
    // orderInfo += "&extern_token=" + "\"" + extern_token + "\"";

    // 支付宝处理完请求后，当前页面跳转到商户指定页面的路径，可空
    orderInfo += "&return_url=\"m.alipay.com\"";

    return orderInfo;
}

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
            prestr = prestr + obj[0]+'='+obj[1]+'';
        }else{
            prestr = prestr + obj[0]+'='+obj[1]+'&';
        }
    }
    return prestr;
}

function getPaySign(orderInfo) {
    try {
        var privatePem = fs.readFileSync('./pem/app_private.pem');
        var key = privatePem.toString();
        console.log(key);
        var prestr = orderInfo; 
        var crypto = require('crypto');
        var sign = crypto.createSign('RSA-SHA1');
        sign.update(prestr);
        sign = sign.sign(key,'base64');
        return encodeURIComponent(sign);
    } catch(err) {
        console.log('veriSign err', err)
    } 
}


function getSign(params) {
    try {
       var privatePem = fs.readFileSync('./pem/app_private.pem');
       var key = privatePem.toString();
        console.log(key);
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
        var publicPem = fs.readFileSync('./pem/alipay_public.pem');
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

//收款通知
router.post('/order/notice', checkLogin,async(ctx, next) => {
    var params = req.body;
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
router.post('/order/:courseId', checkLogin,async(ctx, next) => {
    var courseId = ctx.params.courseId;
    let userId=ctx.user;
    let courseOrderedCount=await Order.count({user:userId,course:courseId}); //按用户和课程查询订单，确认是否重复
    //if(courseOrderedCount>0)
    //    ctx.body={code:1000,errorMessage:"the user have order the course before"};
    //else{
        let order=await prepareOrderInfoByCourseId(courseId,userId);
    console.log('order',order);
        ctx.body = await buy(order);
    //}
});
function prepareOrderInfoByCourseId(courseId,userId){
    let order={};
    return Course.findOne({id:courseId}).then(course=>{
        return course;
    }).then((course)=>{
        order.user=userId;
        order.course=course._id;
        order.price=course.price;
        order.paytime=new Date();
        order.status=0;//未支付
        order.flowno="";//生成order时未涉及支付所以支付宝流水号为空
        order.paymethod="";
        return order;
    }).catch(error=>{
        return {code:1000,errorMessage:error.message}
    });
}
function buy(order) {
    return Order.create(order).then(doc => {
        return {code: 0,data:doc._id};
    }, error => {
        return {code: 1000, errorMessage: error};
    });
}

module.exports = router;
