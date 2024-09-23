import { ConfigService } from '@nestjs/config';
import { FirebaseModuleOptions } from 'nestjs-firebase';

export const getFireBaseConfig = (configService: ConfigService): FirebaseModuleOptions => {
	const firebaseCredentialPath = configService.get<string>('FIREBASE_CREDENTIAL_PATH');
	const firebaseDatabaseUrl = configService.get<string>('FIREBASE_DATABASE_URL');
	return {
		googleApplicationCredential: firebaseCredentialPath,
		databaseURL: firebaseDatabaseUrl,
	};
};
