import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import * as cheerio from 'cheerio';
import crypto from "crypto"
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const generateAccessAndRefreshTokens=async(userId) => {
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()     
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken,refreshToken}
        
    } catch (error) {    
        throw new ApiError(500,"Something went wrong while generating access and refresh tokens")
    }
}


const registerUser = asyncHandler( async (req,res) => {

    //ALGORITHM:-
    //get user details from frontend
    //validation-not empty
    //check is user already exist:username,email
    //check for images,check for avatar
    //upload them to cloudinary,avatar
    //create user object -create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return res

    const {fullName,email,username,password }= req.body
    //console.log("email: ",email);
    
    //if(fullName===""){
    //    throw new ApiError(400,"fullname is required")
    //}

    if (
        [fullName,email,username,password].some((field)=>field?.trim()==="")
    ) {
        throw new ApiError(400,"All fields are required")
    }

    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }
    //console.log(req.files);

    // const avatarLocalPath=req.files?.avatar[0]?.path;
    //const coverImageLocalPath=req.files?.coverImage[0]?.path;

    // if (!avatarLocalPath) {
    //     throw new ApiError(400,"Avatar file is required")
    // }

    // const avatar=await uploadOnCloudinary(avatarLocalPath)
    
    // if(!avatar){
    //     throw new ApiError(400,"Avatar file is required")
    // }

    const user = await User.create({
        fullName,
        //avatar:avatar.url,
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Succesfully")
    )

} )


const loginUser =asyncHandler(async (req,res)=>{
    //req body -> data
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send cookie

    const {email,username,password}=req.body
    console.log(email);
    

    if(!username && !email){
        throw new ApiError(400,"username or password is required")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password) //yaha small u hai kyuki yeh humara banaya hua method jo ki user pe defined hai

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid User Credentials");
    }

    const {accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id)

    const loggedInUser= await  User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,refreshToken
            },
            "User logged In Succesfully"
        )
    )

})


const logoutUser= asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken:1 //this removes the field from document
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged Out"))
})


const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized requestt")
    }

    try {
        const decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user=await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used");
            
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }
    
})


const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body

    const user= await User.findById(req.user?._id)
    const isPasswordCorrect=user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400,"Invalid old password")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))
})


const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "current user fetched successfully"
    ))
})


const updateAccountDetails=asyncHandler(async(req,res)=>{
    const{fullName,email}=req.body

    if(!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email:email
            }
        },
        {new:true}

    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))

})


const verifyCodeforcesProfile = asyncHandler(async (req, res) => {
  const { handle } = req.body;

  if (!handle || !handle.trim()) {
    throw new ApiError(400, "Codeforces handle is required");
  }

  // Step 1: Get basic user info
  const userInfoRes = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
  const userInfo = userInfoRes.data.result[0];

  // Step 2: Get rating history (for contests)
  const ratingRes = await axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`);
  const totalContests = ratingRes.data.result.length;
  const rating = userInfo.rating || 0;
  const maxRating = userInfo.maxRating || 0;

  // Step 3: Get submission history
  const submissionRes = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
  const submissions = submissionRes.data.result;

  const solvedSet = new Set();
  const tags = new Set();

  for (const sub of submissions) {
    if (sub.verdict === "OK" && sub.problem) {
      const key = `${sub.problem.contestId}-${sub.problem.index}`;
      solvedSet.add(key);
      if (Array.isArray(sub.problem.tags)) {
        sub.problem.tags.forEach(tag => tags.add(tag));
      }
    }
  }

  const problemsSolved = solvedSet.size;
  const problemTags = [...tags];

  // Step 4: Update user in DB
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        "profileStats.codeforces": {
          verified: true,
          handle,
          totalContests,
          rating,
          maxRating,
          problemsSolved,
          problemTags,
        }
      }
    },
    { new: true }
  ).select("-password -refreshToken");

  res.status(200).json(
    new ApiResponse(200, user.profileStats.codeforces, "Codeforces profile verified and data fetched")
  );
});


// export const verifyLeetCodeProfile = asyncHandler(async (req, res) => {
//   const { username } = req.body;

//   if (!username) throw new ApiError(400, "Username is required");

//   const query = `
//     query getUserProfile($username: String!) {
//       matchedUser(username: $username) {
//         username
//         submitStats: submitStatsGlobal {
//           acSubmissionNum {
//             difficulty
//             count
//           }
//         }
//         contestRanking {
//           attendedContestsCount
//           rating
//         }
//       }
//     }
//   `;

//   const response = await axios.post("https://leetcode.com/graphql", {
//     query,
//     variables: { username }
//   }, {
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });

//   const data = response.data?.data?.matchedUser;

//   if (!data) throw new ApiError(404, "User not found");

//   const submissionStats = data.submitStats.acSubmissionNum;
//   const difficultyMap = {};
//   let totalSolved = 0;

//   submissionStats.forEach(entry => {
//     if (entry.difficulty !== "All") {
//       difficultyMap[entry.difficulty.toLowerCase()] = entry.count;
//       totalSolved += entry.count;
//     }
//   });

//   const leetStats = {
//     verified: true,
//     username,
//     totalProblemsSolved: totalSolved,
//     contestRating: data.contestRanking?.rating || 0,
//     attendedContestsCount: data.contestRanking?.attendedContestsCount || 0,
//     submissionStats: {
//       easy: difficultyMap.easy || 0,
//       medium: difficultyMap.medium || 0,
//       hard: difficultyMap.hard || 0
//     }
//   };

//   const user = await User.findByIdAndUpdate(
//     req.user._id,
//     { $set: { "profileStats.leetcode": leetStats } },
//     { new: true }
//   ).select("-password -refreshToken");

//   return res.status(200).json(
//     new ApiResponse(200, user.profileStats.leetcode, "LeetCode profile verified and saved")
//   );
// });


export const initiateLeetcodeVerification = asyncHandler(async (req, res) => {
    const raw = crypto.randomBytes(6).toString("hex"); // 12 characters
  const token = `verify_${raw}`; // total length = 19, safe

  // Save token temporarily in DB (optional) or send it directly to user
  // You can also store it in user.profileStats.leetcode.verificationToken if you want

  res.status(200).json(
    new ApiResponse(200, { token }, "Place this token in your LeetCode 'Name' field and click verify.")
  );
});


// export const verifyLeetcodeProfile = asyncHandler(async (req, res) => {
//   const { username, token } = req.body;

//   if (!username || !token) {
//     throw new ApiError(400, "Username and token are required");
//   }

//   const url = `https://leetcode.com/${username}/`;

//   const { data } = await axios.get(`https://leetcode.com/${username}`, {
//   headers: {
//     "User-Agent":
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
//     Accept: "text/html",
//   },
// });
//   const $ = cheerio.load(html);

//   const displayName = $("div.text-label-1.dark\\:text-dark-label-1.text-base.font-semibold").text().trim();

//   if (!displayName) {
//     throw new ApiError(404, "Could not extract name field from LeetCode profile");
//   }

//   if (displayName !== token) {
//     throw new ApiError(400, "Verification token does not match name field");
//   }

//   // Fetch stats (optional: LeetCode GraphQL or scraping)
//   const statsRes = await axios.get(`https://leetcode-stats-api.herokuapp.com/${username}`);
//   const stats = statsRes.data;

//   const updatedUser = await User.findByIdAndUpdate(
//     req.user._id,
//     {
//       $set: {
//         "profileHandles.leetcode": username,
//         "profileStats.leetcode": {
//           verified: true,
//           username,
//           totalProblemsSolved: stats.totalSolved || 0,
//           contestRating: stats.contestRating || 0,
//           attendedContestsCount: stats.contestAttended || 0,
//           submissionStats: {
//             easy: stats.easySolved || 0,
//             medium: stats.mediumSolved || 0,
//             hard: stats.hardSolved || 0,
//           }
//         }
//       }
//     },
//     { new: true }
//   ).select("-password -refreshToken");

//   res.status(200).json(
//     new ApiResponse(200, updatedUser.profileStats.leetcode, "LeetCode profile verified and data saved")
//   );
// });


// export const verifyLeetcodeProfile = asyncHandler(async (req, res) => {
//   const { username, token } = req.body;

//   const profileUrl = `https://leetcode.com/${username}/`;

//   const browser = await puppeteer.launch({ headless: "new" });
//   const page = await browser.newPage();

//   try {
//     await page.setViewport({ width: 1280, height: 800 });

//     await page.goto(`https://leetcode.com/${username}/`, {
//   waitUntil: 'networkidle2',
//   timeout: 15000,
// });

//     await page.screenshot({ path: "leetcode_debug.png", fullPage: true });

//     await page.waitForSelector('[data-cy="profile-username"]', { timeout: 10000 });


//     const leetcodeName = await page.$eval('[data-cy="profile-username"]', el => el.textContent.trim());


//     if (!leetcodeName.includes(token)) {
//       return res.status(400).json(
//         new ApiResponse(400, null, "Token not found in LeetCode name")
//       );
//     }

//     // You can also extract stats here like total solved, rating, etc.

//     await User.findByIdAndUpdate(req.user._id, {
//       $set: {
//         "profileStats.leetcode.verified": true,
//         "profileStats.leetcode.username": username,
//       },
//     });

//     res.status(200).json(
//       new ApiResponse(200, { verified: true, username }, "Leetcode verified successfully")
//     );
//   } catch (error) {
//     console.error("Puppeteer Error:", error);
//     res.status(500).json(
//       new ApiResponse(500, null, "Failed to verify Leetcode profile")
//     );
//   } finally {
//     await browser.close();
//   }
// });


export const verifyLeetcodeProfile = asyncHandler(async (req, res) => {
  const { username, token } = req.body;

  const profileUrl = `https://leetcode.com/${username}/`;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(profileUrl, {
      waitUntil: 'networkidle2',
      timeout: 20000
    });

    await page.screenshot({ path: "leetcode_debug.png", fullPage: true });

    // Wait for the profile username (make sure selector still works)
    await page.waitForSelector('div.text-label-1', { timeout: 10000 });

    const leetcodeName = await page.$eval('div.text-label-1', el => el.textContent.trim());

    if (!leetcodeName.includes(token)) {
      return res.status(400).json(
        new ApiResponse(400, null, "Token not found in LeetCode name")
      );
    }

    // Wait for contest rating
await page.waitForSelector('div.text-label-1.text-2xl', { timeout: 10000 });
const contestRatingText = await page.$eval(
  'div.text-label-1.text-2xl',
  el => el.textContent.trim().replace(/,/g, '') // remove comma if any
);
const contestRating = parseInt(contestRatingText) || 0;

    // Wait for Easy, Medium, Hard problem stats
await page.waitForSelector('div.text-sd-foreground.text-xs.font-medium', { timeout: 10000 });
const rawStats = await page.$$eval(
  'div.text-sd-foreground.text-xs.font-medium',
  els => els.slice(0, 3).map(el => el.textContent.trim())
);


    // Extract problems solved
const [easy, medium, hard] = rawStats.map(stat => parseInt(stat.split('/')[0]));
const totalProblemsSolved = easy + medium + hard;

    // Attended Contests Count
await page.waitForSelector('div.text-label-3', { timeout: 10000 });

const attendedContestsCount = await page.$$eval('div.text-label-3', (labels) => {
  for (const label of labels) {
    if (label.textContent.trim().toLowerCase() === "attended") {
      const numberDiv = label.nextElementSibling;
      if (
        numberDiv &&
        numberDiv.className.includes("text-label-1") &&
        numberDiv.className.includes("font-medium")
      ) {
        const text = numberDiv.textContent.trim().replace(/,/g, '');
        return parseInt(text) || 0;
      }
    }
  }
  return 0;
});


//const attendedContestsCount = parseInt(attendedContestsText) || 0;


    // Save to database
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        "profileStats.leetcode": {
          verified: true,
          username,
          totalProblemsSolved,
          contestRating,
          attendedContestsCount,
          submissionStats: { easy, medium, hard },
        },
      },
    });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          verified: true,
          username,
          totalProblemsSolved,
          contestRating,
          attendedContestsCount,
          submissionStats: { easy, medium, hard },
        },
        "Leetcode verified and stats updated"
      )
    );
  } catch (error) {
    console.error("Puppeteer Error:", error);
    res.status(500).json(
      new ApiResponse(500, null, "Failed to verify Leetcode profile")
    );
  } finally {
    await browser.close();
  }
});

// export const verifyLeetcodeProfile = asyncHandler(async (req, res) => {
//   const { username, token } = req.body;

//   const profileUrl = `https://leetcode.com/${username}/`;

//   const browser = await puppeteer.launch({
//     headless: "new",
//     args: ['--no-sandbox'],
//     defaultViewport: { width: 1280, height: 800 }
//   });
//   const page = await browser.newPage();

//   try {
//     await page.goto(profileUrl, {
//       waitUntil: 'networkidle2',
//       timeout: 20000
//     });

//     // Wait for the display name to appear
//     await page.waitForSelector('div.text-label-1.dark\\:text-dark-label-1', { timeout: 15000 });

//     // Verify token in name field
//     const leetcodeName = await page.$eval(
//       'div.text-label-1.dark\\:text-dark-label-1',
//       el => el.textContent.trim()
//     );

//     if (!leetcodeName.includes(token)) {
//       await browser.close();
//       return res.status(400).json(new ApiResponse(400, null, "Token not found in LeetCode name"));
//     }

//     // Extract stats from the page
//     const totalProblemsSolved = await page.$eval(
//       'div.text-[24px].font-medium.text-label-1.dark\\:text-dark-label-1',
//       el => parseInt(el.textContent.trim())
//     );

//     // Submission breakdown (easy, medium, hard)
//     const counts = await page.$$eval(
//       'div.flex.items-center.gap-1.text-xs',
//       nodes => nodes.map(n => parseInt(n.textContent.match(/\d+/)[0]))
//     );
//     const [easy, medium, hard] = counts;

//     // Contest rating and attended contests
//     const ratingBlockExists = await page.$('div.flex.items-center.space-x-2') !== null;
//     let contestRating = 0, attendedContestsCount = 0;
//     if (ratingBlockExists) {
//       const ratingText = await page.$$eval('span.text-label-1.dark\\:text-dark-label-1', els => els.map(e => e.textContent.trim()));
//       const rating = ratingText.find(t => /^\d+$/.test(t));
//       if (rating) contestRating = parseInt(rating);
//       const attended = ratingText.find(t => t.toLowerCase().includes("contest") && t.match(/\d+/));
//       if (attended) attendedContestsCount = parseInt(attended.match(/\d+/)[0]);
//     }

//     // Save to DB
//     await User.findByIdAndUpdate(req.user._id, {
//       $set: {
//         "profileStats.leetcode": {
//           verified: true,
//           username,
//           totalProblemsSolved,
//           contestRating,
//           attendedContestsCount,
//           submissionStats: { easy, medium, hard },
//         }
//       }
//     });

//     res.status(200).json(
//       new ApiResponse(200, {
//         verified: true,
//         username,
//         totalProblemsSolved,
//         contestRating,
//         attendedContestsCount,
//         submissionStats: { easy, medium, hard },
//       }, "Leetcode verified and stats updated")
//     );
//   } catch (error) {
//     console.error("Puppeteer Error:", error.message);
//     res.status(500).json(new ApiResponse(500, null, "Failed to verify Leetcode profile"));
//   } finally {
//     await browser.close();
//   }
// });


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    verifyCodeforcesProfile
}