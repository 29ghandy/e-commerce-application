import { Sequelize, DataTypes, IntegerDataType } from "sequelize";
import sequelize from "../util/database";
import userRoles from "./user-roles";


const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER
        ,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
    ,
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    }
    ,
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type:DataTypes.ENUM
        ,values:userRoles,

        allowNull:false
    }
    ,
    free: {
         type:DataTypes.BOOLEAN
         ,allowNull:true
    }
});
// c , cs

export default User