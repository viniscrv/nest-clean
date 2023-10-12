import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { NotificationFactory } from "test/factories/make-notification";
import { StudantFactory } from "test/factories/make-studant";

describe("Read Notification (E2E)", () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let studantFactory: StudantFactory;
    let notificationFactory: NotificationFactory;
    let jwt: JwtService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudantFactory, NotificationFactory],
        }).compile();

        app = moduleRef.createNestApplication();
        prisma = moduleRef.get(PrismaService);
        studantFactory = moduleRef.get(StudantFactory);
        notificationFactory = moduleRef.get(NotificationFactory);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    test("[PATCH] /notifications/:notificationId/read", async () => {
        const user = await studantFactory.makePrismaStudant({
            name: "John Doe",
        });

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const notification = await notificationFactory.makePrismaNotification({
            recipientId: user.id,
        });

        const notificationId = notification.id.toString();

        const response = await request(app.getHttpServer())
            .patch(`/notifications/${notificationId}/read`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send();

        expect(response.statusCode).toBe(200);

        const notificationOnDatabase = await prisma.notification.findFirst({
            where: {
                recipientId: user.id.toString(),
            },
        });

        expect(notificationOnDatabase?.readAt).not.toBeNull();
    });
});
