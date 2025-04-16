import sequelize from "../util/database";

import { DataTypes } from "sequelize";

const Payments = sequelize.define("payments", {
  paymentID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    unique: true,
    autoIncrement: true,
  },
  orderID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
