import { where } from "sequelize";
import Product from "../models/product";
import { reqBodyProuduct } from "../types";
import sequelize from "../util/database";
import message from "../models/message";

export const viewCustomerProducts = async (req: any, res: any, next: any) => {
  try {
    const products = await Product.findAll({
      where: { userID: req.params.userID },
    });
    res
      .status(201)
      .json({ message: "this is ur products", products: products });
  } catch (err) {
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};

export const viewProduct = async (req: any, res: any, next: any) => {
  try {
    const product = await Product.findAll({
      where: { userID: req.params.productID },
    });
    res.status(201).json({ message: "product details", product: product });
  } catch (err) {
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};

export const createProduct = async (req: any, res: any, next: any) => {
  const t = await sequelize.transaction();
  try {
    const reqBody = req.body as reqBodyProuduct;
    const product = await Product.findOne({
      where: {
        name: reqBody.name,
        price: reqBody.price,
        description: reqBody.description,
      },
      transaction: t,
    });
    // console.log(product);
    if (!product) {
      await Product.create(
        {
          name: reqBody.name as string,
          price: reqBody.price as number,
          description: reqBody.description as string,
          imageUrl: reqBody.imageUrl as string,
          userID: reqBody.userID as number,
          amount_in_inventory: 1,
        },
        { transaction: t }
      );
    } else {
      const productSchema = product.get();
      productSchema.amount_in_inventory += 1;
      product.update(
        {
          amount_in_inventory: productSchema.amount_in_inventory + 1,
        },
        { transaction: t }
      );
      await product.save();
      await t.commit();
      res.status(201).json({ message: "product created" });
    }
  } catch (err) {
    await t.rollback();
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};

export const deleteProduct = async (req: any, res: any, next: any) => {
  const t = await sequelize.transaction();
  try {
    const reqBody = req.body as reqBodyProuduct;

    const product = await Product.findByPk(req.params.productID, {
      transaction: t,
    });
    // console.log(product);
    if (!product) {
      const err = new Error("can t find ur product");
      (err as any).statusCode = 404;
      throw err;
    } else {
      await product.destroy({ transaction: t });
      await t.commit();
      res.status(201).json({ message: "product deleted" });
    }
  } catch (err) {
    await t.rollback();
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};

export const updateProduct = async (req: any, res: any, next: any) => {
  const t = await sequelize.transaction();
  try {
    const reqBody = req.body as reqBodyProuduct;

    const product = await Product.findByPk(req.params.productID, {
      transaction: t,
    });
    // console.log(product);
    if (!product) {
      const err = new Error("can t find ur product");
      (err as any).statusCode = 404;
      throw err;
    } else {
      product.update(
        {
          name: reqBody.name as string,
          price: reqBody.price as number,
          description: reqBody.description as string,
          imageUrl: reqBody.imageUrl as string,
        },
        { transaction: t }
      );
      await product.save();
      await t.commit();
      res.status(201).json({ message: "product updated" });
    }
  } catch (err) {
    await t.rollback();
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};

export const createOrder = async (req: any, res: any, next: any) => {};

export const cancelOrder = async (req: any, res: any, next: any) => {};

export const updateOrder = async (req: any, res: any, next: any) => {};

export const checkOut = async (req: any, res: any, next: any) => {};

// c cs
