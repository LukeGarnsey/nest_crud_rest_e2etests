import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(private prisma: PrismaService, private jwt: JwtService, private config:ConfigService) { }
    async signup(dto:AuthDto){
        // generate passwordd hash
        const hash = await argon.hash(dto.password);
        try{
        // create user in db
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                }
            });

            delete user.hash;
            //return the saved user
            return user
        }catch(error){
            if(error instanceof PrismaClientKnownRequestError){
                if(error.code === 'P2002'){
                    throw new ForbiddenException('Email already exists');
                }
            }
            throw error;
        }
    }
    async signin(dto: AuthDto){

        //find the user by email
        const user = await this.prisma.user.findUnique({
            where:{
                email: dto.email,

            }
        });
        //user does not exhist
        if(!user){
            throw new ForbiddenException('Wrong email');
        }
        //compare password hashes
        const pwMatches = await argon.verify(
            user.hash, 
            dto.password,
        );
        //if incorrect throw exception.
        if(!pwMatches){
            throw new ForbiddenException('Wrong password');
        }
        //send back the user
        delete user.hash;
        return this.signToken(user.id, user.email);
    }

    async signToken(userId: number, email: string): Promise<{ access_token: string}>{
        const payload = {
            sub: userId,
            email
        };
        const secret = this.config.get('JWT_SECRET');
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: secret,
        });

        return {
            access_token: token,
        }
    }
}
