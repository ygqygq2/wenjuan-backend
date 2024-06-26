import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Roles } from './roles.entity';

@Injectable()
export class RolesService {
  constructor(@InjectRepository(Roles) private roleRepository: Repository<Roles>) {}

  async create(createRoleDto: CreateRoleDto) {
    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  findAll() {
    return this.roleRepository.find();
  }

  findOne(id: number) {
    return this.roleRepository.findOne({
      where: {
        id,
      },
    });
  }

  findByIds(ids: number[]) {
    return this.roleRepository.findBy({ id: In(ids) });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.findOne(id);
    const newRole = this.roleRepository.merge(role, updateRoleDto);
    return this.roleRepository.save(newRole);
  }

  remove(id: number) {
    // delete  -> AfterRemove 不会触发
    return this.roleRepository.delete(id);
  }
}
