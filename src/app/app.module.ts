import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { SwipeDirective } from './swipe.directive';

import { AngularFireModule } from '@angular/fire/compat/';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from '../environments/environment';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent, GameComponent, SwipeDirective],
  imports: [
    BrowserModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
