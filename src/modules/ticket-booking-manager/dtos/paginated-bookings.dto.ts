import { IsDefined, IsNumber, IsOptional } from "class-validator";
import { Booking } from "../entities/booking.entity";

export class PaginatedBookings {

    @IsNumber()
    @IsOptional()
    elementsNumber?: number;

    @IsDefined({ each: true })
    bookings!: any[]
}