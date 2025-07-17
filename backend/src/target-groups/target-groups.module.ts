import { Module } from '@nestjs/common';
import { TargetGroup } from './entities/target-group.entity';
import { TargetGroupSeed } from './target-groups.seed';
import { TargetGroupsController } from './target-groups.controller';
import { TargetGroupsService } from './target-groups.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TargetGroup])],
  controllers: [TargetGroupsController],
  providers: [TargetGroupsService, TargetGroupSeed],
})
export class TargetGroupsModule {
  constructor(private readonly targetSeed: TargetGroupSeed) {
    this.targetSeed.handleCreateDefaultData();
  }
}
