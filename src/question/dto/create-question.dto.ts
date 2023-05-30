import { IsString, IsNotEmpty } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}
