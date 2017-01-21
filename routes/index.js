/**
 * Created by weimin on 16-12-25.
 */
var router = require("koa-router")();

router.get("/",async (ctx,next)=>{
    await ctx.render("index",{
        title:"Home Page Playground"
    })
});


module.exports = router;