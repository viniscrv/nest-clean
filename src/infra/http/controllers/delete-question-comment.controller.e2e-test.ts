import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { QuestionFactory } from "test/factories/make-question";
import { QuestionCommentFactory } from "test/factories/make-question-comment";
import { StudantFactory } from "test/factories/make-studant";

describe("Delete question comment (E2E)", () => {
    let app: INestApplication;
    let studantFactory: StudantFactory;
    let questionFactory: QuestionFactory;
    let questionCommentFactory: QuestionCommentFactory;
    let prisma: PrismaService;
    let jwt: JwtService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [
                StudantFactory,
                QuestionFactory,
                QuestionCommentFactory,
            ],
        }).compile();

        app = moduleRef.createNestApplication();
        studantFactory = moduleRef.get(StudantFactory);
        questionFactory = moduleRef.get(QuestionFactory);
        questionCommentFactory = moduleRef.get(QuestionCommentFactory);
        prisma = moduleRef.get(PrismaService);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    test("[DELETE] /questions/comments/:id", async () => {
        const user = await studantFactory.makePrismaStudant();

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const questionComment =
            await questionCommentFactory.makePrismaQuestionComment({
                authorId: user.id,
                questionId: question.id,
            });

        const questionCommentId = questionComment.id.toString();

        const response = await request(app.getHttpServer())
            .delete(`/questions/comments/${questionCommentId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send();

        expect(response.statusCode).toBe(204);

        const commentOnDataBase = await prisma.comment.findUnique({
            where: {
                id: questionCommentId,
            },
        });

        expect(commentOnDataBase).toBeNull();
    });
});
