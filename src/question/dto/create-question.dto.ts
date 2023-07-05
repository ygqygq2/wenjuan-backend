import { IsString, IsNotEmpty } from 'class-validator';

import { Component } from '../types';

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
  componentList?: Component[];
}
