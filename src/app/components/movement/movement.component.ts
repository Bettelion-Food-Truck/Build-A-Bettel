import { Component, effect, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { Movement } from '@models/part.model';
import { Position, DEFAULT_POSITION } from '@models/position.model';

import { AssetDataService } from '@services/asset-data/asset-data.service';
import { LogService } from '@services/log/log.service';
import { ModelDataService } from '@services/model-data/model-data.service';

enum movementmentOptions {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}

@Component({
  selector: 'app-movement',
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './movement.component.html',
  styleUrl: './movement.component.scss'
})
export class MovementComponent {

  readonly MOVEMENT_OPTIONS = movementmentOptions;
  readonly MOVEMENT_BASE = 10; // 10px
  movementScaleAdjustment: number = 1;

  private readonly initialMovementDelay: number = 500; // ms
  private readonly movementInterval: number = 50; // ms
  private movementPressId: any = null;

  private selectedPositions: Signal<Position[]>;

  upPotential: boolean = false;
  downPotential: boolean = false;
  leftPotential: boolean = false;
  rightPotential: boolean = false;
  scaleDecreasePotential: boolean = true;
  scaleIncreasePotential: boolean = true;

  private lastSelectedPart: number = -1;

  constructor(
    private logger: LogService,
    private assetData: AssetDataService,
    private modelData: ModelDataService
  ) {
    this.selectedPositions = this.modelData.getItemPositions();

    effect(() => {
      let selectedPart = this.modelData.getActivePart()();

      if (selectedPart === undefined || selectedPart < 0) {
        return;
      }

      this.updateMovementButtons();

      if (this.lastSelectedPart !== selectedPart) {

        this.lastSelectedPart = selectedPart;
        this.movementScaleAdjustment = 1;
      }
    });
  }

  startPress(event: MouseEvent | TouchEvent, movement: movementmentOptions) {

    if (!this.movementPressId) {
      this.logger.debug("MovementComponent: startPress()", movement, event);

      this.handleMouseAction(movement);

      this.movementPressId = setTimeout(() => {
        // Wait for initial delay before starting movement

        this.movementPressId = setInterval(() => {

          this.handleMouseAction(movement);

        }, this.movementInterval);
      }, this.initialMovementDelay);
    }
  }

  endPress(event: MouseEvent | TouchEvent, movement: movementmentOptions) {

    if (this.movementPressId) {
      this.logger.debug("MovementComponent: endPress()", movement, event);

      clearInterval(this.movementPressId);
      clearTimeout(this.movementPressId);
      this.movementPressId = null;
    }
  }

  handleMouseAction(movement: movementmentOptions) {

    switch (movement) {
      case movementmentOptions.UP:
        this.moveUp();
        break;
      case movementmentOptions.DOWN:
        this.moveDown();
        break;
      case movementmentOptions.LEFT:
        this.moveLeft();
        break;
      case movementmentOptions.RIGHT:
        this.moveRight();
        break;
    }
  }

  private moveUp() {
    this.logger.debug("MovementComponent: moveUp()", this.upPotential);

    if (!this.upPotential) {
      return;
    }

    let position = this.modelData.getItemPosition(this.modelData.getActivePart()());

    position.y -= this.MOVEMENT_BASE * this.getMovementScale();

    this.modelData.setItemPosition(this.modelData.getActivePart()(), position);

    this.checkMoveLimits();
  }

  private moveDown() {
    this.logger.debug("MovementComponent: moveDown()", this.downPotential);

    if (!this.downPotential) {
      return;
    }

    let position = this.modelData.getItemPosition(this.modelData.getActivePart()());

    position.y += this.MOVEMENT_BASE * this.getMovementScale();

    this.modelData.setItemPosition(this.modelData.getActivePart()(), position);

    this.checkMoveLimits();
  }

  private moveLeft() {
    this.logger.debug("MovementComponent: moveLeft()", this.leftPotential);

    if (!this.leftPotential) {
      return;
    }

    let position = this.modelData.getItemPosition(this.modelData.getActivePart()());

    position.x -= this.MOVEMENT_BASE * this.getMovementScale();

    this.modelData.setItemPosition(this.modelData.getActivePart()(), position);

    this.checkMoveLimits();
  }

  private moveRight() {
    this.logger.debug("MovementComponent: moveRight()", this.rightPotential);

    if (!this.rightPotential) {
      return;
    }

    let position = this.modelData.getItemPosition(this.modelData.getActivePart()());

    position.x += this.MOVEMENT_BASE * this.getMovementScale();

    this.modelData.setItemPosition(this.modelData.getActivePart()(), position);

    this.checkMoveLimits();
  }

  decreaseMovementScale() {
    this.logger.debug("MovementComponent: decreaseMovementScale()");

    this.movementScaleAdjustment = this.movementScaleAdjustment * 0.5;

    this.checkScalePotential();
  }

  increaseMovementScale() {
    this.logger.debug("MovementComponent: increaseMovementScale()");

    this.movementScaleAdjustment = this.movementScaleAdjustment * 2;

    this.checkScalePotential();
  }

  reset() {
    this.logger.debug("MovementComponent: reset()");

    let position: Position = this.modelData.getItemPosition(this.modelData.getActivePart()()) ?? {} as Position;

    position.x = DEFAULT_POSITION.x;
    position.y = DEFAULT_POSITION.y;

    this.modelData.setItemPosition(this.modelData.getActivePart()(), position);

    this.movementScaleAdjustment = 1;

    this.checkMoveLimits();
    this.checkScalePotential();
  }

  getMovementScale(): number {
    this.logger.debug("MovementComponent: getMovementScale()");

    let selectedPart = this.modelData.getActivePart()();
    const movement = this.assetData.getParts()()[selectedPart].movement as Movement;

    return (movement.scale ? movement.scale : 1) * this.movementScaleAdjustment * (this.movementPressId ? 0.5 : 1);
  }

  checkMoveLimits() {
    this.logger.debug("MovementComponent: checkMoveLimits()");

    let selectedPart = this.modelData.getActivePart()();
    const part = this.assetData.getPart(selectedPart);

    if (!part || !part.movement) {
      return;
    }

    const movement = part.movement as Movement;

    let position = this.modelData.getItemPosition(this.modelData.getActivePart()());

    if (movement.y && movement.y.min && position.y < movement.y.min) {

      position.y = movement.y.min;
    }

    if (movement.y && movement.y.max && position.y > movement.y.max) {

      position.y = movement.y.max;
    }

    if (movement.x && movement.x.min && position.x < movement.x.min) {

      position.x = movement.x.min;
    }

    if (movement.x && movement.x.max && position.x > movement.x.max) {

      position.x = movement.x.max;
    }

    this.modelData.setItemPosition(this.modelData.getActivePart()(), position);

    this.updateMovementButtons();
  }

  updateMovementButtons() {
    this.logger.debug("MovementComponent: updateMovementButtons()");

    let selectedPart = this.modelData.getActivePart()();

    const part = this.assetData.getPart(selectedPart);

    if (!part || !part.movement) {
      return;
    }

    const movement = part.movement as Movement;
    const position = (this.selectedPositions()[selectedPart] ?? {}) as Position;

    if (!movement.y) {
      // Axis is disabled, disable buttons

      this.upPotential = false;
      this.downPotential = false;
    } else if (Object.keys(movement.y).length === 0) {
      // No limits

      this.upPotential = true;
      this.downPotential = true;
    } else {
      // Check position vs limits

      this.upPotential = !(movement.y.min && position.y <= movement.y.min);
      this.downPotential = !(movement.y.max && position.y >= movement.y.max);
    }

    if (!movement.x) {
      // Axis is disabled, disable buttons

      this.leftPotential = false;
      this.rightPotential = false;
    } else if (Object.keys(movement.x).length === 0) {
      // No limits

      this.leftPotential = true;
      this.rightPotential = true;
    } else {
      // Check position vs limits

      this.leftPotential = !(movement.x.min && position.x <= movement.x.min);
      this.rightPotential = !(movement.x.max && position.x >= movement.x.max);
    }
  }

  private checkScalePotential() {
    this.logger.debug("MovementComponent: checkScalePotential()");

    this.scaleDecreasePotential = this.movementScaleAdjustment > 0.125;
    this.scaleIncreasePotential = this.movementScaleAdjustment < 16;
  }
}
