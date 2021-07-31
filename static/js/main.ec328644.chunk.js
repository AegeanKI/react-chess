(this["webpackJsonpreact-chess"]=this["webpackJsonpreact-chess"]||[]).push([[0],{11:function(e,t,n){"use strict";n.r(t);var a=n(3),r=n(0),i=n(5),o=n(4),s=n(2),c=n(6),u=n(8),l=n(7),h=n.n(l),y=n(10),p=n.n(y),f=(n(16),n(1));function x(e,t){return{y:e,x:t}}function b(){var e=Array(8).fill(0).map((function(e){return Array(8).fill(null)}));return Object(u.a)(Array(8)).map((function(e,t){return x(1,t)})).forEach((function(t,n){return e[t.y][t.x]=new d("black")})),Object(u.a)(Array(8)).map((function(e,t){return x(6,t)})).forEach((function(t,n){return e[t.y][t.x]=new d("white")})),[x(0,0),x(0,7),x(7,0),x(7,7)].forEach((function(t,n){return e[t.y][t.x]=new j("black")})),[x(7,0),x(7,7)].forEach((function(t,n){return e[t.y][t.x]=new j("white")})),[x(0,1),x(0,6)].forEach((function(t,n){return e[t.y][t.x]=new O("black")})),[x(7,1),x(7,6)].forEach((function(t,n){return e[t.y][t.x]=new O("white")})),[x(0,2),x(0,5)].forEach((function(t,n){return e[t.y][t.x]=new g("black")})),[x(7,2),x(7,5)].forEach((function(t,n){return e[t.y][t.x]=new g("white")})),[x(0,3)].forEach((function(t,n){return e[t.y][t.x]=new k("black")})),[x(7,3)].forEach((function(t,n){return e[t.y][t.x]=new k("white")})),[x(0,4)].forEach((function(t,n){return e[t.y][t.x]=new m("black")})),[x(7,4)].forEach((function(t,n){return e[t.y][t.x]=new m("white")})),e}var v=function(){function e(t,n){var a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[],r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:Math.max(8,8);Object(s.a)(this,e),this.pieceColor=t,this.pieceType=n,this.moved=!1,this.direction=a,this.maxMultiple=r}return Object(c.a)(e,[{key:"hasPiece",value:function(e,t){return t[e.y][e.x]}},{key:"isValidCoord",value:function(e){return e.y>=0&&e.y<8&&e.x>=0&&e.x<8}},{key:"isSamePieceColor",value:function(e,t){return t[e.y][e.x].pieceColor===this.pieceColor}},{key:"canEatPiece",value:function(e,t){return this.isValidCoord(e)&&this.hasPiece(e,t)&&!this.isSamePieceColor(e,t)}},{key:"getCanMovePositionInGeneralRule",value:function(e,t){var n=this,a=[];return this.direction.forEach((function(r){for(var i=1;i<=n.maxMultiple;i++){var o=x(e.y+i*r[0],e.x+i*r[1]);if(!n.isValidCoord(o))break;if(n.hasPiece(o,t)){n.canEatPiece(o,t)&&a.push(o);break}a.push(o)}})),a}},{key:"getCanMovePosition",value:function(e,t,n){var a=this.getCanMovePositionInGeneralRule(e,t);return a=this.updateCanMovePositionInSpecialRule(e,t,a,n)}},{key:"tryToEnPassant",value:function(e){return!1}},{key:"isUsingSpeicalRule",value:function(e,t,n){return!1}},{key:"updateCanMovePositionInSpecialRule",value:function(e,t,n){return n}},{key:"updateSquaresUsingSpecialRule",value:function(e,t,n){return e}},{key:"updateSquaresUsingEnPassant",value:function(e,t,n){return e}},{key:"updateSquares",value:function(e,t,n){var a=e.map((function(e){return e.slice()}));return a[t.y][t.x].isUsingSpeicalRule(a,t,n)&&(a=a[t.y][t.x].updateSquaresUsingSpecialRule(a,t,n)),a[n.y][n.x]=a[t.y][t.x],a[t.y][t.x]=null,a[n.y][n.x].moved=!0,null===e[t.y][t.x]&&console.log("something wrong"),a}}]),e}(),d=function(e){Object(i.a)(n,e);var t=Object(o.a)(n);function n(e){return Object(s.a)(this,n),t.call(this,e,"pawn")}return Object(c.a)(n,[{key:"getCanMovePositionInGeneralRule",value:function(e,t){var i="white"===this.pieceColor?6:1,o="white"===this.pieceColor?-1:1,s=x(e.y+o,e.x),c=x(e.y+2*o,e.x),u=[];return Object(a.a)(Object(r.a)(n.prototype),"isValidCoord",this).call(this,s)&&!Object(a.a)(Object(r.a)(n.prototype),"hasPiece",this).call(this,s,t)&&u.push(s),e.y!==i||Object(a.a)(Object(r.a)(n.prototype),"hasPiece",this).call(this,s,t)||Object(a.a)(Object(r.a)(n.prototype),"hasPiece",this).call(this,c,t)||u.push(c),u}},{key:"updateCanMovePositionInSpecialRule",value:function(e,t,i,o){var s="white"===this.pieceColor?-1:1,c=x(e.y+s,e.x+1),u=x(e.y+s,e.x-1);return Object(a.a)(Object(r.a)(n.prototype),"canEatPiece",this).call(this,c,t)&&i.push(c),Object(a.a)(Object(r.a)(n.prototype),"canEatPiece",this).call(this,u,t)&&i.push(u),o&&"pawn"===o.piece.pieceType&&2===Math.abs(o.startPos.y-o.endPos.y)&&1===Math.abs(o.startPos.x-e.x)&&o.endPos.y===e.y&&i.push(x(e.y+s,o.startPos.x)),i}},{key:"isUsingSpeicalRule",value:function(e,t,n){return"pawn"===e[t.y][t.x].pieceType&&1===Math.abs(t.x-n.x)&&null===e[n.y][n.x]}},{key:"updateSquaresUsingSpecialRule",value:function(e,t,n){var a=e.map((function(e){return e.slice()}));return a[t.y][n.x]=null,a}},{key:"tryToEnPassant",value:function(e){return 0===e.y||7===e.y}},{key:"updateSquaresUsingEnPassant",value:function(e,t,n){var a=e.map((function(e){return e.slice()})),r=n.y===t.y?new k(this.pieceColor):1===Math.abs(n.y-t.y)?new O(this.pieceColor):2===Math.abs(n.y-t.y)?new j(this.pieceColor):3===Math.abs(n.y-t.y)?new g(this.pieceColor):null;return a[t.y][t.x]=r,a}}]),n}(v),j=function(e){Object(i.a)(n,e);var t=Object(o.a)(n);function n(e){Object(s.a)(this,n);return t.call(this,e,"rock",[[1,0],[0,1],[-1,0],[0,-1]])}return n}(v),g=function(e){Object(i.a)(n,e);var t=Object(o.a)(n);function n(e){Object(s.a)(this,n);return t.call(this,e,"bishop",[[1,1],[1,-1],[-1,1],[-1,-1]])}return n}(v),k=function(e){Object(i.a)(n,e);var t=Object(o.a)(n);function n(e){Object(s.a)(this,n);return t.call(this,e,"queen",[[1,0],[0,1],[-1,0],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]])}return n}(v),O=function(e){Object(i.a)(n,e);var t=Object(o.a)(n);function n(e){Object(s.a)(this,n);return t.call(this,e,"knight",[[2,1],[-2,1],[2,-1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]],1)}return n}(v),m=function(e){Object(i.a)(n,e);var t=Object(o.a)(n);function n(e){Object(s.a)(this,n);return t.call(this,e,"king",[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[0,-1],[-1,0],[0,1]],1)}return Object(c.a)(n,[{key:"mayLoose",value:function(e,t,i,o){for(var s=Object(a.a)(Object(r.a)(n.prototype),"updateSquares",this).call(this,e,t,i),c=null,u=0;u<8;u++)for(var l=0;l<8;l++){if(s[u][l]&&!Object(a.a)(Object(r.a)(n.prototype),"isSamePieceColor",this).call(this,x(u,l),s))if("king"!==s[u][l].pieceType){if(s[u][l].getCanMovePosition(x(u,l),s,{startPos:t,endPos:i,piece:s[i.y][i.x]}).some((function(e){return e.y===i.y&&e.x===i.x})))return!0}else c=x(u,l)}for(var h=0;h<this.direction.length;h++){var y=x(c.y+this.direction[h][0],c.x+this.direction[h][1]);if(y.y===i.y&&y.x===i.x)return!0}return!1}},{key:"updateCanMovePositionInSpecialRule",value:function(e,t,i,o){var s=this;if(i=i.filter((function(n){return!s.mayLoose(t,e,n,o)})),!Object(a.a)(Object(r.a)(n.prototype),"moved",this)){var c=[x(e.y,0),x(e.y,7)],u=[-1,1];c.forEach((function(c,l){var h=t[c.y][c.x];if(h&&"rock"===h.pieceType&&!h.moved){for(var y=x(e.y,e.x+u[l]);y.y!==c.y||y.x!==c.x;y=x(y.y,y.x+u[l]))if(Object(a.a)(Object(r.a)(n.prototype),"hasPiece",s).call(s,y,t))return;if(s.mayLoose(t,e,x(e.y,e.x+u[l]),o)||s.mayLoose(t,e,x(e.y,e.x+2*u[l]),o))return;i.push(x(e.y,e.x+2*u[l]))}}))}return i}},{key:"isUsingSpeicalRule",value:function(e,t,n){return"king"===e[t.y][t.x].pieceType&&2===Math.abs(t.x-n.x)}},{key:"updateSquaresUsingSpecialRule",value:function(e,t,n){var a=e.map((function(e){return e.slice()})),r=(n.x-t.x)/2,i=x(t.y,r>0?7:0);return a[t.y][n.x-r]=a[i.y][i.x],a[i.y][i.x]=null,a}}]),n}(v),C=function(e){Object(i.a)(n,e);var t=Object(o.a)(n);function n(){return Object(s.a)(this,n),t.apply(this,arguments)}return Object(c.a)(n,[{key:"render",value:function(){var e=this,t="square "+this.props.squareBackgroundColor;return Object(f.jsxs)("button",{className:t,onClick:function(){return e.props.onClick()},children:[this.props.pieceImgSrc?Object(f.jsx)("img",{src:this.props.pieceImgSrc,alt:this.props.pieceImgSrc}):null,this.props.stackImgSrc?Object(f.jsx)("img",{className:"stack-image",src:this.props.stackImgSrc,alt:this.props.stackImgSrc}):null,this.props.rowIndicatorValue?Object(f.jsx)("p",{className:"row-indicator",children:this.props.rowIndicatorValue}):null,this.props.colIndicatorValue?Object(f.jsx)("p",{className:"col-indicator",children:this.props.colIndicatorValue}):null]})}}]),n}(h.a.Component),P=function(e){Object(i.a)(n,e);var t=Object(o.a)(n);function n(){return Object(s.a)(this,n),t.apply(this,arguments)}return Object(c.a)(n,[{key:"renderSquare",value:function(e){var t=this,n=8*e.y+e.x,a=this.props.squares[e.y][e.x],r=this.props.doingEnPassantCoord,i=r?this.props.squares[r.y][r.x]:null,o=this.props.mayMovePosition.some((function(t){return t.y===e.y&&t.x===e.x})),s=r&&e.x===r.x&&e.y===r.y?"orange-square":n===this.props.tryToMove?"yellow-square":(e.y+e.x)%2===0?"black-square":"white-square",c=r&&e.x===r.x&&Math.abs(e.y-r.y)<4?"light-mask":!r||e.x===r.x&&e.y===r.y?null:"dark-mask",u=o&&a&&a.pieceType?"/react-chess/circle.png":o?"/react-chess/dot.png":c?"/react-chess/"+c+".png":null,l="light-mask"===c&&"orange-square"===s?"/react-chess/"+i.pieceColor+"-queen.png":"light-mask"===c&&1===Math.abs(e.y-r.y)?"/react-chess/"+i.pieceColor+"-knight.png":"light-mask"===c&&2===Math.abs(e.y-r.y)?"/react-chess/"+i.pieceColor+"-rock.png":"light-mask"===c&&3===Math.abs(e.y-r.y)?"/react-chess/"+i.pieceColor+"-bishop.png":a?"/react-chess/"+a.pieceColor+"-"+a.pieceType+".png":null,h=0===e.x?8-e.y:null,y=7===e.y?String.fromCharCode(97+e.x):null;return Object(f.jsx)(C,{pieceImgSrc:l,stackImgSrc:u,squareBackgroundColor:s,mayMove:o,usingMask:c,onClick:function(){return t.props.onClick(e)},rowIndicatorValue:h,colIndicatorValue:y},n)}},{key:"render",value:function(){var e=this;return Object(f.jsx)("div",{className:"board-container",children:Object(u.a)(Array(8)).map((function(t,n){return Object(f.jsx)("div",{className:"board-row",children:Object(u.a)(Array(8)).map((function(t,a){return e.renderSquare(x(n,a))}))},n)}))})}}]),n}(h.a.Component),M=function(e){Object(i.a)(n,e);var t=Object(o.a)(n);function n(e){var a;return Object(s.a)(this,n),(a=t.call(this,e)).state={squares:b(),nextColor:"white",tryToMove:null,mayMovePosition:[],historyMove:[],doingEnPassantCoord:null},a}return Object(c.a)(n,[{key:"handleClick",value:function(e){var t=this.state.squares.map((function(e){return e.slice()})),n=this.state.historyMove.slice(),a=this.state.doingEnPassantCoord,r=this.state.tryToMove,i=[];if(a){if(Math.abs(a.y-e.y)>=4||a.x!==e.x)return;console.log("doing en passant"),t=t[a.y][a.x].updateSquaresUsingEnPassant(t,a,e),this.setState({squares:t,doingEnPassantCoord:null})}else r&&this.state.mayMovePosition.some((function(t){return t.y===e.y&&t.x===e.x}))?(t=t[r.y][r.x].updateSquares(t,r,e),n.push({startPos:r,endPos:e,piece:t[e.y][e.x]}),t[e.y][e.x].tryToEnPassant(e)&&this.setState({doingEnPassantCoord:e}),this.setState({squares:t,nextColor:"black"===this.state.nextColor?"white":"black",historyMove:n})):t[e.y][e.x]&&t[e.y][e.x].pieceColor===this.state.nextColor&&(r=e,i=t[e.y][e.x].getCanMovePosition(e,t,n[n.length-1]));this.setState({tryToMove:r,mayMovePosition:i})}},{key:"render",value:function(){var e=this;return Object(f.jsx)("div",{className:"game",children:Object(f.jsx)("div",{className:"game-board",children:Object(f.jsx)(P,{squares:this.state.squares,onClick:function(t){return e.handleClick(t)},tryToMove:this.state.tryToMove,mayMovePosition:this.state.mayMovePosition,doingEnPassantCoord:this.state.doingEnPassantCoord})})})}}]),n}(h.a.Component);p.a.render(Object(f.jsx)(M,{}),document.getElementById("root"))},16:function(e,t,n){}},[[11,1,2]]]);
//# sourceMappingURL=main.ec328644.chunk.js.map