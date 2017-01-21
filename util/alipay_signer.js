/***********************************************
 *
 * MIT License
 *
 * Copyright (c) 2016 珠峰课堂,Ramroll
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

var fs = require("fs")
var path = require("path")
var crypto = require("crypto")


/**
 * 在支付之前根据订单信息生成支付宝的签名
 * @param orderInfo
 * @returns {string}
 */
const getAlipayPaySign = (orderInfo) => {
    try {
        var privatePem = fs.readFileSync(path.resolve(__dirname, '../pem/rsa_private_key.pem'));
        var key = privatePem.toString();
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


/**
 * 支付宝回调后,验证支付宝返回的参数是否合法
 * @param params
 * @returns {*}
 */
const verifyAlipaySign = (params) => {
  try {

    // Step 1: 去除返回中的sign和sign_type
    const {sign, sign_type} = params
    delete params.sign
    delete params.sign_type

    // Step 2: 把参数按照字典顺序排序
    const __kv_arr = Object.keys(params).map(key => [key, params[key]])
    const sorted_params = __kv_arr.sort()


    // Step 3: 使用RSA的验签方法，通过签名字符串、签名参数（经过base64解码）及支付宝公钥验证签名。
    // 用&将排序完的参数整理成为URL
    const content = sorted_params
      .map(arr => arr[0] + "=" + arr[1])
      .reduce((x, y) => x + "&" + y)
    

    var publicPem = fs.readFileSync(path.resolve(__dirname , '../pem/alipay_public.pem'));
    var publicKey = base64toPem(publicPem.toString());
    var verify = crypto.createVerify('RSA-SHA1');
    verify.update(content);
    return verify.verify(publicKey, sign, 'base64')
  } catch(err) {
    console.log('veriSign err', err)
    return false
  }
}

function base64toPem(base64)
{
  for(var result="", lines=0;result.length-lines < base64.length;lines++) {
    result+=base64.substr(result.length-lines,64)+"\n"
  }

  return "-----BEGIN PUBLIC KEY-----\n" + result + "-----END PUBLIC KEY-----";
}



module.exports = {
  getAlipayPaySign,
  verifyAlipaySign
}
