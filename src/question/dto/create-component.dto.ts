import { IsString, IsNotEmpty } from 'class-validator';

export class CreateComponentDto {
  @IsString()
  @IsNotEmpty()
  fe_id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  props: string;
}
