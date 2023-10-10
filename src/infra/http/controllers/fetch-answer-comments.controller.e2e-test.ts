import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AnswerFactory } from "test/factories/make-answer";
import { AnswerCommentFactory } from "test/factories/make-answer-comment";
import { QuestionFactory } from "test/factories/make-question";
import { StudantFactory } from "test/factories/make-studant";

describe("Fetch answer comments (E2E)", () => {
    let app: INestApplication;
    let studantFactory: StudantFactory;
    let questionFactory: QuestionFactory;
    let answerFactory: AnswerFactory;
    let answerCommentFactory: AnswerCommentFactory;
    let jwt: JwtService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [
                StudantFactory,
                QuestionFactory,
                AnswerFactory,
                AnswerCommentFactory,
            ],
        }).compile();

        app = moduleRef.createNestApplication();

        studantFactory = moduleRef.get(StudantFactory);
        questionFactory = moduleRef.get(QuestionFactory);
        answerFactory = moduleRef.get(AnswerFactory);
        answerCommentFactory = moduleRef.get(AnswerCommentFactory);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    test("[GET] /answers/:answerId/comments", async () => {
        const user = await studantFactory.makePrismaStudant({
            name: "Jhon Doe",
        });

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const answer = await answerFactory.makePrismaAnswer({
            questionId: question.id,
            authorId: user.id,
        });

        await Promise.all([
            answerCommentFactory.makePrismaAnswerComment({
                authorId: user.id,
                answerId: answer.id,
                content: "Comment 01",
            }),
            answerCommentFactory.makePrismaAnswerComment({
                authorId: user.id,
                answerId: answer.id,
                content: "Comment 02",
            }),
        ]);

        const answerId = answer.id.toString();

        const response = await request(app.getHttpServer())
            .get(`/questions/${answerId}/comments`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            comments: expect.arrayContaining([
                expect.objectContaining({
                    content: "Comment 01",
                    authorName: "John Doe",
                }),
                expect.objectContaining({
                    content: "Comment 02",
                    authorName: "John Doe",
                }),
            ]),
        });
    });
});
