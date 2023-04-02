import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Feedback } from '../models/Feedback';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-help-modal',
  templateUrl: './help-modal.component.html',
  styleUrls: ['./help-modal.component.css']
})
export class HelpModalComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public helpContext: string,
    private dialogRef: MatDialogRef<HelpModalComponent>,
    private databaseService: DatabaseService
  ) {}

  ngOnInit(): void {
  }

  async submitFeedback(feedbackText: string): Promise<void> {
    if (feedbackText) {
      const feedback: Feedback = {
        context: this.helpContext,
        text: feedbackText
      };

      await this.databaseService.submitFeedback(feedback);
      
      // Clear the textarea content and close the modal
      const textarea = document.getElementById('feedbackTextarea') as HTMLTextAreaElement;
      textarea.value = '';
      this.dialogRef.close();
    }
  }  
}
