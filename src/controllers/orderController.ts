import Product from "../models/product";
import { reqBodyOrder, reqBodyProuduct } from "../types";
import sequelize from "../util/database";
import Order from "../models/order";
import OrderItems from "../models/orderItem";
import Stripe from "stripe";
import { or } from "sequelize";
import message from "../models/message";

const stripe = new Stripe(
  "sk_test_51RLT0gRcTWiFDinlXKVkQytkkOIp8dv8LPU2zHuSr79MoHJDg0DXOJx0l8ZemFNFzthj83ofKdkvDKRi20HEORTE00NUzWVD9c",
  {
    apiVersion: "2025-04-30.basil",
  }
);
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
    if (productIds.length == 0) {
      const err = new Error("no products sent !");
      (err as any).statusCode = 404;
      throw err;
    }

    const products = await Product.findAll({
      where: { productID: productIds },
      transaction: t,
    });

    let totalPrice = 0;
    const orderItemsData = [];

    // console.log(products);
    for (const product of products) {
      const p = product.get();
      const quantity = reqBody.products.get(p.productID)! as number;
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
    const order = await Order.create(
      {
        userID: reqBody.userID,
        status: "unpaid",
        totalPrice: totalPrice,
      },
      { transaction: t }
    );

    const orderId = order.get().orderID as number;

    const items = orderItemsData.map((item) => {
      item.orderID = orderId;
      return item;
    });
    await OrderItems.bulkCreate(items, { transaction: t });
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
    const orderID = req.params.orderID;
    const order = await Order.findByPk(orderID);
    const inOrder = order?.get();
    if (!order) {
      const err = new Error("can find the order");
      (err as any).statusCode = 404;
      throw err;
    } else {
      if (inOrder.status === "unpaid") {
        await Order.destroy({ where: { orderID: orderID }, transaction: t });
        t.commit();
        res.status(200).json({ message: "order canceled" });
      } else {
        const err = new Error(
          "the order is paid please contact the customer service if you want to delete it"
        );
        (err as any).statusCode = 404;
        throw err;
      }
    }
  } catch (err) {
    t.rollback();
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};

export const updateOrder = async (req: any, res: any, next: any) => {
  const t = await sequelize.transaction();
  // get order , change or remove the products , bulk insert
  try {
    const orderID = req.params.orderID;
    const order = await Order.findByPk(orderID);
    if (!order) {
      const err = new Error("order doesn't exist");
      (err as any).statusCode = 404;
      throw err;
    } else {
      /**
       * - give new order.
       * - bulk insert the new order.
       */
      const reqBod = req.body;
      const quantityMap = new Map<number, number>(
        Object.entries(reqBod.products).map(([k, v]) => [
          parseInt(k),
          v as number,
        ])
      );
      reqBod.products = quantityMap;
      const productIDs = [];
      for (const productID of quantityMap.keys()) {
        productIDs.push(productID);
      }

      await OrderItems.destroy({
        where: {
          orderID: orderID,
        },
      });
      const prods = await Product.findAll({
        where: {
          productID: productIDs,
        },
      });
      const orderItemsData = [];
      let totalPrice = 0.0;
      for (const prod of prods) {
        const product = prod.get();
        const amount = quantityMap.get(product.productID)! as number;
        if (amount != null) {
          if (product.quantity < amount) {
            if (product.amount_in_inventory < amount) {
              throw new Error(
                `Product ${product.name} does not have enough inventory`
              );
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
      await OrderItems.bulkCreate(orderItemsData, { transaction: t });
      await t.commit();
      res
        .status(201)
        .json({ message: "order updated", totalPrice: totalPrice });
    }
  } catch (err) {
    t.rollback();
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};
export const checkOut = async (req: any, res: any, next: any) => {
  // orderID, total price
  const t = await sequelize.transaction();
  try {
    const id = req.params.orderID as number;
    const order = await Order.findByPk(id);
    if (!order) {
      const err = new Error("no order found");
      (err as any).statusCode = 404;
      throw err;
    }
    const od = order.get();
    const payment = await stripe.paymentIntents.create({
      amount: od.totalPrice,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });
    await Order.update({ status: "paied" }, { where: { orderID: id } });
    const orderItems = await OrderItems.findAll({ where: { orderID: id } });
    const inventoryUpdates: { productID: number; quanitiy: number }[] = [];
    const ids = [];
    const mp = new Map<number, number>();
    for (var item of orderItems) {
      const or = item.get();
      mp.set(or.productID, or.quanitiy);
      ids.push({ id: or.productID });
    }
    const products = await Product.findAll({ where: { productID: ids } });
    for (var p of products) {
      const prod = p.get();
      const amount = mp.get(prod.productID)!;
      inventoryUpdates.push({
        productID: prod.quanitiy,
        quanitiy: prod.quanitiy - amount,
      });
    }
    // Step 5: Bulk inventory update using raw SQL
    const updateCases = inventoryUpdates
      .map((item) => `WHEN ${item.productID} THEN ${item.quanitiy}`)
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
    res
      .status(200)
      .json({ client: payment.client_secret, message: "payment done" });
  } catch (err) {
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};
