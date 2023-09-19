import {
    BadRequestException,
    Controller,
    Get,
    Query,
    UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { z } from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { FetchRecentQuestionsUseCase } from "@/domain/forum/application/use-cases/fetch-recent-questions";
import { QuestionPresenter } from "../presenters/question-presenter";

const pageQueryParamSchema = z
    .string()
    .optional()
    .default("1")
    .transform(Number)
    .pipe(z.number().min(1));

type pageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

@Controller("/questions")
export class FetchRecentQuestionsController {
    constructor(private fetchRecentQuestions: FetchRecentQuestionsUseCase) {}

    @Get()
    async handle(
        @Query("page", queryValidationPipe) page: pageQueryParamSchema,
    ) {
        const result = await this.fetchRecentQuestions.execute({
            page,
        });

        if (result.isLeft()) {
            throw new BadRequestException();
        }

        const questions = result.value.questions;

        return { questions: questions.map(QuestionPresenter.toHTTP) };
    }
}
