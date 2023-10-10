import { PaginationParams } from "@/core/repositories/pagination-params";
import { AnswerCommentsRepository } from "@/domain/forum/application/repositories/answer-comments-repository";
import { AnswerComment } from "@/domain/forum/enterprise/entities/answer-comment";
import { InMemoryStudantsRepository } from "./in-memory-studants-repository";
import { CommentWithAuthor } from "@/domain/forum/enterprise/entities/value-objects/comment-with-author";

export class InMemoryAnswerCommentsRepository
    implements AnswerCommentsRepository
{
    public items: AnswerComment[] = [];

    constructor(private studantsRepository: InMemoryStudantsRepository) {}

    async findById(id: string) {
        const answerComment = this.items.find(
            (item) => item.id.toString() === id,
        );

        if (!answerComment) {
            return null;
        }

        return answerComment;
    }

    async findManyByAnswerId(answerId: string, { page }: PaginationParams) {
        const answerComments = this.items
            .filter((item) => item.answerId.toString() === answerId)
            .slice((page - 1) * 20, page * 20);

        return answerComments;
    }

    async findManyByAnswerIdWithAuthor(
        answerId: string,
        { page }: PaginationParams,
    ) {
        const AnswerComments = this.items
            .filter((item) => item.answerId.toString() === answerId)
            .slice((page - 1) * 20, page * 20)
            .map((comment) => {
                const author = this.studantsRepository.items.find((studant) => {
                    return studant.id.equals(comment.authorId);
                });

                if (!author) {
                    throw new Error(
                        `Author with id "${comment.authorId.toString()}" this not exits.`,
                    );
                }

                return CommentWithAuthor.create({
                    commentId: comment.id,
                    content: comment.content,
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt,
                    authorId: comment.authorId,
                    author: author.name,
                });
            });

        return AnswerComments;
    }

    async create(answerComment: AnswerComment) {
        this.items.push(answerComment);
    }

    async delete(answerComment: AnswerComment) {
        const itemIndex = this.items.findIndex(
            (item) => item.id === answerComment.id,
        );

        this.items.splice(itemIndex, 1);
    }
}
