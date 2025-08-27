import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ParksMapService } from './parks-map.service';
import { ParksMapClient } from './parks-map.client';
import { ParksMapController } from './parks-map.controller';

@Module({
  imports: [HttpModule],
  controllers: [ParksMapController],
  providers: [ParksMapService, ParksMapClient],
  exports: [ParksMapService], // makes it available to other modules
})
export class ParksMapModule {}
