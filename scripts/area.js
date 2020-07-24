class Area {
	constructor(selector) {
		this.area = {};
		this.selector = selector;
		this.refresh_list = [];
		this.new_refresh_list = [];
		this.domino_refresh_links = [];

		var self = this;

		this.refresh_interval = setInterval(
			function () {
				// console.log(self.refresh_list.length);
				// if(self.refresh_list.length > 2000){
				// 	self.refresh_list = [];
				// }
				for (let i = 0; i < self.refresh_list.length; i++) {
					self.get_cell(self.refresh_list[i][0], self.refresh_list[i][1]).refresh_state()
				}

				self.refresh_list = self.new_refresh_list.filter(onlyUnique2D);
				self.new_refresh_list = [];
			},
			1000 / 30);
	}

	refresh_cell(x, y) {
		this.new_refresh_list.push([x, y]);

		if (this.domino_refresh_links[[x, y]] !== undefined) {
			for (let i = 0; i < this.domino_refresh_links[[x, y]].length; i++) {
				this.new_refresh_list.push(this.domino_refresh_links[[x, y]][i]);
			}
		}
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
		else if (type == 'logical_and') {
			this.area[[x, y]] = new LogicalAnd(x, y);
		}
		else if (type == 'logical_not') {
			this.area[[x, y]] = new LogicalNot(x, y);
		}
		else if (type == 'empty') {
			let sides = [
				[x, y - 1],
				[x + 1, y],
				[x, y + 1],
				[x - 1, y],
				[x, y - 2],
				[x + 2, y],
				[x, y + 2],
				[x - 2, y]
			];

			for (let i = 0; i < sides.length; i++) {
				this.get_cell(sides[i][0], sides[i][1]).remove_redstone_source(x, y);
				this.refresh_cell(sides[i][0], sides[i][1]);
			}

			$(this.selector + ' tr:nth-child(' + (y - 1) + ') td:nth-child(' + (x - 1) + ')').attr("type", '');
			$(this.selector + ' tr:nth-child(' + (y - 1) + ') td:nth-child(' + (x - 1) + ')').attr("is-active", '');
			$(this.selector + ' tr:nth-child(' + (y - 1) + ') td:nth-child(' + (x - 1) + ')').attr("style", '');

			this.area[[x, y]] = undefined;
		}
		else if (type == 'info') {
			console.log(this.area[[x, y]]);
		}

		if (this.area[[x, y]] !== undefined && this.area[[x, y]].domino_refresh) {
			let sides = [
				[x, y - 1],
				[x + 1, y],
				[x, y + 1],
				[x - 1, y]
			];
			for (let i = 0; i < 4; i++) {
				if (this.domino_refresh_links[sides[i]] !== undefined) {
					this.domino_refresh_links[sides[i]].push([x, y]);
				}
				else {
					this.domino_refresh_links[sides[i]] = [[x, y]];
				}
			}
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

let mouse_last_position;
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
	mouse_last_position = [e.clientX, e.clientY];

	if (mouse_buttons[0]) {
		if (e.shiftKey) {
			area.set_cell(this.cellIndex + 2, this.parentNode.rowIndex + 2, 'empty');
		}
		else {
			area.set_cell(this.cellIndex + 2, this.parentNode.rowIndex + 2, block_to_add);
		}
	}
});

$(area.selector).on('mouseup', 'tr td', function (e) {
	mouse_buttons[e.button] = false;
});

$(area.selector).on("mousemove", "tr td", function (e) {
	if (mouse_buttons[0]) {
		if (e.shiftKey) {
			area.set_cell(this.cellIndex + 2, this.parentNode.rowIndex + 2, 'empty');
		}
		else {
			area.set_cell(this.cellIndex + 2, this.parentNode.rowIndex + 2, block_to_add);

			let flag = false;
			let blocks_with_directions = ['simple_arrow', 'double_arrow', 'pull_arrow', 'logical_and', 'logical_not'];
			for (let i = 0; i < blocks_with_directions.length; i++) {
				if (block_to_add == blocks_with_directions[i]) {
					flag = true;
					break;
				}
			}

			if (flag) {
				let vector = normalize(
					e.clientX - mouse_last_position[0],
					e.clientY - mouse_last_position[1]
				);
				let angle = Math.atan2(vector.y, vector.x) * 180 / Math.PI;
				let direction = 1;

				if (angle <= -45 && angle > -130) {
					direction = 1;
				} else if (angle > -180 && angle <= -130 || angle <= 180 && angle > 130) {
					direction = 4;
				} else if (angle > 45 && angle <= 130) {
					direction = 3;
				} else if (angle <= 45 && angle > -45) {
					direction = 2;
				}

				area.get_cell(this.cellIndex + 2, this.parentNode.rowIndex + 2).direction = direction;
				area.refresh_cell(this.cellIndex + 2, this.parentNode.rowIndex + 2);
			}
		}
	}

	mouse_last_position = [e.clientX, e.clientY];
});