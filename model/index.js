var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
mongoose.Promise = Promise;
mongoose.connect('mongodb://127.0.0.1/zhufengketang');
exports.Course = mongoose.model('Course', new mongoose.Schema({
    title: {type: String, required: false},
    author: {type: String, required: false},
    description: {type: String, required: true},
    price: {type: Number, required: false},
    start: {type: Date, required: false},
    address: {type: String, required: false},
    image: {type: String, required: false}
}));

exports.User = mongoose.model('User', new mongoose.Schema({}));

exports.Order = mongoose.model('Order', new mongoose.Schema({
    course_id: {type: ObjectId, ref: 'Course'},
    user_id: {type: ObjectId, ref: 'User'},
}));