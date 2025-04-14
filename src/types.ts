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
