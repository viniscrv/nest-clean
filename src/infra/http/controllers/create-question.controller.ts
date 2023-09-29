import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { z } from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { CreateQuestionUseCase } from "@/domain/forum/application/use-cases/create-question";

const createQuestionBodySchema = z.object({
    title: z.string(),
    content: z.string(),
    attachments: z.array(z.string().uuid()),
});

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>;

@Controller("/questions")
export class CreateQuestionController {
    constructor(private createQueston: CreateQuestionUseCase) {}

    @Post()
    async handle(
        @Body(new ZodValidationPipe(createQuestionBodySchema))
        body: CreateQuestionBodySchema,
        @CurrentUser() user: UserPayload,
    ) {
        const { title, content, attachments } = body;
        const { sub: userId } = user;

        const result = await this.createQueston.execute({
            title,
            content,
            authorId: userId,
            attachmentsIds: attachments,
        });

        if (result.isLeft()) {
            throw new BadRequestException();
        }
    }
}
