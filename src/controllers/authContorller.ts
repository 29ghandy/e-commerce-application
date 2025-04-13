import { IntegerDataType, where } from "sequelize";
import User from "../models/user";
import bcrypt from "bcryptjs";
import { reqBodyAuth } from "../types";
import jwt from "jsonwebtoken";

export const signup = async (req: any, res: any, next: any) => {
  try {
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
      },
      "secret",
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
  } catch (err) {}
};
