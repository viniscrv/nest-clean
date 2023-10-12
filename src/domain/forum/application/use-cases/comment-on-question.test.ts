import { InMemoryQuestionsRepository } from "test/repositories/in-memory-questions-repository";
import { makeQuestion } from "test/factories/make-question";
import { InMemoryQuestionCommentsRepository } from "test/repositories/in-memory-question-comments-repository";
import { CommentOnQuestionUseCase } from "./comment-on-question";
import { InMemoryQuestionAttachmentsRepository } from "test/repositories/in-memory-question-attachments-repository";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";
import { InMemoryStudantsRepository } from "test/repositories/in-memory-studants-repository";

let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryQuestionRepository: InMemoryQuestionsRepository;
let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryStudantsRepository: InMemoryStudantsRepository;
let sut: CommentOnQuestionUseCase;

describe("Comment On Question", () => {
    beforeEach(() => {
        inMemoryQuestionAttachmentsRepository =
            new InMemoryQuestionAttachmentsRepository();
        inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
        inMemoryStudantsRepository = new InMemoryStudantsRepository();
        inMemoryQuestionRepository = new InMemoryQuestionsRepository(
            inMemoryQuestionAttachmentsRepository,
            inMemoryAttachmentsRepository,
            inMemoryStudantsRepository,
        );
        inMemoryQuestionCommentsRepository =
            new InMemoryQuestionCommentsRepository(inMemoryStudantsRepository);
        sut = new CommentOnQuestionUseCase(
            inMemoryQuestionRepository,
            inMemoryQuestionCommentsRepository,
        );
    });

    test("be able to comment on question", async () => {
        const question = makeQuestion();

        await inMemoryQuestionRepository.create(question);

        await sut.execute({
            questionId: question.id.toString(),
            authorId: question.authorId.toString(),
            content: "Comentário teste",
        });

        expect(inMemoryQuestionCommentsRepository.items[0].content).toEqual(
            "Comentário teste",
        );
    });
});
