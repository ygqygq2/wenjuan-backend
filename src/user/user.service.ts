import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Role } from '@/enum/roles.enum';
import { Logs } from '@/logs/logs.entity';
import { Roles } from '@/roles/roles.entity';
import { conditionUtils } from '@/utils/db.helper';

import { GetUserDto } from './dto/get-user.dto';
import { Profile } from './profile.entity';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Profile) private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Logs) private readonly logsRepository: Repository<Logs>,
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
  ) {}

  findAll(query: GetUserDto) {
    const { limit, page, username, role, gender } = query;
    const take = limit || 10;
    const skip = ((page || 1) - 1) * take;
    const obj = {
      'user.username': username,
      'profile.gender': gender,
      'roles.id': role,
    };

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.roles', 'roles');
    const newQuery = conditionUtils<User>(queryBuilder, obj);
    return newQuery.take(take).skip(skip).getMany();
  }

  find(username: string) {
    return this.userRepository.findOne({ where: { username }, relations: ['roles', 'roles.menus'] });
  }

  async findOne(id: number): Promise<User> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .where('user.id = :id', { id })
      .getOne();
  }

  async create(user: Partial<User>, profile?: Partial<Profile>) {
    if (!user.roles) {
      const role = await this.rolesRepository.findOne({ where: { id: 2 } });
      user.roles = [role];
    }
    if (user.roles instanceof Array && typeof user.roles[0] === 'number') {
      // 查询所有的用户角色
      user.roles = await this.rolesRepository.find({
        where: {
          id: In(user.roles),
        },
      });
    }
    const userTmp = this.userRepository.create(user);
    const res = await this.userRepository.save(userTmp);
    const profileTmp = this.profileRepository.create({
      nickname: profile.nickname,
      user: res,
    });
    await this.profileRepository.save(profileTmp);
    return res;
  }

  async update(id: any, user: Partial<User>) {
    const userTemp = await this.findProfile(parseInt(id, 10));
    const newUser = this.userRepository.merge(userTemp, user);
    // 联合模型更新，需要使用 save 方法或者 queryBuilder
    return this.userRepository.save(newUser);

    // 下面的 update 方法，只适合单模型的更新，不适合有关系的模型更新
    // return this.userRepository.update(parseInt(id), newUser);
  }

  async remove(id: number) {
    // return this.userRepository.delete(id);
    const user = await this.findOne(id);
    return this.userRepository.remove(user);
  }

  findProfile(id: number) {
    return this.userRepository.findOne({
      where: { id },
      relations: { profile: true },
    });
  }

  async findUserLogs(id: number) {
    const user = await this.findOne(id);
    return this.logsRepository.find({
      where: {
        user: user.logs,
      },
      // relations: {
      //   user: true,
      // },
    });
  }

  findLogsByGroup(id: number) {
    return this.logsRepository
      .createQueryBuilder('logs')
      .select('logs.result', 'result')
      .addSelect('COUNT("logs.result")', 'count')
      .leftJoinAndSelect('logs.user', 'user')
      .where('user.id= :id', { id })
      .groupBy('logs.result')
      .orderBy('count', 'DESC')
      .addOrderBy('result', 'DESC')
      .offset(2)
      .limit(3)
      .getRawMany();
  }

  async isAdmin(id: number) {
    const user = await this.findOne(id);
    const roles = user.getRolesList();
    return roles.includes(Role.Admin);
  }
}
