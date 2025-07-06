import {Router} from 'express';
import { getUpcomingContests } from "../controller/contest.controller.js";

const router = Router();

router.route("/upcoming").get(getUpcomingContests);

export default router;
