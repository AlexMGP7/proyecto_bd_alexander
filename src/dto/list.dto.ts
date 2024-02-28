import { IsDefined, IsUUID } from "class-validator";

export class List {
  @IsDefined()
  name: string;

  @IsDefined()
  @IsUUID()
  board_id: string;
}
