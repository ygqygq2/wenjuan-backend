import { Expose } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

enum QuestionTextareaLevel {
  Level1 = 1,
  Level2 = 2,
  Level3 = 3,
  Level4 = 4,
  Level5 = 5,
}

@Entity()
export class QuestionTitle {
  @PrimaryGeneratedColumn()
  @Expose()
  fe_id: string;

  // 组件内容
  @Column()
  @Expose()
  text: string;

  // 标题级别
  @Column({ default: QuestionTextareaLevel.Level1 })
  level: QuestionTextareaLevel;

  // 是否居中
  @Column({ default: false })
  isCenter: boolean;

  @Column({ default: false })
  disabled: boolean;
}
