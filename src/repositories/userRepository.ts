import { AppDataSource } from "../config/db";
import {User} from "../entities/User";

export const userRepository = AppDataSource.getRepository(User);

export const createUser = async (userData: Partial<User>)=>{
    const user = userRepository.create(userData);
    return await userRepository.save(user);
};

export const findUserByEmail = async(email: string)=>{
    return await userRepository.findOne({where: {email}});
}