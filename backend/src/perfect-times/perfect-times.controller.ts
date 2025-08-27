import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PerfectTimesService } from './perfect-times.service';
import { PerfectTimesRequestDto, PerfectTimesResponseDto } from './dto/perfect-times.dto';

@ApiTags('perfect-times')
@Controller('perfect-times')
export class PerfectTimesController {
  constructor(private readonly perfectTimesService: PerfectTimesService) {}

  @Get('get-perfect-times')
  @ApiOperation({ summary: 'Get perfect times for an activity at a location' })
  @ApiQuery({ 
    name: 'location', 
    required: true, 
    description: 'Location in format "lat,lon" or zip code', 
    example: '11221' 
  })
  @ApiQuery({ 
    name: 'activity', 
    required: true, 
    description: 'Activity type to search for perfect times', 
    example: 'kite' 
  })
  @ApiQuery({ 
    name: 'radius', 
    required: true, 
    description: 'Search radius in miles', 
    example: 4 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfect times retrieved successfully',
    type: PerfectTimesResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPerfectTimes(
    @Query('location') location: string,
    @Query('activity') activity: string,
    @Query('radius') radius: number
  ): Promise<any> {
    return this.perfectTimesService.getPerfectTimes(location, activity, radius);
  }

  @Get('get-perfect-times-today')
  @ApiOperation({ summary: 'Get perfect times for today (or until tomorrow midnight if after 8pm)' })
  @ApiQuery({ 
    name: 'location', 
    required: true, 
    description: 'Location in format "lat,lon" or zip code', 
    example: '11221' 
  })
  @ApiQuery({ 
    name: 'activity', 
    required: true, 
    description: 'Activity type to search for perfect times', 
    example: 'kite' 
  })
  @ApiQuery({ 
    name: 'radius', 
    required: true, 
    description: 'Search radius in miles', 
    example: 4 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfect times for today retrieved successfully',
    type: PerfectTimesResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPerfectTimesToday(
    @Query('location') location: string,
    @Query('activity') activity: string,
    @Query('radius') radius: number
  ): Promise<any> {
    return this.perfectTimesService.getPerfectTimesToday(location, activity, radius);
  }

  @Get('supported-activities')
  @ApiOperation({ summary: 'Get list of supported activities' })
  @ApiResponse({ 
    status: 200, 
    description: 'Supported activities retrieved successfully',
    type: [String]
  })
  async getSupportedActivities(): Promise<string[]> {
    return this.perfectTimesService.getSupportedActivities();
  }
}
