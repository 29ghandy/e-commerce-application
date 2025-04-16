import { or, where } from "sequelize";
import Product from "../models/product";
import { reqBodyOrder, reqBodyProuduct } from "../types";
import sequelize from "../util/database";
import message from "../models/message";
import Order from "../models/order";
import OrderItems from "../models/orderItem";

export const viewCustomerProducts = async (req: any, res: any, next: any) => {
  /// needs pagention
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

export const createOrder = async (req: any, res: any, next: any) => {
  const t = await sequelize.transaction();
  try {
    const reqBod = req.body;
    const quantityMap = new Map<number, number>(
      Object.entries(reqBod.products).map(([k, v]) => [
        parseInt(k),
        v as number,
      ])
    );
    reqBod.products = quantityMap;
    const reqBody = reqBod as reqBodyOrder;

    const productIds = [];
    for (const key of reqBody.products.keys()) {
      productIds.push(key as number);
    }

    const products = await Product.findAll({
      where: { productID: productIds },
      transaction: t,
    });

    let totalPrice = 0;
    const orderItemsData = [];
    const inventoryUpdates: { productID: number; newInventory: number }[] = [];
    // console.log(products);
    for (const product of products) {
      const p = product.get();
      const quantity = reqBody.products.get(p.productID)! as number;
      // console.log(p.amount_in_inventory);
      if (p.amount_in_inventory < quantity) {
        throw new Error(
          `Product ${p.productID} does not have enough inventory`
        );
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
    const order = await Order.create(
      {
        userID: reqBody.userID,
        status: "unpaid",
        totalPrice: totalPrice,
      },
      { transaction: t }
    );

    const orderId = order.get().orderID as number;
    console.log(orderId);
    const items = orderItemsData.map((item) => {
      item.orderID = orderId;
      return item;
    });
    await OrderItems.bulkCreate(items, { transaction: t });

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

      await sequelize.query(updateQuery, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ message: "order created" });
  } catch (err) {
    await t.rollback();
    (err as any).statusCode = 500;
    console.error(err);
    throw err;
  }
};

export const cancelOrder = async (req: any, res: any, next: any) => {
  const t = await sequelize.transaction();
  try {
  } catch (err) {
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};

export const updateOrder = async (req: any, res: any, next: any) => {
  const t = await sequelize.transaction();
  try {
  } catch (err) {
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};

export const giveRating = async (req: any, res: any, next: any) => {
  const t = await sequelize.transaction();
  try {
  } catch (err) {
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};

export const checkOut = async (req: any, res: any, next: any) => {
  const t = await sequelize.transaction();
  try {
  } catch (err) {
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};

// c cs
