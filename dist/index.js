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
const rating_1 = __importDefault(require("./models/rating"));
const customer_1 = __importDefault(require("./routes/customer"));
const customer_service_1 = __importDefault(require("./routes/customer-service"));
const payments_1 = __importDefault(require("./models/payments"));
const socket_io_1 = require("socket.io"); // ✅ import socket.io
const http_1 = __importDefault(require("http"));
const app = (0, express_1.default)();
// relationships
const server = http_1.default.createServer(app); // ✅ create HTTP server from Express app
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // change this to your frontend domain in production
        methods: ["GET", "POST"],
    },
});
app.use(body_parser_1.default.json());
// One User has One Order
user_1.default.hasOne(order_1.default, {
    foreignKey: "userID",
    constraints: true,
    onDelete: "CASCADE",
});
order_1.default.belongsTo(user_1.default, { foreignKey: "userID" });
// Order has Many OrderItems
order_1.default.hasMany(orderItem_1.default, { foreignKey: "orderID", onDelete: "CASCADE" });
orderItem_1.default.belongsTo(order_1.default, { foreignKey: "orderID" });
// Product to OrderItems
product_1.default.hasMany(orderItem_1.default, { foreignKey: "productID", onDelete: "CASCADE" });
orderItem_1.default.belongsTo(product_1.default, { foreignKey: "productID" });
// User to Chat (as customer)
user_1.default.hasMany(chat_1.default, { foreignKey: "userID", as: "CustomerChats" });
chat_1.default.belongsTo(user_1.default, { foreignKey: "userID", as: "Customer" });
// // User to Chat (as customer service)
user_1.default.hasMany(chat_1.default, { foreignKey: "userID", as: "ServiceChats" });
chat_1.default.belongsTo(user_1.default, { foreignKey: "userID", as: "CustomerService" });
// Chat to Messages
chat_1.default.hasMany(message_1.default, { foreignKey: "chatID", onDelete: "CASCADE" });
message_1.default.belongsTo(chat_1.default, { foreignKey: "chatID" });
// product to ratings
product_1.default.hasMany(rating_1.default, { foreignKey: "productID", onDelete: "CASCADE" });
rating_1.default.belongsTo(product_1.default, { foreignKey: "productID" });
order_1.default.hasOne(payments_1.default, { foreignKey: "productID", onDelete: "CASCADE" });
payments_1.default.belongsTo(order_1.default);
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
app.get("/home", async (req, res, next) => {
    /// needs pagention
    try {
        const products = await product_1.default.findAll();
        if (products.length == 0)
            res.status(202).json({ message: "no Products in inventory" });
        else
            res.status(200).json({ message: "Products :", products: products });
    }
    catch (err) {
        err.statusCode = 500;
        throw err;
    }
});
app.use("/auth", auth_1.default);
app.use("/customer", customer_1.default);
app.use("/customer-service", customer_service_1.default);
database_1.default
    .sync()
    .then((res) => {
    server.listen(3000);
})
    .catch((err) => console.log(err));
