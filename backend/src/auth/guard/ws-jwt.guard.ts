import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";



@Injectable()
export class JwtWebSocketGuard implements CanActivate{

    constructor(private readonly jwtService:JwtService, private readonly configService:ConfigService){}
    async canActivate(context: ExecutionContext):  Promise<boolean> {
        const client = context.switchToWs().getClient();
        const token = client.handshake.auth.token;
        try{
            const result:{sub:string,iat:number,exp:number} = this.jwtService.verify(token,{secret:this.configService.get("JWT_SECRET")});
            client.data.userId = result.sub;
            return true;
        }catch(error){
            return false;
        }
        

    }
}