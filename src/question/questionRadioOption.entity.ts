import { Expose } from 'class-transformer';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { QuestionRadio } from './questionRadio.entity';

@Entity()
export class QuestionRadioOption {
  @PrimaryGeneratedColumn()
  @Expose()
  _id: string;

  // 选项值
  @Column()
  @Expose()
  value: string;

  // 选项文本
  @Column({ default: '' })
  text: string;

  // 属于哪个单选框，和 QuestionRadio 的 fe_id 关联
  @ManyToOne(() => QuestionRadio, (questionRadio) => questionRadio.options)
  @Expose()
  @Column()
  fe_id: string;
}
