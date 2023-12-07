const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const crypto = require("node:crypto");

const { User } = require("../models/user");

const { schemas } = require("../models/user");

const httpError = require("../helpers/httpError");

const resizeFile = require("../helpers/resizeFile");

const sendEmail = require("../helpers/sendEmail");

const { SECRET_KEY, BASE_URL } = process.env;

const avatarDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res, next) => {
  try {
    const verifiedResult = schemas.registerSchema.validate(req.body);
    if (verifiedResult.error !== undefined) {
      throw httpError(400, verifiedResult.error.message);
    }
    const reqBody = verifiedResult.value;
    const { email, password } = reqBody;
    const user = await User.findOne({ email });
    if (user) {
      throw httpError(409, "Email in use");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationToken = crypto.randomUUID();
    console.log("verificationToken", verificationToken);
    const newUser = await User.create({
      email,
      password: hashPassword,
      avatarURL,
      verificationToken,
    });
    await sendEmail({
      to: email,
      subject: "Welcome to my contacts",
      html: `To confirm your registration please click on the <a href="${BASE_URL}/users/verify/${verificationToken}">link</a>`,
      text: `To confirm your registration please open on the link ${BASE_URL}/users/verify/${verificationToken}`,
    });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verify = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
      throw httpError(404, "User not found");
    }
    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: null,
    });
    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};

const resendVerify = async (req, res, next) => {
  try {
    const verifiedResult = schemas.emailSchema.validate(req.body);
    if (verifiedResult.error !== undefined) {
      throw httpError(400, "missing required field email");
    }
    const reqBody = verifiedResult.value;
    const { email } = reqBody;
    const user = await User.findOne({ email });
    if (!user) {
      throw httpError(404, "User not found");
    }
    if (user.verify) {
      throw httpError(400, "Verification has already been passed");
    }

    await sendEmail({
      to: email,
      subject: "Welcome to my contacts",
      html: `To confirm your registration please click on the <a href="${BASE_URL}/users/verify/${user.verificationToken}">link</a>`,
      text: `To confirm your registration please open on the link ${BASE_URL}/users/verify/${user.verificationToken}`,
    });
    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const verifiedResult = schemas.registerSchema.validate(req.body);
    if (verifiedResult.error !== undefined) {
      throw httpError(400, verifiedResult.error.message);
    }
    const reqBody = verifiedResult.value;
    const { email, password } = reqBody;
    const user = await User.findOne({ email });
    if (!user) {
      throw httpError(401, "Email or password is wrong");
    }
    if (!user.verify) {
      throw httpError(401, "Email not verified");
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw httpError(401, "Email or password is wrong");
    }
    const payload = {
      id: user._id,
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });
    res.status(200).json({
      token: token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

const getCurrent = async (req, res, next) => {
  try {
    const { email, subscription } = req.user;

    res.status(200).json({
      email: email,
      subscription: subscription,
    });
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    if (typeof req.file === "undefined") {
      res.status(400).json({ message: "Invalid request body" });
    }
    const { _id } = req.user;
    const { path: tempUpload, originalname } = req.file;
    const fileName = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarDir, fileName);
    await fs.rename(tempUpload, resultUpload);
    resizeFile(resultUpload);
    const avatarURL = path.join("avatars", fileName);
    await User.findByIdAndUpdate(_id, { avatarURL });

    res.status(200).json({
      avatarURL: avatarURL,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrent,
  updateAvatar,
  verify,
  resendVerify,
};
