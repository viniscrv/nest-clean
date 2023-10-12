import { InMemoryQuestionsRepository } from "test/repositories/in-memory-questions-repository";
import { makeQuestion } from "test/factories/make-question";
import { DeleteQuestionUseCase } from "./delete-question";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { NotAllowedError } from "../../../../core/errors/errors/not-allowed-error";
import { InMemoryQuestionAttachmentsRepository } from "test/repositories/in-memory-question-attachments-repository";
import { makeQuestionAttachment } from "test/factories/make-question-attachment";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";
import { InMemoryStudantsRepository } from "test/repositories/in-memory-studants-repository";

let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryStudantsRepository: InMemoryStudantsRepository;
let sut: DeleteQuestionUseCase;

describe("Delete Question", () => {
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
        sut = new DeleteQuestionUseCase(inMemoryQuestionsRepository);
    });

    test("delete a question by id", async () => {
        const newQuestion = makeQuestion(
            { authorId: new UniqueEntityID("author-1") },
            new UniqueEntityID("question-1"),
        );

        inMemoryQuestionsRepository.create(newQuestion);

        inMemoryQuestionAttachmentsRepository.items.push(
            makeQuestionAttachment({
                questionId: newQuestion.id,
                attachmentId: new UniqueEntityID("1"),
            }),
            makeQuestionAttachment({
                questionId: newQuestion.id,
                attachmentId: new UniqueEntityID("2"),
            }),
        );

        await sut.execute({
            authorId: "author-1",
            questionId: "question-1",
        });

        expect(inMemoryQuestionsRepository.items).toHaveLength(0);
        expect(inMemoryQuestionAttachmentsRepository.items).toHaveLength(0);
    });

    test("not be able to delete a question from another user", async () => {
        const newQuestion = makeQuestion(
            { authorId: new UniqueEntityID("author-1") },
            new UniqueEntityID("question-1"),
        );

        await inMemoryQuestionsRepository.create(newQuestion);

        const result = await sut.execute({
            authorId: "author-2",
            questionId: "question-1",
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(NotAllowedError);
    });
});
