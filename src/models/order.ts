import sequelize from "../util/database";

import { DataTypes } from "sequelize";

const Order = sequelize.define('orders', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
        , autoIncrement: true
    }
    ,
    userID: {
        type: DataTypes.INTEGER,
        allowNull: false
    }

});