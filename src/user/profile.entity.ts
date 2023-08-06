import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ default: '' })
  nickname: string;

  @Column({ default: 1 })
  @Expose()
  gender: number;

  @Column({ default: '' })
  @Expose()
  photo: string;

  @Column({ default: '' })
  @Expose()
  address: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  @Expose()
  user: User;
}
