import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { hash } from "bcryptjs";
import request from "supertest";
import { StudantFactory } from "test/factories/make-studant";

describe("Authenticate (E2E)", () => {
    let app: INestApplication;
    let studantFactory: StudantFactory;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudantFactory],
        }).compile();

        app = moduleRef.createNestApplication();

        studantFactory = moduleRef.get(StudantFactory);

        await app.init();
    });

    test("[POST] /sessions", async () => {
        await studantFactory.makePrismaStudant({
            email: "johndoe@exemple.com",
            password: await hash("123456", 8),
        });

        const response = await request(app.getHttpServer())
            .post("/sessions")
            .send({
                email: "johndoe@exemple.com",
                password: "123456",
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            access_token: expect.any(String),
        });
    });
});
