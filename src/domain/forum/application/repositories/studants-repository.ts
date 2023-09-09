import { Stundant } from "../../enterprise/entities/studant";

export abstract class StudantsRepository {
    abstract findByEmail(email: string): Promise<Stundant | null>;
    abstract create(studant: Stundant): Promise<void>;
}
