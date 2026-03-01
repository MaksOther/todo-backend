import { User } from "../models/User.js";
import { jwtService } from "../services/jwt.sevrices.js";
import { catchError } from "../utils/catchError.js";
import { ApiError } from "../exeptions/api.error.js";
import bcrypt from "bcrypt";

const validateEmail = (value) => {
  if (!value) return "Email is required";
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;
  if (!emailPattern.test(value)) return "Email is not valid";
};

const validatePassword = (value) => {
  if (!value) return "Password is required";
  if (value.length < 6) return "At least 6 characters";
};

const registration = catchError(async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest("Bad request", errors);
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw ApiError.badRequest("Email error", {
      email: "Email is already taken",
    });
  }

  const hashedPass = await bcrypt.hash(password, 10);

  const newUser = await User.create({ email, password: hashedPass });

  const userData = { id: newUser.id, email: newUser.email };
  const accessToken = jwtService.sign(userData);

  res.send({ user: userData, accessToken });
});

const login = catchError(async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    email: !email ? "Email is required" : undefined,
    password: !password ? "Password is required" : undefined,
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest("Missing fields", errors);
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw ApiError.badRequest("No such user");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest("Wrong password");
  }

  const userData = { id: user.id, email: user.email };
  const accessToken = jwtService.sign(userData);

  res.send({ user: userData, accessToken });
});

export const AuthController = {
  registration,
  login,
};
