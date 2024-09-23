import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateReviewDto {
	@ApiProperty({
		description: 'The ID of the user being reviewed',
		example: 'f4c3a7b6-1234-5678-9abc-def012345678', // Example value
	})
	@IsString()
	@IsNotEmpty()
	reviewedUserId: string;

	@ApiProperty({
		description: 'Content of the review',
		example: 'The user provided excellent service and was very helpful.',
	})
	@IsString()
	@IsNotEmpty()
	content: string;

	@ApiProperty({
		description: 'Rating score for the user (between 1 and 5)',
		example: 5, // Example value
	})
	@IsNumber()
	@IsNotEmpty()
	rating: number;
}
