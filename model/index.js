var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
mongoose.Promise = Promise;
mongoose.connect('mongodb://127.0.0.1/zhufengketang');
//课程
exports.Course = mongoose.model('Course', new mongoose.Schema({
    title: {type: String, required: false},//课程标题
    author: {type: String, required: false},//课程作者
    description: {type: String, required: true},//描述
    price: {type: Number, required: false},//价格
    start: {type: Date, required: false},//开始时间
    address: {type: String, required: false},//地址
    image: {type: String, required: false},//图片
    contents: {type: [String], required: false}//图片
},{collection:'course'}));

//用户
exports.User = mongoose.model('User', new mongoose.Schema({
  name:String,//用户名
  password:String,//密码
  mobile:String,//手机号
},{collection:'user'}));

//订单
exports.Order = mongoose.model('Order', new mongoose.Schema({
    course_id: {type: ObjectId, ref: 'Course'},//课程
    user_id: {type: ObjectId, ref: 'User'},//用户
},{collection:'order'}));

//图片验证码
exports.ImgCode = mongoose.model('ImgCode', new mongoose.Schema({
    token: {type: String},//token字符串
    code: {type: String},//图片验证码
    expire:Date//过期时间
},{collection:'img_code'}));

//手机验证码
exports.MobileCode = mongoose.model('MobileCode', new mongoose.Schema({
    token: {type: String},//token字符串
    code: {type: String},//手机验证码
    expire:Date//过期时间
},{collection:'mobile_code'}));

//Token
exports.Token = mongoose.model('Token', new mongoose.Schema({
    user_id: {type: ObjectId, ref: 'User'},//此token对应的用户
    token: {type: String},//token字符串
    expire:Date//过期时间
},{collection:'token'}));