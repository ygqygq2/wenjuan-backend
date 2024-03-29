import { Expose } from 'class-transformer';
import { Column, Entity } from 'typeorm';

import { ComponentTypeNumber } from '@/enum/componentType.enum';

import { Component } from './questionComponent.entity';

@Entity({ name: 'question_paragraph' })
export class QuestionParagraph extends Component {
  type: ComponentTypeNumber = ComponentTypeNumber.QUESTION_PARAGRAPH;

  // 组件内容
  @Expose()
  @Column({ default: '' })
  props_text: string;

  // 是否居中
  @Expose()
  @Column({ default: false })
  props_isCenter: boolean;
}
