import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AnswerFactory } from "test/factories/make-answer";
import { QuestionFactory } from "test/factories/make-question";
import { StudantFactory } from "test/factories/make-studant";

describe("Comment on question (E2E)", () => {
    let app: INestApplication;
    let studantFactory: StudantFactory;
    let questionFactory: QuestionFactory;
    let answerFactory: AnswerFactory;
    let prisma: PrismaService;
    let jwt: JwtService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudantFactory, QuestionFactory, AnswerFactory],
        }).compile();

        app = moduleRef.createNestApplication();
        studantFactory = moduleRef.get(StudantFactory);
        questionFactory = moduleRef.get(QuestionFactory);
        answerFactory = moduleRef.get(AnswerFactory);
        prisma = moduleRef.get(PrismaService);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    test("[POST] /answers/:answerId/comments", async () => {
        const user = await studantFactory.makePrismaStudant();

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const answer = await answerFactory.makePrismaAnswer({
            questionId: question.id,
            authorId: user.id,
        });

        const answerId = answer.id.toString();

        const response = await request(app.getHttpServer())
            .post(`/answers/${answerId}/comments`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                content: "New comment",
            });

        expect(response.statusCode).toBe(201);

        const commentOnDatabase = await prisma.comment.findFirst({
            where: {
                content: "New comment",
            },
        });

        expect(commentOnDatabase).toBeTruthy();
    });
});
