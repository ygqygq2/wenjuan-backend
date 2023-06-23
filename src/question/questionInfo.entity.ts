import { Expose } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class QuestionInfo {
  @PrimaryGeneratedColumn()
  @Expose()
  fe_id: string;

  // 组件标题
  @Column()
  @Expose()
  title: string;

  // 组件描述
  @Column({ default: '' })
  description: string;

  @Column({ default: false })
  disabled: boolean;
}
