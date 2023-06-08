import { Expose } from 'class-transformer';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { Question } from './question.entity';

@Entity()
export class Component {
  // 指定 id 为 fe_id
  @Expose({ name: 'fe_id' })
  @PrimaryColumn()
  fe_id: string;

  @Column()
  title: string;

  @Column()
  type: string;

  @Column()
  props: string;

  // 多对一，多个组件对应一个问题，字段保存问题的 id
  @ManyToOne(() => Question, (question) => question.componentList)
  question: Question;
}
