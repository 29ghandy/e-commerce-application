"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.giveRating = exports.updateProduct = exports.deleteProduct = exports.createProduct = exports.viewProduct = exports.viewCustomerProducts = void 0;
const product_1 = __importDefault(require("../models/product"));
const database_1 = __importDefault(require("../util/database"));
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
// c cs
