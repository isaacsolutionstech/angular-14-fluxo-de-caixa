import { Observable, map } from "rxjs";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { environment } from "src/environments/environment";
import type { CurrencyResponse } from "../models/currency.model";

@Injectable({
	providedIn: "root",
})
export class CurrencyService {
	private apiUrl = environment.apiUrl;

	constructor(private http: HttpClient) {}

	getExchangeRate(): Observable<number> {
		return this.http
			.get<CurrencyResponse>(this.apiUrl)
			.pipe(map((response) => Number.parseFloat(response.USDBRL.bid)));
	}

	convertToDollar(value: number): Observable<number> {
		return this.getExchangeRate().pipe(map((rate) => value / rate));
	}
}
