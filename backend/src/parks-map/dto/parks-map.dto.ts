import { ApiProperty } from '@nestjs/swagger';

// Activity mapping interface for search parameters
export interface ActivityMapping {
  activity: string;
  filter: string[];
}

// Basic DTO structure - to be expanded as needed
export class ParksMapRequestDto {
  @ApiProperty({
    description: 'Location for map search (coordinates in format "lat,lon" or zip code)',
    example: '38.4664,-82.6441',
    required: true
  })
  location: string;

  @ApiProperty({
    description: 'Search radius in miles',
    example: 10,
    required: true
  })
  radius: number;
}

export class ParksMapResponseDto {
  @ApiProperty({
    description: 'Whether the request was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Error message if request failed',
    example: null,
    required: false
  })
  error?: string;
}
