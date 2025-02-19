import { Controller } from "@nestjs/common";
import { TicketService } from "../services/ticket.service";
import { GrpcMethod, RpcException } from "@nestjs/microservices";
import { Metadata, ServerUnaryCall } from "@grpc/grpc-js";
import { Ticket } from "../entities/ticket.entity";
import { TicketDto } from "../dtos/ticket.dto";
import { PaginateQueryDto } from "src/shared-modules/dtos/paginate-query.dto";
import { Paginated, PaginateQuery } from "nestjs-paginate";
import { PaginatedTickets } from "../dtos/paginated-tickets.dto";
import { EmailDto } from "../dtos/email.dto";
import { CountDto } from "../dtos/count.dto";
import { TicketsNumber } from "../dtos/tickets-number.dto";
import { IdDto } from "../dtos/id.dto";


@Controller()
export class TicketController {
    constructor(
        private ticketService: TicketService,
    ) { }

    @GrpcMethod("TicketService", "saveOrUpdate")
    async saveOrUpdate(ticket: any, metadata: Metadata, call: ServerUnaryCall<Ticket, Ticket>): Promise<Ticket> {
        let ticketSaved: Ticket | undefined = await this.ticketService.saveOrUpdate(ticket);
        if (!ticketSaved) {
            throw new RpcException("SAVE OR UPDATE FAILED");
        }
        return ticketSaved;
    }

    @GrpcMethod("TicketService", "delete")
    async delete(ticketDto: TicketDto, metadata: Metadata, call: ServerUnaryCall<TicketDto, Ticket>): Promise<Ticket> {
        let ticketDeleted: Ticket | undefined = await this.ticketService.delete(ticketDto.ticketId);
        if (!ticketDeleted) {
            throw new RpcException("DELETE FAILED");
        }
        return ticketDeleted;
    }

    @GrpcMethod("TicketService", "find")
    async find(queryDto: PaginateQueryDto, metadata: Metadata, call: ServerUnaryCall<PaginateQueryDto, PaginatedTickets>): Promise<PaginatedTickets> {
        let query : PaginateQuery= { path: "localhost:80" };//queryDto.query 
        let tickets: Paginated<Ticket> | undefined = await this.ticketService.find(query);
        if (!tickets) {
            throw new RpcException("FIND FAILED");
        }
        let response: PaginatedTickets = {
            elementsNumber: tickets.meta.totalItems,
            tickets: tickets.data
        };
        for(let ticket of response.tickets){
            ticket.flightDate = ticket.flightDate?.getTime();
        }
        return response;
    }

    @GrpcMethod("TicketService", "findAllByUser")
    async findAllByUser(userId: IdDto, metadata: Metadata, call: ServerUnaryCall<IdDto, PaginatedTickets>): Promise<PaginatedTickets> {
        let tickets: Ticket[] | undefined = await this.ticketService.findAllByUser(userId.id);
        if (!tickets) {
            throw new RpcException("FIND ALL FAILED");
        }
        let response: PaginatedTickets = {
            elementsNumber: tickets.length,
            tickets: tickets
        };
        for(let ticket of response.tickets){
            ticket.flightDate = ticket.flightDate?.getTime();
        }
        return response;
    }

    @GrpcMethod("TicketService", "findOne")
    async findOne(ticketDto: TicketDto, metadata: Metadata, call: ServerUnaryCall<TicketDto, Ticket>): Promise<Ticket> {
        let ticket: Ticket | undefined = await this.ticketService.findOne(ticketDto);
        console.log(ticket);
        if (!ticket) {
            throw new RpcException("FIND ONE FAILED");
        }
        return ticket;
    }

    @GrpcMethod("TicketService", "generateTicket")
    async generateTicket(ticketDto: TicketDto, metadata: Metadata, call: ServerUnaryCall<TicketDto, EmailDto>): Promise<EmailDto> {
        let emailTemplate: EmailDto | undefined = await this.ticketService.generateTicket(ticketDto);
        if (!emailTemplate) {
            throw new RpcException("GENERATE TICKET FAILED");
        }
        return emailTemplate;
    }

    @GrpcMethod("TicketService", "countTickets")
    async countTickets(countDto: CountDto, metadata: Metadata, call: ServerUnaryCall<CountDto, TicketsNumber>): Promise<TicketsNumber> {
        let counter: number | undefined = await this.ticketService.countTickets(countDto.flightId, countDto.departureDate);
        if(counter!>=0){
            let response: TicketsNumber = {ticketsNumber: counter!};
            return response;
        }else{
            throw new RpcException("COUNT TICKET FAILED");
        }
    }
}