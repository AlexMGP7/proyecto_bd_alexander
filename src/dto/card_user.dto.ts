import { IsDefined, IsBoolean, IsUUID } from "class-validator";

export class CardUser {
  @IsUUID()
  @IsDefined()
  card_id: string;

  @IsUUID()
  @IsDefined()
  userId: string;

  @IsBoolean()
  @IsDefined()
  is_owner: boolean;
}
