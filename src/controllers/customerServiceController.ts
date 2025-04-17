import { reqBodyOrder, reqBodyProuduct, reqUpdateOrder } from "../types";
import sequelize from "../util/database";
import Order from "../models/order";

export const cancelOrder = async (req: any, res: any, next: any) => {
  const t = await sequelize.transaction();
  try {
    const orderID = req.params.orderID;
    const order = await Order.findByPk(orderID);
    const inOrder = order?.get();
    if (!order) {
      const err = new Error("the order is not found");
      (err as any).statusCode = 404;
      throw err;
    } else {
      await Order.destroy({ where: { orderID: orderID }, transaction: t });
      t.commit();
      res.status(200).json({ message: "order canceled" });
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
  //
  try {
  } catch (err) {
    t.rollback();
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};

export const getOrders = async (req: any, res: any, next: any) => {
  const t = await sequelize.transaction();
  //
  try {
  } catch (err) {
    t.rollback();
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};
export const getPayments = async (req: any, res: any, next: any) => {
  const t = await sequelize.transaction();
  //
  try {
  } catch (err) {
    t.rollback();
    (err as any).statusCode = 500;
    console.log(err);
    throw err;
  }
};
