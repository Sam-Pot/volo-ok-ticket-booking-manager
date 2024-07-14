import { IsNumber, IsString } from "class-validator";

export class CountDto {
    @IsString()
    flightId!: string;
    @IsNumber()
    departureDate!: number;
}