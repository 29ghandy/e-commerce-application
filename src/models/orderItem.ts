import sequelize from "../util/database";

import { DataTypes } from "sequelize";

const OrderItems = sequelize.define("order_items", {
  orderItemID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
    allowNull: false,
  },
  orderID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export default OrderItems;
