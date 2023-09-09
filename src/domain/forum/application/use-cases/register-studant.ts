import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { Stundant } from "../../enterprise/entities/studant";
import { StudantsRepository } from "../repositories/studants-repository";
import { HashGenerator } from "../cryptography/hash-generator";
import { StudantAlreadyExistsError } from "./errors/studant-already-exists-error";

interface RegisterStudantUseCaseRequest {
    name: string;
    email: string;
    password: string;
}

type RegisterStudantUseCaseResponse = Either<
    StudantAlreadyExistsError,
    {
        studant: Stundant;
    }
>;

@Injectable()
export class RegisterStudantUseCase {
    constructor(
        private studantsRepository: StudantsRepository,
        private hashGenerator: HashGenerator,
    ) {}

    async execute({
        name,
        email,
        password,
    }: RegisterStudantUseCaseRequest): Promise<RegisterStudantUseCaseResponse> {
        const studantWithSameEmal =
            await this.studantsRepository.findByEmail(email);

        if (studantWithSameEmal) {
            return left(new StudantAlreadyExistsError(email));
        }

        const hashedPassword = await this.hashGenerator.hash(password);

        const studant = Stundant.create({
            name,
            email,
            password: hashedPassword,
        });

        await this.studantsRepository.create(studant);

        return right({
            studant,
        });
    }
}
