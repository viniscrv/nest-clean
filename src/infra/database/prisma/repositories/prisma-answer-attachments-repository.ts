import { AnswerAttachmentsRepository } from "@/domain/forum/application/repositories/answer-attachments-repository";
import { AnswerAttachment } from "@/domain/forum/enterprise/entities/answer-attachment";
import { Injectable } from "@nestjs/common";
import { PrismaAnswerAttachmentMapper } from "../mappers/prisma-answer-attachment-mapper";
import { PrismaService } from "../prisma.service";

@Injectable()
export class PrismaAnswerAttachmentsRepository
    implements AnswerAttachmentsRepository
{
    constructor(private prisma: PrismaService) {}

    async findManyByAnswerId(answerId: string): Promise<AnswerAttachment[]> {
        const answerAttachemnts = await this.prisma.attachment.findMany({
            where: {
                answerId,
            },
        });

        return answerAttachemnts.map(PrismaAnswerAttachmentMapper.toDomain);
    }

    async createMany(attachments: AnswerAttachment[]): Promise<void> {
        if (attachments.length === 0) {
            return;
        }

        const attachmentsIds = attachments.map((attachment) => {
            return attachment.id.toString();
        });

        const data =
            PrismaAnswerAttachmentMapper.toPrismaUpdateMany(attachments);

        await this.prisma.attachment.updateMany(data);
    }
    async deleteMany(attachments: AnswerAttachment[]): Promise<void> {
        if (attachments.length === 0) {
            return;
        }

        const attachmentsIds = attachments.map((attachment) => {
            return attachment.id.toString();
        });

        await this.prisma.attachment.deleteMany({
            where: {
                id: {
                    in: attachmentsIds,
                },
            },
        });
    }

    async deleteManyByAnswerId(answerId: string): Promise<void> {
        await this.prisma.attachment.deleteMany({
            where: {
                answerId,
            },
        });
    }
}
