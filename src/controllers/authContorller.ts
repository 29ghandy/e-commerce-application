import { IntegerDataType, where } from "sequelize";
import User from "../models/user";
import bcrypt from "bcryptjs";
import message from "../models/message";
import { reqBodyAuth } from "../types";

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
    console.log(err);
    res.status(501).json({ message: "couldn t create users" });
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
    res.status(201).json({ message: "login is successful" });
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: "couldn t login" });
  }
};
export const forgetPassword = async (req: any, res: any, next: any) => {};
