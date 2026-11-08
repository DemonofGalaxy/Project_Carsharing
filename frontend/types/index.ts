// --- ЭНАМЫ ---
export type CarStatus = 'AVAILABLE' | 'RENTED' | 'RESERVED' | 'MAINTENANCE' | 'BLOCKED';
export type RentalStatus = 'ACTIVE' | 'RESERVED' | 'FINISHED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type UserStatus = 'USER' | 'DISPATCHER' | 'MECHANIC' | 'ACCOUNTANT' | 'ADMIN';

// --- CAR DTOs ---
export interface CarResponseDto {
    id: number;
    brand: string;
    model: string;
    plateNumber: string;
    pricePerMinute: number;
    fuelLevel: number;
    mileAge: number;
    location: string;
    status: CarStatus;
    isActive: boolean;
}

export interface CarCreateDto {
    brand: string;
    model: string;
    plateNumber: string;
    pricePerMinute: number;
    fuelLevel?: number;
    mileAge?: number;
    location?: string;
}

export interface CarStatusUpdateDto {
    status: CarStatus;
}

export interface CarMileAgeUpdateDto {
    mileAge: number;
}

// --- RENTAL DTOs ---
export interface RentalResponseDto {
    id: number;
    userId: number;
    carId: number;
    startTime: string;
    endTime?: string | null;
    totalPrice?: number | null;
    status: RentalStatus;
    startMileage: number;
    endMileage?: number | null;
}

// --- MAINTENANCE DTOs ---
export interface MaintenanceCreateDto {
    carId: number;
    description: string;
    cost?: number;
}

export interface MaintenanceResponseDto {
    id: number;
    carId: number;
    description: string;
    cost?: number | null;
    startDate: string;
    endDate?: string | null;
    isCompleted: boolean;
}

// --- USER DTOs ---
export interface UserLoginDto {
    username: string;
    password?: string;
}

export interface UserRegisterDto {
    username: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
}

export interface UserResponseDto {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    userStatus: UserStatus;
    isActive: boolean;
}

export interface UserRoleUpdateDto {
    role: UserStatus;
}

// --- ANALYTICS DTO ---
export interface AnalyticsSummaryDto {
    totalCars: number;
    activeRentalsCount: number;
    totalRevenue: number;
    fleetUtilizationRate: number;
}
// --- PAYMENT (entity/payment/Payment.java) ---
export interface PaymentDto {
    id: number;
    rentalId: number;
    user?: string;
    amount: number;
    paymentTime: string;
    paymentMethod: string;
    status: PaymentStatus;
    car?: string;
}