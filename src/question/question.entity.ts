import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Logs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
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
