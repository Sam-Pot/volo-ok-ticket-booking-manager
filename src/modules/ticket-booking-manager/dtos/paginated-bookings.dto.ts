import { IsDefined, IsNumber } from "class-validator";
import { Booking } from "../entities/booking.entity";

export class PaginatedBookings {

    @IsNumber()
    elementsNumber!: number;

    @IsDefined({ each: true })
    bookings!: Booking[]
}