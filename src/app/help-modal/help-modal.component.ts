import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Feedback } from '../models/Feedback';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-help-modal',
  templateUrl: './help-modal.component.html',
  styleUrls: ['./help-modal.component.css']
})
export class HelpModalComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public helpContext: string, private databaseService: DatabaseService) {}

  ngOnInit(): void {
  }

  submitFeedback(feedbackText: string) {
    if (feedbackText) {
      const feedback: Feedback = {
        context: this.helpContext,
        text: feedbackText
      };
      
      this.databaseService.submitFeedback(feedback);
    }
  }  
}
