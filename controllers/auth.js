const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models/user");

const { schemas } = require("../models/user");

const httpError = require("../helpers/httpError");

const { SECRET_KEY } = process.env;

const register = async (req, res, next) => {
  try {
    const verifiedResult = schemas.registerSchema.validate(req.body);
    if (verifiedResult.error !== undefined) {
      throw httpError(400, verifiedResult.error);
    }
    const reqBody = verifiedResult.value;
    const { email, password } = reqBody;
    const user = await User.findOne(email);
    if (user) {
      throw httpError(409, "Email in use");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashPassword });
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

const login = async (req, res, next) => {
  try {
    const verifiedResult = schemas.registerSchema.validate(req.body);
    if (verifiedResult.error !== undefined) {
      throw httpError(400, verifiedResult.error);
    }
    const reqBody = verifiedResult.value;
    const { email, password } = reqBody;
    const user = await User.findOne(email);
    if (!user) {
      throw httpError(401, "Email or password is wrong");
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

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.status(200).json({
    email: email,
    subscription: subscription,
  });
};

module.exports = {
  register,
  login,
  logout,
  getCurrent,
};
