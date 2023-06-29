import { Expose } from 'class-transformer';
import { Column, Entity } from 'typeorm';

import { ComponentTypeNumber } from '@/enum/componentType.enum';

import { Component } from './questionComponent.entity';

enum QuestionTextareaLevel {
  Level1 = 1,
  Level2 = 2,
  Level3 = 3,
  Level4 = 4,
  Level5 = 5,
}

@Entity({ name: 'question_title' })
export class QuestionTitle extends Component {
  type: ComponentTypeNumber = ComponentTypeNumber.QUESTION_TITLE;

  // 组件内容
  @Expose()
  @Column({ default: '' })
  props_text: string;

  // 标题级别
  @Expose()
  @Column({ default: QuestionTextareaLevel.Level1 })
  props_level: QuestionTextareaLevel;

  // 是否居中
  @Expose()
  @Column({ default: false })
  props_isCenter: boolean;
}
