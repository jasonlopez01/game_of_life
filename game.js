//Future improvements: add edit dims button for grid size
//re organize by creating create table function, seperate out calls.js from functions
//call create board with dim parameters

var row_len = 30
var col_len = 50
var cell_dim = 10;
var gen_btn = document.getElementById('gen_btn')
var start_btn = document.getElementById('start_btn')
var clear_btn = document.getElementById('clear_btn')
var container = document.getElementById('table_div');
var tbl = document.createElement('table');
tbl.setAttribute('align', 'center')
var row, cell, timer, speed

// Create cell objects and build game table
for (var a = 0; a < row_len; a++){
	row = tbl.insertRow()
    for (var b = 0; b < col_len; b++){
      c = row.insertCell()
      c.setAttribute('state', 0)
      c.setAttribute('prev_state', 0)
    }
};

//add table board and set dims
container.appendChild(tbl)
$('td').width(cell_dim)
$('td').height(cell_dim)

//interactive state change on click
$('td').click(function() {
	$(this).attr('state', Math.abs($(this).attr('state') - 1));
	$(this).attr('prev_state', $(this).attr('state'))
});


//function applies rules by iterating over each td, compiling score from neighbor td's state attr
function run_gen(){
	//loop to reset states
	$('td').each(function(){
		$(this).attr('prev_state', $(this).attr('state'));
	});
	//loop to apply rules
	$('td').each(function(){
		var score = 0
		var row_index = $(this).parent('tr').index()
		var col_index = $(this).index()
		for(var z = row_index - 1; z <= row_index + 1; z++){
			for(var p = col_index - 1; p <= col_index + 1; p++){
				n_row = (z + row_len) % row_len //modulo wraps grid
				n_col = (p + col_len) % col_len
				score += Number(tbl.rows[n_row].cells[n_col].getAttribute('prev_state'))
			}
		}
		if(score == 3){
			$(this).attr('state', 1)
		}else if(score < 3 || score > 4){
			$(this).attr('state', 0)
		}
	})
};

//set click input events
clear_btn.onclick = function(){
	$('td').attr({'state':0, 'prev_state':0})
}

gen_btn.onclick = function(){
	run_gen();
}

start_btn.onclick = function(){
	speed = $('#speed').val()
	if(timer){
		clearInterval(timer)
		timer = null
		$('small',this).text('Start')
	}else{
		timer = setInterval(run_gen, Math.abs(speed))
		$('small',this).text('Stop')
	}
}

$('#speed').on('change', function(){
	clearInterval(timer)
	timer = null
	timer = setInterval(run_gen, Math.abs($(this).val()))
	$('#start_btn small').text('Stop')
})

//helper functions to output and set shapes
function set_shape(points){
	//take input of coordinates and add to board (assumes input [[r1,c1], [r2,c2], ...])
	for(p in points){
		pr = points[p][0]
		pc = points[p][1]
		tbl.rows[pr].cells[pc].setAttribute('state', 1)
	}
 }

function print_active(){
	//output array of coordinates of active cells
	var active_cells = []
	$('td[state="1"]').each(function(){
		active_cells.push([$(this).parent('tr').index(), $(this).index()])
	});
	return JSON.stringify(active_cells)
}

//dict for loading shapes
var shapes = {
	'Space Ship':[[8,8],[8,9],[9,7],[9,8],[9,9],[9,10],[10,7],[10,8],[10,10],[10,11],[11,9],[11,10]],
	'Glider' : [[8,10],[9,11],[10,9],[10,10],[10,11]],
	'Pulsar' : [[6,11],[7,10],[7,12],[8,9],[8,13],[9,9],[9,13],[10,9],[10,13],[11,9],[11,13],[12,9],[12,13],[13,9],[13,13],[14,10],[14,12],[15,11]],
	'Pulsar2' : [[6,5],[6,6],[6,7],[6,11],[6,12],[6,13],[8,3],[8,8],[8,10],[8,15],[9,3],[9,8],[9,10],[9,15],[10,3],[10,8],[10,10],[10,15],[11,5],
		[11,6],[11,7],[11,11],[11,12],[11,13],[13,5],[13,6],[13,7],[13,11],[13,12],[13,13],[14,3],[14,8],[14,10],[14,15],[15,3],[15,8],
		[15,10],[15,15],[16,3],[16,8],[16,10],[16,15],[18,5],[18,6],[18,7],[18,11],[18,12],[18,13]],
	'R Pentomino' : [[7,10],[7,11],[8,9],[8,10],[9,10]],
	'Die Hard' : [[7,14],[8,8],[8,9],[9,9],[9,13],[9,14],[9,15]],
	'Acorn' : [[7,8],[8,10],[9,7],[9,8],[9,11],[9,12],[9,13]],
	'Grower1' : [[7,13],[8,11],[8,13],[8,14],[9,11],[9,13],[10,11],[11,9],[12,7],[12,9]],
	'Grower2' : [[8,9],[8,10],[8,11],[8,13],[9,9],[10,12],[10,13],[11,10],[11,11],[11,13],[12,9],[12,11],[12,13]],
	'Grower3' : [[10,1],[10,2],[10,3],[10,4],[10,5],[10,6],[10,7],[10,8],[10,10],[10,11],[10,12],[10,13],[10,14],[10,18],[10,19],
		[10,20],[10,27],[10,28],[10,29],[10,30],[10,31],[10,32],[10,33],[10,35],[10,36],[10,37],[10,38],[10,39]],
	'Gosper Glider Gun' : [[1,26],[2,24],[2,26],[3,14],[3,15],[3,22],[3,23],[3,36],[3,37],[4,13],[4,17],[4,22],[4,23],[4,36],[4,37],[5,2],[5,3],
		[5,12],[5,18],[5,22],[5,23],[6,2],[6,3],[6,12],[6,16],[6,18],[6,19],[6,24],[6,26],[7,12],[7,18],[7,26],[8,13],[8,17],[9,14],[9,15]],
	'Initial Shape': [[15,15], [16,15], [17,15], [18,15], [19,15], [20,15], [21,15], [22,15], [23,15], [24,15]]
}

//programatically add shapes to LOV
for(shape in shapes){
	var item = $('<li><a>' + shape + '</a></li>')
	$('#shapesLOV').append(item)
}

//call shape loading function on click
$('.dropdown-menu li a').click(function() {
	set_shape(shapes[this.text])
});

//load inital shape
$(document).ready(set_shape(shapes['Initial Shape']))