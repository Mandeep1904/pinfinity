import express from "express";
import isAuth from "../middlewares/isAuth.js";
import uploadFile from "../middlewares/multer.js";
import {
  getAllUsers,
  followAndUnfollowUser,
  logOutUser,
  deleteUser,
  loginUser,
  myProfile,
  updateProfilePic,
  registerUser,
  userProfile,
} from "../controllers/user.controllers.js";

const router = express.Router();

router.get("/all", getAllUsers);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", isAuth, logOutUser);
router.delete("/delete", isAuth, deleteUser);
router.get("/me", isAuth, myProfile);
router.get("/:id", isAuth, userProfile);
router.put("/update-profile-pic", isAuth, uploadFile, updateProfilePic);
router.post("/follow/:id", isAuth, followAndUnfollowUser);

export default router;
