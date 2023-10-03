import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AttachmentFactory } from "test/factories/make-attachment";
import { QuestionFactory } from "test/factories/make-question";
import { QuestionAttachmentFactory } from "test/factories/make-question-attachment";
import { StudantFactory } from "test/factories/make-studant";

describe("Edit question (E2E)", () => {
    let app: INestApplication;
    let studantFactory: StudantFactory;
    let questionFactory: QuestionFactory;
    let attachmentFactory: AttachmentFactory;
    let questionAttachmentFactory: QuestionAttachmentFactory;
    let prisma: PrismaService;
    let jwt: JwtService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [
                StudantFactory,
                QuestionFactory,
                AttachmentFactory,
                QuestionAttachmentFactory,
            ],
        }).compile();

        app = moduleRef.createNestApplication();
        studantFactory = moduleRef.get(StudantFactory);
        questionFactory = moduleRef.get(QuestionFactory);
        attachmentFactory = moduleRef.get(AttachmentFactory);
        questionAttachmentFactory = moduleRef.get(QuestionAttachmentFactory);
        prisma = moduleRef.get(PrismaService);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    test("[PUT] /questions/:id", async () => {
        const user = await studantFactory.makePrismaStudant();

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const attachment1 = await attachmentFactory.makePrismaAttachment();
        const attachment2 = await attachmentFactory.makePrismaAttachment();

        await questionAttachmentFactory.makePrismaQuestionAttachment({
            attachmentId: attachment1.id,
            questionId: question.id,
        });

        await questionAttachmentFactory.makePrismaQuestionAttachment({
            attachmentId: attachment2.id,
            questionId: question.id,
        });

        const attachment3 = await attachmentFactory.makePrismaAttachment();

        const questionId = question.id.toString();

        const response = await request(app.getHttpServer())
            .put(`/questions/${questionId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                title: "New title",
                content: "New content",
                attachments: [
                    attachment1.id.toString(),
                    attachment3.id.toString(),
                ],
            });

        expect(response.statusCode).toBe(204);

        const questionOnDatabase = await prisma.question.findFirst({
            where: {
                title: "New title",
                content: "New content",
            },
        });

        expect(questionOnDatabase).toBeTruthy();

        const attachmentsOnDatabase = await prisma.attachment.findMany({
            where: {
                questionId: questionOnDatabase?.id,
            },
        });

        expect(attachmentsOnDatabase).toHaveLength(2);
        expect(attachmentsOnDatabase).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: attachment1.id.toString(),
                }),
                expect.objectContaining({
                    id: attachment3.id.toString(),
                }),
            ]),
        );
    });
});
