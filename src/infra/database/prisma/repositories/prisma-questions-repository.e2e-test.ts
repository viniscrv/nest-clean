import { QuestionsRepository } from "@/domain/forum/application/repositories/questions-repository";
import { AppModule } from "@/infra/app.module";
import { CacheRepository } from "@/infra/cache/cache-repository";
import { CacheModule } from "@/infra/cache/cache.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AttachmentFactory } from "test/factories/make-attachment";
import { QuestionFactory } from "test/factories/make-question";
import { QuestionAttachmentFactory } from "test/factories/make-question-attachment";
import { StudantFactory } from "test/factories/make-studant";

describe("Prisma Questions Repository (E2E)", () => {
    let app: INestApplication;
    let studantFactory: StudantFactory;
    let questionFactory: QuestionFactory;
    let attachmentFactory: AttachmentFactory;
    let questionAttachmentFactory: QuestionAttachmentFactory;
    let cacheRepository: CacheRepository;
    let questionsRepository: QuestionsRepository;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule, CacheModule],
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
        cacheRepository = moduleRef.get(CacheRepository);
        questionsRepository = moduleRef.get(QuestionsRepository);

        await app.init();
    });

    test("should cache question details", async () => {
        const user = await studantFactory.makePrismaStudant();

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const attachment = await attachmentFactory.makePrismaAttachment();

        await questionAttachmentFactory.makePrismaQuestionAttachment({
            attachmentId: attachment.id,
            questionId: question.id,
        });

        const slug = question.slug.value;

        const questionDetails =
            await questionsRepository.findDetailsBySlug(slug);

        const cached = await cacheRepository.get(`question:${slug}:details`);

        expect(cached).toEqual(JSON.stringify(questionDetails));
    });

    test("should return cached question details on subsequents calls", async () => {
        const user = await studantFactory.makePrismaStudant();

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const attachment = await attachmentFactory.makePrismaAttachment();

        await questionAttachmentFactory.makePrismaQuestionAttachment({
            attachmentId: attachment.id,
            questionId: question.id,
        });

        const slug = question.slug.value;

        await cacheRepository.set(
            `question:${slug}:details`,
            JSON.stringify({ empty: true }),
        );

        const questionDetails =
            await questionsRepository.findDetailsBySlug(slug);

        expect(questionDetails).toEqual({ empty: true });
    });

    test("should reset questionDetails cache when saving the question", async () => {
        const user = await studantFactory.makePrismaStudant();

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id,
        });

        const attachment = await attachmentFactory.makePrismaAttachment();

        await questionAttachmentFactory.makePrismaQuestionAttachment({
            attachmentId: attachment.id,
            questionId: question.id,
        });

        const slug = question.slug.value;

        await cacheRepository.set(
            `question:${slug}:details`,
            JSON.stringify({ empty: true }),
        );

        await questionsRepository.save(question);

        const cached = await cacheRepository.get(`question:${slug}:details`);

        expect(cached).toBeNull();
    });
});
