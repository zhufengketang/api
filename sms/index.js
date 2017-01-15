let TopClient = require( './topClient' ).TopClient;
var client = new TopClient({
    'appkey' : '23577249' ,
    'appsecret' : 'fe82467a0f72788970ea0d4e1fed0ae2' ,
    'REST_URL' : 'http://gw.api.taobao.com/router/rest '
});



module.exports = function(code,mobile,sign_name,template_code){
    return new Promise(function(resolve,reject){
        client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
            'extend' : '' ,
            'sms_type' : 'normal' ,
            'sms_free_sign_name' : sign_name ,
            'sms_param' : "{code:'"+code+"',product:'珠峰课堂'}" ,
            'rec_num' : mobile ,
            'sms_template_code' : template_code
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