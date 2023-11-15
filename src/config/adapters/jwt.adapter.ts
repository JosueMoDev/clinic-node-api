import jwt from 'jsonwebtoken';
import { Environment } from '../envs/envs';

const JWT_SEED = Environment.SECRET_KEY_JWT;

export class JWTAdapter { 

    static async generateToken(payload: any, duration: string = '2h') {
        return new Promise((resolve) => {
            jwt.sign(payload, JWT_SEED, { expiresIn: duration }), (err: Error, token: string) => {
                if (err) return resolve(null);
                resolve(token);
            }
        });
    }

    static validateToken<T>(token: string): Promise<T | null>{
        return new Promise((resolve) => {
            jwt.verify(token, JWT_SEED, (err, decoded) => {
                if (err) return resolve(null);
                resolve(decoded as T);
            })
        });
    }
}