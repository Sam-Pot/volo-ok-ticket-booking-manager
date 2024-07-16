import { Injectable } from "@nestjs/common";
import { TicketRepository } from "../repositories/ticket.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Ticket } from "../entities/ticket.entity";
import { paginate, Paginate, Paginated, PaginateQuery } from "nestjs-paginate";
import { TicketDto } from "../dtos/ticket.dto";
import { Transactional } from "typeorm-transactional";
import { DeleteResult } from "typeorm";
import { EmailDto } from "../dtos/email.dto";
import { EmailTemplate } from "../configs/email-template.constants";

@Injectable()
export class TicketService {

    constructor(
        @InjectRepository(TicketRepository)
        private readonly ticketRepository: TicketRepository,
    ) { }

    async saveOrUpdate(ticket: Ticket): Promise<Ticket | undefined> {
        if (!ticket) {
            return undefined;
        }
        let ticketToSave: Ticket | null;
        if (ticket.id) {
            ticketToSave = await this.ticketRepository.findOneBy({ id: ticket.id });
            if (!ticketToSave) {
                return undefined;
            }
            //IT'S POSSIBLE TO UPDATE ONLY DATE
            ticketToSave.flightDate = new Date(ticket.flightDate);
        } else {
            ticketToSave = ticket;
        }
        ticketToSave.customerCode = ticket.customerCode ? ticket.customerCode : "";
        ticketToSave.generatedPoints = ticket.generatedPoints ? ticket.generatedPoints : 0;
        ticketToSave.usedPoints = ticket.usedPoints ? ticket.usedPoints : 0;
        ticketToSave.flightDate = ticket.flightDate ? new Date(ticket.flightDate) : new Date();
        try {
            return await this.ticketRepository.save(ticketToSave);
        } catch (e) {
            return undefined;
        }
    }

    async find(query: PaginateQuery): Promise<Paginated<Ticket> | undefined> {
        query = { path: "localhost:80" };
        try {
            return await paginate(query, this.ticketRepository, {
                sortableColumns: [
                    'id',
                    'updatedAt',
                    'createdAt',
                    'state',
                    'price',
                    'generatedPoints',
                    'usedPoints',
                ],
                filterableColumns: {
                    'id': true,
                    'updatedAt': true,
                    'createdAt': true,
                    'state': true,
                    'passengerName': true,
                    'passengerSurname': true,
                    'fareId': true,
                    'customerCode': true,
                    'price': true,
                    'generatedPoints': true,
                    'usedPoints': true,
                    'flightId': true,
                    'flightDate': true,
                    'bookingId': true,
                    'userId': true,
                },
                searchableColumns: ['id', 'updatedAt', 'createdAt', 'state', 'passengerName',
                    'passengerSurname', 'fareId', 'customerCode', 'price', 'generatedPoints',
                    'usedPoints', 'flightId', 'flightDate', 'bookingId', 'userId'],
                select: ['id', 'updatedAt', 'createdAt', 'state', 'passengerName',
                    'passengerSurname', 'fareId', 'customerCode', 'price', 'generatedPoints',
                    'usedPoints', 'flightId', 'flightDate', 'bookingId', 'userId'],
                defaultSortBy: [['id', 'ASC']],
            });
        } catch (e) {
            return undefined;
        }
    }

    async findOne(ticketDto: TicketDto): Promise<Ticket | undefined> {
        try {
            let response: Ticket | null = await this.ticketRepository.findOneBy(
                {
                    id: ticketDto.ticketId,
                    userId: ticketDto.userId
                });
            if (!response) {
                return undefined;
            }
            return response;
        } catch (e) {
            return undefined;
        }
    }

    @Transactional()
    async delete(ticketId: string): Promise<Ticket | undefined> {
        try {
            let ticketToDelete: Ticket | null = await this.ticketRepository.findOneBy(
                {
                    id: ticketId
                }
            );
            if (!ticketToDelete) {
                return undefined;
            }
            let deleted: DeleteResult = await this.ticketRepository.delete(ticketToDelete);
            return ticketToDelete;
        } catch (e) {
            return undefined;
        }
    }

    async generateTicket(ticketDto: TicketDto): Promise<EmailDto | undefined> {
        if (!ticketDto || !ticketDto.userEmail) {
            return undefined;
        }
        let ticket: Ticket | null = await this.ticketRepository.findOneBy(
            {
                id: ticketDto.ticketId,
            });
        if (!ticket) {
            return undefined;
        }
        let emailTemplate: EmailDto = {
            to: ticketDto.userEmail,
            subject: EmailTemplate.SUBJECT,
            text: EmailTemplate.TEXT,
            html: EmailTemplate.HTML
                .replace("{ID}", ticket.id!)
                .replace("{FLIGHT}", ticket.flightId)
                .replace("{FARE}", ticket.fareId)
                .replace("{FROM}", ticket.from)
                .replace("{TO}", ticket.to)
                .replace("{DEPARTURE}", new Date(ticket.flightDate).toDateString())
                .replace("{PASSENGER}", ticket.passengerName + " " + ticket.passengerSurname)
        };
        return emailTemplate;
    }

    async countTickets(flightId: string, departureDate: number): Promise<number | undefined> {
        try {
            let counter = await this.ticketRepository.countBy({ flightId: flightId, flightDate: new Date(departureDate) });
            return counter;
        } catch (e) {
            return undefined;
        }
    }
}