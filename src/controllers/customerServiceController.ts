import { reqBodyOrder, reqBodyProuduct, reqUpdateOrder } from "../types";
import Order from "../models/order";
import Payments from "../models/payments";
import OrderItems from "../models/orderItem";
import Stripe from "stripe";
import Product from "../models/product";
import sequelize from "../util/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-04-30.basil",
});

export const refundOrder = async (req: any, res: any, next: any) => {
  const t = await sequelize.transaction();
  try {
    const orderID: number = req.params.orderID;
    const order = await Order.findByPk(orderID);

    // refund and add the products back to inventory
    if (!order) {
      const err = new Error("the order is not found");
      (err as any).statusCode = 404;
      throw err;
    } else {
      const payment = await Payments.findOne({ where: { orderID: orderID } });
      await Order.destroy({ where: { orderID: orderID }, transaction: t });
      const orderItems = await OrderItems.findAll({
        where: { orderID: orderID },
      });
      const amount: Map<number, number> = new Map();
      const itemID: Number[] = [];
      const productsID: Number[] = [];
      for (var item of orderItems) {
        amount.set(item.get().productID, item.get().quantity);
        productsID.push(item.get().productID);
        itemID.push(item.get().orderItemID);
      }
      await OrderItems.destroy({
        where: { orderItemID: itemID },
        transaction: t,
      });
      const paymentID: string = payment?.get().stripeID;
      await stripe.refunds.create({ payment_intent: paymentID });
      const productsInInvetory = await Product.findAll({
        where: { productID: productsID },
      });
      const changeInventory = productsInInvetory.map((it) => {
        const p = it.get();
        const obj: { productID: number; newQuntity: number } = {
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

      await sequelize.query(updateQuery, { transaction: t });
      await t.commit();
      res.status(200).json({ message: "order canceled" });
    }
  } catch (err) {
    await t.rollback();
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};

export const getOrders = async (req: any, res: any, next: any) => {
  try {
    const orders = await Order.findAll({
      where: { userID: req.params.userID, status: "paid" },
    });
    if (orders.length == 0) {
      const err = new Error("no orders done  by this user.");
      (err as any).statusCode = 404;
      throw err;
    }
    res.status(200).json({
      message: "all paid order by the user",
      userID: req.params.userID,
      orders: orders,
    });
  } catch (err) {
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};
export const getPayments = async (req: any, res: any, next: any) => {
  try {
    const userID = req.params.userID;
    const payments = await Payments.findAll({ where: { userID: userID } });
    if (payments.length == 0) {
      const err = new Error("no payments done by this user");
      (err as any).statusCode = 404;
      throw err;
    } else {
      res
        .status(200)
        .json({ message: "payments done by this user", payments: payments });
    }
  } catch (err) {
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};
