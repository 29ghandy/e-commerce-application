import sequelize from "../util/database";
import { DataTypes } from "sequelize";
import Product from "./product";

const Rating = sequelize.define("rating", {
  ratingID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  productID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  stars: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  review_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

export default Rating;
