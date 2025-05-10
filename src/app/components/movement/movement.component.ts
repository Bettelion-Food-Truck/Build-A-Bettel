import { Component, effect, Signal } from '@angular/core';
import { Movement, Part } from '@models/part.model';
import { Position } from '@models/position.model';
import { AssetDataService } from '@services/asset-data/asset-data.service';
import { ModelDataService } from '@services/model-data/model-data.service';

@Component({
  selector: 'app-movement',
  imports: [],
  templateUrl: './movement.component.html',
  styleUrl: './movement.component.scss'
})
export class MovementComponent {

  // TODO should this move elsewhere and provide a default object that way?
  readonly DEFAULT_POSITION = {
    "x": 0,
    "y": 0,
    "scale": 1
  };

  readonly MOVEMENT_BASE = 10; // 10px

  private selectedPositions: Signal<Position[]>;

  upPotential: boolean = false;
  downPotential: boolean = false;
  leftPotential: boolean = false;
  rightPotential: boolean = false;

  constructor(
    private assetData: AssetDataService,
    private modelData: ModelDataService
  ) {
    this.selectedPositions = this.modelData.getItemsPositions();

    effect(() => {
      let selectedPart = this.modelData.getActivePart()();

      if (selectedPart === undefined || selectedPart < 0) {
        return;
      }

      const position = this.modelData.getItemsPosition(selectedPart);

      if (!position) {
        this.modelData.setItemsPosition(
          selectedPart,
          {
            x: this.DEFAULT_POSITION.x,
            y: this.DEFAULT_POSITION.y,
            scale: this.DEFAULT_POSITION.scale
          }
        );
      }

      this.updateMovementButtons();
    });
  }

  moveUp() {

    if (!this.upPotential) {
      return;
    }

    let position = this.modelData.getItemsPosition(this.modelData.getActivePart()());

    position.y -= this.MOVEMENT_BASE * this.getMovementScale();

    this.modelData.setItemsPosition(this.modelData.getActivePart()(), position);

    this.checkMoveLimits();
  }

  moveDown() {

    if (!this.downPotential) {
      return;
    }

    let position = this.modelData.getItemsPosition(this.modelData.getActivePart()());

    position.y += this.MOVEMENT_BASE * this.getMovementScale();

    this.modelData.setItemsPosition(this.modelData.getActivePart()(), position);

    this.checkMoveLimits();
  }

  moveLeft() {

    if (!this.leftPotential) {
      return;
    }

    let position = this.modelData.getItemsPosition(this.modelData.getActivePart()());

    position.x -= this.MOVEMENT_BASE * this.getMovementScale();

    this.modelData.setItemsPosition(this.modelData.getActivePart()(), position);

    this.checkMoveLimits();
  }

  moveRight() {

    if (!this.rightPotential) {
      return;
    }

    let position = this.modelData.getItemsPosition(this.modelData.getActivePart()());

    position.x += this.MOVEMENT_BASE * this.getMovementScale();

    this.modelData.setItemsPosition(this.modelData.getActivePart()(), position);

    this.checkMoveLimits();
  }

  reset() {

    let position = this.modelData.getItemsPosition(this.modelData.getActivePart()());

    position.x = this.DEFAULT_POSITION.x;
    position.y = this.DEFAULT_POSITION.y;

    this.modelData.setItemsPosition(this.modelData.getActivePart()(), position);

    this.checkMoveLimits();
  }

  getMovementScale(): number {

    let selectedPart = this.modelData.getActivePart()();
    const movement = this.assetData.getParts()()[selectedPart].movement as Movement;

    return (movement.scale ? movement.scale : 1);
  }

  checkMoveLimits() {

    let selectedPart = this.modelData.getActivePart()();
    const part = this.assetData.getPart(selectedPart);

    if (!part || !part.movement) {
      return;
    }

    const movement = part.movement as Movement;

    let position = this.modelData.getItemsPosition(this.modelData.getActivePart()());

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

    this.modelData.setItemsPosition(this.modelData.getActivePart()(), position);

    this.updateMovementButtons();
  }

  updateMovementButtons() {
    // TODO change to computed

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
}
