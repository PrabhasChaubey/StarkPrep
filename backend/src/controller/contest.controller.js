import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const CLIST_USERNAME = process.env.CLIST_USERNAME;
const CLIST_API_KEY = process.env.CLIST_API_KEY;


const toIST = (utcString) => {
  const options = {
    timeZone: "Asia/Kolkata",
    hour12: true,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  return new Date(utcString).toLocaleString("en-IN", options) + " IST";
};


const formatDuration = (seconds) => {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  let output = "";
  if (hours) output += `${hours}h `;
  if (minutes) output += `${minutes}m`;
  return output.trim() || "0m";
};


export const getUpcomingContests = asyncHandler(async (req, res) => {

  const url = `https://clist.by/api/v2/contest/?username=prabhaschaubey&api_key=0765b39c45aec997be8776fa0f273c8748f6212d`;

  // const { data } = await axios.get(url, {
  // headers: {
  //   Accept: "application/json"
  // },
  // params: {
  //   start__gt: new Date().toISOString(), // contests after now
  //   order_by: "start",
  //   limit: 100
  // }
  //   });

  const { data } = await axios.get(url, {
  headers: {
    Accept: "application/json"
  },
  params: {
    start__gt: new Date().toISOString(), // contests after now
    order_by: "start",
    limit: 100
  }
});


  const filtered = data.objects.filter(contest =>
    ["leetcode.com", "codeforces.com"].includes(contest.resource)
  );

  const now=new Date();

  const processed = filtered.map(contest => {
    const base = {
      name: contest.event,
      platform: contest.resource,
      url: contest.href,
      startTime: toIST(contest.start),
      endTime: toIST(contest.end),
      duration: formatDuration(contest.duration),
   };

    return base;
  });

  res.status(200).json(new ApiResponse(200, processed, "Contests fetched successfully"));
});
