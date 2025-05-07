export interface Item {
    item: string;

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

    folder: string | null;
}