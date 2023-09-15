import { BadRequestException, Body, ConflictException, Controller, HttpCode, Post, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { RegisterStudantUseCase } from "@/domain/forum/application/use-cases/register-studant";
import { StudantAlreadyExistsError } from "@/domain/forum/application/use-cases/errors/studant-already-exists-error";

const createAccountBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
});

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>;

@Controller("/accounts")
export class CreateAccountController {
    constructor(private registerStudant: RegisterStudantUseCase) {}

    @Post()
    @HttpCode(201)
    @UsePipes(new ZodValidationPipe(createAccountBodySchema))
    async handle(@Body() body: CreateAccountBodySchema) {
        const { name, email, password } = body;

        const result = await this.registerStudant.execute({
            name,
            email,
            password
        });

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case StudantAlreadyExistsError:
                    throw new ConflictException(error.message);
                default:
                    throw new BadRequestException(error.message);
            }
        }
    }
}
