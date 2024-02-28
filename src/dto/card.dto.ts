import { IsDefined, IsOptional, IsString, IsUUID } from "class-validator";

export class Card {
  @IsString()
  @IsDefined()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  due_date?: Date;

  @IsUUID()
  @IsDefined()
  list_id: string;
}
