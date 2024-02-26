import { IsAlpha, IsDefined, IsEmail, IsBoolean, IsUUID, Length } from "class-validator";

export class CardUser {
    @IsUUID()
    @IsDefined()
    card_id: string;
  
    @IsUUID()
    @IsDefined()
    user_id: string;
  
    @IsDefined()
    @IsBoolean()
    is_owner: boolean;
  }