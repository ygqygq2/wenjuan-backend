import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';

import { Component } from './questionComponent.entity';
import { QuestionRadioOption } from './questionRadioOption.entity';

@Entity({ name: 'question_radio' })
export class QuestionRadio extends Component {
  // 是否竖向
  @Column({ default: false })
  props_isVertical: boolean;

  // 值
  @Column({ default: '' })
  props_value: string;

  @Column({ default: '' })
  props_title: string;

  // 单选框
  @OneToMany(() => QuestionRadioOption, (questionRadioOption) => questionRadioOption.fe_id, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  options: QuestionRadioOption[];
}
