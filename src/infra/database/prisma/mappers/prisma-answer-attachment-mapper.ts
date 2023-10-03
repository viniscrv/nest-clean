import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { AnswerAttachment } from "@/domain/forum/enterprise/entities/answer-attachment";
import { Prisma, Attachment as PrismaAttachment } from "@prisma/client";

export class PrismaAnswerAttachmentMapper {
    static toDomain(raw: PrismaAttachment): AnswerAttachment {
        if (!raw.questionId) {
            throw new Error("Invalid attachment type.");
        }

        return AnswerAttachment.create(
            {
                attachmentId: new UniqueEntityID(raw.id),
                answerId: new UniqueEntityID(raw.questionId),
            },
            new UniqueEntityID(raw.id),
        );
    }

    static toPrismaUpdateMany(
        attachments: AnswerAttachment[],
    ): Prisma.AttachmentUpdateManyArgs {
        const attachmentsIds = attachments.map((attachment) => {
            return attachment.attachmentId.toString();
        });

        return {
            where: {
                id: {
                    in: attachmentsIds,
                },
            },
            data: {
                answerId: attachments[0].answerId.toString(),
            },
        };
    }
}
