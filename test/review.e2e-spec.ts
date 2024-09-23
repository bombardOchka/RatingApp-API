import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthUserDto } from 'src/user/dto/authUser.dto';
import { CreateReviewDto } from 'src/review/dto/createReview.dto';
import { v4 as uuidv4 } from 'uuid';

const testDto: CreateReviewDto = {
	reviewedUserId: '51abdc52-85f0-4c8d-82df-8d6f3758c328',
	content: 'The user provided excellent service and was very helpful.',
	rating: 4,
};

const loginDto: AuthUserDto = {
	email: 'user@example.com',
	password: 'password123',
};

const TestId = uuidv4();

const AnotherUserReviewId = '026144dd-abdf-4b4e-9025-225453336486';

describe('AppController (e2e)', () => {
	let app: INestApplication;
	let createdId: string;
	let UserId: string;
	let token: string;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		const { body } = await request(app.getHttpServer()).post('/user/login').send(loginDto);
		UserId = body.id;
		token = body.acces_token;
	});

	// Test (POST) /review/create
	it('/review/create (POST) - Review successfully created', async () => {
		return request(app.getHttpServer())
			.post('/review/create')
			.set('Authorization', 'Bearer ' + token)
			.send(testDto)
			.expect(201)
			.then(({ body }: request.Response) => {
				createdId = body.id;
				expect(createdId).toBeDefined();
			});
	});

	it('/review/create (POST) - User tries to review themselves', () => {
		return request(app.getHttpServer())
			.post('/review/create')
			.set('Authorization', 'Bearer ' + token)
			.send({ ...testDto, reviewedUserId: UserId })
			.expect(403);
	});

	it('/review/create (POST) - Unauthorized', () => {
		return request(app.getHttpServer()).post('/review/create').set('Authorization', 'Bearer Invalid Token').send(testDto).expect(401);
	});

	// Test (GET) /review/:receiverId
	it('/review/:id (GET) - List of reviews', async () => {
		return request(app.getHttpServer()).get(`/review/${testDto.reviewedUserId}`).expect(200);
	});

	it('/review/:id (GET) - Reviews not found', () => {
		return request(app.getHttpServer()).get(`/review/${TestId}`).expect(404);
	});

	// Test (DELETE) /review/delete
	it('/review/:id (DELETE) - Review successfully deleted', async () => {
		return request(app.getHttpServer())
			.delete(`/review/${createdId}`)
			.set('Authorization', 'Bearer ' + token)
			.expect(200);
	});

	it('/review/:id (DELETE) - Review not found to delete', () => {
		return request(app.getHttpServer())
			.delete(`/review/${createdId}`)
			.set('Authorization', 'Bearer ' + token)
			.expect(404);
	});

	it('/review/:id (DELETE) - Insufficient permissions to delete the review', () => {
		return request(app.getHttpServer())
			.delete(`/review/${AnotherUserReviewId}`)
			.set('Authorization', 'Bearer ' + token)
			.expect(403);
	});

	it('/review/:id (DELETE) - Unauthorized', () => {
		return request(app.getHttpServer()).delete(`/review/${createdId}`).set('Authorization', 'Bearer Invalid Token').send(testDto).expect(401);
	});

	afterAll(async () => {
		await app.close();
	});
});
