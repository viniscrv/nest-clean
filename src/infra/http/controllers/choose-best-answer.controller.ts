import {
    BadRequestException,
    Body,
    Controller,
    HttpCode,
    Param,
    Patch,
    Put,
} from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { ChooseQuestionBestAnswerUseCase } from "@/domain/forum/application/use-cases/choose-question-best-answer";


@Controller("/answer/:answerId/choose-as-best")
export class ChooseQuestionBestAnswerController {
    constructor(private createQueston: ChooseQuestionBestAnswerUseCase) {}

    @Patch()
    @HttpCode(204)
    async handle(
        @CurrentUser() user: UserPayload,
        @Param("id") answerId: string,
    ) {
        const { sub: userId } = user;

        const result = await this.createQueston.execute({
            authorId: userId,
            answerId,
        });

        if (result.isLeft()) {
            throw new BadRequestException();
        }
    }
}
