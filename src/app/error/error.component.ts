import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  templateUrl: './error.component.html'
})
export class ErrorComponent {
  // Inject the data passed from the dialog open call
  constructor(@Inject(MAT_DIALOG_DATA) public data: { message: string }) {}
}
