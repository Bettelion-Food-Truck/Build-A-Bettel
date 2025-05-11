import { ChangeDetectionStrategy, Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { PromptService } from '@services/prompt/prompt.service';

@Component({
  selector: 'app-prompt',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './prompt.component.html',
  styleUrl: './prompt.component.scss',
  host: {
    'class': "animated",
    '[class.show]': "lastPrompt().length > 0"
  }
})
export class PromptComponent {

  lastPrompt: Signal<string>;

  constructor(
    private promptService: PromptService
  ) {

    this.lastPrompt = this.promptService.getLastPrompt();
  }

  clearPrompt() {

    this.promptService.wipePrompt();
  }
}
