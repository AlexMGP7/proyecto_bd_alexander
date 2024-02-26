import { IsAlpha, IsDefined, IsEmail, IsBoolean, IsUUID, Length } from "class-validator";

export class Card {
  @IsDefined()
  @Length(5, 50)
  title: string;

  @Length(0, 255)
  description?: string;

  @IsDefined()
  @IsBoolean()
  is_owner: boolean;

  @IsUUID()
  @IsDefined()
  list_id: string;
}