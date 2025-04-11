"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const user_1 = __importDefault(require("./models/user"));
const order_1 = __importDefault(require("./models/order"));
const database_1 = __importDefault(require("./util/database"));
const product_1 = __importDefault(require("./models/product"));
const orderItem_1 = __importDefault(require("./models/orderItem"));
const chat_1 = __importDefault(require("./models/chat"));
const message_1 = __importDefault(require("./models/message"));
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
// relationships
app.use(body_parser_1.default.json());
// One User has One Order
user_1.default.hasOne(order_1.default, { foreignKey: 'userID', constraints: true, onDelete: 'CASCADE' });
order_1.default.belongsTo(user_1.default, { foreignKey: 'userID' });
// Order has Many OrderItems
order_1.default.hasMany(orderItem_1.default, { foreignKey: 'orderID', onDelete: 'CASCADE' });
orderItem_1.default.belongsTo(order_1.default, { foreignKey: 'orderID' });
// Product to OrderItems
product_1.default.hasMany(orderItem_1.default, { foreignKey: 'productID', onDelete: 'CASCADE' });
orderItem_1.default.belongsTo(product_1.default, { foreignKey: 'productID' });
// User to Chat (as customer)
user_1.default.hasMany(chat_1.default, { foreignKey: 'userID', as: 'CustomerChats' });
chat_1.default.belongsTo(user_1.default, { foreignKey: 'userID', as: 'Customer' });
// // User to Chat (as customer service)
user_1.default.hasMany(chat_1.default, { foreignKey: 'userID', as: 'ServiceChats' });
chat_1.default.belongsTo(user_1.default, { foreignKey: 'userID', as: 'CustomerService' });
// Chat to Messages
chat_1.default.hasMany(message_1.default, { foreignKey: 'chatID', onDelete: 'CASCADE' });
message_1.default.belongsTo(chat_1.default, { foreignKey: 'chatID' });
app.use('/auth', auth_1.default);
database_1.default.sync()
    .then(res => {
    app.listen(3000);
}).catch(err => console.log(err));
