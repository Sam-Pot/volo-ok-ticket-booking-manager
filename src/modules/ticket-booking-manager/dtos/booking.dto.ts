import { IsString } from "class-validator";

export class BookingDto {

    @IsString()
    bookingId!: string;

    @IsString()
    userId!: string;
}