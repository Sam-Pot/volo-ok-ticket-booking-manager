import { IsBoolean, IsDate, IsDefined, IsOptional, IsString } from "class-validator";
import { CustomBaseEntity } from "src/shared-modules/database/entities/custom-base.entity";
import { Column, Entity, Index, OneToMany } from "typeorm";
import { BookingState } from "../configs/booking-state";
import { Ticket } from "./ticket.entity";

@Entity()
export class Booking extends CustomBaseEntity {
    
    @Column()
    @Index()
    @IsDefined()
    @IsOptional()
    state?: BookingState;

    @Column()
    @Index()
    @IsDate()
    @IsOptional()
    expirationDate?: Date;

    @Column()
    @IsString()
    userId!: string;

    @IsDefined({ each: true })
    @OneToMany((type) => Ticket, (ticket) => ticket.bookingId, { eager: true, cascade:true})
    tickets!: Ticket[];
}