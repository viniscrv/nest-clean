import {
    BadRequestException,
    Body,
    Controller,
    Param,
    Post, UseGuards
} from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { z } from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { AnswerQuestionUseCase } from "@/domain/forum/application/use-cases/answer-question";

const answerQuestionBodySchema = z.object({
    content: z.string(),
});

type AnswerQuestionBodySchema = z.infer<typeof answerQuestionBodySchema>;

@Controller("/questions/:questionId/answers")
export class AnswerQuestionController {
    constructor(private createQueston: AnswerQuestionUseCase) {}

    @Post()
    async handle(
        @Body(new ZodValidationPipe(answerQuestionBodySchema))
        body: AnswerQuestionBodySchema,
        @CurrentUser() user: UserPayload,
        @Param("questionId") questionId: string
    ) {
        const { content } = body;
        const { sub: userId } = user;

        const result = await this.createQueston.execute({
            content,
            questionId,
            authorId: userId,
            attachmentsIds: [],
        });

        if (result.isLeft()) {
            throw new BadRequestException();
        }
    }
}
