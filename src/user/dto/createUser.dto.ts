import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
	@ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
	@IsString()
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@ApiProperty({ example: 'password123', description: 'The password of the user' })
	@IsString()
	@IsNotEmpty()
	@MinLength(6)
	password: string;
}
