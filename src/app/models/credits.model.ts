export interface Group {
    name: string;
    section: string;

    contributors?: Contributor[];
}

export interface Contributor {
    name: string;
    image?: string;

    handle?: string;
    title?: string;

    responsibilities?: string;
}