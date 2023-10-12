import { InMemoryQuestionsRepository } from "test/repositories/in-memory-questions-repository";
import { GetQuestionBySlugUseCase } from "./get-question-by-slug";
import { makeQuestion } from "test/factories/make-question";
import { Slug } from "../../enterprise/entities/value-objects/slug";
import { InMemoryQuestionAttachmentsRepository } from "test/repositories/in-memory-question-attachments-repository";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";
import { InMemoryStudantsRepository } from "test/repositories/in-memory-studants-repository";
import { makeStudant } from "test/factories/make-studant";
import { makeAttachment } from "test/factories/make-attachment";
import { makeQuestionAttachment } from "test/factories/make-question-attachment";

let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryStudantsRepository: InMemoryStudantsRepository;
let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let sut: GetQuestionBySlugUseCase;

describe("Get Question By Slug", () => {
    beforeEach(() => {
        inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
        inMemoryStudantsRepository = new InMemoryStudantsRepository();
        inMemoryQuestionAttachmentsRepository =
            new InMemoryQuestionAttachmentsRepository();
        inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
            inMemoryQuestionAttachmentsRepository,
            inMemoryAttachmentsRepository,
            inMemoryStudantsRepository,
        );
        sut = new GetQuestionBySlugUseCase(inMemoryQuestionsRepository);
    });

    test("get a question by slug", async () => {
        const studant = makeStudant({ name: "Jhon Doe" });

        inMemoryStudantsRepository.items.push(studant);

        const newQuestion = makeQuestion({
            authorId: studant.id,
            slug: Slug.create("example-question"),
        });

        inMemoryQuestionsRepository.create(newQuestion);

        const attachment = makeAttachment({
            title: "Some attachment",
        });

        inMemoryAttachmentsRepository.items.push(attachment);

        inMemoryQuestionAttachmentsRepository.items.push(
            makeQuestionAttachment({
                attachmentId: attachment.id,
                questionId: newQuestion.id,
            }),
        );

        const result = await sut.execute({
            slug: "example-question",
        });

        expect(result.value).toMatchObject({
            question: expect.objectContaining({
                title: newQuestion.title,
                author: "John Doe",
                attachments: [
                    expect.objectContaining({
                        title: "Some attachment",
                    }),
                ],
            }),
        });
    });
});
