export interface Group {
    name: string;
    section: string;

    contributors: Contributor[];
}

export interface Contributor {
    name: string;

    image?: string;
    social?: string;

    credits?: string[];

    weight: number;
}