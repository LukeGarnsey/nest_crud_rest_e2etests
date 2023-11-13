import {IsOptional, IsString } from "class-validator";

export class EditBookmarkDto{
    @IsString()
    @IsOptional()
    title?:string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    link?: string;
}