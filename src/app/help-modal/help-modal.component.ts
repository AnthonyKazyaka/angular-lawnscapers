import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-help-modal',
  templateUrl: './help-modal.component.html',
  styleUrls: ['./help-modal.component.css']
})

export class HelpModalComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public helpContext: string) {}

  ngOnInit(): void {
  }

}
