const wc = require("./witness_calculator.js");

export async function generateWitness(input) {
	const response = await fetch('/withdraw.wasm');
	const buffer = await response.arrayBuffer();
	let buff;

	await wc(buffer).then(async witnessCalculator => {
		// const w = await witnessCalculator.calculateWitness(input, 0);
		// for (let i = 0; i < w.length; i++) {
		// 	console.log(w[i]);
		// }
		buff = await witnessCalculator.calculateWTNSBin(input, 0);
	});

	return buff;
}
