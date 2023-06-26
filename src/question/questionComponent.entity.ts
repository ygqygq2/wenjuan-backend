import { Expose } from 'class-transformer';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Question } from './question.entity';

@Entity()
export class Component {
  @PrimaryGeneratedColumn()
  @Expose()
  fe_id: string;

  // 组件名称
  @Column({ default: '' })
  title: string;

  // 是否隐藏
  @Column({ default: false })
  isHidden: boolean;

  @Column({ default: false })
  disabled: boolean;

  @ManyToOne(() => Question, (question) => question.componentList)
  question: Question;
}
