import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const rowNum = 8, colNum = 8;

function Coord (y, x) {
	return { "y": y, "x": x }
}

function getInitSquares() {
	let initSquares = Array(rowNum).fill(0).map(x => Array(colNum).fill(null));

	const blackPawnPositions = [...Array(colNum)].map((ele, i) => Coord(1, i));
	blackPawnPositions.forEach((coord, i) => initSquares[coord.y][coord.x] = new Pawn("black"));
	const whitePawnPositions = [...Array(colNum)].map((ele, i) => Coord(rowNum - 2, i));
	whitePawnPositions.forEach((coord, i) => initSquares[coord.y][coord.x] = new Pawn("white"));

	const blackRockPosition = [Coord(0, 0), Coord(0, colNum - 1), Coord(rowNum - 1, 0), Coord(rowNum - 1, colNum - 1)];
	blackRockPosition.forEach((coord, i) => initSquares[coord.y][coord.x] = new Rock("black"));
	const whiteRockPosition = [Coord(rowNum - 1, 0), Coord(rowNum - 1, colNum - 1)];
	whiteRockPosition.forEach((coord, i) => initSquares[coord.y][coord.x] = new Rock("white"));

	const blackKnightPosition = [Coord(0, 1), Coord(0, colNum - 2)];
	blackKnightPosition.forEach((coord, i) => initSquares[coord.y][coord.x] = new Knight("black"));
	const whiteKnightPosition = [Coord(rowNum - 1, 1), Coord(rowNum - 1, colNum - 2)];
	whiteKnightPosition.forEach((coord, i) => initSquares[coord.y][coord.x] = new Knight("white"));

	const blackBishopPosition = [Coord(0, 2), Coord(0, colNum - 3)];
	blackBishopPosition.forEach((coord, i) => initSquares[coord.y][coord.x] = new Bishop("black"));
	const whiteBishopPosition = [Coord(rowNum - 1, 2), Coord(rowNum - 1, colNum - 3)];
	whiteBishopPosition.forEach((coord, i) => initSquares[coord.y][coord.x] = new Bishop("white"));

	const blackQueenPosition = [Coord(0, 3)];
	blackQueenPosition.forEach((coord, i) => initSquares[coord.y][coord.x] = new Queen("black"));
	const whiteQueenPosition = [Coord(rowNum - 1, 3)];
	whiteQueenPosition.forEach((coord, i) => initSquares[coord.y][coord.x] = new Queen("white"));

	const blackKingPosition = [Coord(0, 4)];
	blackKingPosition.forEach((coord, i) => initSquares[coord.y][coord.x] = new King("black"));
	const whiteKingPosition = [Coord(rowNum - 1, 4)];
	whiteKingPosition.forEach((coord, i) => initSquares[coord.y][coord.x] = new King("white"));

	return initSquares;
}

class Piece {
	constructor(pieceColor, pieceType) {
		this.pieceColor = pieceColor;
		this.pieceType = pieceType;
		this.moved = false;
	}

	hasPiece(coord, squares) {
		return squares[coord.y][coord.x];
	}

	isValidCoord(coord) {
		return (coord.y >= 0 && coord.y < rowNum && coord.x >= 0 && coord.x < colNum);
	}

	isSamePieceColor(coord, squares) {
		return (squares[coord.y][coord.x].pieceColor === this.pieceColor);
	}

	canEatPiece(coord, squares) {
		return (this.isValidCoord(coord) && this.hasPiece(coord, squares) && !this.isSamePieceColor(coord, squares))
	}

	getCanMovePositionInGeneralRule(coord, squares) { return; }
	updateCanMovePositionInSpecialRule(coord, squares, positions) { return positions; }
	getCanMovePosition(coord, squares, lastMove) {
		let positions = this.getCanMovePositionInGeneralRule(coord, squares);
		positions = this.updateCanMovePositionInSpecialRule(coord, squares, positions, lastMove);

		return positions;
	}

	isUsingSpeicalRule(squares, startPos, endPos) { return false; }
	updateSquaresUsingSpecialRule(squares, startPos, endPos) { return squares; }
	updateSquaresUsingEnPassant(squares, coord, choose) { return squares; }

	updateSquares(BeforeSquares, startPos, endPos) {
		let squares = BeforeSquares.map(arr => arr.slice());
		if (squares[startPos.y][startPos.x].isUsingSpeicalRule(squares, startPos, endPos))
			squares = squares[startPos.y][startPos.x].updateSquaresUsingSpecialRule(squares, startPos, endPos);
			// squares[startPos.y][endPos.x] = null;
		squares[endPos.y][endPos.x] = squares[startPos.y][startPos.x];
		squares[startPos.y][startPos.x] = null;
		squares[endPos.y][endPos.x].moved = true;

		if (BeforeSquares[startPos.y][startPos.x] === null)
			console.log("something wrong");

		return squares;
	}

	tryToEnPassant(coord) { return false; }
	// move() {
	// 	this.moved = true;
	// }
};

class Pawn extends Piece {
	constructor(pieceColor) {
		super(pieceColor, "pawn");
	}

	getCanMovePositionInGeneralRule(coord, squares) {
		const startPos = (this.pieceColor === "white") ? rowNum - 2 : 1;
		const yDir = (this.pieceColor === "white") ? -1 : 1;
		const firstCoord = Coord(coord.y + yDir, coord.x);
		const secondCoord = Coord(coord.y + 2 * yDir, coord.x);
		let canMovePositions = [];
		if (super.isValidCoord(firstCoord) && !super.hasPiece(firstCoord, squares))
			canMovePositions.push(firstCoord);
		if (coord.y === startPos && !super.hasPiece(firstCoord, squares) && !super.hasPiece(secondCoord, squares))
			canMovePositions.push(secondCoord);

		return canMovePositions;
	}

	updateCanMovePositionInSpecialRule(coord, squares, positions, lastMove) {
		const yDir = (this.pieceColor === "white") ? -1 : 1;
		const leftTopCoord = Coord(coord.y + yDir, coord.x + 1);
		const rightTopCoord = Coord(coord.y + yDir, coord.x - 1);

		if (super.canEatPiece(leftTopCoord, squares))
			positions.push(leftTopCoord);
		if (super.canEatPiece(rightTopCoord, squares))
			positions.push(rightTopCoord);

		if (lastMove && lastMove.piece.pieceType === "pawn" && Math.abs(lastMove.startPos.y - lastMove.endPos.y) === 2 &&
				Math.abs(lastMove.startPos.x - coord.x) === 1 && lastMove.endPos.y === coord.y) {
			positions.push(Coord(coord.y + yDir, lastMove.startPos.x));
		}

		return positions;
	}

	isUsingSpeicalRule(squares, startPos, endPos) {
		return (squares[startPos.y][startPos.x].pieceType === "pawn" && Math.abs(startPos.x - endPos.x) === 1 && squares[endPos.y][endPos.x] === null);
	}

	updateSquaresUsingSpecialRule(BeforeSquares, startPos, endPos) {
		let squares = BeforeSquares.map(arr => arr.slice());
		squares[startPos.y][endPos.x] = null;
		return squares;
	}

	tryToEnPassant(coord) { 
		return (coord.y === 0 || coord.y === rowNum - 1);
	}

	updateSquaresUsingEnPassant(BeforeSquares, coord, choose) {
		let squares = BeforeSquares.map(arr => arr.slice());
		const newPiece = (choose.y === coord.y) ? new Queen(this.pieceColor) :
										 (Math.abs(choose.y - coord.y) === 1) ? new Knight(this.pieceColor) :
										 (Math.abs(choose.y - coord.y) === 2) ? new Rock(this.pieceColor) :
										 (Math.abs(choose.y - coord.y) === 3) ? new Bishop(this.pieceColor) : null;
		squares[coord.y][coord.x] = newPiece;
		// if (choose.y ===)
		return squares;
	}
};

class Rock extends Piece {
	constructor(pieceColor) {
		super(pieceColor, "rock");
	}

	getCanMovePositionInGeneralRule(coord, squares) {
		const directionForRock = [[1, 0], [0, 1], [-1, 0], [0, -1]];
		let canMovePositions = [];
		directionForRock.forEach((dir) => {
			let nextCoord = Coord(coord.y + dir[0], coord.x + dir[1]);
			for (; super.isValidCoord(nextCoord) && !super.hasPiece(nextCoord, squares); nextCoord = Coord(nextCoord.y + dir[0], nextCoord.x + dir[1]))
					canMovePositions.push(nextCoord);
			if (super.canEatPiece(nextCoord, squares))
				canMovePositions.push(nextCoord);
		});
		return canMovePositions;
	}
}

class Bishop extends Piece {
	constructor(pieceColor) {
		super(pieceColor, "bishop");
	}

	getCanMovePositionInGeneralRule(coord, squares) {
		const directionForBishop = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
		let canMovePositions = [];
		directionForBishop.forEach((dir) => {
			let nextCoord = Coord(coord.y + dir[0], coord.x + dir[1]);
			for (; super.isValidCoord(nextCoord) && !super.hasPiece(nextCoord, squares); nextCoord = Coord(nextCoord.y + dir[0], nextCoord.x + dir[1]))
					canMovePositions.push(nextCoord);
			if (super.canEatPiece(nextCoord, squares))
				canMovePositions.push(nextCoord);
		});
		return canMovePositions;
	}
}

class Queen extends Piece {
	constructor(pieceColor) {
		super(pieceColor, "queen");
	}

	getCanMovePositionInGeneralRule(coord, squares) {
		const directionForQueen = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
		let canMovePositions = [];
		directionForQueen.forEach((dir) => {
			let nextCoord = Coord(coord.y + dir[0], coord.x + dir[1]);
			for (; super.isValidCoord(nextCoord) && !super.hasPiece(nextCoord, squares); nextCoord = Coord(nextCoord.y + dir[0], nextCoord.x + dir[1]))
					canMovePositions.push(nextCoord);
			if (super.canEatPiece(nextCoord, squares))
				canMovePositions.push(nextCoord);
		});
		return canMovePositions;
	}
}

class Knight extends Piece {
	constructor(pieceColor) {
		super(pieceColor, "knight");
	}

	getCanMovePositionInGeneralRule(coord, squares) {
		const directionForKnight = [[2, 1], [-2, 1], [2, -1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
		let canMovePositions = [];

		directionForKnight.forEach((dir) => {
			let nextCoord = Coord(coord.y + dir[0], coord.x + dir[1]);
			if (super.isValidCoord(nextCoord) && (!super.hasPiece(nextCoord, squares) || !super.isSamePieceColor(nextCoord, squares)))
				canMovePositions.push(nextCoord);
		});
		return canMovePositions;
	}
}

class King extends Piece {
	constructor(pieceColor) {
		super(pieceColor, "king");
	}

	getCanMovePositionInGeneralRule(coord, squares) {
		const directionForKing = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [0, -1], [-1, 0], [0, 1]];
		let canMovePositions = [];

		directionForKing.forEach((dir) => {
			let nextCoord = Coord(coord.y + dir[0], coord.x + dir[1]);
			if (super.isValidCoord(nextCoord) && (!super.hasPiece(nextCoord, squares) || !super.isSamePieceColor(nextCoord, squares)))
				canMovePositions.push(nextCoord);
		});
		return canMovePositions;
	}

	mayLoose(squares, startPos, endPos, lastMove) {
		const nextSquares = super.updateSquares(squares, startPos, endPos);
		let anotherKingPosition = null;
		for (let y = 0; y < rowNum; y++) {
			for (let x = 0; x < colNum; x++) {
				if (!nextSquares[y][x] || super.isSamePieceColor(Coord(y, x), nextSquares)) continue;
				if (nextSquares[y][x].pieceType === "king") {
					anotherKingPosition = Coord(y, x);
					continue;
				}

				const mayMovePosition = nextSquares[y][x].getCanMovePosition(Coord(y, x), nextSquares, {
					"startPos": startPos,
					"endPos": endPos,
					"piece": nextSquares[endPos.y][endPos.x],
				});
				if (mayMovePosition.some(ele => ele.y === endPos.y && ele.x === endPos.x)) {
					console.log(nextSquares[y][x].pieceColor, "-", nextSquares[y][x].pieceType, " may cause lose");
					return true;
				}
			}
		}

		const directionForKing = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [0, -1], [-1, 0], [0, 1]];
		for (let i = 0; i < directionForKing.length; i++) {
			const mayMovePosition = Coord(anotherKingPosition.y + directionForKing[i][0], anotherKingPosition.x + directionForKing[i][1]);
			if (mayMovePosition.y === endPos.y && mayMovePosition.x === endPos.x)
				return true;
		}

		return false;
	}

	updateCanMovePositionInSpecialRule(coord, squares, positions, lastMove) {
		positions = positions.filter(endPos => !this.mayLoose(squares, coord, endPos, lastMove));

		if (!super.moved) {
			const pieceToCheckPositions = [Coord(coord.y, 0), Coord(coord.y, colNum - 1)];
			const xDir = [-1, 1];
			pieceToCheckPositions.forEach((ele, idx) => {
				const piece = squares[ele.y][ele.x];
				if (piece && piece.pieceType === "rock" && !piece.moved) {
					for (let i = Coord(coord.y, coord.x + xDir[idx]); i.y !== ele.y || i.x !== ele.x; i = Coord(i.y, i.x + xDir[idx]))
						if (super.hasPiece(i, squares)) return;
					if (this.mayLoose(squares, coord, Coord(coord.y, coord.x + xDir[idx]), lastMove) || this.mayLoose(squares, coord, Coord(coord.y, coord.x + 2 * xDir[idx]), lastMove)) return;
					
					positions.push(Coord(coord.y, coord.x + 2 * xDir[idx]));
				}
			})
		}

		return positions;
	}

	isUsingSpeicalRule(squares, startPos, endPos) {
		return (squares[startPos.y][startPos.x].pieceType === "king" && Math.abs(startPos.x - endPos.x) === 2);
	}

	updateSquaresUsingSpecialRule(BeforeSquares, startPos, endPos) {
		let squares = BeforeSquares.map(arr => arr.slice());
		const xDir = (endPos.x - startPos.x) / 2;
		const rockCoord = (xDir > 0 ? Coord(startPos.y, colNum - 1) : Coord(startPos.y, 0));
		squares[startPos.y][endPos.x - xDir] = squares[rockCoord.y][rockCoord.x];
		squares[rockCoord.y][rockCoord.x] = null;
		return squares;
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

class Board extends React.Component {
	renderSquare(coord) {
		const idx = coord.y * colNum + coord.x;
		const piece = this.props.squares[coord.y][coord.x];
		const doingEnPassantCoord = this.props.doingEnPassantCoord;
		const doingEnPassantPiece = doingEnPassantCoord ? this.props.squares[doingEnPassantCoord.y][doingEnPassantCoord.x] : null;
		const mayMove = this.props.mayMovePosition.some(ele => ele.y === coord.y && ele.x === coord.x);
		const squareBackgroundColor = (doingEnPassantCoord && coord.x === doingEnPassantCoord.x && coord.y === doingEnPassantCoord.y) ? "orange-square" :
																  (idx === this.props.tryToMove) ? "yellow-square" :
																  ((coord.y + coord.x)  % 2 === 0) ? "black-square" : "white-square";
		const usingMask = (doingEnPassantCoord && coord.x === doingEnPassantCoord.x && Math.abs(coord.y - doingEnPassantCoord.y) < 4) ? "light-mask" :
										  (doingEnPassantCoord && (coord.x !== doingEnPassantCoord.x || coord.y !== doingEnPassantCoord.y)) ? "dark-mask" : null;
		const stackImgSrc = (mayMove && piece && piece.pieceType) ? process.env.PUBLIC_URL + "/circle.png" :
											  (mayMove) ? process.env.PUBLIC_URL + "/dot.png" : 
											  (usingMask) ? process.env.PUBLIC_URL + "/" + usingMask + ".png" : null;

		const pieceImgSrc = (usingMask === "light-mask" && squareBackgroundColor === "orange-square") ? process.env.PUBLIC_URL + "/" + doingEnPassantPiece.pieceColor + "-queen.png" :
												(usingMask === "light-mask" && Math.abs(coord.y - doingEnPassantCoord.y) === 1) ? process.env.PUBLIC_URL + "/" + doingEnPassantPiece.pieceColor + "-knight.png" :
												(usingMask === "light-mask" && Math.abs(coord.y - doingEnPassantCoord.y) === 2) ? process.env.PUBLIC_URL + "/" + doingEnPassantPiece.pieceColor + "-rock.png" :
												(usingMask === "light-mask" && Math.abs(coord.y - doingEnPassantCoord.y) === 3) ? process.env.PUBLIC_URL + "/" + doingEnPassantPiece.pieceColor + "-bishop.png" :
												(piece) ? process.env.PUBLIC_URL + "/" + piece.pieceColor + "-" + piece.pieceType + ".png" : null;

		const rowIndicatorValue = (coord.x === 0) ? rowNum - coord.y : null;
		const colIndicatorValue = (coord.y === colNum - 1) ? String.fromCharCode(97 + coord.x) : null;
		return (
			<Square
				key={idx}
				pieceImgSrc={pieceImgSrc}
				stackImgSrc={stackImgSrc}
				squareBackgroundColor={squareBackgroundColor}
				mayMove={mayMove}
				usingMask={usingMask}
				onClick={() => this.props.onClick(coord)}
				rowIndicatorValue={rowIndicatorValue}
				colIndicatorValue={colIndicatorValue}
			/>
		);
	}

	render() {
		return (
			<div className="board-container">
				{[...Array(rowNum)].map((ele, y) =>
					<div className="board-row" key={y}>
						{[...Array(colNum)].map((ele, x) => 
							this.renderSquare(Coord(y, x))
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
			squares: getInitSquares(),
			nextColor: "white",
			tryToMove: null,
			mayMovePosition: [],
			historyMove: [],
			doingEnPassantCoord: null,
		};
	}

	handleClick(coord) {
		let squares = this.state.squares.map(arr => arr.slice());
		let historyMove = this.state.historyMove.slice();
		let doingEnPassantCoord = this.state.doingEnPassantCoord;
		let tryToMove = this.state.tryToMove;
		let mayMovePosition = [];
		if (doingEnPassantCoord) {
			if (Math.abs(doingEnPassantCoord.y - coord.y) >= 4 || doingEnPassantCoord.x !== coord.x) return;

			console.log("doing en passant");
			squares = squares[doingEnPassantCoord.y][doingEnPassantCoord.x].updateSquaresUsingEnPassant(squares, doingEnPassantCoord, coord);

			// historyMove.push({
			// 	"startPos": tryToMove,
			// 	"endPos": coord,
			// 	"piece": squares[coord.y][coord.x],
			// });
			this.setState({
				squares: squares,
				doingEnPassantCoord: null
			});
		} else if (tryToMove && (this.state.mayMovePosition.some(ele => ele.y === coord.y && ele.x === coord.x))) {
			squares = squares[tryToMove.y][tryToMove.x].updateSquares(squares, tryToMove, coord);

			historyMove.push({
				"startPos": tryToMove,
				"endPos": coord,
				"piece": squares[coord.y][coord.x],
			});

			if (squares[coord.y][coord.x].tryToEnPassant(coord)) {
				this.setState({
					doingEnPassantCoord: coord
				});
			}
			this.setState({
				squares: squares,
				nextColor: (this.state.nextColor === "black" ? "white" : "black"),
				historyMove: historyMove,
			});


		} else if (squares[coord.y][coord.x] && squares[coord.y][coord.x].pieceColor === this.state.nextColor) {
			tryToMove = coord;
			mayMovePosition = squares[coord.y][coord.x].getCanMovePosition(coord, squares, historyMove[historyMove.length - 1]);
		}

		this.setState({
			tryToMove: tryToMove,
			mayMovePosition: mayMovePosition,
		});
	}

	render() {
		return (
			<div className="game">
				<div className="game-board">
					<Board
						squares={this.state.squares}
						onClick={(i) => this.handleClick(i)}
						tryToMove={this.state.tryToMove}
						mayMovePosition={this.state.mayMovePosition}
						doingEnPassantCoord={this.state.doingEnPassantCoord}
					/>
					{/*<Indicator
						squares={[...Array(rowNum)].map((ele, idx) => idx)}
					/>*/}
				</div>
			</div>
		);
	}
};

ReactDOM.render(
	<Game />,
	document.getElementById('root')
);