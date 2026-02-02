import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,
  ) {}

  async create(createRoleDto: Partial<Role>): Promise<Role> {
    const createdRole = new this.roleModel(createRoleDto);
    return createdRole.save();
  }

  async findAll(): Promise<Role[]> {
    return this.roleModel.find({ active: true }).exec();
  }

  async findOne(id: string): Promise<Role> {
    return this.roleModel.findById(id).exec();
  }

  async update(id: string, updateRoleDto: Partial<Role>): Promise<Role> {
    return this.roleModel.findByIdAndUpdate(id, updateRoleDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Role> {
    return this.roleModel.findByIdAndUpdate(id, { active: false }, { new: true }).exec();
  }
}