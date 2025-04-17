"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPayments = exports.getOrders = exports.updateOrder = exports.cancelOrder = void 0;
const database_1 = __importDefault(require("../util/database"));
const order_1 = __importDefault(require("../models/order"));
const cancelOrder = async (req, res, next) => {
    const t = await database_1.default.transaction();
    try {
        const orderID = req.params.orderID;
        const order = await order_1.default.findByPk(orderID);
        const inOrder = order?.get();
        if (!order) {
            res.status(200).json({ message: "order not found" });
        }
        else {
            await order_1.default.destroy({ where: { orderID: orderID }, transaction: t });
            t.commit();
            res.status(200).json({ message: "order canceled" });
        }
    }
    catch (err) {
        t.rollback();
        err.statusCode = 500;
        console.log(err);
        throw err;
    }
};
exports.cancelOrder = cancelOrder;
const updateOrder = async (req, res, next) => {
    const t = await database_1.default.transaction();
    //
    try {
    }
    catch (err) {
        t.rollback();
        err.statusCode = 500;
        console.log(err);
        throw err;
    }
};
exports.updateOrder = updateOrder;
const getOrders = async (req, res, next) => {
    const t = await database_1.default.transaction();
    //
    try {
    }
    catch (err) {
        t.rollback();
        err.statusCode = 500;
        console.log(err);
        throw err;
    }
};
exports.getOrders = getOrders;
const getPayments = async (req, res, next) => {
    const t = await database_1.default.transaction();
    //
    try {
    }
    catch (err) {
        t.rollback();
        err.statusCode = 500;
        console.log(err);
        throw err;
    }
};
exports.getPayments = getPayments;
