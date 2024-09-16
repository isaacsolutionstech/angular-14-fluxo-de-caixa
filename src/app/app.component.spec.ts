import { ReactiveFormsModule } from "@angular/forms";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AppComponent } from "./app.component";

describe("AppComponent", () => {
	let component: AppComponent;
	let fixture: ComponentFixture<AppComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AppComponent],
			imports: [ReactiveFormsModule],
		}).compileComponents();

		fixture = TestBed.createComponent(AppComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("deve criar o componente", () => {
		expect(component).toBeTruthy();
	});

	it("deve inicializar com o mês atual", () => {
		const currentDate = new Date();
		expect(component.currentMonth.getMonth()).toBe(currentDate.getMonth());
		expect(component.currentMonth.getFullYear()).toBe(
			currentDate.getFullYear(),
		);
	});

	it("deve adicionar uma nova entrada", () => {
		const initialEntriesLength = component.entries.length;
		component.entryForm.setValue({
			description: "Teste",
			amount: "100",
			type: "income",
		});
		component.onSubmit();
		expect(component.entries.length).toBe(initialEntriesLength + 1);
	});

	it("deve editar uma entrada existente", () => {
		component.entryForm.setValue({
			description: "Entrada Original",
			amount: "100",
			type: "income",
		});
		component.onSubmit();
		const originalEntry = component.entries[0];
		component.editEntry(0);
		component.entryForm.patchValue({
			description: "Entrada Editada",
			amount: "200",
		});
		component.onSubmit();
		expect(component.entries[0].description).toBe("Entrada Editada");
		expect(component.entries[0].amount).toBe(200);
		expect(component.entries[0].type).toBe("income");
	});

	it("deve calcular o total de receitas corretamente", () => {
		component.entries = [
			{
				date: new Date(),
				amount: 100,
				description: "Receita 1",
				type: "income",
			},
			{
				date: new Date(),
				amount: 200,
				description: "Receita 2",
				type: "income",
			},
			{
				date: new Date(),
				amount: 50,
				description: "Despesa 1",
				type: "expense",
			},
		];
		expect(component.totalIncome).toBe(300);
	});

	it("deve calcular o total de despesas corretamente", () => {
		component.entries = [
			{
				date: new Date(),
				amount: 100,
				description: "Receita 1",
				type: "income",
			},
			{
				date: new Date(),
				amount: 200,
				description: "Despesa 1",
				type: "expense",
			},
			{
				date: new Date(),
				amount: 50,
				description: "Despesa 2",
				type: "expense",
			},
		];
		expect(component.totalExpense).toBe(250);
	});

	it("deve calcular o saldo total corretamente", () => {
		component.entries = [
			{
				date: new Date(),
				amount: 300,
				description: "Receita 1",
				type: "income",
			},
			{
				date: new Date(),
				amount: 200,
				description: "Despesa 1",
				type: "expense",
			},
			{
				date: new Date(),
				amount: 100,
				description: "Receita 2",
				type: "income",
			},
		];
		expect(component.total).toBe(200);
	});

	it("deve formatar valores para BRL corretamente", () => {
		expect(component.formatToBRL(1234.56)).toBe("R$ 1.234,56");
	});

	it("deve mudar para o mês anterior", () => {
		const initialMonth = component.currentMonth.getMonth();
		component.previousMonth();
		expect(component.currentMonth.getMonth()).toBe(
			(initialMonth - 1 + 12) % 12,
		);
	});

	it("deve mudar para o próximo mês", () => {
		const initialMonth = component.currentMonth.getMonth();
		component.nextMonth();
		expect(component.currentMonth.getMonth()).toBe((initialMonth + 1) % 12);
	});

	it("deve resetar para o mês atual", () => {
		component.nextMonth();
		component.resetToCurrentMonth();
		const currentDate = new Date();
		expect(component.currentMonth.getMonth()).toBe(currentDate.getMonth());
		expect(component.currentMonth.getFullYear()).toBe(
			currentDate.getFullYear(),
		);
	});
});
