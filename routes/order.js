var router = require('koa-router')();
var Order = require('../model').Order;
var Course=require('../model').Course;
var Token=require('../model').Token;
var checkLogin = require('../ware/auth.js').checkLogin;
let fs = require('fs');
let https = require('https');
var format = require('date-format');
var qs = require("qs")

var {getAlipayPaySign, verifyAlipaySign} = require("../util/alipay_signer")

router.get('/order',checkLogin,async (ctx, next) => {
  console.log('orderId');
  let tokenObj = await Token.findOne({token:ctx.header.token});
  let userId=tokenObj.user;
  // let total = await Order.count({user:userId});
  // console.log(total);
  let orders = await Order.find({user:userId,status:1}).sort({paytime:-1}).populate('course');
  let total=orders.length;
  let orderInfos=[];
  for(let i=0;i<orders.length;i++){
    let order=orders[i];
    await Course.findById(order.course)
      .then((course)=>{
        let orderInfo={
          id:order._id,
          title:course.title,
          author:course.author,
          description : course.description,
          price : course.price,
          start : course.start,
          address : course.address,
          image : course.image
        };
        orderInfos.push(orderInfo);
      });
  }
  ctx.body = {code: 0, data: {total,orderInfos}};
});

//参考文章  http://www.jb51.net/article/102190.htm
//参考文档 https://doc.open.alipay.com/docs/doc.htm?spm=a219a.7629140.0.0.nNOmiW&treeId=204&articleId=105297&docType=1
router.get('/order/sign/alipay', checkLogin,async(ctx, next) => {
  let orderId = ctx.query.orderId;
  console.log('orderId',orderId);
  let orderVo = await Order.findById(orderId).populate('course');
  let alipayConfig = {
    subject:orderVo.course.title,
    body:orderVo.course.description,
    total_fee:orderVo.course.price,
    notify_url:'https://ketang.zhufengpeixun.cn/order/notice'
  };
  var code = "";
  for(var i = 0; i < 4; i++) {
    code += Math.floor(Math.random() * 10);
  }
  //流水号暂时由时间戳与四位随机码生成
  alipayConfig.out_trade_no = Date.now().toString() + code;

  const order = await Order.update({ _id: orderVo._id }, { $set: { flowno: alipayConfig.out_trade_no }})

  ctx.body = {
    code:0,
    data: getOrderSpecAndSign(alipayConfig)
  };
});


/**
 * 通过订单信息获取支付宝(支付签名)
 * @param alipayConfig
 * @returns {{orderSpec: *, sign}}
 */
function getOrderSpecAndSign (alipayConfig) {
  const params = getPayParams(alipayConfig);
  const orderSpec = qs.stringify(params, {encode : false})
  const orderSpecEncoded = qs.stringify(params, {encode : true})

  var sign = getAlipayPaySign(orderSpec)
  return {orderSpec : orderSpecEncoded, sign}
}


/**
 * 组织支付宝支付签名所需参数
 * @param alipayConfig
 * @returns {{app_id: string, biz_content: {timeout_express: string, seller_id: string, product_code: string, total_amount: (*|CourseSchema.price|{type, required}|number|Document.price), subject: *, body: (*|string|string|string|CourseSchema.description|{type, required}), out_trade_no: (string|*)}, charset: string, method: string, notify_url: string, sign_type: string, timestamp: string, version: string}}
 */
function getPayParams(alipayConfig){

  //请求参数按照key=value&key=value方式拼接的未签名原始字符串
  var params = {
    app_id : "2016101002076612",
    biz_content : {
      timeout_express : "30m",
      seller_id : "",
      product_code:"QUICK_MSECURITY_PAY",
      total_amount: alipayConfig.total_fee,
      subject : alipayConfig.subject,
      body : alipayConfig.body,
      out_trade_no : alipayConfig.out_trade_no
    },
    charset : "utf-8",
    method : "alipay.trade.app.pay",
    notify_url : alipayConfig.notify_url,
    sign_type:"RSA",
    timestamp : format.asString('yyyy-MM-dd hh:mm:ss', new Date()),
    version:"1.0"
  }

  params.biz_content = JSON.stringify(params.biz_content)

  return params
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



//收款通知
router.post('/order/notice', async(ctx, next) => {
  var params = ctx.request.body; 

  console.log("@/order/notice")
  console.log(params)

  if(verifyAlipaySign(params)) {

    console.log("verify ok")
    const {trade_status} = params
    
    // 支付成功 处理订单逻辑
    if(trade_status === "TRADE_SUCCESS") {
      console.log("pay success")
      const order = await Order.findOne({flowno : params.out_trade_no})
      const result = Order.update({_id : order.id}, {$set : {status : 1}})
      ctx.body = "success"

      ///TODO
    }

  }else{
    console.log("alipay notify sign error :" +JSON.stringify(ctx.requrest.body))
    ctx.body = 'failure'
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
    order.course=course;
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
