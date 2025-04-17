"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.giveRating = exports.updateProduct = exports.deleteProduct = exports.createProduct = exports.viewProduct = exports.viewCustomerProducts = void 0;
const product_1 = __importDefault(require("../models/product"));
const database_1 = __importDefault(require("../util/database"));
const rating_1 = __importDefault(require("../models/rating"));
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
        const product = await product_1.default.findOne({
            where: { userID: req.params.productID },
        });
        const ratings = await rating_1.default.findAll({
            where: { productID: req.params.productID },
        });
        const n = ratings.length;
        let sum = 0;
        for (const rating of ratings) {
            const tmp = rating.get();
            sum += tmp.stars;
        }
        res
            .status(201)
            .json({ message: "product details", product: product, rating: sum / n });
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
        const numberOfstars = req.body.numberOfstars;
        const review_message = req.body.review_message;
        const productID = req.body.productID;
        await rating_1.default.create({
            productID: productID,
            stars: numberOfstars,
            review_message: review_message,
        });
        res.status(202).json({ message: "Thank u for the review!!" });
    }
    catch (err) {
        err.statusCode = 500;
        console.log(err);
        throw err;
    }
};
exports.giveRating = giveRating;
// c cs
