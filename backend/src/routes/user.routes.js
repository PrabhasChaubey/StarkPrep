import {Router} from 'express';
import { registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser, updateAccountDetails,verifyCodeforcesProfile, initiateLeetcodeVerification,verifyLeetcodeProfile,fetchLeetcodeStats,updateProfileInfo} from '../controller/user.controller.js';
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";



const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        // {
        //     name:"coverImage",
        //     maxCount:1
        // }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/update-profile-info").patch(
  verifyJWT,
  upload.single("avatar"), // 👈 for one image file
  updateProfileInfo
);



//verify codeforces
router.post("/verify/cf", verifyJWT, verifyCodeforcesProfile);


//verify leetcode
router.post("/leetcode/initiate-verification",initiateLeetcodeVerification)

router.route("/leetcode/verify").post(verifyJWT, verifyLeetcodeProfile);

router.get("/leetcode/stats", verifyJWT, fetchLeetcodeStats);


export default router