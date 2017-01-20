var mongoose = require('mongoose');
var uuid = require('uuid');
var ObjectId = mongoose.Schema.Types.ObjectId;
mongoose.Promise = Promise;
let url = require('../setting').url;
mongoose.connect(url);
//课程
var CourseSchema = new mongoose.Schema({
    id: {type: ObjectId, required: false},//id
    title: {type: String, required: false},//课程标题
    author: {type: String, required: false},//课程作者
    description: {type: String, required: false},//描述
    price: {type: Number, required: false},//价格
    start: {type: Date, required: false},//开始时间
    address: {type: String, required: false},//地址
    image: {type: String, required: false},//图片
    author_profile: {type: String, required: false},//老师简介
    hours: {type: Number, required: false},//课时
    contents: {type: [String], required: false},//图片
    weight:{type:Number,default:0}
}, {collection: 'course'});

CourseSchema.pre('save', function (next) {
    this.id = this._id;
    next();
});
exports.Course = mongoose.model('Course', CourseSchema);

//用户
var UserSchema = new mongoose.Schema({
    id: {type: ObjectId, required: false},//id
    name: String,//用户名
    password: String,//密码
    mobile: String,//手机号
}, {collection: 'user'});

UserSchema.pre('save', function (next) {
    this.id = this._id;
    next();
});
exports.User = mongoose.model('User', UserSchema);

//订单
var OrderSchema = new mongoose.Schema({
    id: {type: ObjectId, required: false},//id
    course: {type: ObjectId, ref: 'Course'},//课程
    user: {type: ObjectId, ref: 'User'},//用户
    price: Number,//价格
    paytime: {type:Date,default:Date.now},//购买时间
    status: Number,//订单状态 0-新订单 1-已支付 2-支付失败
    flowno: String,//外部交易流水号
    paymethod: String //支付方式 alipay(支付宝) offline(线下) other(其它)
}, {collection: 'order'});

OrderSchema.pre('save', function (next) {
    this.id = this._id;
    next();
});
exports.Order = mongoose.model('Order', OrderSchema);

var ImgCodeSchema =  new mongoose.Schema({
    token: {type: String},//token字符串
    code: {type: String},//图片验证码
    expire: Date//过期时间
}, {collection: 'img_code'});

//图片验证码
exports.ImgCode = mongoose.model('ImgCode',ImgCodeSchema);

//短信验证码
var VCodeSchema = new mongoose.Schema({
    token: {type: String},//token字符串
    code: {type: String},//手机验证码
    expire: Date//过期时间
}, {collection: 'vcode'});

//手机验证码
exports.VCode = mongoose.model('VCode',VCodeSchema);

//Token
var TokenSchema = new mongoose.Schema({
    id: String,
    user: {type: ObjectId, ref: 'User'},//此token对应的用户
    token: {type: String},//token字符串
    expire: Date//过期时间
}, {collection: 'token'});

exports.Token = mongoose.model('Token', TokenSchema);
