import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwTest } from './sw-test';

describe('SwTest', () => {
  let component: SwTest;
  let fixture: ComponentFixture<SwTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
