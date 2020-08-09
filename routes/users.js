var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/reset',function(req,res,next){
    res.render('reset',
    {title:"reset password",
    userName:req.session.user
})
})

module.exports = router;
