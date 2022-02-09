"use strict";

const {K, Q, R, B, N, P, k, q, r, b, n, p, BLACK, WHITE, startpos, load_fen} = require("./board");

function evaluate(pos) {

	let wscore = 0;
	let bscore = 0;

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
				wscore += 900;
				break;
			case q:
				bscore += 900;
				break;
			case R:
				wscore += 500;
				break;
			case r:
				bscore += 500;
				break;
			case B:
			case N:
				wscore += 300;
				break;
			case b:
			case n:
				bscore += 300;
				break;
			case P:
				wscore += 100;
				if (i < 40) wscore += 10;
				if (i < 32) wscore += 10;
				if (i < 24) wscore += 10;
				break;
			case p:
				bscore += 100;
				if (i >= 24) bscore += 10;
				if (i >= 32) bscore += 10;
				if (i >= 40) bscore += 10;
				break;
		}
	}

	if (pos.active === WHITE) {
		return wscore - bscore;
	} else {
		return bscore - wscore;
	}
}

function evaluate_no_moves(pos, depthleft) {				// FIXME: use depthleft to adjust score
	if (pos.king_in_check()) {
		return -90000000;
	}
	return 0;
}

function alphaBetaMax(pos, alpha, beta, depthleft) {
	if (depthleft <= 0) {
		return evaluate(pos);
	}
	let moves = pos.movegen();
	if (moves.length === 0) {
		return evaluate_no_moves(pos, depthleft);
	}
	for (let move of moves) {
		let score = alphaBetaMin(pos.move(move), alpha, beta, depthleft - 1);
		if (score >= beta) {
			return beta;
		}
		if (score > alpha) {
			alpha = score;
		}
	}
	return alpha;
}

function alphaBetaMin(pos, alpha, beta, depthleft) {
	if (depthleft <= 0) {
		return -evaluate(pos);
	}
	let moves = pos.movegen();
	if (moves.length === 0) {
		return -evaluate_no_moves(pos, depthleft);
	}
	for (let move of moves) {
		let score = alphaBetaMax(pos.move(move), alpha, beta, depthleft - 1);
		if (score <= alpha) {
			return alpha;
		}
		if (score < beta) {
			beta = score;
		}
	}
	return beta;
}

function search(pos, depth = 4) {

	let moves = pos.movegen();

	if (moves.length === 0) {
		throw new Error("No moves");
	}

	let best = "";
	let best_score = -Infinity;

	for (let move of moves) {
		let score = -alphaBetaMax(pos.move(move), -Infinity, Infinity, depth - 1);
		// console.log(move, score);
		if (score > best_score) {
			best = move;
			best_score = score;
		}
	}

	return best;
}

function search_fen(fen, depth = 4) {
	return search(load_fen(fen), depth);
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

module.exports = {
	evaluate, search, search_fen, game
};
