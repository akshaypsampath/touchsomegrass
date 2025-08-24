import { ApiProperty } from '@nestjs/swagger';

export class WeatherForecastPointRequestDto {
  @ApiProperty({
    description: 'Latitude for weather service forecast office point',
    example: 38.4664,
    required: true,
    default: 38.4664,
  })
  latitude: number;

  @ApiProperty({
    description: 'Longitude for weather service forecast office point',
    example: -82.6441,
    required: true,
    default: -82.6441,
  })
  longitude: number;
}

export class WeatherForecastPointResponseDto {
  @ApiProperty({
    description: 'Weather Forecast Office ID for Weather Forecast Office point',
    example: 'RLX',
    required: true,
    default: 'RLX',
  })
  forecastOffice: string;

  @ApiProperty({
    description: 'X Coordinate for Weather Forecast Office point',
    example: 26,
    required: true,
    default: 26,
  })
  gridX: number;

  @ApiProperty({
    description: 'Y Coordinate for Weather Forecast Office point',
    example: 69,
    required: true,
    default: 69,
  })
  gridY: number;

  @ApiProperty({
    description: 'City and state combination from the NWS API',
    example: 'Ashland, KY',
    required: true,
  })
  city: string;

  @ApiProperty({
    description: 'Timezone from the NWS API',
    example: 'America/New_York',
    required: true,
  })
  timezone: string;
}

export class WeatherForecastRequestDto {
  @ApiProperty({
    description: 'Location for weather forecast (coordinates in format "lat,lon")',
    example: '38.4664,-82.6441',
    required: true,
    default: '38.4664,-82.6441'
  })
  location?: string;
}

export class WeatherForecastLocationDto {
    @ApiProperty({
        description: 'Name of the location',
        example: 'Ashland, KY'
    })
    name: string;

    @ApiProperty({
        description: 'Latitude of the location',
        example: 38.4664
    })
    lat: number;

    @ApiProperty({
        description: 'Longitude of the location',
        example: -82.6441
    })
    long: number;
}

export class WeatherForecastPeriodDto {
    @ApiProperty({
        description: 'Period number',
        example: 1
    })
    number: number;

    @ApiProperty({
        description: 'Start time of the forecast period',
        example: '2025-08-22T23:00:00-04:00'
    })
    startTime: string;

    @ApiProperty({
        description: 'End time of the forecast period',
        example: '2025-08-23T00:00:00-04:00'
    })
    endTime: string;

    @ApiProperty({
        description: 'Whether this period is during daytime',
        example: false
    })
    isDaytime: boolean;

    @ApiProperty({
        description: 'Temperature in Fahrenheit',
        example: 72
    })
    temperature: number;

    @ApiProperty({
        description: 'Temperature unit',
        example: 'F'
    })
    temperatureUnit: string;

    @ApiProperty({
        description: 'Wind speed description',
        example: '2 mph'
    })
    windSpeed: string;

    @ApiProperty({
        description: 'Wind direction',
        example: 'NE'
    })
    windDirection: string;

    @ApiProperty({
        description: 'Weather condition icon URL',
        example: 'https://api.weather.gov/icons/land/night/few?size=small'
    })
    icon: string;

    @ApiProperty({
        description: 'Short weather forecast description',
        example: 'Mostly Clear'
    })
    shortForecast: string;

    @ApiProperty({
        description: 'Detailed weather forecast description',
        example: ''
    })
    detailedForecast: string;

    @ApiProperty({
        description: 'Probability of precipitation',
        example: { unitCode: 'wmoUnit:percent', value: 0 }
    })
    probabilityOfPrecipitation: {
        unitCode: string;
        value: number;
    };

    @ApiProperty({
        description: 'Dew point in Celsius',
        example: { unitCode: 'wmoUnit:degC', value: 18.88888888888889 }
    })
    dewpoint: {
        unitCode: string;
        value: number;
    };

    @ApiProperty({
        description: 'Relative humidity percentage',
        example: { unitCode: 'wmoUnit:percent', value: 80 }
    })
    relativeHumidity: {
        unitCode: string;
        value: number;
    };
}

export class WeatherForecastDataDto {
    @ApiProperty({
        description: 'Date and time of the forecast',
        example: '2025-08-22T12:00:00-04:00'
    })
    datetime: string;

    @ApiProperty({
        description: 'Temperature in Fahrenheit',
        example: 72.5
    })
    temperature_f: number;

    @ApiProperty({
        description: 'Wind speed in miles per hour',
        example: 10.2
    })
    wind_speed_mph: number;

    @ApiProperty({
        description: 'Gust speed in miles per hour (not available from NWS)',
        example: 0,
        required: false
    })
    gust_speed_mph?: number;

    @ApiProperty({
        description: 'Precipitation in inches (not available from NWS hourly forecast)',
        example: 0,
        required: false
    })
    precipitation_in?: number;

    @ApiProperty({
        description: 'Relative humidity in percent',
        example: 65
    })
    humidity: number;

    @ApiProperty({
        description: 'Dew point in Fahrenheit',
        example: 55.4
    })
    dew_point_f: number;

    @ApiProperty({
        description: 'Whether it will rain (0 = no, 1 = yes)',
        example: 1
    })
    will_it_rain: number;

    @ApiProperty({
        description: 'Chance of rain in percent',
        example: 80
    })
    chance_of_rain: number;

    @ApiProperty({
        description: 'Air quality index (not available from NWS)',
        example: 0,
        required: false
    })
    air_quality_index?: number;

    @ApiProperty({
        description: 'Weather condition description',
        example: 'Mostly Sunny'
    })
    condition: string;
}

export class WeatherForecastResponseDto {
  @ApiProperty({
    description: 'Whether the request was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Location used for the forecast',
    example: {
      name: 'Ashland, KY',
      lat: 38.4664,
      long: -82.6441
    }
  })
  location: WeatherForecastLocationDto;

  @ApiProperty({
    description: 'Weather forecast data in standardized format',
    example: [
      {
        datetime: '2025-08-22T12:00:00-04:00',
        temperature_f: 72.5,
        wind_speed_mph: 10.2,
        condition: 'Mostly Sunny',
        humidity: 65,
        dew_point_f: 55.4,
        will_it_rain: 0,
        chance_of_rain: 20
      }
    ],
    required: false
  })
  data?: WeatherForecastDataDto[];

  @ApiProperty({
    description: 'Error message if request failed',
    example: null,
    required: false
  })
  error?: string;
}

