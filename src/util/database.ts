import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    'node-database',
    'root',
    'ghandy',
    {
        dialect: 'mysql',
        host: "localhost",

    }
);
export default sequelize