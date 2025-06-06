"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOut = exports.giveRating = exports.updateOrder = exports.cancelOrder = exports.createOrder = exports.updateProduct = exports.deleteProduct = exports.createProduct = exports.viewProduct = exports.viewCustomerProducts = void 0;
const product_1 = __importDefault(require("../models/product"));
const database_1 = __importDefault(require("../util/database"));
const order_1 = __importDefault(require("../models/order"));
const orderItem_1 = __importDefault(require("../models/orderItem"));
const viewCustomerProducts = async (req, res, next) => {
    /// needs pagention
    try {
        const products = await product_1.default.findAll({
            where: { userID: req.params.userID },
        });
        res
            .status(201)
            .json({ message: "this is ur products", products: products });
    }
    catch (err) {
        err.statusCode = 500;
        console.log(err);
        throw err;
    }
};
exports.viewCustomerProducts = viewCustomerProducts;
const viewProduct = async (req, res, next) => {
    try {
        const product = await product_1.default.findAll({
            where: { userID: req.params.productID },
        });
        res.status(201).json({ message: "product details", product: product });
    }
    catch (err) {
        err.statusCode = 500;
        console.log(err);
        throw err;
    }
};
exports.viewProduct = viewProduct;
const createProduct = async (req, res, next) => {
    const t = await database_1.default.transaction();
    try {
        const reqBody = req.body;
        const product = await product_1.default.findOne({
            where: {
                name: reqBody.name,
                price: reqBody.price,
                description: reqBody.description,
            },
            transaction: t,
        });
        // console.log(product);
        if (!product) {
            await product_1.default.create({
                name: reqBody.name,
                price: reqBody.price,
                description: reqBody.description,
                imageUrl: reqBody.imageUrl,
                userID: reqBody.userID,
                amount_in_inventory: 1,
            }, { transaction: t });
        }
        else {
            const productSchema = product.get();
            await product.update({
                amount_in_inventory: productSchema.amount_in_inventory + 1,
            }, { transaction: t });
            await product.save();
        }
        await t.commit();
        res.status(201).json({ message: "product created" });
    }
    catch (err) {
        await t.rollback();
        err.statusCode = 500;
        console.log(err);
        throw err;
    }
};
exports.createProduct = createProduct;
const deleteProduct = async (req, res, next) => {
    const t = await database_1.default.transaction();
    try {
        const product = await product_1.default.findByPk(req.params.productID, {
            transaction: t,
        });
        // console.log(product);
        if (!product) {
            const err = new Error("can t find ur product");
            err.statusCode = 404;
            throw err;
        }
        else {
            await product.destroy({ transaction: t });
            await t.commit();
            res.status(201).json({ message: "product deleted" });
        }
    }
    catch (err) {
        await t.rollback();
        err.statusCode = 500;
        console.log(err);
        throw err;
    }
};
exports.deleteProduct = deleteProduct;
const updateProduct = async (req, res, next) => {
    const t = await database_1.default.transaction();
    try {
        const reqBody = req.body;
        const product = await product_1.default.findByPk(req.params.productID, {
            transaction: t,
        });
        // console.log(product);
        if (!product) {
            const err = new Error("can t find ur product");
            err.statusCode = 404;
            throw err;
        }
        else {
            await product.update({
                name: reqBody.name,
                price: reqBody.price,
                description: reqBody.description,
                imageUrl: reqBody.imageUrl,
            }, { transaction: t });
            await product.save();
            await t.commit();
            res.status(201).json({ message: "product updated" });
        }
    }
    catch (err) {
        await t.rollback();
        err.statusCode = 500;
        console.log(err);
        throw err;
    }
};
exports.updateProduct = updateProduct;
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
        const products = await product_1.default.findAll({
            where: { productID: productIds },
            transaction: t,
        });
        let totalPrice = 0;
        const orderItemsData = [];
        const inventoryUpdates = [];
        // console.log(products);
        for (const product of products) {
            const p = product.get();
            const quantity = reqBody.products.get(p.productID);
            // console.log(p.amount_in_inventory);
            if (p.amount_in_inventory < quantity) {
                throw new Error(`Product ${p.productID} does not have enough inventory`);
            }
            inventoryUpdates.push({
                productID: p.productID,
                newInventory: p.amount_in_inventory - quantity,
            });
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
        console.log(orderId);
        const items = orderItemsData.map((item) => {
            item.orderID = orderId;
            return item;
        });
        await orderItem_1.default.bulkCreate(items, { transaction: t });
        // Step 5: Bulk inventory update using raw SQL
        const updateCases = inventoryUpdates
            .map((item) => `WHEN ${item.productID} THEN ${item.newInventory}`)
            .join(" ");
        if (inventoryUpdates.length > 0) {
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
        if (inOrder.status === "unpaid") {
            await order_1.default.destroy({ where: { orderID: orderID }, transaction: t });
            t.commit();
            res.status(200).json({ message: "order canceled" });
        }
        else {
            res.status(405).json({
                message: "the order is payed please contact the customer service if you want to delete it",
            });
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
    try {
    }
    catch (err) {
        err.statusCode = 500;
        console.log(err);
        throw err;
    }
};
exports.updateOrder = updateOrder;
const giveRating = async (req, res, next) => {
    const t = await database_1.default.transaction();
    try {
    }
    catch (err) {
        err.statusCode = 500;
        console.log(err);
        throw err;
    }
};
exports.giveRating = giveRating;
const checkOut = async (req, res, next) => {
    const t = await database_1.default.transaction();
    try {
    }
    catch (err) {
        err.statusCode = 500;
        console.log(err);
        throw err;
    }
};
exports.checkOut = checkOut;
// c cs
