import { Exclude, Expose } from 'class-transformer';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Answer } from '@/answer/answer.entity';
import { Logs } from '@/logs/logs.entity';
import { Question } from '@/question/question.entity';
import { Roles } from '@/roles/roles.entity';

import { Profile } from './profile.entity';

@Entity()
export class User {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  @Exclude()
  salt: string;

  @Expose()
  @OneToMany(() => Logs, (logs) => logs.user, { cascade: true })
  logs: Logs[];

  @Expose()
  @ManyToMany(() => Roles, (roles) => roles.users, { cascade: ['insert'] })
  @JoinTable({ name: 'user_roles' })
  roles: Roles[];

  @Expose()
  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Profile;

  @Expose()
  @OneToMany(() => Question, (question) => question.user)
  questions: Question[];

  @Expose()
  @OneToMany(() => Answer, (answer) => answer.user)
  answers: Answer[];

  // 获取用户角色列表
  getRolesList(): number[] {
    return this.roles.map((role) => role.id);
  }
}
