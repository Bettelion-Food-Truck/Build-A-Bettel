import { Pipe, PipeTransform } from '@angular/core';
import { Contributor } from '@models/credits.model';

@Pipe({
  name: 'sortContributors'
})
export class SortContributorsPipe implements PipeTransform {

  transform(contributors: Contributor[]): Contributor[] {

    if (!contributors || contributors.length <= 1) {
      return contributors;
    }

    return [...contributors].sort((a, b) => {

      const aWeight = a.weight ?? 0;
      const bWeight = b.weight ?? 0;
      const aName = a.name ?? "";
      const bName = b.name ?? "";

      // Sort by weight first
      if (aWeight !== bWeight) {
        return aWeight - bWeight;
      }

      // If weights are equal, sort by name
      return aName.localeCompare(bName, undefined, { ignorePunctuation: true });
    });
  }
}
