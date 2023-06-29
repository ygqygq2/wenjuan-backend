import { Expose } from 'class-transformer';
import { Column, Entity } from 'typeorm';

import { ComponentTypeNumber } from '@/enum/componentType.enum';

import { Component, ManyToOneMixin, Mixin } from './questionComponent.entity';

@Entity({ name: 'question_info' })
export class QuestionInfo extends Mixin(ManyToOneMixin)(Component) {
  type: ComponentTypeNumber = ComponentTypeNumber.QUESTION_INFO;

  // 组件显示标题
  @Expose()
  @Column({ default: '' })
  props_title: string;

  // 组件描述
  @Expose()
  @Column({ default: '' })
  props_description: string;
}
