"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOut = exports.updateOrder = exports.cancelOrder = exports.createOrder = exports.getOrders = void 0;
const product_1 = __importDefault(require("../models/product"));
const database_1 = __importDefault(require("../util/database"));
const order_1 = __importDefault(require("../models/order"));
const orderItem_1 = __importDefault(require("../models/orderItem"));
const stripe_1 = __importDefault(require("stripe"));
const payments_1 = __importDefault(require("../models/payments"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-04-30.basil",
});
const getOrders = async (req, res, next) => {
    try {
        const userID = req.params.userID;
        const orders = await order_1.default.findAll({
            where: {
                userID: userID,
            },
        });
        if (orders.length == 0) {
            const err = new Error("no order made yet!");
            err.statusCode = 404;
            throw err;
        }
        else {
            const or = [];
            for (var i of orders) {
                or.push({ order: i.get() });
            }
            res.status(201).json({ message: "here is all ur orders", orders: or });
        }
    }
    catch (err) {
        err.statusCode = 500;
        console.error(err);
        throw err;
    }
};
exports.getOrders = getOrders;
const createOrder = async (req, res, next) => {
    const t = await database_1.default.transaction();
    try {
        const reqBod = req.body;
        const quantityMap = new Map(Object.entries(reqBod.products).map(([k, v]) => [
            parseInt(k),
            v,
        ]));
        reqBod.products = quantityMap;
        const reqBody = reqBod;
        const productIds = [];
        for (const key of reqBody.products.keys()) {
            productIds.push(key);
        }
        if (productIds.length == 0) {
            const err = new Error("no products sent !");
            err.statusCode = 404;
            throw err;
        }
        const products = await product_1.default.findAll({
            where: { productID: productIds },
            transaction: t,
        });
        let totalPrice = 0;
        const orderItemsData = [];
        // console.log(products);
        for (const product of products) {
            const p = product.get();
            const quantity = reqBody.products.get(p.productID);
            // console.log(p.amount_in_inventory);
            if (p.amount_in_inventory < quantity) {
                throw new Error(`Product ${p.name} does not have enough inventory`);
            }
            orderItemsData.push({
                orderID: -1,
                productID: p.productID,
                quantity,
                price: p.price,
            });
            totalPrice += p.price * quantity;
        }
        const order = await order_1.default.create({
            userID: reqBody.userID,
            status: "unpaid",
            totalPrice: totalPrice,
        }, { transaction: t });
        const orderId = order.get().orderID;
        const items = orderItemsData.map((item) => {
            item.orderID = orderId;
            return item;
        });
        await orderItem_1.default.bulkCreate(items, { transaction: t });
        await t.commit();
        res.status(201).json({ message: "order created" });
    }
    catch (err) {
        await t.rollback();
        err.statusCode = 500;
        console.error(err);
        throw err;
    }
};
exports.createOrder = createOrder;
const cancelOrder = async (req, res, next) => {
    const t = await database_1.default.transaction();
    try {
        const orderID = req.params.orderID;
        const order = await order_1.default.findByPk(orderID);
        const inOrder = order?.get();
        if (!order) {
            const err = new Error("can find the order");
            err.statusCode = 404;
            throw err;
        }
        else {
            if (inOrder.status === "unpaid") {
                await order_1.default.destroy({ where: { orderID: orderID }, transaction: t });
                t.commit();
                res.status(200).json({ message: "order canceled" });
            }
            else {
                const err = new Error("the order is paid please contact the customer service if you want to delete it");
                err.statusCode = 404;
                throw err;
            }
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
    // get order , change or remove the products , bulk insert
    try {
        const orderID = req.params.orderID;
        const order = await order_1.default.findByPk(orderID);
        if (!order) {
            const err = new Error("order doesn't exist");
            err.statusCode = 404;
            throw err;
        }
        else {
            /**
             * - give new order.
             * - bulk insert the new order.
             */
            const reqBod = req.body;
            const quantityMap = new Map(Object.entries(reqBod.products).map(([k, v]) => [
                parseInt(k),
                v,
            ]));
            reqBod.products = quantityMap;
            const productIDs = [];
            for (const productID of quantityMap.keys()) {
                productIDs.push(productID);
            }
            await orderItem_1.default.destroy({
                where: {
                    orderID: orderID,
                },
            });
            const prods = await product_1.default.findAll({
                where: {
                    productID: productIDs,
                },
            });
            const orderItemsData = [];
            let totalPrice = 0.0;
            for (const prod of prods) {
                const product = prod.get();
                const amount = quantityMap.get(product.productID);
                if (amount != null) {
                    if (product.quantity < amount) {
                        if (product.amount_in_inventory < amount) {
                            throw new Error(`Product ${product.name} does not have enough inventory`);
                        }
                    }
                }
                orderItemsData.push({
                    orderID: orderID,
                    productID: product.productID,
                    quantity: amount,
                    price: product.price,
                });
                totalPrice += product.price * amount;
            }
            await order.update({ totalPrice: totalPrice }, { transaction: t });
            await orderItem_1.default.bulkCreate(orderItemsData, { transaction: t });
            await t.commit();
            res
                .status(201)
                .json({ message: "order updated", totalPrice: totalPrice });
        }
    }
    catch (err) {
        t.rollback();
        err.statusCode = 500;
        console.log(err);
        throw err;
    }
};
exports.updateOrder = updateOrder;
const checkOut = async (req, res, next) => {
    const t = await database_1.default.transaction();
    try {
        const id = Number(req.params.orderID);
        const order = await order_1.default.findByPk(id);
        if (!order) {
            const err = new Error("No order found");
            err.statusCode = 404;
            throw err;
        }
        const od = order.get();
        if (od.status === "paid") {
            res.status(301).json({ message: "order is already paid" });
        }
        // Step 1: Create PaymentIntent with Stripe
        const payment = await stripe.paymentIntents.create({
            amount: od.totalPrice,
            currency: "usd",
            payment_method: "pm_card_visa",
            confirm: true,
            return_url: "http://localhost:3000/home",
        });
        console.log(payment.latest_charge);
        // Step 2: Record the payment
        await payments_1.default.create({
            orderID: id,
            userID: od.userID,
            amount: od.totalPrice,
            stripeID: payment.id,
        }, { transaction: t });
        // Step 3: Update order status
        await order_1.default.update({ status: "paid" }, { where: { orderID: id }, transaction: t });
        // Step 4: Fetch order items
        const orderItems = await orderItem_1.default.findAll({ where: { orderID: id } });
        const inventoryUpdates = [];
        const ids = [];
        const productQuantityMap = new Map();
        for (const item of orderItems) {
            const or = item.get();
            productQuantityMap.set(or.productID, or.quantity);
            ids.push(or.productID);
        }
        // Step 5: Fetch products
        const products = await product_1.default.findAll({ where: { productID: ids } });
        for (const p of products) {
            const prod = p.get();
            const amount = productQuantityMap.get(prod.productID);
            const updatedQuantity = prod.amount_in_inventory - amount;
            inventoryUpdates.push({
                productID: prod.productID,
                quantity: updatedQuantity,
            });
        }
        // Step 6: Bulk inventory update using raw SQL
        if (inventoryUpdates.length > 0) {
            const updateCases = inventoryUpdates
                .map((item) => `WHEN ${item.productID} THEN ${item.quantity}`)
                .join(" ");
            const updateIDs = inventoryUpdates
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
        }
        // destroy
        // Commit transaction
        await t.commit();
        res.status(200).json({
            client: payment.client_secret,
            message: "Payment processed successfully",
        });
    }
    catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: "Checkout failed", error: err });
    }
};
exports.checkOut = checkOut;
