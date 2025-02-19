import { IsDefined, IsNumber, IsOptional } from "class-validator";
import { Ticket } from "../entities/ticket.entity";

export class PaginatedTickets {

    @IsNumber()
    @IsOptional()
    elementsNumber?: number;

    @IsDefined({ each: true })
    tickets!: any[]
}