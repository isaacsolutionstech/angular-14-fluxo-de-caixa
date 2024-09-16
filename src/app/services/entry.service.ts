import { of } from "rxjs";
import type { Observable } from "rxjs";
import { Injectable } from "@angular/core";

import type { Entry } from "../models/entry.model";

@Injectable({
	providedIn: "root",
})
export class EntryService {
	private entries: Entry[] = [];
	private nextId = 1;

	getEntries(): Observable<Entry[]> {
		return of(this.entries);
	}

	getEntry(id: number): Observable<Entry | undefined> {
		const entry = this.entries.find((e) => e.id === id);
		return of(entry);
	}

	getEntriesByDateRange(startDate: Date, endDate: Date): Observable<Entry[]> {
		return of(this.entries.filter(entry => {
			const entryDate = new Date(entry.date);
			return entryDate >= startDate && entryDate <= endDate;
		}));
	}

	createEntry(entry: Omit<Entry, "id">): Observable<Entry> {
		const newEntry = { ...entry, id: this.nextId++ };
		this.entries.push(newEntry);
		return of(newEntry);
	}

	updateEntry(
		id: number,
		entry: Partial<Entry>,
	): Observable<Entry | undefined> {
		const index = this.entries.findIndex((e) => e.id === id);
		if (index !== -1) {
			this.entries[index] = { ...this.entries[index], ...entry };
			return of(this.entries[index]);
		}
		return of(undefined);
	}

	deleteEntry(id: number): Observable<boolean> {
		const initialLength = this.entries.length;
		this.entries = this.entries.filter((e) => e.id !== id);
		return of(this.entries.length !== initialLength);
	}
}
