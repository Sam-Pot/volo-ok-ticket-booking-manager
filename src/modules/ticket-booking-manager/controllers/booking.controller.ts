import { Controller } from "@nestjs/common";
import { PaginateQueryDto } from "../../../shared-modules/dtos/paginate-query.dto";
import { BookingDto } from "../dtos/booking.dto";
import { Metadata, ServerUnaryCall } from "@grpc/grpc-js";
import { Booking } from "../entities/booking.entity";
import { GrpcMethod, RpcException } from "@nestjs/microservices";
import { PaginatedBookings } from "../dtos/paginated-bookings.dto";
import { Paginated, PaginateQuery } from "nestjs-paginate";
import { BookingService } from "../services/booking.service";

@Controller()
export class BookingController {

    constructor(
        private bookingService: BookingService,
    ) { }

    @GrpcMethod("BookingService", "saveOrUpdate")
    async saveOrUpdate(booking: any, metadata: Metadata, call: ServerUnaryCall<Booking, Booking>): Promise<Booking> {
        let bookingSaved: Booking | undefined = await this.bookingService.saveOrUpdate(booking);
        if (!bookingSaved) {
            throw new RpcException("SAVE OR UPDATE FAILED");
        }
        return bookingSaved;
    }

    @GrpcMethod("BookingService", "delete")
    async delete(bookingDto: BookingDto, metadata: Metadata, call: ServerUnaryCall<BookingDto, Booking>): Promise<Booking> {
        let bookingDeleted: Booking | undefined = await this.bookingService.delete(bookingDto);
        if (!bookingDeleted) {
            throw new RpcException("DELETE FAILED");
        }
        return bookingDeleted;
    }

    @GrpcMethod("BookingService", "find")
    async find(queryDto: PaginateQueryDto, metadata: Metadata, call: ServerUnaryCall<PaginateQueryDto, PaginatedBookings>): Promise<PaginatedBookings> {
        //let query : PaginateQuery= { path: "http://localhost:80" };//queryDto.query 
        //let bookings: Paginated<Booking> | undefined = await this.bookingService.find(query);
        let bookings: Booking[] | undefined = await this.bookingService.findAll();
        if (!bookings) {
            throw new RpcException("FIND FAILED");
        }
        let response: PaginatedBookings = {
            elementsNumber: bookings.length,
            bookings: bookings
        };
        for(let booking of response.bookings){
            booking.expirationDate = booking.expirationDate?.getTime();
        }
        return response;
    }

    @GrpcMethod("BookingService", "findOne")
    async findOne(bookingDto: BookingDto, metadata: Metadata, call: ServerUnaryCall<BookingDto, Booking>): Promise<Booking> {
        let booking: Booking | undefined = await this.bookingService.findOne(bookingDto);
        if (!booking) {
            throw new RpcException("FIND ONE FAILED");
        }
        return booking;
    }
}