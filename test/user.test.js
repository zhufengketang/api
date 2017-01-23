/**
 * Created by zhangdongming on 2017/1/22.
 */
"use strict";
var mongooseConfig = require('../setting');
var User = require('../model').User;
var {assert,expect} =require('chai');
var mocha = require('mocha');
var request = require('supertest');
var should = require('should');
var app = require('../app');
var uuid = require("uuid");
var ImgCode = require('../model').ImgCode;
const host = 'http://localhost:2701';



let testToken = "";
let code = "";
describe('test:token and imageCode', function () {
    it('should get a token', (done)=> {
        request(host)
            .get('/token')
            .end(function (err, result) {
                assert.equal(result.body.code, 0);
                assert(/\w+/.test(result.body.token));
                testToken = result.body.token;
                done();
            });
    });
    //it('should fail to login,fail code 100', (done)=> {
    //    request(host)
    //        .post('/user')
    //        .set('token', "")
    //        .send({})
    //        .end(function (err, result) {
    //            assert.equal(result.body.code, 100);
    //            done();
    //        })
    //});
});

describe('test:getvcode',function(){
    let imageCode = "";
    it('ask for imageCode',(done)=>{
        request(host)
            .get("/imgCode")
            .set("token", testToken)
            .end(function(err,result){
                ImgCode.findOne({token:testToken}).then((doc)=>{
                    imageCode=doc.code;
                    done();
                })
            });
    });
    it("get register vcode",(done)=> {
        const mobileCode = 15210938964;
        const type = "register";
        request(host)
            .get(`/user/vcode?mobile=${mobileCode}&type=${type}&img_code=${imageCode}`)
            .set("token", testToken)
            .end((err,result)=>{
                console.log('body',result.body);
                assert.equal(result.body.code, 0);
                //assert(result.body['data']);
                done();
            });
    })
});