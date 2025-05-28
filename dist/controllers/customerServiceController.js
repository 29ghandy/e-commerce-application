"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPayments = exports.getOrders = exports.refundOrder = void 0;
const order_1 = __importDefault(require("../models/order"));
const payments_1 = __importDefault(require("../models/payments"));
const orderItem_1 = __importDefault(require("../models/orderItem"));
const stripe_1 = __importDefault(require("stripe"));
const product_1 = __importDefault(require("../models/product"));
const database_1 = __importDefault(require("../util/database"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-04-30.basil",
});
const refundOrder = async (req, res, next) => {
    const t = await database_1.default.transaction();
    try {
        const orderID = req.params.orderID;
        const order = await order_1.default.findByPk(orderID);
        // refund and add the products back to inventory
        if (!order) {
            const err = new Error("the order is not found");
            err.statusCode = 404;
            throw err;
        }
        else {
            const payment = await payments_1.default.findOne({ where: { orderID: orderID } });
            await order_1.default.destroy({ where: { orderID: orderID }, transaction: t });
            const orderItems = await orderItem_1.default.findAll({
                where: { orderID: orderID },
            });
            const amount = new Map();
            const itemID = [];
            const productsID = [];
            for (var item of orderItems) {
                amount.set(item.get().productID, item.get().quantity);
                productsID.push(item.get().productID);
                itemID.push(item.get().orderItemID);
            }
            await orderItem_1.default.destroy({
                where: { orderItemID: itemID },
                transaction: t,
            });
            const paymentID = payment?.get().stripeID;
            await stripe.refunds.create({ payment_intent: paymentID });
            const productsInInvetory = await product_1.default.findAll({
                where: { productID: productsID },
            });
            const changeInventory = productsInInvetory.map((it) => {
                const p = it.get();
                const obj = {
                    productID: p.productID,
                    newQuntity: p.amount_in_inventory + amount.get(p.productID),
                };
                return obj;
            });
            const updateCases = changeInventory
                .map((item) => `WHEN ${item.productID} THEN ${item.newQuntity}`)
                .join(" ");
            const updateIDs = changeInventory
                .map((item) => item.productID)
                .join(", ");
            const updateQuery = `
        UPDATE \`Products\`
        SET \`amount_in_inventory\` = CASE \`productID\`
          ${updateCases}
        END
        WHERE \`productID\` IN (${updateIDs})
      `;
            await database_1.default.query(updateQuery, { transaction: t });
            await t.commit();
            res.status(200).json({ message: "order canceled" });
        }
    }
    catch (err) {
        await t.rollback();
        err.statusCode = 500;
        console.log(err);
        throw err;
    }
};
exports.refundOrder = refundOrder;
const getOrders = async (req, res, next) => {
    try {
        const orders = await order_1.default.findAll({
            where: { userID: req.params.userID, status: "paid" },
        });
        if (orders.length == 0) {
            const err = new Error("no orders done  by this user.");
            err.statusCode = 404;
            throw err;
        }
        res.status(200).json({
            message: "all paid order by the user",
            userID: req.params.userID,
            orders: orders,
        });
    }
    catch (err) {
        err.statusCode = 500;
        console.log(err);
        throw err;
    }
};
exports.getOrders = getOrders;
const getPayments = async (req, res, next) => {
    try {
        const userID = req.params.userID;
        const payments = await payments_1.default.findAll({ where: { userID: userID } });
        if (payments.length == 0) {
            const err = new Error("no payments done by this user");
            err.statusCode = 404;
            throw err;
        }
        else {
            res
                .status(200)
                .json({ message: "payments done by this user", payments: payments });
        }
    }
    catch (err) {
        err.statusCode = 500;
        console.log(err);
        throw err;
    }
};
exports.getPayments = getPayments;
