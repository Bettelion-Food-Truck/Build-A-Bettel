import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

import PromptJSONData from '@data/prompts.json';

@Injectable({
  providedIn: 'root'
})
export class PromptService {

  readonly activities: string[] = PromptJSONData.activities;
  readonly targets: string[] = PromptJSONData.targets;

  private lastPrompt: WritableSignal<string> = signal('');

  constructor() { }

  getLastPrompt(): Signal<string> {

    return this.lastPrompt.asReadonly();
  }

  wipePrompt() {
    this.lastPrompt.set('');
  }

  generateRandomPrompt() {

    const target: string = this.targets[Math.floor(Math.random() * this.targets.length)];
    const activity: string = this.activities[Math.floor(Math.random() * this.activities.length)];

    this.lastPrompt.set(
      `${activity} with ${target}`
    );
  }
}
