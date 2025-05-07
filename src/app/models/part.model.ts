import { Item } from './item.model';

export interface Part {
    name: string;

    layer: string | null;
    folder: string;
    path: string;

    icon: string;

    noneAllowed: boolean;
    hideFromPartsList: boolean;

    movement: Object | null;
    colorMode: string | null;
    colors: string[];

    items: Item[];
}