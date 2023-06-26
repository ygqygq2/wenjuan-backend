import { Expose } from 'class-transformer';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { QuestionCheckbox } from './questionCheckbox.entity';

@Entity({ name: 'question_checkbox_option' })
export class QuestionCheckboxOption {
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

  // 是否选中
  @Column({ default: false })
  checked: boolean;

  // 属于哪个多选框，和 QuestionCheckbox 的 fe_id 关联
  @ManyToOne(() => QuestionCheckbox, (questionCheckbox) => questionCheckbox.options)
  @Expose()
  @Column()
  fe_id: string;
}
