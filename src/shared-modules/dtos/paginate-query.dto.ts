import { IsDefined, IsOptional, IsString } from "class-validator";

export class PaginateQueryDto{
    @IsString()
    query!:string;
}