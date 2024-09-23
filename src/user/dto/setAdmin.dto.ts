import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class SetAdminDto {
	@ApiProperty({ example: 'admin@example.com', description: 'The email of the user to be set as admin' })
	@IsString()
	@IsNotEmpty()
	@IsEmail()
	email: string;
}
