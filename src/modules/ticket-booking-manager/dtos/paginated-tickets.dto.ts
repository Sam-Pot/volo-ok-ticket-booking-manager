import { IsDefined, IsNumber } from "class-validator";
import { Ticket } from "../entities/ticket.entity";

export class PaginatedTickets {

    @IsNumber()
    elementsNumber!: number;

    @IsDefined({ each: true })
    tickets!: Ticket[]
}