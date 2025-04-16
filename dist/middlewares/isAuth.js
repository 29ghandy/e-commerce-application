"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuth = (req, res, next) => {
    const header = req.get("Authorization");
    if (!header) {
        const err = new Error("Not authorized!");
        err.statusCode = 401;
        throw err;
    }
    const token = header.split(" ")[1];
    let decodedToken;
    try {
        decodedToken = jsonwebtoken_1.default.verify(token, "secret");
    }
    catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (typeof decodedToken !== "object" || !("userID" in decodedToken)) {
        const error = new Error("Not authenticated");
        error.statusCode = 401;
        throw error;
    }
    req.userID = decodedToken.userID;
    next();
};
exports.default = isAuth;
