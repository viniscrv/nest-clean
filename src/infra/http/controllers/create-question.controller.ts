import { Body, Controller, Post, Request, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { z } from "zod";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";

const createQuestionBodySchema = z.object({
    title: z.string(),
    content: z.string(),
});

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>;

@Controller("/questions")
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
    constructor(private prisma: PrismaService) {}

    @Post()
    async handle(
        @Body(new ZodValidationPipe(createQuestionBodySchema))
        body: CreateQuestionBodySchema,
        @CurrentUser() user: UserPayload,
    ) {
        const { title, content } = body;
        const { sub: userId } = user;

        const slug = this.convertToSlug(title);

        await this.prisma.question.create({
            data: {
                authorId: userId,
                title,
                content,
                slug,
            },
        });
    }

    private convertToSlug(title: string): string {
        return title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
    }
}
