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
import { EditAnswerUseCase } from "@/domain/forum/application/use-cases/edit-answer";

const editAnswerBodySchema = z.object({
    content: z.string(),
    attachments: z.array(z.string().uuid()).default([]),
});

type EditAnswerBodySchema = z.infer<typeof editAnswerBodySchema>;

@Controller("/answers/:id")
export class EditAnswerController {
    constructor(private createQueston: EditAnswerUseCase) {}

    @Put()
    @HttpCode(204)
    async handle(
        @Body(new ZodValidationPipe(editAnswerBodySchema))
        body: EditAnswerBodySchema,
        @CurrentUser() user: UserPayload,
        @Param("id") answerId: string,
    ) {
        const { content, attachments } = body;
        const { sub: userId } = user;

        const result = await this.createQueston.execute({
            content,
            answerId,
            authorId: userId,
            attachmentsIds: attachments,
        });

        if (result.isLeft()) {
            throw new BadRequestException();
        }
    }
}
