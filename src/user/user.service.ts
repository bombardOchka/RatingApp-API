import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';
import { CreateUserDto } from './dto/createUser.dto';
import { compare, genSalt, hash } from 'bcryptjs';
import { IUser, Roles } from './interface/user.interface';
import { v4 as uuidv4 } from 'uuid';
import { NOT_ENOUGH_PERMISSIONS, USER_ALREADY_EXISTS_ERROR, USER_NOT_FOUND_ERROR, WRONG_PASSWORD_ERROR } from './user.constants';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
	constructor(
		@InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin,
		private readonly jwtService: JwtService,
	) {}

	async findUser(email: string): Promise<IUser> {
		const usersRef = this.firebase.database.ref('users');
		return (await usersRef.orderByChild('email').equalTo(email).once('value')).val();
	}

	async createUser(dto: CreateUserDto) {
		const isUserExists = await this.findUser(dto.email);
		if (isUserExists) {
			throw new BadRequestException(USER_ALREADY_EXISTS_ERROR);
		}
		const salt = await genSalt(10);
		const id = uuidv4();
		const newUser: IUser = {
			id,
			email: dto.email,
			passwordHash: await hash(dto.password, salt),
			role: Roles.User,
		};
		const userRef = this.firebase.database.ref(`users/${id}`);
		await userRef.set(newUser);
		return this.auth(newUser.email, newUser.id, Roles.User);
	}

	async validateUser(email: string, password: string): Promise<Pick<IUser, 'email'>> {
		const userValue = await this.findUser(email);
		const firstUserKey = Object.keys(userValue)[0];
		const user = userValue[firstUserKey];
		if (!user) {
			throw new UnauthorizedException(USER_NOT_FOUND_ERROR);
		}
		const isCorrectPassword = await compare(password, user.passwordHash);
		if (!isCorrectPassword) {
			throw new UnauthorizedException(WRONG_PASSWORD_ERROR);
		}
		return { email: user.email };
	}

	async getUsers(): Promise<Omit<IUser, 'passwordHash'>[]> {
		const ref = this.firebase.database.ref('users');
		const value = (await ref.once('value')).val();
		const UserKeys = Object.keys(value);
		return UserKeys.map((elem) => this.buildUserResponse(value[elem]));
	}

	async login(email: string, password: string) {
		const payload = await this.validateUser(email, password);
		const userValue = await this.findUser(payload.email);
		const userId = Object.keys(userValue)[0];
		return this.auth(payload.email, userId, userValue[userId]['role']);
	}

	async setAdmin(email: string, req): Promise<Omit<IUser, 'passwordHash'>> {
		const user = await this.findUser(email);
		const adminEmail = this.getInfoFromToken(req).email;
		const adminValue = await this.findUser(adminEmail);
		const AdminKey = Object.keys(adminValue)[0];
		const admin = adminValue[AdminKey];
		if (!user) {
			throw new NotFoundException(USER_NOT_FOUND_ERROR);
		} else if (admin.role !== 'admin') {
			throw new ForbiddenException(NOT_ENOUGH_PERMISSIONS);
		}
		const firstUserKey = Object.keys(user)[0];
		const getuser = user[firstUserKey];

		const userKey = Object.keys(user)[0];
		const ref = this.firebase.database.ref(`users/${userKey}`);
		await ref.update({ role: Roles.Admin });
		return this.buildUserResponse({ ...getuser, role: Roles.Admin });
	}

	buildUserResponse(user: IUser): Omit<IUser, 'passwordHash'> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { passwordHash, ...rest } = user;
		return rest;
	}

	async auth(email: string, id: string, role: Roles) {
		const payload = { id, email, role };
		return {
			...payload,
			acces_token: await this.jwtService.signAsync(payload),
		};
	}

	getInfoFromToken(req) {
		const token = req.headers.authorization?.split(' ')[1];
		try {
			const decoded = this.jwtService.verify(token);
			return decoded;
		} catch (error) {
			return null;
		}
	}
}
