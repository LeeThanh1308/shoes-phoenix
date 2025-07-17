import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TargetGroup } from './entities/target-group.entity';

@Injectable()
export class TargetGroupSeed {
  private readonly defaultData: Array<Partial<TargetGroup>> = [
    { name: 'Ban công' },
    { name: 'Bàn thờ' },
    { name: 'Mái kính' },
    { name: 'Chung cư' },
    { name: 'Gia đình' },
    { name: 'Phòng khách' },
    { name: 'Phòng ngủ' },
    { name: 'Văn phòng' },
    { name: 'Spa' },
  ];
  constructor(
    @InjectRepository(TargetGroup)
    private readonly targetGroupRepository: Repository<TargetGroup>,
  ) {}

  async handleCreateDefaultData() {
    const findData = await this.targetGroupRepository.find();
    if (findData.length == 0) {
      const createTargetGroup = await Promise.all(
        this.defaultData.map((_) => {
          return this.targetGroupRepository.create(_);
        }),
      );
      const data = await this.targetGroupRepository.save(createTargetGroup);
      Logger.log(`Create data target group succeed ${data?.length}`);
    }
  }
}
