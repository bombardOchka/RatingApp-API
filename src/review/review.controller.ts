import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe, Request, Delete, Get, Param } from '@nestjs/common';
import { JwtAuthGuard } from 'src/user/guards/jwt.guard';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/createReview.dto';
import { IdValidationPipe } from 'src/pipes/id-validation.pipe';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('review')
@Controller('review')
export class ReviewController {
	constructor(private readonly reviewService: ReviewService) {}

	@ApiOperation({ summary: 'Create a review' })
	@ApiResponse({ status: 201, description: 'Review successfully created' })
	@ApiResponse({ status: 403, description: 'User tries to review themselves' })
	@ApiBearerAuth()
	@UsePipes(new ValidationPipe())
	@UseGuards(JwtAuthGuard)
	@Post('create')
	async createReview(@Body() dto: CreateReviewDto, @Request() req) {
		return this.reviewService.createReview(dto, req);
	}

	@ApiOperation({ summary: 'Delete a review' })
	@ApiResponse({ status: 200, description: 'Review successfully deleted' })
	@ApiResponse({ status: 404, description: 'Review not found to delete' })
	@ApiResponse({ status: 403, description: 'Insufficient permissions to delete the review' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	async deleteReview(@Param('id', IdValidationPipe) id: string, @Request() req) {
		return this.reviewService.deleteReview(id, req);
	}

	@ApiOperation({ summary: 'Get reviews by user ID' })
	@ApiResponse({ status: 200, description: 'List of reviews' })
	@ApiResponse({ status: 404, description: 'Reviews not found' })
	@Get(':receiverId')
	async getByReceiverId(@Param('receiverId', IdValidationPipe) id: string) {
		return this.reviewService.findReviewsByReceiver(id);
	}
}
