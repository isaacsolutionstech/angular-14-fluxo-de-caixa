export interface Entry {
	date: Date;
	id?: number;
	amount: number;
	description: string;
	amountInDollar: number;
	type: "income" | "expense";
}
