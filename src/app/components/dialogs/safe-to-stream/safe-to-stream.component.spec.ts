import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SafeToStreamComponent } from './safe-to-stream.component';

describe('SafeToStreamComponent', () => {
  let component: SafeToStreamComponent;
  let fixture: ComponentFixture<SafeToStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SafeToStreamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SafeToStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
