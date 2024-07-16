import { IsNumber } from "class-validator";

export class TicketsNumber{
    @IsNumber()
    ticketsNumber!: number;
}