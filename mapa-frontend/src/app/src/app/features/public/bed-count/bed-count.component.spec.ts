import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedCountComponent } from './bed-count.component';

describe('BedCountComponent', () => {
  let component: BedCountComponent;
  let fixture: ComponentFixture<BedCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedCountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
