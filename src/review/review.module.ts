import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getJWTConfig } from 'src/config/jwt.config';

@Module({
	controllers: [ReviewController],
	providers: [ReviewService],
	imports: [JwtModule.registerAsync({ imports: [ConfigModule], inject: [ConfigService], useFactory: getJWTConfig }), ConfigModule, PassportModule],
	exports: [ReviewService],
})
export class ReviewModule {}
