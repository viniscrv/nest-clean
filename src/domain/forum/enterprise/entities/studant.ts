import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

interface StudantProps {
    name: string;
}

export class Stundant extends Entity<StudantProps> {
    static create(props: StudantProps, id?: UniqueEntityID) {
        const studant = new Stundant(props, id);

        return studant;
    }
}
