// import jwt from "jsonwebtoken";
// import { User } from "../models/user.models.js";

// const isAuth = async (req, res, next) => {
//   try {
//     const token = req.cookies.token;

//     if (!token) {
//       return res.status(403).json({
//         message: "Please Login",
//       });
//     }

//     const decodedData = jwt.verify(token, process.env.JWT_SEC);

//     if (!decodedData) {
//       return res.status(403).json({
//         message: "token expired",
//       });
//     }

//     req.user = await User.findById(decodedData.id);

//     next();
//   } catch (error) {
//     res.status(500).json({
//       message: "Please Login",
//     });
//   }
// };

// export default isAuth;

import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

const isAuth = async (req, res, next) => {
  try {
    let token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(403).json({ message: "Please Login" });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SEC);

    if (!decodedData) {
      return res.status(403).json({ message: "Token expired" });
    }

    req.user = await User.findById(decodedData.id);

    next();
  } catch (error) {
    res.status(500).json({ message: "Please Login" });
  }
};

export default isAuth;
