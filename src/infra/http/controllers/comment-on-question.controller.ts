import {
    BadRequestException,
    Body,
    Controller,
    Param,
    Post,
} from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { z } from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { CommentOnQuestionUseCase } from "@/domain/forum/application/use-cases/comment-on-question";

const commentOnQuestionBodySchema = z.object({
    content: z.string(),
});

type CommentOnQuestionBodySchema = z.infer<typeof commentOnQuestionBodySchema>;

@Controller("/questions/:questionId/comments")
export class CommentOnQuestionController {
    constructor(private createQueston: CommentOnQuestionUseCase) {}

    @Post()
    async handle(
        @Body(new ZodValidationPipe(commentOnQuestionBodySchema))
        body: CommentOnQuestionBodySchema,
        @CurrentUser() user: UserPayload,
        @Param("questionId") questionId: string,
    ) {
        const { content } = body;
        const { sub: userId } = user;

        const result = await this.createQueston.execute({
            content,
            questionId,
            authorId: userId,
        });

        if (result.isLeft()) {
            throw new BadRequestException();
        }
    }
}
