import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

import { LogService } from '@services/log/log.service';
import { SortContributorImagesPipe } from '@pipes/sort-contrib-images/sort-contributors-images.pipe';

import { CONTRIBUTOR_PATH } from '@data/paths';

import data from '@data/credits.json';
import { Group, Contributor } from '@models/credits.model';

import { DialogType } from '@components/dialogs/dialogs.enum';

@Component({
  selector: 'app-info',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    CommonModule,
    SortContributorImagesPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent {
  readonly dialogRef = inject(MatDialogRef<InfoComponent>);

  readonly types = DialogType;

  contributors: Group[] = [];
  fullList: Contributor[] = [];

  constructor(private logger: LogService) { }

  ngOnInit() {

    this.logger.info('InfoComponent: ngOnInit()');

    this.processCredits(data);
  }

  /**
   * Process the JSON data.
   */
  processCredits(data: any) {
    this.logger.info('InfoComponent: processCredits()');

    this.contributors = data.roles.map((role: any) => {

      let group: Group = {
        name: role.name ?? "",
        section: role.section ?? "",
        contributors: []
      } as Group;

      if (group.section.length > 0 && data[group.section]) {
        group.contributors = data[group.section].map((contributor: any) => {
          return {
            name: contributor.name ?? "",
            image: contributor.image ? `${CONTRIBUTOR_PATH}${contributor.image}` : "",
            social: contributor.social ?? "",
            credits: contributor.credits ?? [],
            imageWeight: contributor.imageWeight ?? 0,
            weight: contributor.weight ?? 0
          } as Contributor;
        });
      }

      return group;
    });

    this.fullList = [];

    this.contributors.forEach((group: Group) => {

      this.fullList.push(...group.contributors);
    });
  }
}
