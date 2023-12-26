import { Router } from "express";
import registeUser from "../controllers/user.controller.js";

const router = Router()

router.route("/Register").post(registeUser)
// router.route("/Login").post(loginUser)


export default router;