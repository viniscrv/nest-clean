import { Module } from "@nestjs/common";
import { AuthenticateController } from "./controllers/authenticate.controller";
import { CreateAccountController } from "./controllers/create-account.controller";
import { CreateQuestionController } from "./controllers/create-question.controller";
import { FetchRecentQuestionsController } from "./controllers/fetch-recent-questions.controller";
import { DatabaseModule } from "../database/database.module";
import { CreateQuestionUseCase } from "@/domain/forum/application/use-cases/create-question";
import { FetchRecentQuestionsUseCase } from "@/domain/forum/application/use-cases/fetch-recent-questions";
import { RegisterStudantUseCase } from "@/domain/forum/application/use-cases/register-studant";
import { AuthenticateStudantUseCase } from "@/domain/forum/application/use-cases/authenticate-studant";
import { CryptgraphyModule } from "../cryptography/cryptography.module";

@Module({
    imports: [DatabaseModule, CryptgraphyModule],
    controllers: [
        CreateAccountController,
        AuthenticateController,
        CreateQuestionController,
        FetchRecentQuestionsController,
    ],
    providers: [
        CreateQuestionUseCase,
        FetchRecentQuestionsUseCase,
        RegisterStudantUseCase,
        AuthenticateStudantUseCase,
    ],
})
export class HttpModule {}
