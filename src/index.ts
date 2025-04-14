import express from "express";
import bodyParser from "body-parser";
import User from "./models/user";
import Order from "./models/order";
import sequelize from "./util/database";
import Product from "./models/product";
import OrderItem from "./models/orderItem";
import Chat from "./models/chat";
import Message from "./models/message";
import authRoutes from "./routes/auth";
import Rating from "./models/rating";
import customerRoutes from "./routes/customer";
import customerServiceRoutes from "./routes/customer-service";
import message from "./models/message";

const app = express();
// relationships

app.use(bodyParser.json());
// One User has One Order
User.hasOne(Order, {
  foreignKey: "userID",
  constraints: true,
  onDelete: "CASCADE",
});
Order.belongsTo(User, { foreignKey: "userID" });

// Order has Many OrderItems
Order.hasMany(OrderItem, { foreignKey: "orderID", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderID" });

// Product to OrderItems
Product.hasMany(OrderItem, { foreignKey: "productID", onDelete: "CASCADE" });
OrderItem.belongsTo(Product, { foreignKey: "productID" });

// User to Chat (as customer)
User.hasMany(Chat, { foreignKey: "userID", as: "CustomerChats" });
Chat.belongsTo(User, { foreignKey: "userID", as: "Customer" });

// // User to Chat (as customer service)
User.hasMany(Chat, { foreignKey: "userID", as: "ServiceChats" });
Chat.belongsTo(User, { foreignKey: "userID", as: "CustomerService" });

// Chat to Messages
Chat.hasMany(Message, { foreignKey: "chatID", onDelete: "CASCADE" });
Message.belongsTo(Chat, { foreignKey: "chatID" });
// product to ratings
Product.hasMany(Rating, { foreignKey: "productID", onDelete: "CASCADE" });
Rating.belongsTo(Product, { foreignKey: "productID" });

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.get("/home", async (req: any, res: any, next: any) => {
  try {
    const products = await Product.findAll();
    if (products.length == 0)
      res.status(202).json({ message: "no Products in inventory" });
    else res.status(200).json({ message: "Products :", products: products });
  } catch (err) {
    (err as any).statusCode = 500;
    throw err;
  }
});
app.use("/auth", authRoutes);

app.use("/customer", customerRoutes);

app.use("/customer-service", customerServiceRoutes);

sequelize
  .sync()
  .then((res) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
