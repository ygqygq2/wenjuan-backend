import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user.entity';

@Entity()
export class Profile {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column({ default: '' })
  nickname: string;

  @Expose()
  @Column({ default: 1 })
  gender: number;

  @Expose()
  @Column({ default: '' })
  photo: string;

  @Expose()
  @Column({ default: '' })
  address: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  @Expose()
  user: User;
}
