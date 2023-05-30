import { Expose } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  title: string;

  @Column()
  desc: string;

  @Column()
  js: string;

  @Column()
  css: string;

  @Column()
  isDeleted: boolean;

  @Column()
  isPublished: boolean;

  @Column()
  componentList: string;
}
