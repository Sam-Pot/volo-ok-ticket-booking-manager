import { number } from "joi";
import { CustomBaseEntity } from "src/shared-modules/database/entities/custom-base.entity";
import { Column, Entity, Index, ManyToOne } from "typeorm";
import { TicketState } from "../configs/ticket-state";
import { IsDefined, IsNumber, IsOptional, IsString } from "class-validator";
import { Booking } from "./booking.entity";

@Entity()
export class Ticket extends CustomBaseEntity {

    @Column()
    @IsString()
    @IsOptional()
    passengerName?: string;

    @Column()
    @IsString()
    @IsOptional()
    passengerSurname?: string;

    @Column()
    @IsString()
    fareId!: string;

    @Column()
    @IsString()
    @Index()
    @IsOptional()
    customerCode?: string;

    @Column()
    @IsNumber()
    price!: number;

    @Column()
    @IsNumber()
    @Index()
    @IsOptional()
    generatedPoints?: number;

    @Column()
    @IsNumber()
    @IsOptional()
    usedPoints?: number;

    @Column()
    @IsString()
    flightId!: string;

    @Column()
    @IsDefined()
    state!: TicketState

    @Column()
    @IsNumber()
    @Index()
    flightDate!: number;

    @IsOptional()
    @IsString()
    @ManyToOne(() => Booking, (booking) => booking.tickets, { nullable: true })
    bookingId?: string;

    @Column()
    @IsOptional()
    userId?: string;

    @Column()
    @IsString()
    from!: string;

    @Column()
    @IsString()
    to!: string;
}