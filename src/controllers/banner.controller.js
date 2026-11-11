const Banner = require("../model/banner.model");
const apiResponse = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler")

exports.createBannerController = asyncHandler(async (req,res)=>{
    let {title, image}=req.body; 

    let banner = new Banner({
        title, 
        image
    }) 
    await banner.save()

    apiResponse(res, 201, "banner created successful",banner )

})