import { ApiProperty } from '@nestjs/swagger';

// Perfect time data structure
export class PerfectTimeDto {
  @ApiProperty({
    description: 'Start time of the perfect weather period',
    example: '2024-01-15T10:00:00Z'
  })
  startTime: string;

  @ApiProperty({
    description: 'End time of the perfect weather period',
    example: '2024-01-15T12:00:00Z'
  })
  endTime: string;

  @ApiProperty({
    description: 'Average temperature during the period',
    example: '72°F'
  })
  avg_temp: string;

  @ApiProperty({
    description: 'Average wind speed in mph during the period',
    example: 15
  })
  avg_wind_speed_mph: number;

  @ApiProperty({
    description: 'Average chance of rain during the period',
    example: 10
  })
  avg_chance_of_rain: number;
}

// Park with perfect times data structure
export class ParkWithPerfectTimesDto {
  @ApiProperty({
    description: 'Name of the park',
    example: 'Parade Ground'
  })
  park_name: string;

  @ApiProperty({
    description: 'Primary address of the park',
    example: '305 PARKSIDE AVENUE'
  })
  park_address_1: string;

  @ApiProperty({
    description: 'Latitude coordinate of the park',
    example: 40.64951566070916
  })
  park_lat: number;

  @ApiProperty({
    description: 'Longitude coordinate of the park',
    example: -73.96849393509393
  })
  park_lon: number;

  @ApiProperty({
    description: 'Array of perfect times for the activity at this park',
    type: [PerfectTimeDto]
  })
  perfect_times: PerfectTimeDto[];
}

// Request DTO for perfect times
export class PerfectTimesRequestDto {
  @ApiProperty({
    description: 'Location for search (coordinates in format "lat,lon" or zip code)',
    example: '11221',
    required: true
  })
  location: string;

  @ApiProperty({
    description: 'Activity type to search for perfect times',
    example: 'kite',
    required: true
  })
  activity: string;

  @ApiProperty({
    description: 'Search radius in miles',
    example: 4,
    required: true
  })
  radius: number;
}

// Response DTO for perfect times
export class PerfectTimesResponseDto {
  @ApiProperty({
    description: 'Activity type that was searched',
    example: 'kite'
  })
  activity: string;

  @ApiProperty({
    description: 'Location that was searched (zip code or coordinates)',
    example: '11221'
  })
  location: string;

  @ApiProperty({
    description: 'Search radius in miles',
    example: '4'
  })
  radius: string;

  @ApiProperty({
    description: 'Total number of parks found',
    example: 8
  })
  total: number;

  @ApiProperty({
    description: 'Array of parks with perfect times for the activity',
    type: [ParkWithPerfectTimesDto]
  })
  parks: ParkWithPerfectTimesDto[];
}
