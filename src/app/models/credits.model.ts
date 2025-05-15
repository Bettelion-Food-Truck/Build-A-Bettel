import { CONTRIBUTOR_PATH } from "@data/paths";

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

    imageWeight: number;
    weight: number;
}

export function ParseCreditJSON(contributor: any): Contributor {

    return {
        name: contributor.name ?? "",
        image: contributor.image ? `${CONTRIBUTOR_PATH}${contributor.image}` : "",
        social: contributor.social ?? "",
        credits: contributor.credits ?? [],
        imageWeight: contributor.imageWeight ?? 0,
        weight: contributor.weight ?? 0
    } as Contributor;
}