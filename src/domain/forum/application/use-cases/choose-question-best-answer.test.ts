import { InMemoryAnswersRepository } from "test/repositories/in-memory-answers-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { makeAnswer } from "test/factories/make-answer";
import { InMemoryQuestionsRepository } from "test/repositories/in-memory-questions-repository";
import { ChooseQuestionBestAnswerUseCase } from "./choose-question-best-answer";
import { makeQuestion } from "test/factories/make-question";
import { NotAllowedError } from "../../../../core/errors/errors/not-allowed-error";
import { InMemoryAnswerAttachmentsRepository } from "test/repositories/in-memory-answer-attachments";
import { InMemoryQuestionAttachmentsRepository } from "test/repositories/in-memory-question-attachments-repository";

let inMemoryAnswerRepository: InMemoryAnswerAttachmentsRepository;
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryQuestionRepository: InMemoryQuestionsRepository;
let inMemoryAnswersRepository: InMemoryAnswersRepository;
let sut: ChooseQuestionBestAnswerUseCase;

describe("Choose Question Best Answer", () => {
    beforeEach(() => {
        inMemoryAnswerRepository = new InMemoryAnswerAttachmentsRepository();
        inMemoryQuestionAttachmentsRepository =
            new InMemoryQuestionAttachmentsRepository();
        inMemoryAnswersRepository = new InMemoryAnswersRepository(
            inMemoryAnswerRepository
        );
        inMemoryQuestionRepository = new InMemoryQuestionsRepository(
            inMemoryQuestionAttachmentsRepository
        );
        sut = new ChooseQuestionBestAnswerUseCase(
            inMemoryQuestionRepository,
            inMemoryAnswersRepository
        );
    });

    test("be able to choose the question best answer", async () => {
        const question = makeQuestion();
        const answer = makeAnswer({
            questionId: question.id
        });

        await inMemoryQuestionRepository.create(question);
        await inMemoryAnswersRepository.create(answer);

        await sut.execute({
            authorId: question.authorId.toString(),
            answerId: answer.id.toString()
        });

        expect(inMemoryQuestionRepository.items[0].bestAnswerId).toEqual(
            answer.id
        );
    });

    test("not be able to choose another user question best answer", async () => {
        const question = makeQuestion({
            authorId: new UniqueEntityID("author-1")
        });
        const answer = makeAnswer({
            questionId: question.id
        });

        await inMemoryQuestionRepository.create(question);
        await inMemoryAnswersRepository.create(answer);

        const result = await sut.execute({
            authorId: "author-2",
            answerId: answer.id.toString()
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(NotAllowedError);
    });
});
