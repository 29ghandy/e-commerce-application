"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const user_1 = __importDefault(require("../models/user"));
const signup = async (req, res, next) => {
    try {
        const user = {
            name: req.body.name,
            password: req.body.password,
            role: req.body.role,
            email: req.body.email
        };
        await user_1.default.create({ name: user.name, email: user.email, password: user.password, role: user.role });
        res.status(201).json({ message: 'User created!' });
    }
    catch (err) {
        console.log(err);
    }
};
exports.signup = signup;
const login = async (req, res, next) => {
};
exports.login = login;
