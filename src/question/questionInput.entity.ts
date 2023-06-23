import { Expose } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class QuestionInput {
  @PrimaryGeneratedColumn()
  @Expose()
  fe_id: string;

  // 组件标题
  @Column()
  @Expose()
  title: string;

  // 输入框提示
  @Column({ default: '' })
  placeholder: string;

  @Column({ default: false })
  disabled: boolean;
}
