const jwt = require("jsonwebtoken");

const { User } = require("../models/user");

const httpError = require("../helpers/httpError");

const { SECRET_KEY } = process.env;

const authenticate = async (req, res, next) => {
  const { authorization } = req.headers;

  if (typeof authorization === "undefined") {
    return res.status(401).send({ message: "Not authorized" });
  }
  
  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer") {
    return res.status(401).send({ message: "Not authorized" });
  }

  jwt.verify(token, SECRET_KEY, async (err, decode) => {
    if (err) {
      return res.status(401).send({ message: "Not authorized" });
    }
    try {
      const { id } = decode;
      const user = await User.findById(id);
      if (!user || !user.token || user.token !== token) {
        throw httpError(401, "Not authorized");
      }
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  });
};

module.exports = authenticate;
