import { Pin } from "../models/pin.models.js";
import TryCatch from "../utils/TryCatch.js";
import getDataUrl from "../utils/urlGenerator.js";
import cloudinary from "cloudinary";

// Create Pin
//------------
const createPin = TryCatch(async (req, res) => {
  const { title, pin } = req.body;

  const file = req.file;
  const fileUrl = getDataUrl(file);

  const cloud = await cloudinary.v2.uploader.upload(fileUrl.content);

  await Pin.create({
    title,
    pin,
    image: {
      id: cloud.public_id,
      url: cloud.secure_url,
    },
    owner: req.user._id,
  });

  res.json({
    message: "Pin Created",
  });
});

// Get All Pins
//--------------
const getAllPins = TryCatch(async (req, res) => {

  const pins = await Pin.find()
    .sort({ createdAt: -1 })
    .populate("owner", "name profilePic");

  const filteredPins = pins.filter(pin => pin.owner !== null);

  res.json(filteredPins);

});

// Get Single Pin
//----------------
const getSinglePin = TryCatch(async (req, res) => {
  const pin = await Pin.findById(req.params.id).populate("owner", "-password");

  res.json(pin);
});

// Comment on a Pin
//-----------------
const commentOnPin = TryCatch(async (req, res) => {
  const pin = await Pin.findById(req.params.id);

  if (!pin) {
    return res.status(400).json({
      message: "No Pin with this id",
    });
  }

  pin.comments.push({
    user: req.user._id,
    name: req.user.name,
    comment: req.body.comment,
  });

  await pin.save();

  res.json({
    message: "Comment Added",
  });
});

// Delete a Comment
//------------------
const deleteComment = TryCatch(async (req, res) => {
  const pin = await Pin.findById(req.params.id);

  if (!pin) {
    return res.status(400).json({
      message: "No Pin with this id",
    });
  }

  if (!req.query.commentId) {
    return res.status(404).json({
      message: "Please give comment id",
    });
  }

  const commentIndex = pin.comments.findIndex(
    (item) => item._id.toString() === req.query.commentId.toString()
  );

  if (commentIndex === -1) {
    return res.status(404).json({
      message: "Comment not found",
    });
  }

  const comment = pin.comments[commentIndex];

  if (comment.user.toString() === req.user._id.toString()) {
    pin.comments.splice(commentIndex, 1);

    await pin.save();

    return res.json({
      message: "Comment Deleted",
    });
  } else {
    return res.status(403).json({
      message: "You are not owner of this comment",
    });
  }
});

// Edit a comment
//--------------
const editComment = TryCatch(async (req, res) => {
  const pin = await Pin.findById(req.params.id);

  if (!pin) {
    return res.status(400).json({
      message: "No Pin with this ID",
    });
  }

  if (!req.query.commentId) {
    return res.status(404).json({
      message: "Please provide a comment ID",
    });
  }

  const commentIndex = pin.comments.findIndex(
    (item) => item._id.toString() === req.query.commentId.toString()
  );

  if (commentIndex === -1) {
    return res.status(404).json({
      message: "Comment not found",
    });
  }

  const comment = pin.comments[commentIndex];

  // Check if the logged-in user is the owner of the comment
  if (comment.user.toString() === req.user._id.toString()) {
    // Update the comment content
    pin.comments[commentIndex].comment = req.body.comment;

    await pin.save();

    return res.json({
      message: "Comment Updated Successfully",
      updatedComment: pin.comments[commentIndex],
    });
  } else {
    return res.status(403).json({
      message: "You are not the owner of this comment",
    });
  }
});

// Delete a Pin
//-------------
const deletePin = TryCatch(async (req, res) => {
  const pin = await Pin.findById(req.params.id);

  if (!pin) {
    return res.status(400).json({
      message: "No Pin with this id",
    });
  }

  if (pin.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      message: "Unauthorized",
    });
  }

  await cloudinary.v2.uploader.destroy(pin.image.id);

  await pin.deleteOne();

  res.json({
    message: "Pin Deleted",
  });
});

// Update a Pin
//-------------
const updatePin = TryCatch(async (req, res) => {
  const pin = await Pin.findById(req.params.id);

  if (!pin) {
    return res.status(400).json({
      message: "No Pin with this id",
    });
  }

  if (pin.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      message: "Unauthorized",
    });
  }

  pin.title = req.body.title;
  pin.pin = req.body.pin;

  await pin.save();

  res.json({
    message: "Pin updated",
  });
});

// Exporting All of them
//---------------------
export {
  createPin,
  getAllPins,
  getSinglePin,
  commentOnPin,
  deleteComment,
  editComment,
  deletePin,
  updatePin,
}