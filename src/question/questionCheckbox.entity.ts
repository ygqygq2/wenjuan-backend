import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { QuestionCheckboxOption } from './questionCheckboxOption.entity';

@Entity()
export class QuestionCheckbox {
  @PrimaryGeneratedColumn()
  @Expose()
  fe_id: string;

  // 组件标题
  @Column()
  @Expose()
  title: string;

  // 是否竖向
  @Column({ default: false })
  isVertical: boolean;

  // 多选框列表
  @OneToMany(() => QuestionCheckboxOption, (questionCheckboxOption) => questionCheckboxOption.fe_id, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  options: QuestionCheckboxOption[];

  @Column({ default: false })
  disabled: boolean;
}
