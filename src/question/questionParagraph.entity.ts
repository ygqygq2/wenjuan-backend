import { Expose } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class QuestionParagraph {
  @PrimaryGeneratedColumn()
  @Expose()
  fe_id: string;

  // 组件内容
  @Column()
  @Expose()
  text: string;

  // 是否居中
  @Column({ default: false })
  isCenter: boolean;

  @Column({ default: false })
  disabled: boolean;
}
