import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { QuestionCheckbox } from './questionCheckbox.entity';
import { Component } from './questionComponent.entity';
import { QuestionInfo } from './questionInfo.entity';
import { QuestionInput } from './questionInput.entity';
import { QuestionParagraph } from './questionParagraph.entity';
import { QuestionRadio } from './questionRadio.entity';
import { QuestionTextarea } from './questionTextarea.entity';
import { QuestionTitle } from './questionTitle.entity';

@Entity()
export class Question {
  // 为了避免前端使用关键字 id 可能产生问题，这里使用列名 _id
  @Expose()
  @PrimaryGeneratedColumn()
  _id: number;

  // 问卷标题
  @Expose()
  @Column()
  title: string;

  // 问卷描述
  @Expose()
  @Column({ default: '' })
  description: string;

  // 问卷自定义 js 脚本
  @Expose()
  @Column({ default: '' })
  js: string;

  // 问卷自定义样式
  @Expose()
  @Column({ default: '' })
  css: string;

  // 是否已删除
  @Expose()
  @Column({ default: false })
  isDeleted: boolean;

  // 是否已发布
  @Expose()
  @Column({ default: false })
  isPublished: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // 是否星标
  @Expose()
  @Column({ default: false })
  isStar: boolean;

  // 回答数
  @Expose()
  @Column({ default: 0 })
  answerCount: number;

  @Expose()
  @OneToMany(() => Component, (component) => component.question)
  @JoinColumn()
  componentList: (
    | QuestionCheckbox
    | QuestionInfo
    | QuestionInput
    | QuestionParagraph
    | QuestionRadio
    | QuestionTextarea
    | QuestionTitle
  )[];
}
