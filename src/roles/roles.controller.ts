import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { Roles } from '@/decorators/roles.decorator';
import { ErrMsg, Errno } from '@/enum/errno.enum';
import { Role } from '@/enum/roles.enum';
import { RolesGuard } from '@/guards/roles.guard';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@Controller('roles')
@Roles(Role.Admin)
@UseGuards(RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  // @Roles(Role.User)
  async findAll() {
    const roles = await this.rolesService.findAll();
    if (roles) {
      return {
        errno: Errno['SUCCESS'],
        data: roles,
      };
    }
    return {
      errno: Errno['ERRNO_24'],
      msg: ErrMsg[Errno.ERRNO_24],
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }
}
