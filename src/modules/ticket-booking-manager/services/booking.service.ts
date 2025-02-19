import { Injectable } from "@nestjs/common";
import { BookingRepository } from "../repositories/booking.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Booking } from "../entities/booking.entity";
import { Transactional } from "typeorm-transactional";
import { BookingState } from "../configs/booking-state";
import { TicketState } from "../configs/ticket-state";
import { paginate, Paginate, Paginated, PaginateQuery } from "nestjs-paginate";
import { BookingDto } from "../dtos/booking.dto";
import { DeleteResult } from "typeorm";
import { TicketRepository } from "../repositories/ticket.repository";

@Injectable()
export class BookingService {

    private readonly EXPIRE_DAYS = 3; //3 days before the nearest flight
    private readonly BOOKING_EXPIRE_DAYS_MILLIS = (this.EXPIRE_DAYS * 24 * 60 * 60 * 1000);

    constructor(
        @InjectRepository(BookingRepository)
        private readonly bookingRepository: BookingRepository,
        @InjectRepository(TicketRepository)
        private readonly ticketRepository: TicketRepository,
    ) { }

    @Transactional()
    async saveOrUpdate(booking: Booking): Promise<Booking | undefined> {
        if (!booking) {
            return undefined;
        }
        let bookingToSave: Booking | null;
        //UPDATE CASE
        if (booking.id) {
            bookingToSave = await this.bookingRepository.findOneBy({ id: booking.id });
            if (!bookingToSave || bookingToSave.state == BookingState.CONFIRMED
                || bookingToSave.state == BookingState.EXPIRED) {
                return undefined;
            }
            bookingToSave.state = booking.state;
            bookingToSave.tickets = booking.tickets;
            /*for (let t of bookingToSave.tickets) {
                t.customerCode = t.customerCode?t.customerCode: "";
                t.generatedPoints = t.generatedPoints?t.generatedPoints: 0;
                t.usedPoints = t.usedPoints?t.usedPoints: 0;
                t.flightDate =new Date(t.flightDate);
                t.userId = bookingToSave.userId;
                await this.ticketRepository.save(t);
            }*/
        } else {
            //SAVE CASE
            bookingToSave = booking;
            bookingToSave.state = BookingState.OPEN;
            for (let ticket of bookingToSave.tickets) {
                ticket.state = TicketState.BOOKED;
            }
            /*for (let t of bookingToSave.tickets) {
                t.customerCode = t.customerCode?t.customerCode: "";
                t.generatedPoints = t.generatedPoints?t.generatedPoints: 0;
                t.usedPoints = t.usedPoints?t.usedPoints: 0;
                t.flightDate = new Date(t.flightDate);
                t.userId = bookingToSave.userId;
                await this.ticketRepository.save(t);
            }*/
        }
        //SET EXPIRING DATE
        let flightDates: number[] = [];
        for (let ticket of booking.tickets) {
            ticket.customerCode = ticket.customerCode ? ticket.customerCode : "";
            ticket.usedPoints = ticket.usedPoints ? ticket.usedPoints : 0;
            ticket.userId = booking.userId;
            flightDates.push(new Date(ticket.flightDate).getTime());
            ticket.flightDate = new Date(ticket.flightDate);
        }
        let nearestFlightDate: Date = new Date(Math.min(...flightDates) - this.BOOKING_EXPIRE_DAYS_MILLIS);
        bookingToSave.expirationDate = nearestFlightDate;
        try {
            return await this.bookingRepository.save(bookingToSave);
        } catch (e) {
            return undefined;
        }
    }

    async findAll(): Promise<Booking[] | undefined>{
        try{
            let bookings: Booking[] | null = await this.bookingRepository.find();
            return bookings;
        }catch(e){
            return undefined;
        }
    }

    async find(query: PaginateQuery): Promise<Paginated<Booking> | undefined> {
        try {
            return await paginate(query, this.bookingRepository, {
                sortableColumns: [
                    'id',
                    'updatedAt',
                    'createdAt',
                    'state',
                    'expirationDate'
                ],
                filterableColumns: {
                    'id': true,
                    'updatedAt': true,
                    'createdAt': true,
                    'state': true,
                    'expirationDate': true,
                    'userId': true,
                    'tickets': true
                },
                searchableColumns: ["createdAt", "updatedAt", "id", "state", "expirationDate", "userId", "tickets"],
                select: ["createdAt", "updatedAt", "id", "state", "expirationDate", "userId"],
                defaultSortBy: [['id', 'ASC']],
            });
        } catch (e) {
            console.log(e);
            return undefined;
        }
    }

    async findOne(bookingDto: BookingDto): Promise<Booking | undefined> {
        try {
            let response: Booking | null = await this.bookingRepository.findOneBy(
                {
                    id: bookingDto.bookingId,
                    userId: bookingDto.userId
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
    async delete(bookingDto: BookingDto): Promise<Booking | undefined> {
        try {
            let bookingToDelete: Booking | null = await this.bookingRepository.findOneBy(
                {
                    id: bookingDto.bookingId,
                    userId: bookingDto.userId
                }
            );
            if (!bookingToDelete) {
                return undefined;
            }
            /*for(let ticket of bookingToDelete.tickets){
                let t =await this.ticketRepository.delete(ticket);
                console.log(t);
            }
            bookingToDelete = await this.bookingRepository.findOneBy(
                {
                    id: bookingDto.bookingId,
                    userId: bookingDto.userId
                }
            );
            console.log(bookingToDelete);*/
            await this.bookingRepository.delete({id: bookingToDelete.id});
            return bookingToDelete;
        } catch (e) {
            console.log(e);
            return undefined;
        }
    }

}