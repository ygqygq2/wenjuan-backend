import { Expose } from 'class-transformer';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Component } from './questionComponent.entity';

@Entity()
export class Question {
  // 为了避免前端使用关键字 id 可能产生问题，这里使用列名 _id
  @PrimaryGeneratedColumn()
  @Expose()
  _id: number;

  // 问卷标题
  @Column()
  @Expose()
  title: string;

  // 问卷描述
  @Column({ default: '' })
  description: string;

  // 问卷自定义 js 脚本
  @Column({ default: '' })
  js: string;

  // 问卷自定义样式
  @Column({ default: '' })
  css: string;

  // 是否已删除
  @Column({ default: false })
  isDeleted: boolean;

  // 是否已发布
  @Column({ default: false })
  isPublished: boolean;

  @ManyToMany(() => Component, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'question_component',
    joinColumn: {
      name: 'question_id',
      referencedColumnName: '_id',
    },
    inverseJoinColumn: {
      name: 'component_fe_id',
      referencedColumnName: 'fe_id',
    },
  })
  componentList: Component[];

  // 创建时间，自动使用数据库插入时间
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // 是否星标
  @Column({ default: false })
  isStar: boolean;

  // 回答数
  @Column({ default: 0 })
  answerCount: number;
}
