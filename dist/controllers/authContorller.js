"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.resetPassword = exports.forgetPassword = exports.login = exports.signup = void 0;
const user_1 = __importDefault(require("../models/user"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const inspector_1 = require("inspector");
const sendingmails_1 = require("../util/sendingmails");
const signup = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            inspector_1.console.log(errors);
            const err = new Error("data validation failed");
            err.status = 404;
            throw err;
        }
        const body = req.body;
        const hashedPassword = await bcryptjs_1.default.hash(body.password, 12);
        const user = {
            name: body.name,
            password: hashedPassword,
            role: "customer",
            email: body.email,
        };
        await user_1.default.create({
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
        });
        res.status(201).json({ message: "User created!" });
    }
    catch (err) {
        err.statusCode = 500;
        throw err;
    }
};
exports.signup = signup;
const login = async (req, res, next) => {
    try {
        const body = req.body;
        const result = await user_1.default.findOne({ where: { email: body.email } });
        if (!result) {
            const error = new Error("there is no user with this email");
            throw error;
        }
        const user = result.get();
        const isMatch = await bcryptjs_1.default.compare(body.password, user.password);
        if (!isMatch) {
            throw new Error("Invalid password");
        }
        const token = jsonwebtoken_1.default.sign({
            email: user.email,
            userID: user.userID,
            userRole: user.role,
        }, process.env.jwtSecret, { expiresIn: "1h" });
        res.status(201).json({
            message: "login is successful",
            token: token,
            userID: user.userID,
        });
    }
    catch (err) {
        err.statusCode = 500;
        throw err;
    }
};
exports.login = login;
const forgetPassword = async (req, res, next) => {
    try {
        const email = req.body.email;
        const user = await user_1.default.findOne({ where: { email: email } });
        if (!user) {
            const err = new Error("no user with this email");
            err.statusCode = 404;
            throw err;
        }
        else {
            const token = jsonwebtoken_1.default.sign({ userID: user.get().userID }, process.env.jwtSecret, {
                expiresIn: "1h",
            });
            const resetLink = `${req.protocol}://${req.get("host")}/api/v1/resetpassward/${token}`;
            await (0, sendingmails_1.sendResetEmail)(user.get().userID, resetLink);
        }
    }
    catch (err) {
        err.statusCode = 500;
        inspector_1.console.log(err);
        throw err;
    }
};
exports.forgetPassword = forgetPassword;
const resetPassword = async (req, res, next) => {
    const token = req.body.token;
    const newPassword = req.body.newPassword;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.jwtSecret);
        const user = await user_1.default.findByPk(decoded.userID);
        if (!user) {
            const err = new Error("no user found");
            err.statusCode = 404;
            throw err;
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await user_1.default.update({ password: hashedPassword }, { where: { userID: decoded.userID } });
        res.json({ message: "Password reset successful" });
    }
    catch (err) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
};
exports.resetPassword = resetPassword;
const deleteAccount = async (req, res, next) => {
    try {
        const userId = req.params.userID;
        const user = await user_1.default.findByPk(userId);
        if (!user) {
            const err = new Error("can 't find the user");
            err.statusCode = 404;
            throw err;
        }
        await user.destroy();
        return res.status(200).json({ message: "Account deleted successfully." });
    }
    catch (err) {
        err.statusCode = 500;
        inspector_1.console.log(err);
        throw err;
    }
};
exports.deleteAccount = deleteAccount;
