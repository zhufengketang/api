let TopClient = require( './topClient' ).TopClient;
var client = new TopClient({
    'appkey' : '23577249' ,
    'appsecret' : 'fe82467a0f72788970ea0d4e1fed0ae2' ,
    'REST_URL' : 'http://gw.api.taobao.com/router/rest '
});



module.exports = function(code,mobile){
    return new Promise(function(resolve,reject){
        client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
            'extend' : '' ,
            'sms_type' : 'normal' ,
            'sms_free_sign_name' : '注册验证' ,
            'sms_param' : "{code:'"+code+"',product:'珠峰课堂'}" ,
            'rec_num' : mobile ,
            'sms_template_code' : "SMS_34950592"
        }, function(error, response) {
            if(error){
                console.error(error);
                reject('fail');
            }else{
                console.log(response);
                resolve('success');
            }
        });
    });

}