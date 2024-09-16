export interface Currency {
	low: string;
	bid: string;
	ask: string;
	code: string;
	name: string;
	high: string;
	codein: string;
	varBid: string;
	pctChange: string;
	timestamp: string;
	create_date: string;
}

export interface CurrencyResponse {
	USDBRL: Currency;
}
