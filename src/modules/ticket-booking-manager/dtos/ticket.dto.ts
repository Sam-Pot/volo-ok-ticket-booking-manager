import { IsEmail, IsOptional, IsString } from "class-validator";

export class TicketDto {

    @IsString()
    ticketId!: string;

    @IsOptional()
    @IsEmail()
    userEmail?: string;
    
    @IsOptional()
    @IsString()
    userId?:string;
}