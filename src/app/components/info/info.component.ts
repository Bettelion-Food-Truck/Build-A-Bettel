import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

import data from '@data/credits.json';
import { Group, Contributor } from '@models/credits.model';

import { LogService } from '../../services/log/log.service';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-info',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    CommonModule
  ],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent {
  readonly dialogRef = inject(MatDialogRef<InfoComponent>);

  contributors?: Group[];

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
            image: contributor.image ?? "",
            handle: contributor.handle ?? "",
            title: contributor.title ?? "",
            responsibilities: contributor.responsibilities ?? ""
          } as Contributor;
        });
      }

      return group;
    });
  }
}
