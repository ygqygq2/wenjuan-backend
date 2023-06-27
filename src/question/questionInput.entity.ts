import { Column, Entity } from 'typeorm';

import { ComponentTypeNumber } from '@/enum/componentType.enum';

import { Component } from './questionComponent.entity';

@Entity({ name: 'question_info' })
export class QuestionInput extends Component {
  type: ComponentTypeNumber = ComponentTypeNumber.QUESTION_INPUT;

  // 组件显示标题
  @Column({ default: '' })
  props_title: string;

  // 问卷前台输入框提示
  @Column({ default: '' })
  props_placeholder: string;
}
