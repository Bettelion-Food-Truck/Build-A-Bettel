import { Injectable } from '@angular/core';

import PromptJSONData from '@data/prompts.json';

@Injectable({
  providedIn: 'root'
})
export class PromptService {

  readonly activities: string[] = PromptJSONData.activities;
  readonly targets: string[] = PromptJSONData.targets;

  constructor() { }

  getRandomPrompt(): string {

    const target: string = this.targets[Math.floor(Math.random() * this.targets.length)];
    const activity: string = this.activities[Math.floor(Math.random() * this.activities.length)];

    return `${activity} with ${target}`;
  }
}
