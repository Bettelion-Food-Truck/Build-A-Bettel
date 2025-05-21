import { Directive, HostListener, output } from '@angular/core';

@Directive({
  selector: '[konami]'
})
export class KonamiCodeDirective {

  konami = output();

  private code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  private codeIndex = 0;

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {

    if (this.code[this.codeIndex] === event.key) {

      this.codeIndex++;

      if (this.codeIndex === this.code.length) {

        this.konami.emit();
        this.codeIndex = 0;
      }
    } else {

      this.codeIndex = 0;
    }
  }
}