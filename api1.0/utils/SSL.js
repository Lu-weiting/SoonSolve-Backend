const express = require('express');
const router = express.Router();
const path =require('path');

router.get('/.well-known/pki-validation/645AC20059CE0F16BEF838BF3350EEEE.txt',(req,res)=>{
    console.log("well-know !")
    const file= path.join(__dirname,'..','static','.well-known','pki-validation','645AC20059CE0F16BEF838BF3350EEEE.txt');
    console.log(file);
    res.sendFile(file);
});


module.exports = router;
