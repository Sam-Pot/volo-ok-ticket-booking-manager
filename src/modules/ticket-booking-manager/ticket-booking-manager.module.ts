import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'src/shared-modules/database/database.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { BookingController } from './controllers/booking.controller';
import { TicketController } from './controllers/ticket.controller';
import { BookingService } from './services/booking.service';
import { TicketService } from './services/ticket.service';
import { BookingRepository } from './repositories/booking.repository';
import { TicketRepository } from './repositories/ticket.repository';
import { Booking } from './entities/booking.entity';
import { Ticket } from './entities/ticket.entity';

@Module({
    imports: [
        //CONFIG MODULE
        ConfigModule.forRoot({
            //load env parameters
            load: [() => ({

            })],
            validationSchema: Joi.object({

            })
        }),
        DatabaseModule,
        TypeOrmModule.forFeature([Booking, Ticket]),      

    ],
    controllers: [BookingController, TicketController],
    providers: [BookingRepository, TicketRepository, BookingService,TicketService],
})
export class TicketBookingManager { }
