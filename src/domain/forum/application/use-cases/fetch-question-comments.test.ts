import { FetchQuestionCommentsUseCase } from "./fetch-question-comments";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { makeQuestionComment } from "test/factories/make-question-comment";
import { makeStudant } from "test/factories/make-studant";
import { InMemoryQuestionCommentsRepository } from "test/repositories/in-memory-question-comments-repository";
import { InMemoryStudantsRepository } from "test/repositories/in-memory-studants-repository";

let inMemoryStudantsRepository: InMemoryStudantsRepository;
let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository;
let sut: FetchQuestionCommentsUseCase;

describe("Fetch Question Comments", () => {
    beforeEach(() => {
        inMemoryStudantsRepository = new InMemoryStudantsRepository();
        inMemoryQuestionCommentsRepository =
            new InMemoryQuestionCommentsRepository(inMemoryStudantsRepository);
        sut = new FetchQuestionCommentsUseCase(
            inMemoryQuestionCommentsRepository,
        );
    });

    test("be able to fetch question comments", async () => {
        const studant = makeStudant({ name: "John Doe" });
        inMemoryStudantsRepository.items.push(studant);

        const comment1 = makeQuestionComment({
            questionId: new UniqueEntityID("question-1"),
            authorId: studant.id,
        });
        const comment2 = makeQuestionComment({
            questionId: new UniqueEntityID("question-1"),
            authorId: studant.id,
        });
        const comment3 = makeQuestionComment({
            questionId: new UniqueEntityID("question-1"),
            authorId: studant.id,
        });

        await inMemoryQuestionCommentsRepository.create(comment1);
        await inMemoryQuestionCommentsRepository.create(comment2);
        await inMemoryQuestionCommentsRepository.create(comment3);

        const result = await sut.execute({
            questionId: "question-1",
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

    test("be able to fetch paginated questions comments", async () => {
        const studant = makeStudant({ name: "John Doe" });
        inMemoryStudantsRepository.items.push(studant);

        for (let i = 1; i <= 22; i++) {
            await inMemoryQuestionCommentsRepository.create(
                makeQuestionComment({
                    questionId: new UniqueEntityID("question-1"),
                    authorId: studant.id,
                }),
            );
        }

        const result = await sut.execute({
            questionId: "question-1",
            page: 2,
        });

        expect(result.value?.comments).toHaveLength(2);
    });
});
