import express from 'express'
import bodyParser from 'body-parser';
import User from './models/user';
import Order from './models/order';
import sequelize from './util/database';
import Product from './models/product';
import OrderItem from './models/orderItem';
import Chat from './models/chat';
import Message from './models/message';


const app = express();
// relationships


// One User has One Order
User.hasOne(Order, { foreignKey: 'customerID', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'customerID' });

// Order has Many OrderItems
Order.hasMany(OrderItem, { foreignKey: 'orderID', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderID' });

// Product to OrderItems
Product.hasMany(OrderItem, { foreignKey: 'productID', onDelete: 'CASCADE' });
OrderItem.belongsTo(Product, { foreignKey: 'productID' });

// User to Chat (as customer)
User.hasMany(Chat, { foreignKey: 'customerId', as: 'CustomerChats' });
Chat.belongsTo(User, { foreignKey: 'customerId', as: 'Customer' });

// // User to Chat (as customer service)
User.hasMany(Chat, { foreignKey: 'customerServiceId', as: 'ServiceChats' });
Chat.belongsTo(User, { foreignKey: 'customerServiceId', as: 'CustomerService' });

// Chat to Messages
Chat.hasMany(Message, { foreignKey: 'chatID', onDelete: 'CASCADE' });
Message.belongsTo(Chat, { foreignKey: 'chatID' });


app.use(bodyParser.json());

sequelize.sync()
.then(res => {
    app.listen(3000);
}
).catch(err => console.log(err));