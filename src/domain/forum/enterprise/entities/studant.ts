import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

interface StudantProps {
    name: string;
    email: string;
    password: string;
}

export class Stundant extends Entity<StudantProps> {
    get name() {
        return this.props.name;
    }
    get email() {
        return this.props.email;
    }
    get password() {
        return this.props.password;
    }

    static create(props: StudantProps, id?: UniqueEntityID) {
        const studant = new Stundant(props, id);

        return studant;
    }
}
