import sequelize from "../util/database";

import { DataTypes } from "sequelize";

const OrderItems = sequelize.define('order_items', {
    orderID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    productID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    }
    ,
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    }

});

export default OrderItems;