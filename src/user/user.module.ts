import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getJWTConfig } from 'src/config/jwt.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ReviewModule } from 'src/review/review.module';

@Module({
	controllers: [UserController],
	providers: [UserService, JwtStrategy],
	imports: [
		JwtModule.registerAsync({ imports: [ConfigModule], inject: [ConfigService], useFactory: getJWTConfig }),
		ConfigModule,
		PassportModule,
		ReviewModule,
	],
})
export class UserModule {}
