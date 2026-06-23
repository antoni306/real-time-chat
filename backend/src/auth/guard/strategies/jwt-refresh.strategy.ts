import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy,"JwtRefreshStrategy"){
    constructor(
        private readonly configService: ConfigService, 
    ){
        super({
            jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:false,
            secretOrKey: configService.get("JWT_REFRESH_SECRET") as string,
            passReqToCallback:true
        })
    }

    async validate(req:Request,payload: {sub:string}){
        const bearerToken = (req.get("Authorization") as string).replace("Bearer ","").trim();
        return {id:payload.sub,refreshToken:bearerToken};
    }
}