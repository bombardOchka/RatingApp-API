import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectFirebaseAdmin, FirebaseAdmin } from 'nestjs-firebase';
import { CreateReviewDto } from './dto/createReview.dto';
import { IReview } from './interface/review.interface';
import { v4 as uuidv4 } from 'uuid';
import { RECEIVER_IS_OWNER_ERROR, NOT_ENOUGH_PERMISSIONS, REVIEW_NOT_FOUND } from './reviews.constants';

@Injectable()
export class ReviewService {
	constructor(
		@InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin,
		private readonly jwtService: JwtService,
	) {}

	getInfoFromToken(req) {
		const token = req.headers.authorization?.split(' ')[1];
		try {
			const decoded = this.jwtService.verify(token);
			return decoded;
		} catch (error) {
			return null;
		}
	}

	async createReview(dto: CreateReviewDto, req): Promise<IReview> {
		const authorId = this.getInfoFromToken(req).id;
		if (dto.reviewedUserId == authorId) {
			throw new ForbiddenException(RECEIVER_IS_OWNER_ERROR);
		}

		const id = uuidv4();
		const newReview: IReview = {
			id,
			authorId,
			reviewedUserId: dto.reviewedUserId,
			content: dto.content,
			rating: dto.rating,
		};
		const reviewRef = this.firebase.database.ref(`reviews/${id}`);
		await reviewRef.set(newReview);
		return newReview;
	}

	async deleteReview(reviewId: string, req) {
		const currUser = this.getInfoFromToken(req);
		const reviewValue = await this.findReview(reviewId);
		if (reviewValue == null) {
			throw new NotFoundException(REVIEW_NOT_FOUND);
		} else if (currUser.id !== reviewValue.authorId && currUser.role !== 'admin') {
			throw new ForbiddenException(NOT_ENOUGH_PERMISSIONS);
		}
		await this.firebase.database.ref(`reviews/${reviewId}`).remove();
		return `remove succes id: ${reviewId}`;
	}

	async findReview(id: string): Promise<IReview> {
		const reviewsRef = this.firebase.database.ref(`reviews/${id}`);
		return (await reviewsRef.once('value')).val();
	}

	async findReviewsByReceiver(id: string): Promise<IReview[]> {
		const reviewsRef = this.firebase.database.ref('reviews');
		const reviewsValue = (await reviewsRef.orderByChild('reviewedUserId').equalTo(id).once('value')).val();
		if (reviewsValue == null) {
			throw new NotFoundException(REVIEW_NOT_FOUND);
		}
		const reviewsKeys = Object.keys(reviewsValue);
		return reviewsKeys.map((elem) => reviewsValue[elem]);
	}

	async getUserRating(id: string) {
		const reviews = await this.findReviewsByReceiver(id);

		let totalRating = 0;
		let reviewCount = 0;
		Object.values(reviews).forEach((review: any) => {
			totalRating += review.rating;
			reviewCount++;
		});
		return totalRating / reviewCount;
	}
}
