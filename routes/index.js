/**
 * Created by weimin on 16-12-25.
 */
var router = require("koa-router")();
var model = require('../model');
var rp = require('request-promise');
var fs = require('fs');
var util = require('util');
var User = require('../model').User;

router.get("/test",async (ctx,next)=>{
    await ctx.render("index",{
        title:"Home Page Playground"
    })
});


module.exports = router;