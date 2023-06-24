import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { QuestionRadioOption } from './questionRadioOption.entity';

@Entity()
export class QuestionRadio {
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

  // 值
  @Column({ default: '' })
  value: string;

  // 单选框
  @OneToMany(() => QuestionRadioOption, (questionRadioOption) => questionRadioOption.fe_id, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  options: QuestionRadioOption[];

  @Column({ default: false })
  disabled: boolean;
}
