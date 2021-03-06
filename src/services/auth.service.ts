import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { LoginUserData, RegisterUserData } from '../types';
import UserModel from '../models/User';
import { NOT_FOUND_STATUS, SERVER_ERROR_STATUS, SUCCESS_STATUS } from '../constants';

export const registerUser = async (userData: RegisterUserData) => {
    const {
        firstName, lastName, username, email, password,
    } = userData;

    try {
        const hashedPwd = await hash(password, 12);

        const newUser = await UserModel.create({
            firstName,
            lastName,
            username,
            email,
            password: hashedPwd,
        });

        return { status: SUCCESS_STATUS, data: newUser, e: null };
    } catch (e) {
        console.log(e);

        if (e.code === 11000) return { status: SERVER_ERROR_STATUS, e: `Duplicate Value ${Object.keys(e.keyValue)}` };
        return { status: SERVER_ERROR_STATUS, e: 'ServerError', data: null };
    }
};

export const LoginUser = async (userData: LoginUserData) => {
    try {
        const existingUser = await UserModel.findOne({ username: userData.username });

        console.log(existingUser);
        if (!existingUser) return { status: NOT_FOUND_STATUS, e: 'invalid username credentials ...', data: null };

        const matchPwd = await compare(userData.password, existingUser.password);
        if (!matchPwd) return { status: NOT_FOUND_STATUS, e: 'invalid password credentials ...', data: null };

        const token = sign({ username: userData.username }, process.env.JWT_SECRET!);
        return { status: SUCCESS_STATUS, e: null, data: { token, existingUser } };
    } catch (e) {
        console.log(e);
        return { status: SERVER_ERROR_STATUS, e: 'ServerError' };
    }
};
