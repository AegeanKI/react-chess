import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const rowNum = 8, colNum = 8;

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

function chess(pieceName, pieceColor) {
  switch (pieceName) {
    case 'pawn': return new Pawn(pieceColor);
    case 'queen': return new Queen(pieceColor);
    case 'king': return new King(pieceColor);
    case 'rock': return new Rock(pieceColor);
    case 'bishop': return new Bishop(pieceColor);
    case 'knight': return new Knight(pieceColor);
		default: return null;
  }
}


class Board {
	constructor(squares) {
		this.squares = squares.map(row => row.map(piece => (piece ? piece.copyPiece() : null)));
	}

	copyBoard() {
		return new Board(this.squares);
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
		const newPiece = (choose.yDis(curPos) === 0) ? chess("queen", adjustingPieceColor) :
										 (choose.yDis(curPos) === 1) ? chess("knight", adjustingPieceColor) :
										 (choose.yDis(curPos) === 2) ? chess("rock", adjustingPieceColor) :
										 (choose.yDis(curPos) === 3) ? chess("bishop", adjustingPieceColor) : null;
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
		if (this.isDoingEnPassant(startPos)) {
			return this.updateBoardByEnPassant(startPos, endPos);
		}
		return this.updateBoardByMoving(startPos, endPos);
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
};

class Piece {
	constructor(pieceColor, pieceType, alreadyMoved=false, direction=[], maxMultiple=Math.max(rowNum, colNum)) {
		this.pieceColor = pieceColor;
		this.pieceType = pieceType;
		this.alreadyMoved = alreadyMoved;
		this.direction = direction;
		this.maxMultiple = maxMultiple;
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

class Square extends React.Component {
	render() {
		const className = "square " + this.props.squareBackgroundColor;

		return (
			<button className={className} onClick={() => this.props.onClick()}>
				{this.props.pieceImgSrc ? <img src={this.props.pieceImgSrc} alt={this.props.pieceImgSrc} /> : null}
				{this.props.stackImgSrc ? <img className="stack-image" src={this.props.stackImgSrc} alt={this.props.stackImgSrc} /> : null}
				{this.props.rowIndicatorValue ? <p className="row-indicator">{this.props.rowIndicatorValue}</p> : null}
				{this.props.colIndicatorValue ? <p className="col-indicator">{this.props.colIndicatorValue}</p> : null}
			</button>
		);
	}
}

class ChessBoard extends React.Component {
	renderSquare(curPos) {
		const idx = curPos.y * colNum + curPos.x;
		const rowIndicatorValue = (curPos.x === 0) ? rowNum - curPos.y : null;
		const colIndicatorValue = (curPos.y === colNum - 1) ? String.fromCharCode(97 + curPos.x) : null;

		const doingEnPassantCoord = this.props.doingEnPassantCoord;
		const piece = this.props.board.getPiece(curPos);
		const doingEnPassantPiece = this.props.board.getPiece(doingEnPassantCoord);
		const mayMove = this.props.mayMovePosition.some(ele => ele.equal(curPos));
		const squareBackgroundColor = curPos.equal(doingEnPassantCoord) ? "orange-square" :
																  curPos.equal(this.props.tryToMove) ? "yellow-square" :
																  (curPos.y + curPos.x)  % 2 === 0 ? "black-square" : "white-square";
		const usingMask = (doingEnPassantCoord && curPos.xEqual(doingEnPassantCoord) && curPos.yDis(doingEnPassantCoord) < 4) ? "light-mask" :
										  (doingEnPassantCoord && !curPos.equal(doingEnPassantCoord)) ? "dark-mask" : null;
		const stackImgSrc = (mayMove && piece && piece.pieceType) ? process.env.PUBLIC_URL + "/circle.png" :
											  (mayMove) ? process.env.PUBLIC_URL + "/dot.png" : 
											  (usingMask) ? process.env.PUBLIC_URL + "/" + usingMask + ".png" : null;
		const pieceImgSrc = (usingMask === "light-mask" && curPos.yDis(doingEnPassantCoord) === 0) ? process.env.PUBLIC_URL + "/" + doingEnPassantPiece.pieceColor + "-queen.png" :
												(usingMask === "light-mask" && curPos.yDis(doingEnPassantCoord) === 1) ? process.env.PUBLIC_URL + "/" + doingEnPassantPiece.pieceColor + "-knight.png" :
												(usingMask === "light-mask" && curPos.yDis(doingEnPassantCoord) === 2) ? process.env.PUBLIC_URL + "/" + doingEnPassantPiece.pieceColor + "-rock.png" :
												(usingMask === "light-mask" && curPos.yDis(doingEnPassantCoord) === 3) ? process.env.PUBLIC_URL + "/" + doingEnPassantPiece.pieceColor + "-bishop.png" :
												(piece) ? process.env.PUBLIC_URL + "/" + piece.pieceColor + "-" + piece.pieceType + ".png" : null;
		return (
			<Square
				key={idx}
				rowIndicatorValue={rowIndicatorValue}
				colIndicatorValue={colIndicatorValue}
				pieceImgSrc={pieceImgSrc}
				stackImgSrc={stackImgSrc}
				squareBackgroundColor={squareBackgroundColor}
				mayMove={mayMove}
				usingMask={usingMask}
				onClick={() => this.props.onClick(curPos)}
			/>
		);
	}

	render() {
		return (
			<div className="chess-board-container">
				{[...Array(rowNum)].map((ele, y) =>
					<div className="chess-board-row" key={y}>
						{[...Array(colNum)].map((ele, x) => 
							this.renderSquare(new Coord(y, x))
						)}
					</div>
				)}
			</div>
		);
	}
}


class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			board: new Board(this.getInitBoard()),
			nextColor: "white",
			tryToMove: null,
			mayMovePosition: [],
			historyMove: [],
			doingEnPassantCoord: null,
		};
	}

	getInitBoard() {
		let initBoard = Array(rowNum).fill(0).map(x => Array(colNum).fill(null));
		const piecePos = 'rock knight bishop queen king bishop knight rock'.split(' ');
		initBoard[0] = piecePos.map((pieceName) => chess(pieceName, "black"));
		initBoard[1] = [...Array(colNum)].map((ele) => chess("pawn", "black"));
		initBoard[rowNum - 2] = [...Array(colNum)].map((ele) => chess("pawn", "white"));
		initBoard[rowNum - 1] = piecePos.map((pieceName) => chess(pieceName, "white"));
		return initBoard;
	}

	handleDoingEnPassant(coord) {
		const doingEnPassantCoord = this.state.doingEnPassantCoord;
		if (Math.abs(doingEnPassantCoord.y - coord.y) >= 4 || doingEnPassantCoord.x !== coord.x) {
			return;
		}
		const newBoard = this.state.board.updateBoardByPiece(doingEnPassantCoord, coord);
			// historyMove.push({
			// });
		this.setState({
			board: newBoard,
			doingEnPassantCoord: null,
			tryToMove: null,
			mayMovePosition: [],
		});
	}

	handlePieceMoving(coord) {
		const historyMove = this.state.historyMove.slice();
		const newBoard = this.state.board.updateBoardByPiece(this.state.tryToMove, coord);
		historyMove.push({
			"startPos": this.state.tryToMove,
			"endPos": coord,
			"piece": newBoard.getPiece(coord),
		});
		this.setState({
			board: newBoard,
			nextColor: (this.state.nextColor === "black" ? "white" : "black"),
			historyMove: historyMove,
			tryToMove: null,
			mayMovePosition: [],
		});

		if (newBoard.isDoingEnPassant(coord)) {
			this.setState({
				doingEnPassantCoord: coord
			});
		}
	}

	handlePieceTryToMove(coord) {
		const board = this.state.board;
		const historyMove = this.state.historyMove.slice();
		const mayMovePosition = board.getPieceCanMovePosition(coord, historyMove[historyMove.length - 1]);
		this.setState({
			tryToMove: coord,
			mayMovePosition: mayMovePosition,
		});
	}

	handleOperationCancel(coord) {
		this.setState({
			tryToMove: null,
			mayMovePosition: [],
		});
	}

	handleClick(coord) {
		if (this.state.doingEnPassantCoord) {
			this.handleDoingEnPassant(coord);
		} else if (this.state.mayMovePosition.some(ele => ele.equal(coord))) {
			this.handlePieceMoving(coord);
		} else if (this.state.board.hasPiece(coord) && this.state.board.getPiece(coord).pieceColor === this.state.nextColor) {
			this.handlePieceTryToMove(coord);
		} else {
			this.handleOperationCancel(coord);
		}
	}

	render() {
		return (
			<div className="game">
				<div className="game-chess-board">
					<ChessBoard
						board={this.state.board}
						onClick={(coord) => this.handleClick(coord)}
						tryToMove={this.state.tryToMove}
						mayMovePosition={this.state.mayMovePosition}
						doingEnPassantCoord={this.state.doingEnPassantCoord}
					/>
				</div>
			</div>
		);
	}
};

ReactDOM.render(
	<Game />,
	document.getElementById('root')
);