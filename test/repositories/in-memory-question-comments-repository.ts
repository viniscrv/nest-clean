import { PaginationParams } from "@/core/repositories/pagination-params";
import { QuestionCommentsRepository } from "@/domain/forum/application/repositories/question-comments-repository";
import { StudantsRepository } from "@/domain/forum/application/repositories/studants-repository";
import { QuestionComment } from "@/domain/forum/enterprise/entities/question-comment";
import { InMemoryStudantsRepository } from "./in-memory-studants-repository";
import { CommentWithAuthor } from "@/domain/forum/enterprise/entities/value-objects/comment-with-author";

export class InMemoryQuestionCommentsRepository
    implements QuestionCommentsRepository
{
    public items: QuestionComment[] = [];

    constructor(private studantsRepository: InMemoryStudantsRepository) {}

    async findById(id: string) {
        const questionComment = this.items.find(
            (item) => item.id.toString() === id,
        );

        if (!questionComment) {
            return null;
        }

        return questionComment;
    }

    async findManyByQuestionId(questionId: string, { page }: PaginationParams) {
        const questionComment = this.items
            .filter((item) => item.questionId.toString() === questionId)
            .slice((page - 1) * 20, page * 20);

        return questionComment;
    }

    async findManyByQuestionIdWithAuthor(
        questionId: string,
        { page }: PaginationParams,
    ) {
        const questionComment = this.items
            .filter((item) => item.questionId.toString() === questionId)
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

        return questionComment;
    }

    async create(questionComment: QuestionComment) {
        this.items.push(questionComment);
    }

    async delete(questionComment: QuestionComment) {
        const itemIndex = this.items.findIndex(
            (item) => item.id === questionComment.id,
        );

        this.items.splice(itemIndex, 1);
    }
}
