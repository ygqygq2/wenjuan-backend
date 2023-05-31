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
  desc: string;

  @Column()
  js: string;

  @Column()
  css: string;

  @Column()
  isDeleted: boolean;

  @Column()
  isPublished: boolean;

  @OneToMany(() => Component, (component) => component.question, { cascade: true })
  componentList: Component[];
}
