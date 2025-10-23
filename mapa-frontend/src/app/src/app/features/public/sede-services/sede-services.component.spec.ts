import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SedeServicesComponent } from './sede-services.component';

describe('SedeServicesComponent', () => {
  let component: SedeServicesComponent;
  let fixture: ComponentFixture<SedeServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SedeServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SedeServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
