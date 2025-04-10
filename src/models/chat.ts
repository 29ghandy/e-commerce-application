import sequelize from "../util/database";

import { DataTypes } from "sequelize";


const chat = sequelize.define('chat', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true
    }
    ,
    customerID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    customer_Service_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }

});

export default chat;