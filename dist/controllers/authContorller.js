"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.forgetPassword = exports.login = exports.signup = void 0;
const user_1 = __importDefault(require("../models/user"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../util/database"));
const signup = async (req, res, next) => {
    const t = await database_1.default.transaction();
    try {
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
        }, { transaction: t });
        t.commit();
        res.status(201).json({ message: "User created!" });
    }
    catch (err) {
        t.rollback();
        err.statusCode = 500;
        throw err;
    }
};
exports.signup = signup;
const login = async (req, res, next) => {
    try {
        const body = req.body;
        const t = await database_1.default.transaction();
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
        }, "secret", { expiresIn: "1h" });
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
    }
    catch (err) {
        err.statusCode = 500;
        console.log(err);
        throw err;
    }
};
exports.forgetPassword = forgetPassword;
const deleteAccount = async (req, res, next) => {
    try {
    }
    catch (err) {
        err.statusCode = 500;
        console.log(err);
        throw err;
    }
};
exports.deleteAccount = deleteAccount;
