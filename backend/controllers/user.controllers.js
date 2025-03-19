import { User } from "../models/user.models.js";
import { Pin } from "../models/pin.models.js";
import cloudinary from "cloudinary";
import bcrypt from "bcrypt";
import TryCatch from "../utils/TryCatch.js";
import generateToken from "../utils/generateToken.js";

// Get All Users
//--------------
const getAllUsers = TryCatch(
  async (req, res) => {
    const users = await User.find().select("-password");
    res.json(users);
  }
)

// Register a user
//----------------
const registerUser = TryCatch(async (req, res) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    return res.status(400).json({
      message: "Already have an account with this email",
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  user = await User.create({
    name,
    email,
    password: hashPassword,
  });

  generateToken(user._id, res);

  res.status(201).json({
    user,
    message: "User Registered",
  });
});

// Login a user
//--------------
const loginUser = TryCatch(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "No user with this mail",
    });
  }

  const comparePassword = await bcrypt.compare(password, user.password);

  if (!comparePassword) {
    return res.status(400).json({
      message: "Wrong password",
    });
  }

  generateToken(user._id, res);

  res.json({
    user,
    message: "Logged in",
  });
});

// Get my profile
//---------------
const myProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
});

// Get a user's profile
//-----------------
const userProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  res.json(user);
});

// Update a user's profile pic
//----------------------------
const updateProfilePic = TryCatch(async (req, res) => {
  console.log("Received File:", req.file);
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded!" });
  }

  // Upload to Cloudinary
  const result = cloudinary.v2.uploader.upload_stream(
    { folder: "profile_pics" },
    async (error, result) => {
      if (error) {
        return res.status(500).json({ message: "Cloudinary upload failed" });
      }

      // Find user and update profilePic URL
      const user = await User.findById(req.user._id);
      user.profilePic = result.secure_url;
      await user.save();

      res.json({ message: "Profile picture updated!", profilePic: result.secure_url });
    }
  );

  result.end(req.file.buffer);
});

// Follow and Unfollow a user
//----------------------------
const followAndUnfollowUser = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id);
  const loggedInUser = await User.findById(req.user._id);

  if (!user) {
    return res.status(400).json({
      message: "No user with this id",
    });
  }

  if (user._id.toString() === loggedInUser._id.toString()) {
    return res.status(400).json({
      message: "you can't follow yourself",
    });
  }

  if (user.followers.includes(loggedInUser._id)) {
    const indexFollowing = loggedInUser.followings.indexOf(user._id);
    const indexFollowers = user.followers.indexOf(loggedInUser._id);

    loggedInUser.followings.splice(indexFollowing, 1);
    user.followers.splice(indexFollowers, 1);

    await loggedInUser.save();
    await user.save();

    res.json({
      message: "User Unfollowed",
    });
  } else {
    loggedInUser.followings.push(user._id);
    user.followers.push(loggedInUser._id);

    await loggedInUser.save();
    await user.save();

    res.json({
      message: "User followed",
    });
  }
});

// Log out a user
//---------------
const logOutUser = TryCatch(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(200).json({ message: "Logged out successfully" });
}
);

// Delete a user
//--------------
const deleteUser = TryCatch(async (req, res) => {
  const userId = req.user.id;

  await User.updateMany({}, { $pull: { followers: userId } });

  await Pin.deleteMany({ owner: userId });

  await User.findByIdAndDelete(userId);

  res.clearCookie("token");
  res.status(200).json({ message: "Account deleted successfully!" });
});


// Exporting all of them
//----------------------
export {
  getAllUsers,
  deleteUser,
  registerUser,
  loginUser,
  myProfile,
  userProfile,
  updateProfilePic,
  followAndUnfollowUser,
  logOutUser,
}
