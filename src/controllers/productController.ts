import Product from "../models/product";
import { reqBodyProuduct } from "../types";
import sequelize from "../util/database";
import Rating from "../models/rating";
import message from "../models/message";

export const viewCustomerProducts = async (req: any, res: any, next: any) => {
  /// needs pagention
  try {
    const products = await Product.findAll({
      where: { userID: req.params.userID },
    });
    if (!products) {
      res.status(404).json({ message: "no products for this user found" });
    } else {
      res
        .status(201)
        .json({ message: "this is ur products", products: products });
    }
  } catch (err) {
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};

export const viewProduct = async (req: any, res: any, next: any) => {
  try {
    const product = await Product.findOne({
      where: { userID: req.params.productID },
    });
    if (!product) {
      res.status(404).json({ message: "no such a product" });
    } else {
      const ratings = await Rating.findAll({
        where: { productID: req.params.productID },
      });
      const n: number = ratings.length;
      let sum: number = 0;
      for (const rating of ratings) {
        const tmp = rating.get();
        sum += tmp.stars;
      }

      res.status(201).json({
        message: "product details",
        product: product,
        rating: sum / n,
      });
    }
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
          name: reqBody.name,
          price: reqBody.price,
          description: reqBody.description,
          imageUrl: reqBody.imageUrl,
          userID: reqBody.userID,
          amount_in_inventory: 1,
        },
        { transaction: t }
      );
    } else {
      const productSchema = product.get();
      await product.update(
        {
          amount_in_inventory: productSchema.amount_in_inventory + 1,
        },
        { transaction: t }
      );
      await product.save();
    }
    await t.commit();
    res.status(201).json({ message: "product created" });
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
      await product.update(
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

export const giveRating = async (req: any, res: any, next: any) => {
  const t = await sequelize.transaction();
  try {
    const numberOfstars = req.body.numberOfstars;
    const review_message = req.body.review_message;
    const productID = req.body.productID;
    await Rating.create({
      productID: productID,
      stars: numberOfstars,
      review_message: review_message,
    });

    res.status(202).json({ message: "Thank u for the review!!" });
  } catch (err) {
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};

// c cs
