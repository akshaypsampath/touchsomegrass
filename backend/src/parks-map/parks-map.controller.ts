import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ParksMapService } from './parks-map.service';
import { ParksMapRequestDto, ParksMapResponseDto } from './dto/parks-map.dto';

@ApiTags('map')
@Controller('parks-map')
export class ParksMapController {
  constructor(private readonly parksMapService: ParksMapService) {}

  @Get('nearby-locations-for-activity')
  @ApiOperation({ summary: 'Get nearby locations filtered by activity' })
  @ApiQuery({ 
    name: 'activity', 
    required: false, 
    description: 'Activity type to search for', 
    example: 'kite' 
  })
  @ApiQuery({ 
    name: 'location', 
    required: true, 
    description: 'Location in format "lat,lon" or zip code', 
    example: '11221' 
  })
  @ApiQuery({ 
    name: 'radius', 
    required: true, 
    description: 'Search radius in miles', 
    example: 4 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Nearby locations retrieved successfully',
    type: ParksMapResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getNearbyLocationsByActivity(
    @Query('activity') activity: string,
    @Query('location') location: string,
    @Query('radius') radius: number
  ): Promise<any> {
    return this.parksMapService.getNearbyLocationsByActivity(activity, location, radius);
  }

  @Get('supported-activities')
  @ApiOperation({ summary: 'Get list of supported activities' })
  @ApiResponse({ 
    status: 200, 
    description: 'Supported activities retrieved successfully',
    type: [String]
  })
  async getSupportedActivities(): Promise<string[]> {
    return this.parksMapService.getSupportedActivities();
  }
}
