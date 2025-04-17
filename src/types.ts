export type reqBodyAuth = {
  name: string | null;
  email: string;
  password: string;
};
export type reqBodyProuduct = {
  productID: number;
  name: string;
  imageUrl: string;
  price: number;
  description: string;
  userID: number;
};
export type reqBodyOrder = {
  products: Map<Number, Number>; // id , f
  userID: number;
};
export type reqUpdateOrder = {
  orderID: number;
  removedProducts: Map<Number, Number>;
  newProducts: Map<Number, Number>;
};
