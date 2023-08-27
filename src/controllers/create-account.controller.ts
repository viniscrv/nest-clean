import { ConflictException } from "@nestjs/common";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Controller("/accounts")
export class CreateAccountController {
    constructor(private prisma: PrismaService) {}

    @Post()
    @HttpCode(201)
    async handle(@Body() body: any) {
        const { name, email, password } = body;

        const userWithSameEmal = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (userWithSameEmal) {
            throw new ConflictException(
                "User with same e-mail address already exists.",
            );
        }

        await this.prisma.user.create({
            data: {
                name,
                email,
                password,
            },
        });
    }
}
