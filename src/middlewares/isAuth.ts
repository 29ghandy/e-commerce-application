import jwt, { JwtPayload } from "jsonwebtoken";

const isAuth = (req: any, res: any, next: any) => {
  const header = req.get("Authorization");
  if (!header) {
    const err = new Error("Not authorized!");
    (err as any).statusCode = 401;
    throw err;
  }
  const token = header.split(" ")[1];
  console.log(token);
  let decodedToken: JwtPayload | string;
  try {
    decodedToken = jwt.verify(token, "secret");
  } catch (err) {
    (err as any).statusCode = 500;
    throw err;
  }
  if (typeof decodedToken !== "object" || !("userID" in decodedToken)) {
    const error = new Error("Not authenticated");
    (error as any).statusCode = 401;
    throw error;
  }
  console.log(decodedToken.userID);
  req.userID = decodedToken.userID;
  next();
};
export default isAuth;
