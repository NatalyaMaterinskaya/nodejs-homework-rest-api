const { Schema, model } = require("mongoose");
const Joi = require("joi");

const mongooseError = require("../helpers/mongooseError");

const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, "Set password for user"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: String,
    avatarURL: {
      type: String,
      requared: true,
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", mongooseError);

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
password: Joi.string().min(8).required(),
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const User = model("user", userSchema);

const schemas = {
  registerSchema,
  loginSchema,
};

module.exports = {
    User,
    schemas,
}