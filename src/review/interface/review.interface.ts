export interface IReview {
	id: string;
	authorId: string;
	reviewedUserId: string;
	content: string;
	rating: number;
}
