import {rowNum, colNum} from './Constant.js';

class Coord {
	constructor(y, x) {
		this.y = y;
		this.x = x;
	}

	add(anotherCoord) {
		return new Coord(this.y + anotherCoord.y, this.x + anotherCoord.x);
	}

	minus(anotherCoord) {
		return new Coord(this.y - anotherCoord.y, this.x - anotherCoord.x);
	}

	equal(anotherCoord) {
		return (anotherCoord !== null && this.y === anotherCoord.y && this.x === anotherCoord.x);
	}

	mul(times) {
		return new Coord(this.y * times, this.x * times);
	}

	div(times) {
		return new Coord(this.y / times, this.x / times);
	}

	step(yInc, xInc) {
		return new Coord(this.y + yInc, this.x + xInc);
	}

	xDis(anotherCoord) {
		return Math.abs(this.x - anotherCoord.x);
	}

	yDis(anotherCoord) {
		return Math.abs(this.y - anotherCoord.y);
	}

	xEqual(anotherCoord) {
		return this.xDis(anotherCoord) === 0;
	}

	yEqual(anotherCoord) {
		return this.yDis(anotherCoord) === 0;
	}
};


function Chess(pieceType, pieceColor, alreadyMoved=false) {
  switch (pieceType) {
    case 'pawn': return new Pawn(pieceColor, alreadyMoved);
    case 'queen': return new Queen(pieceColor, alreadyMoved);
    case 'king': return new King(pieceColor, alreadyMoved);
    case 'rock': return new Rock(pieceColor, alreadyMoved);
    case 'bishop': return new Bishop(pieceColor, alreadyMoved);
    case 'knight': return new Knight(pieceColor, alreadyMoved);
		default: 
			const JSONPiece = pieceType;
			return Chess(JSONPiece.pieceType, JSONPiece.pieceColor, JSONPiece.alreadyMoved);
  }
};


class Board {
	constructor(data) {
		this.timestamp = data.timestamp ? data.timestamp : 1;
		if (data.squares) {
			this.squares = data.squares.map(row => row.map(obj => (obj ? Chess(obj.pieceType, obj.pieceColor, obj.alreadyMoved) : null)));
		} else {
			this.squares = data.map(row => row.map(piece => (piece ? piece.copyPiece() : null)));
		}
	}

	valeuOf() {
  	return this.timestamp; 
  }

	copyBoard() {
		return new Board(this);
	}

	equal(anotherBoard) {
		for (let y = 0; y < rowNum; y++) {
			for (let x = 0; x < colNum; x++) {
				const thisPiece = this.squares[y][x];
				const anotherPiece = anotherBoard.squares[y][x];
				if ((!thisPiece && !anotherPiece) || 
						(thisPiece && anotherPiece && thisPiece.equal(anotherPiece))) {
					continue;
				}

				console.log("board is not equal at", y, x);
				console.log("thisPiece:", thisPiece);
				console.log("anotherPiece:", anotherPiece);
				return false;
			}
		}
		return true;
	}

	isValidCoord(curPos) {
		return (curPos !== null && curPos.y >= 0 && curPos.y < rowNum && curPos.x >= 0 && curPos.x < colNum);
	}

	getPiece(curPos) {
		if (this.isValidCoord(curPos)){
			return this.squares[curPos.y][curPos.x];
		}
		return null;
	}

	getPieceCanMovePosition(curPos, lastMove) {
		if (this.isValidCoord(curPos)) {
			const piece = this.getPiece(curPos);
			const positions = piece.getCanMovePositionInGeneralRule(curPos, this);
			return piece.updateCanMovePositionInSpecialRule(curPos, this, positions, lastMove);
		}
		return [];
	}

	hasPiece(curPos) { 
		if (this.isValidCoord(curPos)) {
			return (this.squares[curPos.y][curPos.x] !== null);
		}
		return false;
	}

	hasNoPiece(curPos) {
		if (this.isValidCoord(curPos)) {
			return (this.squares[curPos.y][curPos.x] === null);
		}
		return false;
	}

	isSamePieceColor(curPos, targetPos) {
		return (this.getPiece(curPos).pieceColor === this.getPiece(targetPos).pieceColor);
	}

	isSamePieceType(curPos, pieceType) {
		return (this.getPiece(curPos).pieceType === pieceType);
	}

	canEatPiece(curPos, targetPos) {
		return (this.isValidCoord(targetPos) && this.hasPiece(targetPos) && !this.isSamePieceColor(curPos, targetPos));
	}

	setPiece(curPos, piece) {
		if (this.isValidCoord(curPos)) {
			this.squares[curPos.y][curPos.x] = piece;
		}
	}

	removePiece(curPos) {
		this.setPiece(curPos, null);
	}

	isDoingEnPassant(curPos) {
		if (this.isValidCoord(curPos)) {
			return (this.isSamePieceType(curPos, "pawn") && (curPos.y === 0 || curPos.y === rowNum - 1));
		}
		return false;
	}

	isUsingSpeicalRule(startPos, endPos) {
		const usingFirstRule = (this.isSamePieceType(startPos, "pawn") && startPos.xDis(endPos) === 1 && !this.hasPiece(endPos)) ? 1 : null;
		const usingSecondRule = (this.isSamePieceType(startPos, "king") && startPos.xDis(endPos) === 2) ? 2 : null;
		return  (usingFirstRule || usingSecondRule);
	}

	updateBoardByEnPassant(curPos, choose) {
		let copyBoard = this.copyBoard();
		const adjustingPieceColor = this.getPiece(curPos).pieceColor;
		const newPiece = (choose.yDis(curPos) === 0) ? Chess("queen", adjustingPieceColor) :
										 (choose.yDis(curPos) === 1) ? Chess("knight", adjustingPieceColor) :
										 (choose.yDis(curPos) === 2) ? Chess("rock", adjustingPieceColor) :
										 (choose.yDis(curPos) === 3) ? Chess("bishop", adjustingPieceColor) : null;
		copyBoard.setPiece(curPos, newPiece);
		return copyBoard;
	}

	updateSquaresUsingSpecialRule(whichSpecialRule, startPos, endPos) {
		let copyBoard = this.copyBoard();
		if (whichSpecialRule === 1) {
			copyBoard.removePiece(new Coord(startPos.y, endPos.x));
		} else if (whichSpecialRule === 2) {
			const dir = endPos.minus(startPos).div(2);
			const rockPos = (dir.x > 0 ? new Coord(startPos.y, colNum - 1) : new Coord(startPos.y, 0));
			copyBoard.setPiece(endPos.minus(dir), this.getPiece(rockPos));
			copyBoard.removePiece(rockPos);
		}
		return copyBoard;
	}

	updateBoardByMoving(startPos, endPos) {
		let copyBoard = this.copyBoard();
		const whichSpecialRule = this.isUsingSpeicalRule(startPos, endPos);
		if (whichSpecialRule) {
			copyBoard = this.updateSquaresUsingSpecialRule(whichSpecialRule, startPos, endPos);
		}
		copyBoard.setPiece(endPos, copyBoard.getPiece(startPos));
		copyBoard.removePiece(startPos);
		copyBoard.getPiece(endPos).setAlreadyMoved();
		return copyBoard;
	}

	updateBoardByPiece(startPos, endPos) {
		console.log('in updateBoardByPiece');
		console.log('before update, timestamp =', this.timestamp);
		let resultBoard = null;
		if (this.isDoingEnPassant(startPos)) {
			resultBoard = this.updateBoardByEnPassant(startPos, endPos);
		} else {
			resultBoard = this.updateBoardByMoving(startPos, endPos);
		}
		resultBoard.addTimestamp();
		console.log('after update, timestamp =', resultBoard.timestamp);
		return resultBoard;
	}

	mayLoose(startPos, endPos) {
		const newBoard = this.updateBoardByPiece(startPos, endPos);
		let anotherKingPosition = null;
		for (let y = 0; y < rowNum; y++) {
			for (let x = 0; x < colNum; x++) {
				const curPos = new Coord(y, x);
				if (!newBoard.hasPiece(curPos) || newBoard.isSamePieceColor(endPos, curPos)) continue;
				if (newBoard.isSamePieceType(curPos, "king")) {
					anotherKingPosition = curPos;
					continue;
				}
				const mayMovePosition = newBoard.getPieceCanMovePosition(curPos, {
					"startPos": startPos,
					"endPos": endPos,
					"piece": newBoard.getPiece(endPos),
				});
				if (mayMovePosition.some(ele => ele.equal(endPos))) return true;
			}
		}

		const directionForKing = newBoard.getPiece(anotherKingPosition).direction;
		for (let dir of directionForKing) {
			const mayMovePosition = anotherKingPosition.add(dir);
			if (mayMovePosition.equal(endPos)) return true;
		}

		return false;
	}

	addTimestamp() {
		this.timestamp += 1;
	}

};

class Piece {
	constructor(pieceColor, pieceType, alreadyMoved=false, direction=[], maxMultiple=Math.max(rowNum, colNum)) {
		this.pieceColor = pieceColor;
		this.pieceType = pieceType;
		this.alreadyMoved = alreadyMoved;
		this.direction = direction;
		this.maxMultiple = maxMultiple;
	}

	equal(anotherPiece) {
		return (this.pieceColor === anotherPiece.pieceColor &&
						this.pieceType === anotherPiece.pieceType &&
						this.alreadyMoved === anotherPiece.alreadyMoved);
	}

	getCanMovePositionInGeneralRule(curPos, board) {
		let canMovePositions = [];
		this.direction.forEach((dir) => {
			for (let times = 1; times <= this.maxMultiple; times++) {
				let nextPos = curPos.add(dir.mul(times));

				if (!board.isValidCoord(nextPos)) break;
				if (board.hasPiece(nextPos)) {
					if (board.canEatPiece(curPos, nextPos))
						canMovePositions.push(nextPos);
					break;
				}
				canMovePositions.push(nextPos);
			}
		});
		return canMovePositions;
	}

	updateCanMovePositionInSpecialRule(curPos, board, positions, lastMove) {
		return positions;
	}

	getAlreadyMoved() {
		return this.alreadyMoved;
	}

	setAlreadyMoved() {
		this.alreadyMoved = true;
	}
};

class Pawn extends Piece {
	constructor(pieceColor, alreadyMoved=false) {
		super(pieceColor, "pawn", alreadyMoved);
	}

	copyPiece() {
		return new Pawn(this.pieceColor, this.alreadyMoved);
	}

	getCanMovePositionInGeneralRule(curPos, board) {
		const startPos = (this.pieceColor === "white") ? rowNum - 2 : 1;
		const yDir = (this.pieceColor === "white") ? -1 : 1;
		const firstCoord = curPos.step(yDir, 0);
		const secondCoord = curPos.step(2 * yDir, 0);
		let canMovePositions = [];
		if (board.isValidCoord(firstCoord) && !board.hasPiece(firstCoord)){
			canMovePositions.push(firstCoord);
		}
		if (curPos.y === startPos && !board.hasPiece(firstCoord) && !board.hasPiece(secondCoord)){
			canMovePositions.push(secondCoord);
		}
		return canMovePositions;
	}

	updateCanMovePositionInSpecialRule(curPos, board, positions, lastMove) {
		const yDir = (this.pieceColor === "white") ? -1 : 1;
		const leftTopCoord = curPos.step(yDir, 1);
		const rightTopCoord = curPos.step(yDir, -1);

		let newPosition = positions.slice();
		if (board.canEatPiece(curPos, leftTopCoord)){
			newPosition.push(leftTopCoord);
		}
		if (board.canEatPiece(curPos, rightTopCoord)){
			newPosition.push(rightTopCoord);
		}
		if (lastMove && lastMove.piece.pieceType === "pawn" &&
		    lastMove.startPos.yDis(lastMove.endPos) === 2 &&
				lastMove.startPos.xDis(curPos) === 1 &&
				lastMove.endPos.yDis(curPos) === 0) {
			newPosition.push(new Coord(curPos.y + yDir, lastMove.startPos.x));
		}
		return newPosition;
	}
};

class Rock extends Piece {
	constructor(pieceColor, alreadyMoved=false) {
		const directionForRock = [new Coord(1, 0), new Coord(0, 1), new Coord(-1, 0), new Coord(0, -1)];
		super(pieceColor, "rock", alreadyMoved, directionForRock);
	}

	copyPiece() {
		return new Rock(this.pieceColor, this.alreadyMoved);
	}
}

class Bishop extends Piece {
	constructor(pieceColor, alreadyMoved=false) {
		const directionForBishop = [new Coord(1, 1), new Coord(1, -1), new Coord(-1, 1), new Coord(-1, -1)];
		super(pieceColor, "bishop", alreadyMoved, directionForBishop);
	}

	copyPiece() {
		return new Bishop(this.pieceColor, this.alreadyMoved);
	}
}

class Queen extends Piece {
	constructor(pieceColor, alreadyMoved=false) {
		const directionForQueen = [new Coord(1, 0), new Coord(0, 1), new Coord(-1, 0), new Coord(0, -1),
															 new Coord(1, 1), new Coord(1, -1), new Coord(-1, 1), new Coord(-1, -1)];
		super(pieceColor, "queen", alreadyMoved, directionForQueen);
	}

	copyPiece() {
		return new Queen(this.pieceColor, this.alreadyMoved);
	}
}

class Knight extends Piece {
	constructor(pieceColor, alreadyMoved=false) {
		const directionForKnight = [new Coord(2, 1), new Coord(-2, 1), new Coord(2, -1), new Coord(-2, -1),
																new Coord(1, 2), new Coord(1, -2), new Coord(-1, 2), new Coord(-1, -2)];
		super(pieceColor, "knight", alreadyMoved, directionForKnight, 1);
	}

	copyPiece() {
		return new Knight(this.pieceColor, this.alreadyMoved);
	}
}

class King extends Piece {
	constructor(pieceColor, alreadyMoved=false) {
		const directionForKing = [new Coord(1, 1), new Coord(-1, 1), new Coord(1, -1), new Coord(-1, -1),
															new Coord(1, 0), new Coord(0, -1), new Coord(-1, 0), new Coord(0, 1)];
		super(pieceColor, "king", alreadyMoved, directionForKing, 1);
	}

	copyPiece() {
		return new King(this.pieceColor, this.alreadyMoved);
	}

	updateCanMovePositionInSpecialRule(curPos, board, positions, lastMove) {
		positions = positions.filter(endPos => !board.mayLoose(curPos, endPos));

		if (!board.getPiece(curPos).getAlreadyMoved()) {
			const pieceToCheckPositions = [new Coord(curPos.y, 0), new Coord(curPos.y, colNum - 1)];
			const xDir = [new Coord(0, -1), new Coord(0, 1)];
			pieceToCheckPositions.forEach((rockPos, idx) => {
				if (board.hasPiece(rockPos) && board.isSamePieceType(rockPos, "rock") && !board.getPiece(rockPos).getAlreadyMoved()) {
					for (let nextPos = curPos.add(xDir[idx]); !rockPos.equal(nextPos); nextPos = nextPos.add(xDir[idx])) {
						if (board.hasPiece(nextPos)) {
							return;
						}
					}
					if (board.mayLoose(curPos, curPos.add(xDir[idx]), lastMove) ||
							board.mayLoose(curPos, curPos.add(xDir[idx].mul(2)), lastMove)) {
						return;
					}
					positions.push(curPos.add(xDir[idx].mul(2)));
				}
			});
		}
		return positions;
	}
}

export {Coord, Chess, Board}