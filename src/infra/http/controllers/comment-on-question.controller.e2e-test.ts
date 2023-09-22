import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { QuestionFactory } from "test/factories/make-question";
import { StudantFactory } from "test/factories/make-studant";

describe("Comment on question (E2E)", () => {
    let app: INestApplication;
    let studantFactory: StudantFactory;
    let questionFactory: QuestionFactory;
    let prisma: PrismaService;
    let jwt: JwtService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudantFactory, QuestionFactory],
        }).compile();

        app = moduleRef.createNestApplication();
        studantFactory = moduleRef.get(StudantFactory);
        questionFactory = moduleRef.get(QuestionFactory);
        prisma = moduleRef.get(PrismaService);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    test("[POST] /questions/:questionId/comments", async () => {
        const user = await studantFactory.makePrismaStudant();

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const questionId = question.id.toString();

        const response = await request(app.getHttpServer())
            .post(`/questions/${questionId}/comments`)
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
