import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedTypesListComponent } from './bed-types-list.component';

describe('BedTypesListComponent', () => {
  let component: BedTypesListComponent;
  let fixture: ComponentFixture<BedTypesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedTypesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedTypesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
