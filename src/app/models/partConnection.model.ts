export interface PartConnection {
    [key: string]: {
        [key: string]: {
            part: string;
            item: string;
        }[]
    }
}