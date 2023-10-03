import {
    BadRequestException,
    Body,
    Controller,
    HttpCode,
    Param,
    Put,
} from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { z } from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { EditQuestionUseCase } from "@/domain/forum/application/use-cases/edit-question";

const editQuestionBodySchema = z.object({
    title: z.string(),
    content: z.string(),
    attachments: z.array(z.string().uuid()),
});

type EditQuestionBodySchema = z.infer<typeof editQuestionBodySchema>;

@Controller("/questions/:id")
export class EditQuestionController {
    constructor(private createQueston: EditQuestionUseCase) {}

    @Put()
    @HttpCode(204)
    async handle(
        @Body(new ZodValidationPipe(editQuestionBodySchema))
        body: EditQuestionBodySchema,
        @CurrentUser() user: UserPayload,
        @Param("id") questionId: string,
    ) {
        const { title, content, attachments } = body;
        const { sub: userId } = user;

        const result = await this.createQueston.execute({
            title,
            content,
            authorId: userId,
            attachmentsIds: attachments,
            questionId,
        });

        if (result.isLeft()) {
            throw new BadRequestException();
        }
    }
}
