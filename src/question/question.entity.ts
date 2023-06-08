import { Expose } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Component } from './component.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  title: string;

  @Column()
  description: string;

  @Column()
  js: string;

  @Column()
  css: string;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: false })
  isPublished: boolean;

  // 一对多，一个问题对应多个组件，字段保存组件的 fe_id 列表
  @OneToMany(() => Component, (component) => component.question, { cascade: true })
  componentList: Component[];
}
