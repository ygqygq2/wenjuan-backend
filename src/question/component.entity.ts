import { Expose } from 'class-transformer';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Question } from './question.entity';

@Entity()
export class Component {
  @PrimaryGeneratedColumn()
  @Expose()
  fe_id: string;

  @Column()
  title: string;

  @Column()
  type: string;

  @Column()
  props: string;

  @ManyToOne(() => Question, (question) => question.componentList)
  question: Question;
}
