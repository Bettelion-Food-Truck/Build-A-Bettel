import { Position } from "@models/position.model";

export interface SimpleFit {
    [key: string]: {
        item: string;
        position: Position;
        color: string;
    }
};