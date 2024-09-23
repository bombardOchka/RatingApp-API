import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { SetAdminDto } from 'src/user/dto/setAdmin.dto';

const testDto: CreateUserDto = {
	email: 'user@example.com',
	password: 'password123',
};

const adminDto: CreateUserDto = {
	email: 'admin@example.com',
	password: 'password123',
};

const emailDto: SetAdminDto = {
	email: 'user@example.com',
};

describe('AppController (e2e)', () => {
	let app: INestApplication;
	let createdId: string;
	let token: string;
	let adminToken: string;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		const { body } = await request(app.getHttpServer()).post('/user/login').send(adminDto);
		adminToken = body.acces_token;
	});

	// Test (POST) /user/create
	it('/user/create (POST) - User successfully created.', async () => {
		return request(app.getHttpServer())
			.post('/user/create')
			.send(testDto)
			.expect(201)
			.then(({ body }: request.Response) => {
				createdId = body.id;
				expect(createdId).toBeDefined();
			});
	});

	it('/review/create (POST) - Bad request. User already exists.', () => {
		return request(app.getHttpServer()).post('/user/create').send(testDto).expect(400);
	});

	// Test (POST) /user/login
	it('/user/create (POST) - User successfully logged in.', async () => {
		return request(app.getHttpServer())
			.post('/user/login')
			.send(testDto)
			.expect(200)
			.then(({ body }: request.Response) => {
				token = body.acces_token;
				expect(token).toBeDefined();
			});
	});

	it('/review/create (POST) - Unauthorized. Wrong credentials.', () => {
		return request(app.getHttpServer()).post('/user/login').send({ testDto, password: 'wrong-password' }).expect(400);
	});

	// Test (POST) /user/setAdmin
	it('/user/setAdmin (POST) - Forbidden. User successfully set as admin.', async () => {
		return request(app.getHttpServer())
			.post('/user/setAdmin')
			.set('Authorization', 'Bearer ' + token)
			.send(emailDto)
			.expect(403);
	});

	it('/user/setAdmin (POST) - User successfully set as admin.', async () => {
		return request(app.getHttpServer())
			.post('/user/setAdmin')
			.set('Authorization', 'Bearer ' + adminToken)
			.send(emailDto)
			.expect(201);
	});

	// Test (POST) /user/getRating:id
	it('/user/getRating:id (GET) - Return user rating.', async () => {
		return request(app.getHttpServer()).get(`/user/getRating/${createdId}`).expect(200);
	});

	it('/user/getRating:id (GET) - Reviews not found', async () => {
		return request(app.getHttpServer()).get(`/user/getRating/${createdId}`).expect(404);
	});

	afterAll(async () => {
		await app.close();
	});
});
