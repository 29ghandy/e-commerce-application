import sequelize from "../util/database";

import { DataTypes } from "sequelize";

const message = sequelize.define('message', {
      id: { 
         type:DataTypes.INTEGER,
         allowNull:false,
         autoIncrement:true,
         primaryKey:true
      },
      chatID: {
          type: DataTypes.INTEGER,
          allowNull:false
      }
      ,
      context: {
         type: DataTypes.TEXT,
         allowNull:false
      }

});

export default message;
