"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../util/database"));
const sequelize_1 = require("sequelize");
const message = database_1.default.define('message', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    chatID: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    context: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    }
});
exports.default = message;
