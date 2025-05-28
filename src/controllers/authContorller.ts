import { IntegerDataType, Transaction, where } from "sequelize";
import User from "../models/user";
import bcrypt from "bcryptjs";
import { reqBodyAuth } from "../types";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { console } from "inspector";
import { sendResetEmail } from "../util/sendingmails";

export const signup = async (req: any, res: any, next: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      const err = new Error("data validation failed");
      (err as any).status = 404;
      throw err;
    }
    const body = req.body as reqBodyAuth;
    const hashedPassword = await bcrypt.hash(body.password, 12);
    const user = {
      name: body.name,
      password: hashedPassword,
      role: "customer",
      email: body.email,
    };

    await User.create({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
    });

    res.status(201).json({ message: "User created!" });
  } catch (err) {
    (err as any).statusCode = 500;
    throw err;
  }
};

export const login = async (req: any, res: any, next: any) => {
  try {
    const body = req.body as reqBodyAuth;
    const result = await User.findOne({ where: { email: body.email } });
    if (!result) {
      const error = new Error("there is no user with this email");

      throw error;
    }
    const user = result.get();

    const isMatch = await bcrypt.compare(body.password, user.password);

    if (!isMatch) {
      throw new Error("Invalid password");
    }
    const token = jwt.sign(
      {
        email: user.email,
        userID: user.userID,
        userRole: user.role,
      },
      process.env.jwtSecret as string,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "login is successful",
      token: token,
      userID: user.userID,
    });
  } catch (err) {
    (err as any).statusCode = 500;
    throw err;
  }
};
export const forgetPassword = async (req: any, res: any, next: any) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      const err = new Error("no user with this email");
      (err as any).statusCode = 404;
      throw err;
    } else {
      const token = jwt.sign(
        { userID: user.get().userID },
        process.env.jwtSecret as string,
        {
          expiresIn: "1h",
        }
      );

      const resetLink = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/resetpassward/${token}`;
      await sendResetEmail(user.get().userID, resetLink);
    }
  } catch (err) {
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};

export const resetPassword = async (req: any, res: any, next: any) => {
  const token = req.body.token;
  const newPassword = req.body.newPassword;
  try {
    const decoded: any = jwt.verify(token, process.env.jwtSecret as string);
    const user = await User.findByPk(decoded.userID);

    if (!user) {
      const err = new Error("no user found");
      (err as any).statusCode = 404;
      throw err;
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(
      { password: hashedPassword },
      { where: { userID: decoded.userID } }
    );
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

export const deleteAccount = async (req: any, res: any, next: any) => {
  try {
    const userId = req.params.userID;

    const user = await User.findByPk(userId);

    if (!user) {
      const err = new Error("can 't find the user");
      (err as any).statusCode = 404;
      throw err;
    }

    await user.destroy();
    return res.status(200).json({ message: "Account deleted successfully." });
  } catch (err) {
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};
