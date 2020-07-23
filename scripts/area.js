class Area {
	constructor(selector) {
		this.area = {};
		this.selector = selector;
		this.refresh_list = [];
		this.new_refresh_list = [];

		var self = this;

		this.refresh_interval = setInterval(
			function() {
				console.log(self.refresh_list.length + '( ' + self.refresh_list.filter(onlyUnique2D).length + ' )');
				// if(self.refresh_list.length > 2000){
				// 	self.refresh_list = [];
				// }
				for (let i = 0; i < self.refresh_list.length; i++) {
					self.get_cell(self.refresh_list[i][0], self.refresh_list[i][1]).refresh_state()
				}

				self.refresh_list = self.new_refresh_list.filter(onlyUnique2D);
				self.new_refresh_list = [];
			},
			25);
	}

	refresh_cell(x, y) {
		this.new_refresh_list.push([x, y]);
	}

	set_cell(x, y, type) {
		if (type == 'redstone_source') {
			this.area[[x, y]] = new RedstoneSource(x, y);
		}
		else if (type == 'simple_arrow') {
			this.area[[x, y]] = new SimpleArrow(x, y);
		}
		else if (type == 'double_arrow') {
			this.area[[x, y]] = new DoubleArrow(x, y);
		}
		else if (type == 'pull_arrow') {
			this.area[[x, y]] = new PullArrow(x, y);
		}
	};

	get_cell(x, y) {
		if (typeof this.area[[x, y]] !== 'undefined') {
			return this.area[[x, y]];
		}
		else {
			return new EmptyBlock();
		}
	}

	clear_cell(x, y) {
		this.area[[x, y]] = undefined;
	};

	click_cell(x, y) {
		this.get_cell(x, y).click();
	}
}

let area = new Area('#area');
let block_to_add = 'simple_arrow';

let mouse_buttons = {
	0: false,
	1: false,
	2: false
};

$(".menu").on('click', '.menu__block', function () {
	$('.menu .menu__block').removeClass('selected');
	$(this).addClass('selected');

	block_to_add = $(this).attr('block');
})

$(area.selector).on('contextmenu', 'tr td', function (e) {
	area.get_cell(this.cellIndex + 2, this.parentNode.rowIndex + 2).click();

	e.preventDefault();
	return false;
});

$(area.selector).on('mousedown', 'tr td', function (e) {
	mouse_buttons[e.button] = true;

	if (mouse_buttons[0]) {
		area.set_cell(this.cellIndex + 2, this.parentNode.rowIndex + 2, block_to_add);
	}
});

$(area.selector).on('mouseup', 'tr td', function (e) {
	mouse_buttons[e.button] = false;
});