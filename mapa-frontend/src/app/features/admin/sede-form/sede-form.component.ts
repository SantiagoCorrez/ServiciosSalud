import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sede-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sede-form.component.html',
  styleUrls: ['./sede-form.component.scss']
})
export class SedeFormComponent implements OnInit {
  @Input() sede: any = {};
  @Input() municipalities: any[] = [];
  @Output() formSubmit = new EventEmitter<any>();
  sedeForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.sedeForm = this.fb.group({
      name: ['', Validators.required],
      municipalityId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.sede) {
      this.sedeForm.patchValue(this.sede);
    }
  }

  onSubmit(): void {
    if (this.sedeForm.valid) {
      this.formSubmit.emit(this.sedeForm.value);
    }
  }
}
