import { Injectable } from "@nestjs/common";
import { BookingRepository } from "../repositories/booking.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Booking } from "../entities/booking.entity";
import { TicketRepository } from "../repositories/ticket.repository";
import { Transactional } from "typeorm-transactional";
import { BookingState } from "../configs/booking-state";
import { TicketState } from "../configs/ticket-state";
import { paginate, Paginate, Paginated, PaginateQuery } from "nestjs-paginate";
import { BookingDto } from "../dtos/booking.dto";
import { DeleteResult } from "typeorm";

@Injectable()
export class BookingService {

    private readonly EXPIRE_DAYS = 3; //3 days before the nearest flight
    private readonly BOOKING_EXPIRE_DAYS_MILLIS = (this.EXPIRE_DAYS * 24 * 60 * 60 * 1000);

    constructor(
        @InjectRepository(BookingRepository)
        private readonly bookingRepository: BookingRepository,
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
        } else {
            //SAVE CASE
            bookingToSave = booking;
            bookingToSave.state = BookingState.OPEN;
            for (let ticket of bookingToSave.tickets) {
                ticket.state = TicketState.BOOKED;
            }
        }
        //SET EXPIRING DATE
        let flightDates: number[] = [];
        for (let ticket of booking.tickets) {
            flightDates.push(ticket.flightDate);
        }
        let nearestFlightDate: Date = new Date(Math.min(...flightDates) - this.BOOKING_EXPIRE_DAYS_MILLIS);
        bookingToSave.expirationDate = nearestFlightDate;
        try {
            return await this.bookingRepository.save(bookingToSave);
        } catch (e) {
            return undefined;
        }
    }

    async find(@Paginate() query: PaginateQuery): Promise<Paginated<Booking> | undefined> {
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
                select: ["createdAt", "updatedAt", "id", "state", "expirationDate", "userId", "tickets"],
                defaultSortBy: [['id', 'ASC']],
            });
        } catch (e) {
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
    async delete(bookingDto: BookingDto): Promise<Booking | undefined>{
        try{
            let bookingToDelete: Booking | null = await this.bookingRepository.findOneBy(
                {
                    id:bookingDto.bookingId,
                    userId:bookingDto.userId
                }
            );
            if(!bookingToDelete){
                return undefined;
            }
            let deleted: DeleteResult = await this.bookingRepository.delete(bookingToDelete);
            return bookingToDelete;
        }catch(e){
            return undefined;
        }
    }
    
}