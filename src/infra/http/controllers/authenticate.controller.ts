import {
    BadRequestException,
    Body,
    Controller,
    Post,
    UnauthorizedException,
    UsePipes,
} from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { AuthenticateStudantUseCase } from "@/domain/forum/application/use-cases/authenticate-studant";
import { WrongCredentialsError } from "@/domain/forum/application/use-cases/errors/wrong-credentials-error";
import { Public } from "@/infra/auth/public";

const authenticateBodySchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>;

@Controller("/sessions")
@Public()
export class AuthenticateController {
    constructor(private authenticateStudant: AuthenticateStudantUseCase) {}

    @Post()
    @UsePipes(new ZodValidationPipe(authenticateBodySchema))
    async handle(@Body() body: AuthenticateBodySchema) {
        const { email, password } = body;

        const result = await this.authenticateStudant.execute({
            email,
            password,
        });

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case WrongCredentialsError:
                    throw new UnauthorizedException(error.message);
                default:
                    throw new BadRequestException(error.message);
            }
        }

        const { accessToken } = result.value;

        return {
            access_token: accessToken,
        };
    }
}
