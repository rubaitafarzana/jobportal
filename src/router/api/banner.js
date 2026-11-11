const express = require("express");
const { createBannerController } = require("../../controllers/banner.controller");

const router = express.Router()


router.post("/create-banner",createBannerController)



module.exports = router;