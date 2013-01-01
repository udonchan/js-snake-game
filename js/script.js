(function(){

    var fps = 5;

    var SnakeGame = function(size_x, size_y, step_handler){
	this.size_x = size_x;
	this.size_y = size_y;
	var snake_head = {x : Math.floor((size_x - 1) / 2), 
			  y : Math.floor((size_y - 1) / 2)
	};
	this.snake = [snake_head];
	this.score = 0;

	this._newFood();
	this._current_direction = Math.floor(Math.random() * 4);
	this._step_handler = step_handler;
	this._step_handler();
	this._timer;
    };

    SnakeGame.prototype.set_direction = function(direction) {
	if(0 <= direction && direction <=3 && 
	   !(this.snake.length > 1  && (direction - this._current_direction)%2 == 0) // omit dead direction
	    ){
	    this._current_direction = direction;
	}
    }

    SnakeGame.prototype._newFood = function(){
    OUTTER_LOOP: do {
	    this.food = this._randDot();
	    for(var i = 0; i < this.snake.length; i++){ 
		if(this.food.x == this.snake[i].x && this.food.y == this.snake[i].y){
		    continue OUTTER_LOOP;	
		}
	    }
	    break;
	}while(true);
    }

    SnakeGame.prototype._randDot = function(){
	return {x : Math.floor(Math.random()*(this.size_x-1)),
		y : Math.floor(Math.random()*(this.size_y-1))
	};
    }

    SnakeGame.prototype.stop = function(){
	clearInterval(this._timer);
    }

    SnakeGame.prototype.step = function(){
	var current_head = this.snake[0];
	var new_head;
	switch(this._current_direction){
	    case 0: // left
		new_head = {x : current_head.x - 1, y : current_head.y};
		break;
	    case 1: // up
		new_head = {x : current_head.x, y : current_head.y - 1};
		break;
	    case 2: // right
		new_head = {x : current_head.x + 1, y : current_head.y};
		break;
	    case 3: // down
		new_head = {x : current_head.x, y : current_head.y + 1};
		break;
	    default:
		break;
	}
	if(this.judge_head(new_head) == -1) { 
	    this.stop();
	    return;
	}
	
	this.snake.unshift(new_head); // add new head 
	
	if(this.judge_head(new_head) == 1) { // got a food
	    this._newFood();
	    this.score++;
	} else {
	    this.snake.pop();
	}
	this._step_handler();
    };

    SnakeGame.prototype.judge_head = function(new_head){
	if(new_head.x  < 0 || this.size_x <= new_head.x ||
	   new_head.y < 0 ||  this.size_y <= new_head.y){ // out of range
	    return -1
	}
	for(var i = 1; i < this.snake.length; i++){ // head hit the body
	    if(new_head.x == this.snake[i].x && new_head.y == this.snake[i].y){
		return -1;
	    }
	}
	if(new_head.x == this.food.x && new_head.y == this.food.y) {// got a food
	    return 1 
	}
	return 0; 
    }

    SnakeGame.prototype.start = function(){
	this._timer = setInterval(
	    (function(receiver){
		return function(){
		    receiver.step();
		};
	    })(this), 1000/fps);
    }
    window.SnakeGame = SnakeGame;
})();

jQuery(document).ready(function(){
    var game_view = jQuery("#game_view");
    var start_button = jQuery("#start");
    var reload_button = jQuery("#reload");
    var score_label = jQuery("#score");

    var snakeGame = new SnakeGame(15, 10, function draw() {
	// print score label
	score_label.html(this.score);

	var _blank = "\u25a1";
	var _snake = "\u25a0";
	var _food = "\u2605";

	// init draw matrix
	var matrix = [];
	for (var y = 0; y < this.size_y; y++) {
	    matrix[y] = new Array(this.size_x);
	    for (x = 0; x < matrix[y].length; x++) {
		matrix[y][x] = _blank;
	    }
	}
	// append snake dotts to matrix
	for(var i = 0; i < this.snake.length; i++)
	    matrix[this.snake[i].y][this.snake[i].x] = _snake;
	// append a star dot to matrix
	matrix[this.food.y][this.food.x] = _food;

	var str = "";
	for (var y = 0; y < matrix.length; y++) {
	    str += matrix[y].join("") + "<br />";
	} 
	game_view.html(str);
    });

    $('body').keydown(function(e){
	    switch (e.keyCode) {
		case 37://left
		case 38://up
		case 39://right
		case 40://down
		    snakeGame.set_direction(e.keyCode-37);
		default:
		    return false;
	    }
	});

    start_button.click(function(){
	snakeGame.start();
    });

    reload_button.click(function(){
	location.reload()
    });
});
