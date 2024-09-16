import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import type { Entry } from "./models/entry.model";
import { EntryService } from "./services/entry.service";
import { CurrencyService } from "./services/currency.service";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
	public editingIndex = -1;
	public isLoading = false;
	public entryForm: FormGroup;
	public entries: Entry[] = [];
	public currentMonthDisplay = "";
	public suggestions: string[] = [];
	public currentMonth: Date = new Date();
	public editingEntry: Entry | null = null;

	private _totalIncome = 0;
	private _totalExpense = 0;

	private readonly monthNames: string[] = [
		"Janeiro",
		"Fevereiro",
		"Março",
		"Abril",
		"Maio",
		"Junho",
		"Julho",
		"Agosto",
		"Setembro",
		"Outubro",
		"Novembro",
		"Dezembro",
	];

	constructor(
		private fb: FormBuilder,
		private entryService: EntryService,
		private currencyService: CurrencyService,
	) {
		this.entryForm = this.initForm();
		this.updateCurrentMonthDisplay();
	}

	ngOnInit(): void {
		this.loadEntries();
		this.entryForm.get("description")?.valueChanges.subscribe((value) => {
			this.updateSuggestions(value);
		});
	}

	public onSubmit(): void {
		if (this.entryForm.valid) {
			const formValue = this.entryForm.value;
			if (this.isEditing && this.editingEntry) {
				if (this.editingEntry.id) {
					this.updateEntry(this.editingEntry.id, formValue);
				} else {
					console.error("Tentativa de atualizar uma entrada sem ID");
				}
			} else {
				this.addEntry(formValue);
			}
		}
	}

	public deleteEntry(index: number): void {
		const entry = this.entries[index];
		if (entry && entry.id) {
			this.entryService.deleteEntry(entry.id).subscribe(
				() => {
					this.entries = this.entries.filter((e) => e.id !== entry.id);
					if (this.editingEntry && this.editingEntry.id === entry.id) {
						this.cancelEdit();
					}
					this.calculateTotals();
				},
				(error) => {
					console.error("Erro ao excluir entrada:", error);
				},
			);
		}
	}

	public previousMonth(): void {
		this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
		this.updateCurrentMonthDisplay();
		this.loadEntries();
	}

	public nextMonth(): void {
		this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
		this.updateCurrentMonthDisplay();
		this.loadEntries();
	}

	public resetToCurrentMonth(): void {
		this.currentMonth = new Date();
		this.updateCurrentMonthDisplay();
		this.loadEntries();
	}

	public abs(value: number): number {
		return Math.abs(value);
	}

	public resetForm(): void {
		this.entryForm.reset({ type: "income" });
		this.finishEditing();
	}

	public editEntry(entry: Entry) {
		this.editingEntry = { ...entry };
		this.entryForm.patchValue({
			type: entry.type,
			date: entry.date,
			amount: entry.amount,
			description: entry.description,
			amountInDollar: entry.amountInDollar,
		});
	}

	public cancelEdit(): void {
		this.editingEntry = null;
		this.entryForm.reset({ type: "income" });
	}

	public selectSuggestion(suggestion: string) {
		const selectedEntry = this.entries.find(
			(entry) => entry.description === suggestion,
		);
		if (selectedEntry) {
			this.entryForm.patchValue({
				description: selectedEntry.description,
				amount: selectedEntry.amount,
				type: selectedEntry.type,
			});
		} else {
			this.entryForm.patchValue({ description: suggestion });
		}
		this.suggestions = [];
	}

	public updateSuggestions(event: Event) {
		const inputElement = event?.target as HTMLInputElement;
		const value = inputElement?.value;

		if (value && value.length > 1) {
			console.log(this.entries, value);
			this.suggestions = this.entries
				.map((entry) => entry.description)
				.filter(
					(description, index, self) =>
						self.indexOf(description) === index &&
						description.toLowerCase().includes(value.toLowerCase()),
				)
				.slice(0, 5);
		} else {
			this.suggestions = [];
		}
	}

	public get filteredEntries(): Entry[] {
		return this.entries.filter(
			(entry) =>
				entry.date &&
				new Date(entry.date).getMonth() === this.currentMonth.getMonth() &&
				new Date(entry.date).getFullYear() === this.currentMonth.getFullYear(),
		);
	}

	public get totalIncome(): number {
		return this._totalIncome;
	}

	public get totalExpense(): number {
		return this._totalExpense;
	}

	public get total(): number {
		return this.totalIncome - this.totalExpense;
	}

	public get isEditing(): boolean {
		return this.editingEntry !== null;
	}

	public get balance(): number {
		return this.totalIncome - this.totalExpense;
	}

	public get formTitle(): string {
		return this.isEditing
			? `Editando: ${this.editingEntry?.description}`
			: "Nova Entrada";
	}

	private initForm(): FormGroup {
		return this.fb.group({
			description: ["", Validators.required],
			amount: ["", [Validators.required, Validators.min(0)]],
			type: ["income", Validators.required],
		});
	}

	private updateCurrentMonthDisplay(): void {
		const month = this.monthNames[this.currentMonth.getMonth()];
		const year = this.currentMonth.getFullYear();
		this.currentMonthDisplay = `${month}/${year}`;
	}

	private calculateTotals(): void {
		const currentMonthEntries = this.filteredEntries;
		this._totalIncome = currentMonthEntries
			.filter((entry) => entry.type === "income")
			.reduce((sum, entry) => sum + entry.amount, 0);
		this._totalExpense = currentMonthEntries
			.filter((entry) => entry.type === "expense")
			.reduce((sum, entry) => sum + entry.amount, 0);
	}

	private loadEntries() {
		this.isLoading = true;
		this.entryService.getEntries().subscribe(
			(entries: Entry[]) => {
				this.entries = entries;
				this.calculateTotals();
				this.isLoading = false;
			},
			(error) => {
				console.error("Erro ao carregar entradas:", error);
				this.isLoading = false;
			},
		);
	}

	private addEntry(entry: Omit<Entry, "id">) {
		this.currencyService
			.convertToDollar(entry.amount)
			.subscribe((amountInDollar) => {
				const newEntry = {
					...entry,
					amountInDollar,
					date: this.getDateForCurrentMonth(entry.date),
				};
				this.entryService.createEntry(newEntry).subscribe(
					(createdEntry) => {
						const existingEntryIndex = this.entries.findIndex(
							(e) => e.id === createdEntry.id,
						);
						if (existingEntryIndex !== -1) {
							this.entries[existingEntryIndex] = createdEntry;
						} else {
							this.entries.push(createdEntry);
						}
						this.calculateTotals();
						this.entryForm.reset({ type: "income" });
					},
					(error) => {
						console.error("Erro ao adicionar entrada:", error);
					},
				);
			});
	}

	private getDateForCurrentMonth(date?: Date): Date {
		const newDate = date ? new Date(date) : new Date();
		newDate.setFullYear(this.currentMonth.getFullYear());
		newDate.setMonth(this.currentMonth.getMonth());
		return newDate;
	}

	private updateEntry(id: number, entry: Entry) {
		const updatedEntry = {
			...entry,
			date: this.getDateForCurrentMonth(entry.date),
		};
		this.entryService.updateEntry(id, updatedEntry).subscribe(
			(updatedEntry) => {
				const index = this.entries.findIndex((e) => e.id === id);
				if (index !== -1) {
					this.entries[index] = updatedEntry as Entry;
				}
				this.calculateTotals();
				this.cancelEdit();
			},
			(error) => {
				console.error("Erro ao atualizar entrada:", error);
			},
		);
	}

	private finishEditing(): void {
		this.editingIndex = -1;
	}
}
