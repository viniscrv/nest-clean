import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { StudantFactory } from "test/factories/make-studant";

describe("Upload attachments (E2E)", () => {
    let app: INestApplication;
    let studantFactory: StudantFactory;
    let jwt: JwtService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudantFactory],
        }).compile();

        app = moduleRef.createNestApplication();

        studantFactory = moduleRef.get(StudantFactory);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    test("[POST] /attachments", async () => {
        const user = await studantFactory.makePrismaStudant();

        const accessToken = jwt.sign({ sub: user.id.toString() });

        const response = await request(app.getHttpServer())
            .get("/attachments")
            .set("Authorization", `Bearer ${accessToken}`)
            .attach("file", "./test/e2e/test.jpg");

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            attachmentId: expect.any(String),
        });
    });
});
