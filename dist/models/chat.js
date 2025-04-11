"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../util/database"));
const sequelize_1 = require("sequelize");
const chat = database_1.default.define('chat', {
    chatID: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    customerID: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    customer_Service_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    }
});
exports.default = chat;
