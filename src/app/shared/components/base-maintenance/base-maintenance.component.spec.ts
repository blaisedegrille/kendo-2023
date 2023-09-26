import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseMaintenanceComponent } from './base-maintenance.component';

describe('BaseMaintenanceComponent', () => {
  let component: BaseMaintenanceComponent;
  let fixture: ComponentFixture<BaseMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BaseMaintenanceComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
