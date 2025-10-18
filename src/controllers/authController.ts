import type {Request, Response} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {createUser, findUserByEmail} from '../repositories/userRepository.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const signup = async(req: Request, res: Response)=>{
    try{
        const {firstName, lastName, email, password}= req.body;
        const existingUser = await findUserByEmail(email);
        if(existingUser) return res.status(400).json({meesage: 'User already exists'});

        const hashedPassword = await bcrypt.hash(password,10);
        const user = await createUser({firstName, lastName, email, password: hashedPassword});

        res.status(201).json({id: user.id, emai: user.email, firstName: user.firstName, lastName: user.lastName});
    }
    catch(error){
        res.status(500).json({message:'Signup failed',error});
    }
};

export const login = async(req: Request, res: Response)=>{
    try{
        const {email, password} = req.body;
        const user = await findUserByEmail(email);
        if(!user) return res.status(400).json({message: 'Invalid credentials'});

        const validPassword = await bcrypt.compare(password, user.password);
        if(!validPassword) return res.status(400).json({message: 'Invalid credentials'});

        const token = jwt.sign({userId: user.id}, JWT_SECRET, {expiresIn: '24h'});
        res.json({token});
    }
    catch(error){
        res.status(500).json({message:'Login failed',error});
    }
}