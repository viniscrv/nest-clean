import { FetchAnswerCommentsUseCase } from "./fetch-answer-comments";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { makeAnswerComment } from "test/factories/make-answer-comment";
import { makeStudant } from "test/factories/make-studant";
import { InMemoryAnswerCommentsRepository } from "test/repositories/in-memory-answer-comments-repository";
import { InMemoryStudantsRepository } from "test/repositories/in-memory-studants-repository";

let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository;
let inMemoryStudantsRepository: InMemoryStudantsRepository;
let sut: FetchAnswerCommentsUseCase;

describe("Fetch Answer Comments", () => {
    beforeEach(() => {
        inMemoryStudantsRepository = new InMemoryStudantsRepository();
        inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository(
            inMemoryStudantsRepository,
        );
        sut = new FetchAnswerCommentsUseCase(inMemoryAnswerCommentsRepository);
    });

    test("be able to fetch answer comments", async () => {
        const studant = makeStudant({ name: "John Doe" });
        inMemoryStudantsRepository.items.push(studant);

        const comment1 = makeAnswerComment({
            answerId: new UniqueEntityID("answer-1"),
            authorId: studant.id,
        });

        const comment2 = makeAnswerComment({
            answerId: new UniqueEntityID("answer-1"),
            authorId: studant.id,
        });

        const comment3 = makeAnswerComment({
            answerId: new UniqueEntityID("answer-1"),
            authorId: studant.id,
        });

        await inMemoryAnswerCommentsRepository.create(comment1);
        await inMemoryAnswerCommentsRepository.create(comment2);
        await inMemoryAnswerCommentsRepository.create(comment3);

        const result = await sut.execute({
            answerId: "answer-1",
            page: 1,
        });

        expect(result.value?.comments).toHaveLength(3);
        expect(result.value?.comments).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    author: "John Doe",
                    commentId: comment1.id,
                }),
                expect.objectContaining({
                    author: "John Doe",
                    commentId: comment2.id,
                }),
                expect.objectContaining({
                    author: "John Doe",
                    commentId: comment3.id,
                }),
            ]),
        );
    });

    test("be able to fetch paginated answers comments", async () => {
        const studant = makeStudant({ name: "John Doe" });
        inMemoryStudantsRepository.items.push(studant);

        for (let i = 1; i <= 22; i++) {
            await inMemoryAnswerCommentsRepository.create(
                makeAnswerComment({
                    answerId: new UniqueEntityID("answer-1"),
                    authorId: studant.id,
                }),
            );
        }

        const result = await sut.execute({
            answerId: "answer-1",
            page: 2,
        });

        expect(result.value?.comments).toHaveLength(2);
    });
});
