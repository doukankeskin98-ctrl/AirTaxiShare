export enum Cluster {
    MASLAK = 'MASLAK',
    LEVENT = 'LEVENT',
    ATASEHIR = 'ATASEHIR',
}

export enum TripStatus {
    PENDING = 'PENDING',
    MATCHED = 'MATCHED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
}

export const MATCH_EXPIRATION_SECONDS = 180;
export const TRIP_WINDOW_MINUTES = 15;
