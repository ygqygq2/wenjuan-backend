import { Column, Entity } from 'typeorm';

import { Component } from './questionComponent.entity';

@Entity({ name: 'question_info' })
export class QuestionInfo extends Component {
  // 组件显示标题
  @Column({ default: '' })
  props_title: string;

  // 组件描述
  @Column({ default: '' })
  props_description: string;
}
