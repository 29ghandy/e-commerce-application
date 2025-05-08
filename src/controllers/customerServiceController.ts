import { reqBodyOrder, reqBodyProuduct, reqUpdateOrder } from "../types";
import sequelize from "../util/database";
import Order from "../models/order";
import Payments from "../models/payments";
import OrderItems from "../models/orderItem";

export const cancelOrder = async (req: any, res: any, next: any) => {
  try {
    const orderID: number = req.params.orderID;
    const order = await Order.findByPk(orderID);

    // refund and add the products back to inventory

    if (!order) {
      const err = new Error("the order is not found");
      (err as any).statusCode = 404;
      throw err;
    } else {
      await Order.destroy({ where: { orderID: orderID } });
      const orderItems = await OrderItems.findAll({
        where: { orderID: orderID },
      });
      const products: { id: number; quanitiy: number }[] = [];
      const itemID: Number[] = [];
      for (var item of orderItems) {
        products.push({
          id: item.get().productID,
          quanitiy: item.get().quanitiy,
        });
        itemID.push(item.get().orderItemID);
      }
      await OrderItems.destroy({ where: { orderItemID: itemID } });
      const amount: number = order.get().totalPrice;

      res.status(200).json({ message: "order canceled" });
    }
  } catch (err) {
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};

export const updateOrder = async (req: any, res: any, next: any) => {
  const t = await sequelize.transaction();
  // get the order paid according to the user
  //  change the order
  // req
  const orderID = req.params.orderID;
  const newOrder = req.body.orderItems;
  try {
  } catch (err) {
    t.rollback();
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};

export const getOrders = async (req: any, res: any, next: any) => {
  //
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
