import { IsAlpha, IsDefined, IsEmail, IsBoolean, IsUUID, Length } from "class-validator";

export class List {
    @IsAlpha()
    @IsDefined()
    @Length(5, 30)
    name: string;
  
    @IsUUID()
    @IsDefined()
    board_id: string;
  }