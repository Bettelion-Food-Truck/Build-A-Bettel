export interface Item {
    item: string;
    name: string | null;

    outfits: string[];

    layer: string | null;
    multilayer: {
        item: string,
        layer: string
    }[];

    requires: {
        part: string,
        item: string
    } | null;

    thumbnail: boolean;
    hide: boolean;

    folder: string | null;
}