const jwt = require("jsonwebtoken");

const { User } = require("../models/user");

const httpError = require("../helpers/httpError");

const { SECRET_KEY } = process.env;

const authenticate = async (req, res, next) => {
  try {
    const { authorization = "" } = req.headers;
    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer") {
      throw httpError(401, "Not authorized");
    }

    const { id } = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(id);
    if (!user || !user.token || user.token !== token) {
      throw httpError(401, "Not authorized");
      }
      req.user = user;
      next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;