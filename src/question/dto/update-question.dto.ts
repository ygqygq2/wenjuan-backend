import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  css?: string;

  @IsString()
  @IsOptional()
  js?: string;

  // 组件列表
  @IsOptional()
  componentList?: string;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsBoolean()
  @IsOptional()
  isStar?: boolean;
}
