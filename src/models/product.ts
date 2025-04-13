import { describe } from "node:test";
import sequelize from "../util/database";

import { DataTypes, Sequelize } from "sequelize";

const Product = sequelize.define("product", {
  productID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  amount_in_inventory: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  desciption: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
export default Product;
