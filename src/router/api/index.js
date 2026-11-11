const express = require("express")
const router = express.Router()

const auth = require("./auth")
const banner = require("./banner")
// localhost:3000/api/auth

router.use('/auth',auth )
router.use("/banner",banner)

module.exports = router;