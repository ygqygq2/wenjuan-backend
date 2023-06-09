import { IsString, IsNotEmpty } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description?: string;

  @IsString()
  css?: string;

  @IsString()
  js?: string;

  // 组件列表
  componentList?: string;
}
