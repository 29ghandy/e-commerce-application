import Product from "../models/product";
import { reqBodyOrder, reqBodyProuduct } from "../types";
import sequelize from "../util/database";
import Order from "../models/order";
import OrderItems from "../models/orderItem";

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
  /* 
    1- get the product
  */
  try {
  } catch (err) {
    t.rollback();
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
