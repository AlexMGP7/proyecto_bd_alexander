import { IsAlpha, IsDefined, IsEmail, IsBoolean, IsUUID, Length } from "class-validator";

export class BoardUser {
    @IsUUID()
    @IsDefined()
    boardId: string;
  
    @IsUUID()
    @IsDefined()
    userId: string;
  
    @IsDefined()
    @IsBoolean()
    isAdmin: boolean;
  }
  