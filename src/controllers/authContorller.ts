import { IntegerDataType } from "sequelize";
import User from "../models/user";


export const signup = async (req: any, res: any, next: any) => {

    try {
        
          const user = {
               name:req.body.name,
               password:req.body.password,
               role:req.body.role ,
               email:req.body.email
          }
         await User.create({name : user.name,email:user.email, password:user.password,role:user.role})
         res.status(201).json({ message: 'User created!'});
    }
    catch(err) {
        console.log(err);
    }
} 
export const login = async (req:any , res:any, next:any) =>
{

}
