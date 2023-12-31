import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBookmarkDto{
    @IsString()
    title:string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsString()
    link: string;
}