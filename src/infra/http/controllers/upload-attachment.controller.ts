import {
    Controller,
    FileTypeValidator,
    MaxFileSizeValidator,
    ParseFilePipe,
    Post,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("/attachments")
export class UploadAttachmentController {
    // constructor() {}

    @Post()
    @UseInterceptors(FileInterceptor("file"))
    async handle(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }),
                    new FileTypeValidator({ fileType: ".(png|jpg|jgep|pdf)" }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {}
}
