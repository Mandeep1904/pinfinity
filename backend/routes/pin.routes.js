import express from "express";
import isAuth from "../middlewares/isAuth.js";
import uploadFile from "../middlewares/multer.js";
import {
  commentOnPin,
  createPin,
  deleteComment,
  editComment,
  deletePin,
  getAllPins,
  getSinglePin,
  updatePin,
} from "../controllers/pin.controllers.js";

const router = express.Router();

router.post("/new", isAuth, uploadFile, createPin);
router.get("/all", isAuth, getAllPins);
router.get("/:id", isAuth, getSinglePin);
router.put("/:id", isAuth, updatePin);
router.delete("/:id", isAuth, deletePin);
router.post("/comment/:id", isAuth, commentOnPin);
router.delete("/comment/:id", isAuth, deleteComment);
router.put("/comment/:id", isAuth, editComment);


export default router;
