import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from "@angular/common/http";

import { AppComponent } from "./app.component";

@NgModule({
	providers: [],
	bootstrap: [AppComponent],
	declarations: [AppComponent],
	imports: [BrowserModule, HttpClientModule, ReactiveFormsModule],
})
export class AppModule {}
