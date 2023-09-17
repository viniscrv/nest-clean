import { PaginationParams } from "@/core/repositories/pagination-params";
import { AnswersRepository } from "@/domain/forum/application/repositories/answers-respository";
import { Answer } from "@/domain/forum/enterprise/entities/answer";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class PrismaAnswersRepository implements AnswersRepository {
    constructor(private prisma: PrismaService) {}

    // async findById(id: string): Promise<Answer | null> {
    //     const answer = await this.prisma.answer.findUnique({
    //         where: {
    //             id,
    //         },
    //     });

    //     if (!answer) {
    //         return null;
    //     }

    //     return PrismaAnswerMapper.toDomain(answer);
    // }
    // async findManyByQuestionId(
    //     questionId: string,
    //     { page }: PaginationParams,
    // ): Promise<Answer[]> {
    //     const answers = await this.prisma.answer.findMany({
    //         where: {
    //             questionId,
    //         },
    //         take: 20,
    //         skip: (page - 1) * 20,
    //     });

    //     return answers.map(PrismaAnswerMapper.toDomain);
    // }
    create(answer: Answer): Promise<void> {
        throw new Error("Method not implemented.");
    }
    save(answer: Answer): Promise<void> {
        throw new Error("Method not implemented.");
    }
    delete(answer: Answer): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
