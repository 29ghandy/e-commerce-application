import sequelize from "../util/database";

import { DataTypes } from "sequelize";

const Order = sequelize.define("orders", {
  orderID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  userID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
       type:DataTypes.STRING,
       allowNull:false
  }
});
export default Order;
