import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FirebaseModule } from 'nestjs-firebase';
import { getFireBaseConfig } from './config/firebase.config';
import { ReviewModule } from './review/review.module';

@Module({
	imports: [
		UserModule,
		ConfigModule.forRoot(),
		FirebaseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getFireBaseConfig,
		}),
		ReviewModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
