import { Item } from './item.model';

export interface Part {
    name: string;
    layer: string;
    folder: string;

    icon: string;
    alttext: string;

    noneAllowed: boolean;
    noneThumbnail: string | null;

    hideFromPartsList: boolean;

    movement: Movement | null;
    colorMode: string | null;
    colors: Color[];

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

export interface Color {
    name: string;
    hex: string;
    transparency: number;
}