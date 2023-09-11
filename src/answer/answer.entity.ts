import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Question } from '@/question/question.entity';

@Entity({ name: 'answer' })
export class Answer {
  @Expose()
  @PrimaryGeneratedColumn()
  _id: number;

  @Expose()
  @ManyToOne(() => Question)
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Expose()
  @Column({ type: 'mediumtext' })
  answerContent: string;
}
