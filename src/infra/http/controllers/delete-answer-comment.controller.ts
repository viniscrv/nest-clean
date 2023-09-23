import {
    BadRequestException, Controller,
    Delete,
    HttpCode,
    Param
} from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { DeleteAnswerCommentUseCase } from "@/domain/forum/application/use-cases/delete-answer-comment";

@Controller("/answers/comments/:id")
export class DeleteAnswerCommentController {
    constructor(private createQueston: DeleteAnswerCommentUseCase) {}

    @Delete()
    @HttpCode(204)
    async handle(
        @CurrentUser() user: UserPayload,
        @Param("id") answerCommentId: string
    ) {
        const { sub: userId } = user;

        const result = await this.createQueston.execute({
            authorId: userId,
            answerCommentId
        });

        if (result.isLeft()) {
            throw new BadRequestException();
        }
    }
}
