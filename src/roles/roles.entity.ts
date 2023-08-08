import { Expose } from 'class-transformer';

import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Menus } from '../menus/menus.entity';
import { Question } from '../question/question.entity';
import { User } from '../user/user.entity';

@Entity()
export class Roles {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Expose()
  @Column()
  name: string;

  @Expose()
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => Menus, (menus) => menus.role)
  menus: Menus[];

  @ManyToMany(() => Question, (question) => question.roles)
  questions: Question[];
}
