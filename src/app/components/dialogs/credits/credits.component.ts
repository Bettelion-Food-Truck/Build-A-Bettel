import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { SortContributorsPipe } from 'app/pipes/sort-contrib/sort-contributors.pipe';

import { CONTRIBUTOR_PATH } from '@data/paths';

import data from '@data/credits.json';
import { Group, Contributor } from '@models/credits.model';

import { LogService } from '../../../services/log/log.service';

@Component({
  selector: 'app-info',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    CommonModule,
    MatCardModule,
    MatIcon,
    SortContributorsPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './credits.component.html',
  styleUrl: './credits.component.scss'
})
export class CreditsComponent {
  readonly dialogRef = inject(MatDialogRef<CreditsComponent>);

  contributors: Group[] = [];
  fullList: Contributor[] = [];

  constructor(private logger: LogService) { }

  ngOnInit() {

    this.logger.info('CreditsComponent: ngOnInit()');

    this.processCredits(data);
  }

  /**
   * Process the JSON data.
   */
  processCredits(data: any) {
    this.logger.info('CreditsComponent: processCredits()');

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
