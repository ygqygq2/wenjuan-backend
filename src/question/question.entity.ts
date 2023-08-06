import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '@/user/user.entity';

@Entity()
export class Question {
  // 为了避免前端使用关键字 id 可能产生问题，这里使用列名 _id
  @Expose()
  @PrimaryGeneratedColumn()
  _id: number;

  // 问卷标题
  @Expose()
  @Column()
  title: string;

  // 问卷描述
  @Expose()
  @Column({ default: '' })
  description: string;

  // 问卷自定义 js 脚本
  @Expose()
  @Column({ default: '' })
  js: string;

  // 问卷自定义样式
  @Expose()
  @Column({ default: '' })
  css: string;

  // 是否已删除
  @Expose()
  @Column({ default: false })
  isDeleted: boolean;

  // 是否已发布
  @Expose()
  @Column({ default: false })
  isPublished: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // 是否星标
  @Expose()
  @Column({ default: false })
  isStar: boolean;

  // 回答数
  @Expose()
  @Column({ default: 0 })
  answerCount: number;

  // 保存组件 fe_id 的列表，格式：[{'9EsDAD8RSkLiooaOLCyFl': 2}]
  @Expose()
  @Column({
    type: 'simple-array',
    nullable: true,
    default: '',
  })
  componentList: string[];

  // 问卷的创建者
  @Expose()
  @JoinColumn()
  @ManyToOne(() => User, (user) => user.questions)
  user: User;
}
