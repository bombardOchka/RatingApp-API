export enum Roles {
	Admin = 'admin',
	User = 'user',
}

export interface IUser {
	id: string;
	email: string;
	passwordHash: string;
	role: Roles;
}
