import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  nickname: string;

  @Column({ default: 1 })
  gender: number;

  @Column({ default: '' })
  photo: string;

  @Column({ default: '' })
  address: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
