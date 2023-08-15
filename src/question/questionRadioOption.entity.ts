import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { QuestionRadio } from './questionRadio.entity';

@Entity({ name: 'question_radio_option' })
export class QuestionRadioOption {
  @PrimaryGeneratedColumn()
  @Expose()
  _id: number;

  // 选项值
  @Expose()
  @Column()
  value: string;

  // 选项文本
  @Expose()
  @Column({ default: '' })
  text: string;

  // 属于哪个单选框，和 QuestionRadio 的 fe_id 关联
  @ManyToOne(() => QuestionRadio, (questionRadio) => questionRadio.options)
  @Expose()
  @JoinColumn({ name: 'component_fe_id' })
  component: QuestionRadio;
}
