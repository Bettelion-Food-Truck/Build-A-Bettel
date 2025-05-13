import { Item } from './item.model';

export interface Part {
    name: string;

    layer: string | null;
    folder: string;

    icon: string;

    noneAllowed: boolean;
    noneThumbnail: string | null;

    hideFromPartsList: boolean;

    movement: Movement | null;
    colorMode: string | null;
    colors: string[];

    items: Item[];
    assumeThumbnails: boolean;
}

export interface Movement {
    x: Limits | null;
    y: Limits | null;
    scale: number | null;
}

export interface Limits {
    min: number;
    max: number;
}