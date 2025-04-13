"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../util/database"));
const sequelize_1 = require("sequelize");
const Rating = database_1.default.define("rating", {
    ratingID: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    productID: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    starts: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    review_message: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
});
exports.default = Rating;
