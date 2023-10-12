import { InMemoryAnswersRepository } from "test/repositories/in-memory-answers-repository";
import { makeAnswer } from "test/factories/make-answer";
import { CommentOnAnswerUseCase } from "./comment-on-answer";
import { InMemoryAnswerCommentsRepository } from "test/repositories/in-memory-answer-comments-repository";
import { InMemoryAnswerAttachmentsRepository } from "test/repositories/in-memory-answer-attachments";
import { InMemoryStudantsRepository } from "test/repositories/in-memory-studants-repository";

let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let inMemoryAnswerRepository: InMemoryAnswersRepository;
let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository;
let inMemoryStudantsRepository: InMemoryStudantsRepository;
let sut: CommentOnAnswerUseCase;

describe("Comment On Answer", () => {
    beforeEach(() => {
        inMemoryAnswerAttachmentsRepository =
            new InMemoryAnswerAttachmentsRepository();
        inMemoryAnswerRepository = new InMemoryAnswersRepository(
            inMemoryAnswerAttachmentsRepository,
        );
        inMemoryStudantsRepository = new InMemoryStudantsRepository();
        inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository(
            inMemoryStudantsRepository,
        );
        sut = new CommentOnAnswerUseCase(
            inMemoryAnswerRepository,
            inMemoryAnswerCommentsRepository,
        );
    });

    test("be able to comment on answer", async () => {
        const answer = makeAnswer();

        await inMemoryAnswerRepository.create(answer);

        await sut.execute({
            answerId: answer.id.toString(),
            authorId: answer.authorId.toString(),
            content: "Comentário teste",
        });

        expect(inMemoryAnswerCommentsRepository.items[0].content).toEqual(
            "Comentário teste",
        );
    });
});
