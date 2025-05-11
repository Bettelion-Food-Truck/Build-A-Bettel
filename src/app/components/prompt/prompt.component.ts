import { Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PromptService } from '@services/prompt/prompt.service';

@Component({
  selector: 'app-prompt',
  imports: [
    CommonModule
  ],
  templateUrl: './prompt.component.html',
  styleUrl: './prompt.component.scss'
})
export class PromptComponent {

  lastPrompt: Signal<string>;

  constructor(
    private promptService: PromptService
  ) {

    this.lastPrompt = this.promptService.getLastPrompt();
  }
}
