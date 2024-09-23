import { Body, Controller, Get, HttpCode, Post, UseGuards, UsePipes, ValidationPipe, Request, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { AuthUserDto } from './dto/authUser.dto';
import { SetAdminDto } from './dto/setAdmin.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { IdValidationPipe } from 'src/pipes/id-validation.pipe';
import { ReviewService } from 'src/review/review.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly reviewService: ReviewService,
	) {}

	@ApiOperation({ summary: 'Create a new user' })
	@ApiResponse({ status: 201, description: 'User successfully created.' })
	@ApiResponse({ status: 400, description: 'Bad request. User already exists.' })
	@UsePipes(new ValidationPipe())
	@Post('create')
	async createUser(@Body() dto: CreateUserDto) {
		return this.userService.createUser(dto);
	}

	@ApiOperation({ summary: 'Get all users' })
	@ApiResponse({ status: 200, description: 'Return all users.' })
	@Get('all')
	async getUsers() {
		return this.userService.getUsers();
	}

	@ApiOperation({ summary: 'Login user' })
	@ApiResponse({ status: 200, description: 'User successfully logged in.' })
	@ApiResponse({ status: 400, description: 'Unauthorized. Wrong credentials.' })
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('login')
	async login(@Body() { email, password }: AuthUserDto) {
		return this.userService.login(email, password);
	}

	@ApiOperation({ summary: 'Set user as admin' })
	@ApiResponse({ status: 200, description: 'User successfully set as admin.' })
	@ApiResponse({ status: 403, description: 'Forbidden. Not enough permissions.' })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Post('setAdmin')
	async setAdmin(@Body() { email }: SetAdminDto, @Request() req) {
		return this.userService.setAdmin(email, req);
	}

	@ApiOperation({ summary: 'Get user rating by ID' })
	@ApiResponse({ status: 200, description: 'Return user rating.' })
	@ApiResponse({ status: 404, description: 'Reviews not found' })
	@Get('getRating/:id')
	async getUserRating(@Param('id', IdValidationPipe) id: string) {
		return this.reviewService.getUserRating(id);
	}
}
