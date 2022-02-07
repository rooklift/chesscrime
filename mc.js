"use strict";

const {K, Q, R, B, N, P, k, q, r, b, n, p, BLACK, WHITE, startpos, load_fen} = require("./board");

function val(pos) {

	let score = 0;

	for (let i = 0; i < 64; i++) {

		let piece = pos.state[i];

		if (!piece) {
			continue;
		}

		switch (piece) {

		case K:
			break;
		case k:
			break;
		case Q:
			score += 900;
			break;
		case q:
			score += -900;
			break;
		case R:
			score += 500;
			break;
		case r:
			score += -500;
			break;
		case B:
		case N:
			score += 300;
			break;
		case b:
		case n:
			score += -300;
			break;
		case P:
			score += 100;
			break;
		case p:
			score += -100;
			break;
		}
	}

	return score + Math.random();
}

function val_terminal(pos) {
	if (pos.king_in_check()) {
		if (pos.active === WHITE) {				// White losing
			return -1000000;
		} else {
			return  1000000;
		}
	} else {
		return 0;
	}
}

function search(pos) {

	let moves = pos.movegen();

	if (moves.length === 0) {
		throw new Error("No moves");
	}

	let scores = {};

	for (let move of moves) {
		scores[move] = meta_monte(pos, move, 400, 4);
	}

	moves.sort((a, b) => {
		return scores[b] - scores[a];			// Sorts good-for-white to left
	});

	if (pos.active === WHITE) {
		return moves[0];
	} else {
		return moves[moves.length - 1];
	}

}

function meta_monte(pos, m, runs, depth) {

	// Considering all possible responses to our move mv,
	// return the worst score that the opponent can give us.

	let one = pos.move(m);

	let moves = one.movegen();

	if (moves.length === 0) {
		return val_terminal(one);
	}

	let runs_per_reply = Math.ceil(runs / moves.length);

	let highest = -Infinity;
	let lowest = Infinity;

	for (let mv of moves) {

		let score = 0;

		for (let run = 0; run < runs_per_reply; run++) {
			let two = one.move(mv);
			score += monte_carlo(two, depth - 2);
		}

		score /= runs_per_reply;		// Important so the score returned above for mates can compete

		if (score > highest) highest = score;
		if (score < lowest) lowest = score;
	}

	return (pos.active === WHITE) ? lowest : highest;
}

function monte_carlo(pos, depth) {
	for (let d = 0; d < depth; d++) {
		let moves = pos.movegen();
		if (moves.length === 0) {
			return val_terminal(pos);
		}
		pos = pos.move(random_choice(moves));
	}
	return val(pos);
}

function game() {

	let pos = startpos();

	let history = [];

	while (true) {

		if (pos.no_moves() || pos.insufficient_material()) {
			break;
		}

		let mv = search(pos);

		if (pos.active === WHITE) {
			process.stdout.write(pos.next_number_string() + " ");
		}
		process.stdout.write(pos.nice_string(mv) + " ");

		pos = pos.move(mv);

	}

	process.stdout.write("\n");
}

function random_choice(arr) {
	return arr[Math.floor(arr.length * Math.random())];
}

module.exports = {
	val, search, game
};
