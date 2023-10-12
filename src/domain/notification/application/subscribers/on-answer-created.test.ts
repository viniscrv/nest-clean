import { makeAnswer } from "test/factories/make-answer";
import { OnAnswerCreated } from "./on-answer-created";
import { InMemoryAnswersRepository } from "test/repositories/in-memory-answers-repository";
import { InMemoryAnswerAttachmentsRepository } from "test/repositories/in-memory-answer-attachments";
import { InMemoryQuestionsRepository } from "test/repositories/in-memory-questions-repository";
import { InMemoryQuestionAttachmentsRepository } from "test/repositories/in-memory-question-attachments-repository";
import {
    SendNotificationUseCase,
    SendNotificationUseCaseRequest,
    SendNotificationUseCaseResponse,
} from "../use-cases/send-notification";
import { InMemoryNotificationsRepository } from "test/repositories/in-memory-notifications-repository";
import { makeQuestion } from "test/factories/make-question";
import { SpyInstance } from "vitest";
import { waitFor } from "test/utils/wait-for";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";
import { InMemoryStudantsRepository } from "test/repositories/in-memory-studants-repository";

let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let inMemoryAnswersRepository: InMemoryAnswersRepository;
let inMemoryNotificationsRepository: InMemoryNotificationsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryStudantsRepository: InMemoryStudantsRepository;
let sendNotificationUseCase: SendNotificationUseCase;

let sendNotificationExecuteSpy: SpyInstance<
    [SendNotificationUseCaseRequest],
    Promise<SendNotificationUseCaseResponse>
>;

describe("On Answer Created", () => {
    beforeEach(() => {
        inMemoryQuestionAttachmentsRepository =
            new InMemoryQuestionAttachmentsRepository();
        inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
        inMemoryStudantsRepository = new InMemoryStudantsRepository();
        inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
            inMemoryQuestionAttachmentsRepository,
            inMemoryAttachmentsRepository,
            inMemoryStudantsRepository,
        );
        inMemoryAnswerAttachmentsRepository =
            new InMemoryAnswerAttachmentsRepository();
        inMemoryAnswersRepository = new InMemoryAnswersRepository(
            inMemoryAnswerAttachmentsRepository,
        );
        inMemoryNotificationsRepository = new InMemoryNotificationsRepository();
        sendNotificationUseCase = new SendNotificationUseCase(
            inMemoryNotificationsRepository,
        );

        sendNotificationExecuteSpy = vi.spyOn(
            sendNotificationUseCase,
            "execute",
        );

        new OnAnswerCreated(
            inMemoryQuestionsRepository,
            sendNotificationUseCase,
        );
    });

    test("should send a notification when an answer is created", async () => {
        const question = makeQuestion();
        const answer = makeAnswer({
            questionId: question.id,
        });

        inMemoryQuestionsRepository.create(question);
        inMemoryAnswersRepository.create(answer);

        await waitFor(() => {
            expect(sendNotificationExecuteSpy).toHaveBeenCalled();
        });
    });
});
