import { InjectRepository } from "@nestjs/typeorm";
import { Booking } from "../entities/booking.entity";
import { Repository } from "typeorm";

export class BookingRepository extends Repository<Booking> {
    constructor(
        @InjectRepository(Booking)
        private repository: Repository<Booking>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }


}