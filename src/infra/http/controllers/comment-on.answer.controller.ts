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
import { CommentOnAnswerUseCase } from "@/domain/forum/application/use-cases/comment-on-answer";

const commentOnAnswerBodySchema = z.object({
    content: z.string(),
});

type CommentOnAnswerBodySchema = z.infer<typeof commentOnAnswerBodySchema>;

@Controller("/answers/:answerId/comments")
export class CommentOnAnswerController {
    constructor(private createQueston: CommentOnAnswerUseCase) {}

    @Post()
    async handle(
        @Body(new ZodValidationPipe(commentOnAnswerBodySchema))
        body: CommentOnAnswerBodySchema,
        @CurrentUser() user: UserPayload,
        @Param("answerId") answerId: string,
    ) {
        const { content } = body;
        const { sub: userId } = user;

        const result = await this.createQueston.execute({
            content,
            answerId,
            authorId: userId,
        });

        if (result.isLeft()) {
            throw new BadRequestException();
        }
    }
}
