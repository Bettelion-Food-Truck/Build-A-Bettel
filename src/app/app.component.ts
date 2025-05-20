import { Component, computed, effect, HostListener, inject, Injector, isDevMode, signal, Signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { CanvasComponent } from "@components/canvas/canvas.component";

import { PartsComponent } from "@components/parts/parts.component";
import { ItemsComponent } from "@components/items/items.component";

import { ZoomComponent } from '@components/zoom/zoom.component';

import { MovementComponent } from '@components/movement/movement.component';
import { PaletteComponent } from "@components/palette/palette.component";
import { OutfitsComponent } from "@components/outfits/outfits.component";
import { PromptComponent } from "@components/prompt/prompt.component";

import { InfoComponent } from '@components/dialogs/info/info.component';
import { CreditsComponent } from '@components/dialogs/credits/credits.component';
import { IntroductionComponent } from '@components/dialogs/introduction/introduction.component';
import { DialogType } from '@components/dialogs/dialogs.enum';

import { LogService } from '@services/log/log.service';

import { Part } from '@models/part.model';
import { Outfit } from '@models/outfit.model';

import { AssetDataService } from '@services/asset-data/asset-data.service';
import { ModelDataService } from '@services/model-data/model-data.service';
import { LoadingComponent } from "./components/loading/loading.component";
import { OutfitDataService } from '@services/outfit-data/outfit-data.service';
import { LogLevel } from '@services/log/log-entry.model';
import { PromptService } from '@services/prompt/prompt.service';
import { WebPService } from '@services/web-p/web-p.service';
import { SaveStateService } from '@services/save-state/save-state.service';

enum AppComponentState {
  Movement,
  Items,
  Outfits
}

@Component({
  selector: 'app-root',
  imports: [
    MatButtonModule,
    MatIconModule,

    CanvasComponent,
    PartsComponent,
    ItemsComponent,
    ZoomComponent,
    MovementComponent,
    PaletteComponent,
    OutfitsComponent,
    LoadingComponent,
    PromptComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  title = 'Build-A-Bettel';

  readonly dialog = inject(MatDialog);

  private injector = inject(Injector);
  private partSignal: Signal<Part[]>;
  private outfitSignal: Signal<Outfit[]>;
  imageDataString: Signal<string>;
  private activePart: Signal<number>;

  potentialPalette: Signal<boolean> = computed(() => {

    if (this.isInvalidActivePart()) {
      return false;
    }

    const part: Part = this.partSignal()[this.activePart()];

    return part.colors.length > 0;
  });

  potentialMovement: Signal<boolean> = computed(() => {

    if (this.isInvalidActivePart()) {
      return false;
    }

    const part: Part = this.partSignal()[this.activePart()];

    return !(!part || !part.movement || Object.keys(part.movement).length === 0);
  });

  featuresEnabled: Signal<boolean> = computed(() => {

    if (this.isInvalidActivePart()) {
      return false;
    }

    const item: number = this.modalData.getSelectedItem(this.activePart());

    return item >= 0;
  });

  private componentState: WritableSignal<AppComponentState> = signal(AppComponentState.Outfits);

  outfitsHidden: Signal<boolean> = computed(() => {

    console.log(this.activePart(), this.componentState(), AppComponentState.Outfits);

    if (this.activePart() && this.activePart() >= 0) {
      // activePart is set and not -1 (which is outfits)
      return true;
    }

    return this.componentState() !== AppComponentState.Outfits;
  });

  itemsHidden: Signal<boolean> = computed(() => {

    if (this.isInvalidActivePart()) {
      return true;
    }

    return this.componentState() !== AppComponentState.Items;
  });

  movementHidden: Signal<boolean> = computed(() => {

    if (this.isInvalidActivePart()) {
      return true;
    }

    return this.componentState() !== AppComponentState.Movement;
  });

  constructor(
    private webPService: WebPService,
    private assetData: AssetDataService,
    private outfitData: OutfitDataService,
    private modalData: ModelDataService,
    private saveState: SaveStateService,
    private prompt: PromptService,
    private logger: LogService
  ) {

    if (isDevMode()) {
      // Enable up to Info level logging in dev mode
      this.logger.level = LogLevel.Info;

      // Debug level when trying to find strange behaviors
      // this.logger.level = LogLevel.Debug;
    } else {
      this.logger.level = LogLevel.Error;
    }

    this.partSignal = this.assetData.getParts();
    this.outfitSignal = this.outfitData.getOutfits();
    this.activePart = this.modalData.getActivePart();
    this.imageDataString = this.modalData.getImageEncoded();

    effect(() => {
      this.logger.debug(`AppComponent: partChangeEffect() ${this.activePart()}`);

      if (this.activePart() === -1) {

        this.showOutfits();
      } else if (this.activePart() >= 0) {

        this.showItems();
      } else {

        this.logger.warn(`AppComponent: partChangeEffect() activePart state unknown.`, this.activePart());
      }
    });

    effect(() => {
      this.logger.debug("AppComponent: selectedItemsChangeEffect()");

      // TODO set up to call on movement change finish
      // TODO set up to call on color change

      this.saveState.saveState();
    });
  }

  ngOnInit() {
    this.logger.debug("AppComponent: ngOnInit()");

    // Show credits on initial load in production mode
    if (!isDevMode()) {
      this.showIntro();
    }

    // Initial load
    const initialLoadEffect = effect(() => {
      this.logger.debug(`AppComponent: initialLoadEffect() ${this.partSignal().length}`);

      if (this.partSignal().length > 0) {

        // Load game into a default outfit
        if (this.outfitSignal().length > 0) {

          this.modalData.selectOutfit(this.outfitSignal()[0])
        } else {

          this.modalData.reset();
        }

        // Initially visible part
        for (let i = 0; i < this.partSignal().length; i++) {
          if (this.partSignal()[i].hideFromPartsList) {
            continue;
          }

          this.modalData.setActivePart(-1);
          break;
        }

        initialLoadEffect.destroy();
      }
    }, {
      injector: this.injector,
      manualCleanup: true
    });
  }

  toggleMovement() {
    this.logger.debug("AppComponent: toggleMovement()");

    if (!this.potentialMovement() || !this.featuresEnabled()) {
      return;
    }

    if (this.movementHidden()) {
      this.showMovement();
    } else {
      this.showItems();
    }
  }

  private showOutfits() {
    this.componentState.set(AppComponentState.Outfits);
  }

  private showItems() {
    this.componentState.set(AppComponentState.Items);
  }

  private showMovement() {
    this.componentState.set(AppComponentState.Movement);
  }

  reset() {
    this.logger.debug("AppComponent: reset()");

    this.modalData.reset();

    if (this.outfitsHidden()) {
      this.showItems();
    } else {
      this.showOutfits();
    }
  }

  @HostListener('document:keydown.control.z')
  @HostListener('document:keydown.meta.z')
  onUndo() {

    this.saveState.undo();
  }

  @HostListener('document:keydown.control.y')
  @HostListener('document:keydown.control.shift.z')
  @HostListener('document:keydown.meta.shift.z')
  onRedo() {

    this.saveState.redo();
  }

  generatePrompt() {
    this.logger.debug("AppComponent: generatePrompt()");

    this.prompt.generateRandomPrompt();
  }

  showIntro() {
    this.logger.debug("AppComponent: showInfo()");

    const dialogRef = this.dialog.open(IntroductionComponent);

    dialogRef.afterClosed().subscribe(result => {

      this.showDialog(result);
    });
  }

  showInfo() {
    this.logger.debug("AppComponent: showInfo()");

    const dialogRef = this.dialog.open(InfoComponent);

    dialogRef.afterClosed().subscribe(result => {

      this.showDialog(result);
    });
  }

  showCredits() {
    this.logger.debug("AppComponent: showCredits()");

    const dialogRef = this.dialog.open(CreditsComponent);

    dialogRef.afterClosed().subscribe(result => {

      this.showDialog(result);
    });
  }

  private showDialog(type: string) {
    this.logger.debug("AppComponent: showDialog()");

    switch (type) {
      case DialogType.Credits:
        this.showCredits();
        break;
      case DialogType.Info:
        this.showInfo();
        break;
      case DialogType.Intro:
        this.showIntro();
        break;
    }
  }

  isInvalidActivePart() {

    return !this.partSignal() ||
      this.activePart() < 0 ||
      this.partSignal().length < this.activePart()
  }
}
