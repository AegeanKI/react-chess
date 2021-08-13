import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import io from "socket.io-client";
import "./index.css";
import {Coord, Chess, Board} from "./Chess.js";
import {rowNum, colNum} from "./Constant.js";

function Square(props) {
	const className = "square " + props.squareBackgroundColor;

	return (
		<button className={className} onClick={props.onClick}>
			{props.pieceImgSrc ? <img src={props.pieceImgSrc} alt={props.pieceImgSrc} /> : null}
			{props.stackImgSrc ? <img className="stack-image" src={props.stackImgSrc} alt={props.stackImgSrc} /> : null}
			{props.rowIndicatorValue ? <p className="row-indicator">{props.rowIndicatorValue}</p> : null}
			{props.colIndicatorValue ? <p className="col-indicator">{props.colIndicatorValue}</p> : null}
		</button>
	);
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


class ChessGame extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			board: new Board(this.getInitBoard()),
			canMove: null,
			nextColor: "white",
			tryToMove: null,
			mayMovePosition: [],
			historyMove: [],
			doingEnPassantCoord: null,
		};
	}

	getInitBoard() {
		let initBoard = Array(rowNum).fill(0).map(x => Array(colNum).fill(null));
		const piecePos = "rock knight bishop queen king bishop knight rock".split(" ");
		initBoard[0] = piecePos.map((pieceName) => Chess(pieceName, "black"));
		initBoard[1] = [...Array(colNum)].map((ele) => Chess("pawn", "black"));
		initBoard[rowNum - 2] = [...Array(colNum)].map((ele) => Chess("pawn", "white"));
		initBoard[rowNum - 1] = piecePos.map((pieceName) => Chess(pieceName, "white"));
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
		const historyMove = this.state.historyMove.slice();

		this.sendBoardToServer(newBoard, historyMove[historyMove.length - 1]);
	}

	handlePieceMoving(coord) {
		const historyMove = this.state.historyMove.slice();
		console.log('while moving');
		console.log('before update board, timestamp =', this.state.board.timestamp);
		const newBoard = this.state.board.updateBoardByPiece(this.state.tryToMove, coord);
		console.log('after update board, timestamp =', newBoard.timestamp);
		const newMove = {
			"startPos": this.state.tryToMove,
			"endPos": coord,
			"piece": newBoard.getPiece(coord),
		};
		historyMove.push(newMove);

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
		} else {
			this.sendBoardToServer(newBoard, newMove);
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

		// this.sendBoardToServer(null);
	}

	handleOperationCancel(coord) {
		this.setState({
			tryToMove: null,
			mayMovePosition: [],
		});

		// this.sendBoardToServer(null);
	}

	sendBoardToServer(board, lastMove) {
		const socket = this.props.socket;
		if (socket && board) {
			const sendData = {
				board: board,
				lastMove: lastMove
			};
			console.log('send to server', sendData);
			socket.emit("sendToSameRoom", sendData);
		}
	}

	handleClick(coord) {
		// console.log("canMove is", this.state.canMove);
		// console.log("nextColor is", this.state.nextColor);
		if (this.state.doingEnPassantCoord) {
			this.handleDoingEnPassant(coord);
		} else if (this.state.mayMovePosition.some(ele => ele.equal(coord))) {
			this.handlePieceMoving(coord);
		} else if (this.state.board.hasPiece(coord) && this.state.board.getPiece(coord).pieceColor === this.state.nextColor && this.state.nextColor === this.state.canMove) {
		// } else if (this.state.board.hasPiece(coord) && this.state.board.getPiece(coord).pieceColor === this.state.nextColor) {
			this.handlePieceTryToMove(coord);
		} else {
			this.handleOperationCancel(coord);
		}
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		const nextCanMove = nextProps.orderFromServer === 0 ? "white" : 
												nextProps.orderFromServer === 1 ? "black" : null;
		if (nextCanMove !== prevState.canMove) {
			console.log('set canMove:', nextCanMove);
			return {
				canMove: nextCanMove
			}
		}

		if (nextProps.boardFromServer &&
			  nextProps.boardFromServer.timestamp > prevState.board.timestamp &&
				prevState.nextColor !== nextCanMove) {
			console.log('set board:', nextProps.boardFromServer);
			let historyMove = prevState.historyMove.slice();
			historyMove.push(nextProps.lastMoveFromServer);
			return {
				board: nextProps.boardFromServer,
				historyMove: historyMove,
				nextColor: (prevState.nextColor === "black" ? "white" : "black"),
			}
		} else {
			// console.log('get board props but not set');
			// console.log('nextProps.boardFromServer:', nextProps.boardFromServer);
			// console.log('prevState.board', prevState.board);
			// console.log('prevState.nextColor', prevState.nextColor);
			// console.log('nextCanMove', nextCanMove);
		}

		return null;
	}

	render() {
		console.log('re rendering, this.state.board.timestamp:', this.state.board.timestamp);
		return (
			<div className="chess-game-container">
				<ChessBoard
					board={this.state.board}
					onClick={(coord) => this.handleClick(coord)}
					tryToMove={this.state.tryToMove}
					mayMovePosition={this.state.mayMovePosition}
					doingEnPassantCoord={this.state.doingEnPassantCoord}
				/>
			</div>
		);
	}
};

class ConnectToServer extends React.Component {
	constructor(props) {
		super(props);

		const newSocket = io("http://localhost:3000", { transports: ["websocket", "polling", "flashsocket"] });
		this.state = {
			socket: newSocket
		};
		this.listenMessage(newSocket);
	}

	listenMessage(socket) {
		if (!socket) return;

		socket.on("connect", () => {
			console.log("success connect:", socket.id);
		});

		socket.on("sendToSameRoom", JSONDataFromServer => {
			// console.log('receive data', JSONDataFromServer);
			const JSONBoardFromServer = JSONDataFromServer.board;
			const JSONLastMoveFromServer = JSONDataFromServer.lastMove;
			if (this.state.board && JSONBoardFromServer.timestamp <= this.state.board.timestamp) return;

			console.log('set boardFromServer:', JSONBoardFromServer);
			const newBoard = new Board(JSONBoardFromServer);
			let newLastMove = this.buildLastMoveFromJSON(JSONLastMoveFromServer);
			// console.log(newLastMove);
			this.setState({
				boardFromServer: newBoard,
				lastMoveFromServer: newLastMove
			});
		});

		socket.on("setUserOrderInRoom", orderFromServer => {
			if (orderFromServer === this.state.orderFromServer) return;

			console.log('set orderFromServer:', orderFromServer);
			this.setState({
				orderFromServer: orderFromServer
			});
		})
	};

	buildLastMoveFromJSON(JSONLastMove) {
		let lastMove = JSONLastMove;
		lastMove.piece = Chess(lastMove.piece);
		lastMove.endPos = new Coord(lastMove.endPos.y, lastMove.endPos.x);
		lastMove.startPos = new Coord(lastMove.startPos.y, lastMove.startPos.x);
		return lastMove;
	}
	// shouldComponentUpdate(nextProps, nextState) {
	// 	return (nextState.socket && nextState.orderFromServer);
	// }

	render() {
		return (
			<div className="game-container">
				<ChessGame
					socket={this.state.socket}
					orderFromServer={this.state.orderFromServer}
					boardFromServer={this.state.boardFromServer}
					lastMoveFromServer={this.state.lastMoveFromServer}
				/>
			</div>
		)
	}
};


ReactDOM.render(
	// <Game />,
	<ConnectToServer />,
	document.getElementById("root")
);