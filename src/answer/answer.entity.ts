import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Question } from '@/question/question.entity';
import { User } from '@/user/user.entity';

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

  // 回答的创建者
  @Expose()
  @JoinColumn({ name: 'creator' })
  @ManyToOne(() => User, (user) => user.answers)
  user: User;

  @Expose()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
