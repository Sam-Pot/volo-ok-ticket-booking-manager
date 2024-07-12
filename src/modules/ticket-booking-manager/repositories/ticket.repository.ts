import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Ticket } from "../entities/ticket.entity";

export class TicketRepository extends Repository<Ticket> {
    constructor(
        @InjectRepository(Ticket)
        private repository: Repository<Ticket>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }


}