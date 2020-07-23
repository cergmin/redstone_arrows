class Block {
	constructor(x, y, name, icon_size, icon_src, active_icon_src, active_color) {
		this.x = x;
		this.y = y;
		this.is_active = false;
		this.domino_refresh = false;
		this.redstone_sources = {};

		this.name = name;
		this.icon_size = icon_size;
		this.icon_src = icon_src;
		this.active_icon_src = active_icon_src;
		this.active_color = active_color;

		this.draw();
	}

	get styles() {
		let styles = '';

		if (this.is_active) {
			styles += 'background-color: ' + this.active_color + ';';
			styles += 'background-image: url(' + this.active_icon_src + ');';
		}
		else {
			styles += 'background-image: url(' + this.icon_src + ');';
		}

		styles += 'background-repeat: no-repeat;';
		styles += 'background-position: center;';
		styles += 'background-size: ' + this.icon_size + ';';

		return styles;
	}

	get number_of_redstone_sources() {
		let n = 0;

		let new_redstone_sources = {};

		for (let key in this.redstone_sources) {
			if (this.redstone_sources.hasOwnProperty(key) && this.redstone_sources[key]) {
				n += 1;
				new_redstone_sources[key] = this.redstone_sources[key];
			}
		}

		this.redstone_sources = new_redstone_sources;

		return n;
	}

	refresh_state() {
		this.is_active = false;

		this.draw();

		// New coordinates to refresh state
		area.refresh_cell(this.x + 1, this.y);
		area.refresh_cell(this.x, this.y + 1);
		area.refresh_cell(this.x - 1, this.y);
		area.refresh_cell(this.x, this.y - 1);
	}

	draw() {
		$(area.selector + ' tr:nth-child(' + (this.y - 1) + ') td:nth-child(' + (this.x - 1) + ')').attr("type", this.name);
		$(area.selector + ' tr:nth-child(' + (this.y - 1) + ') td:nth-child(' + (this.x - 1) + ')').attr("is-active", this.is_active);
		$(area.selector + ' tr:nth-child(' + (this.y - 1) + ') td:nth-child(' + (this.x - 1) + ')').attr("style", this.styles);
	}

	add_redstone_source(x, y) {
		this.redstone_sources[[x, y]] = true;
	}

	remove_redstone_source(x, y) {
		this.redstone_sources[[x, y]] = false;
	}

	click() {
		return;
	}
}

class EmptyBlock extends Block {
	constructor() {
		super(0, 0, 'empty_block', '0%', '', '', '');
	}

	get styles() {
		return '';
	}

	get number_of_redstone_sources() {
		return 0;
	}

	refresh_state() {
		return;
	}

	draw() {
		return;
	}

	add_redstone_source(x, y) {
		return;
	}

	remove_redstone_source(x, y) {
		return;
	}

	click() {
		return;
	}
}

class RedstoneSource extends Block {
	constructor(x, y) {
		super(x,
			y,
			'redstone_source',
			'60%',
			'./images/redstone_source.png',
			'./images/redstone_source_white.png',
			'hsla(0, 100%, 40%, 1)');
	}

	refresh_state() {
		this.draw();

		if (this.is_active) {
			area.get_cell(this.x + 1, this.y).add_redstone_source(this.x, this.y);
			area.get_cell(this.x, this.y + 1).add_redstone_source(this.x, this.y);
			area.get_cell(this.x - 1, this.y).add_redstone_source(this.x, this.y);
			area.get_cell(this.x, this.y - 1).add_redstone_source(this.x, this.y);
		}
		else {
			area.get_cell(this.x + 1, this.y).remove_redstone_source(this.x, this.y);
			area.get_cell(this.x, this.y + 1).remove_redstone_source(this.x, this.y);
			area.get_cell(this.x - 1, this.y).remove_redstone_source(this.x, this.y);
			area.get_cell(this.x, this.y - 1).remove_redstone_source(this.x, this.y);
		}

		area.refresh_cell(this.x + 1, this.y);
		area.refresh_cell(this.x, this.y + 1);
		area.refresh_cell(this.x - 1, this.y);
		area.refresh_cell(this.x, this.y - 1);
	}

	click() {
		this.is_active = !this.is_active;
		return this.refresh_state();
	}
}

class SimpleArrow extends Block {
	constructor(x, y) {
		super(x,
			y,
			'simple_arrow',
			'70%',
			'./images/simple_arrow.png',
			'./images/simple_arrow_white.png',
			'hsla(0, 100%, 40%, 1)');
		this.direction = 1;
	}

	get styles() {
		let styles = super.styles;

		if (this.direction == 2) {
			styles += 'transform: rotate(90deg);';
		}
		else if (this.direction == 3) {
			styles += 'transform: rotate(180deg);';
		}
		else if (this.direction == 4) {
			styles += 'transform: rotate(270deg);';
		}

		return styles;
	}

	refresh_state() {
		this.is_active = (this.number_of_redstone_sources > 0 ? true : false);

		this.draw();

		let sides = [
			[this.x, this.y - 1],
			[this.x + 1, this.y],
			[this.x, this.y + 1],
			[this.x - 1, this.y]
		];

		if (this.is_active) {
			for (let i = 0; i < 4; i++) {
				if (i + 1 == this.direction) {
					area.get_cell(sides[i][0], sides[i][1]).add_redstone_source(this.x, this.y);
				}
				else {
					area.get_cell(sides[i][0], sides[i][1]).remove_redstone_source(this.x, this.y);
				}
			}
		}
		else {
			for (let i = 0; i < 4; i++) {
				area.get_cell(sides[i][0], sides[i][1]).remove_redstone_source(this.x, this.y);
			}
		}

		if (this.direction == 1) {
			area.refresh_cell(this.x, this.y - 1);
		}
		else if (this.direction == 2) {
			area.refresh_cell(this.x + 1, this.y);
		}
		else if (this.direction == 3) {
			area.refresh_cell(this.x, this.y + 1);
		}
		else if (this.direction == 4) {
			area.refresh_cell(this.x - 1, this.y);
		}
	}

	click() {
		this.direction++;

		if (this.direction > 4) {
			this.direction = 1;
		}

		this.refresh_state();
		area.refresh_cell(this.x + 1, this.y);
		area.refresh_cell(this.x, this.y + 1);
		area.refresh_cell(this.x - 1, this.y);
		area.refresh_cell(this.x, this.y - 1);
	}
}

class DoubleArrow extends Block {
	constructor(x, y) {
		super(x,
			y,
			'pull_arrow',
			'70%',
			'./images/double_arrow.png',
			'./images/double_arrow_white.png',
			'hsla(240, 100%, 40%, 1)');
		this.direction = 1;
	}

	get styles() {
		let styles = super.styles;

		if (this.direction == 2) {
			styles += 'transform: rotate(90deg);';
		}
		else if (this.direction == 3) {
			styles += 'transform: rotate(180deg);';
		}
		else if (this.direction == 4) {
			styles += 'transform: rotate(270deg);';
		}

		return styles;
	}

	refresh_state() {
		this.is_active = (this.number_of_redstone_sources > 0 ? true : false);

		this.draw();

		let sides = [
			[this.x, this.y - 2],
			[this.x + 2, this.y],
			[this.x, this.y + 2],
			[this.x - 2, this.y]
		];

		if (this.is_active) {
			for (let i = 0; i < 4; i++) {
				if (i + 1 == this.direction) {
					area.get_cell(sides[i][0], sides[i][1]).add_redstone_source(this.x, this.y);
				}
				else {
					area.get_cell(sides[i][0], sides[i][1]).remove_redstone_source(this.x, this.y);
				}
			}
		}
		else {
			for (let i = 0; i < 4; i++) {
				area.get_cell(sides[i][0], sides[i][1]).remove_redstone_source(this.x, this.y);
			}
		}

		if (this.direction == 1) {
			area.refresh_cell(this.x, this.y - 2);
		}
		else if (this.direction == 2) {
			area.refresh_cell(this.x + 2, this.y);
		}
		else if (this.direction == 3) {
			area.refresh_cell(this.x, this.y + 2);
		}
		else if (this.direction == 4) {
			area.refresh_cell(this.x - 2, this.y);
		}
	}

	click() {
		this.direction++;

		if (this.direction > 4) {
			this.direction = 1;
		}

		this.refresh_state();
		area.refresh_cell(this.x + 1, this.y);
		area.refresh_cell(this.x, this.y + 1);
		area.refresh_cell(this.x - 1, this.y);
		area.refresh_cell(this.x, this.y - 1);
	}
}

class PullArrow extends Block {
	constructor(x, y) {
		super(x,
			y,
			'pull_arrow',
			'70%',
			'./images/pull_arrow.png',
			'./images/pull_arrow_white.png',
			'hsla(0, 100%, 40%, 1)');
		this.direction = 1;

		this.domino_refresh = true;
	}

	get styles() {
		let styles = super.styles;

		if (this.direction == 2) {
			styles += 'transform: rotate(90deg);';
		}
		else if (this.direction == 3) {
			styles += 'transform: rotate(180deg);';
		}
		else if (this.direction == 4) {
			styles += 'transform: rotate(270deg);';
		}

		return styles;
	}

	refresh_state() {
		let sides = [
			[this.x, this.y + 1],
			[this.x - 1, this.y],
			[this.x, this.y - 1],
			[this.x + 1, this.y]
		];
		
		this.is_active = area.get_cell(
			sides[this.direction - 1][0], 
			sides[this.direction - 1][1]
		).is_active || (this.number_of_redstone_sources > 0 ? true : false);

		this.draw();

		sides = [
			[this.x, this.y - 1],
			[this.x + 1, this.y],
			[this.x, this.y + 1],
			[this.x - 1, this.y]
		];

		if (this.is_active) {
			for (let i = 0; i < 4; i++) {
				if (i + 1 == this.direction) {
					area.get_cell(sides[i][0], sides[i][1]).add_redstone_source(this.x, this.y);
				}
				else {
					area.get_cell(sides[i][0], sides[i][1]).remove_redstone_source(this.x, this.y);
				}
			}
		}
		else {
			for (let i = 0; i < 4; i++) {
				area.get_cell(sides[i][0], sides[i][1]).remove_redstone_source(this.x, this.y);
			}
		}

		if (this.direction == 1) {
			area.refresh_cell(this.x, this.y - 1);
		}
		else if (this.direction == 2) {
			area.refresh_cell(this.x + 1, this.y);
		}
		else if (this.direction == 3) {
			area.refresh_cell(this.x, this.y + 1);
		}
		else if (this.direction == 4) {
			area.refresh_cell(this.x - 1, this.y);
		}
	}

	click() {
		this.direction++;

		if (this.direction > 4) {
			this.direction = 1;
		}

		this.refresh_state();
		area.refresh_cell(this.x + 1, this.y);
		area.refresh_cell(this.x, this.y + 1);
		area.refresh_cell(this.x - 1, this.y);
		area.refresh_cell(this.x, this.y - 1);
	}
}

class LogicalAnd extends Block {
	constructor(x, y) {
		super(x,
			y,
			'logical_arrow',
			'70%',
			'./images/logical_and.png',
			'./images/logical_and_white.png',
			'hsl(45, 100%, 40%)');
		this.direction = 1;
	}

	get styles() {
		let styles = super.styles;

		if (this.direction == 2) {
			styles += 'transform: rotate(90deg);';
		}
		else if (this.direction == 3) {
			styles += 'transform: rotate(180deg);';
		}
		else if (this.direction == 4) {
			styles += 'transform: rotate(270deg);';
		}

		return styles;
	}

	refresh_state() {
		this.is_active = (this.number_of_redstone_sources > 1 ? true : false);

		this.draw();

		let sides = [
			[this.x, this.y - 1],
			[this.x + 1, this.y],
			[this.x, this.y + 1],
			[this.x - 1, this.y]
		];

		if (this.is_active) {
			for (let i = 0; i < 4; i++) {
				if (i + 1 == this.direction) {
					area.get_cell(sides[i][0], sides[i][1]).add_redstone_source(this.x, this.y);
				}
				else {
					area.get_cell(sides[i][0], sides[i][1]).remove_redstone_source(this.x, this.y);
				}
			}
		}
		else {
			for (let i = 0; i < 4; i++) {
				area.get_cell(sides[i][0], sides[i][1]).remove_redstone_source(this.x, this.y);
			}
		}

		if (this.direction == 1) {
			area.refresh_cell(this.x, this.y - 1);
		}
		else if (this.direction == 2) {
			area.refresh_cell(this.x + 1, this.y);
		}
		else if (this.direction == 3) {
			area.refresh_cell(this.x, this.y + 1);
		}
		else if (this.direction == 4) {
			area.refresh_cell(this.x - 1, this.y);
		}
	}

	click() {
		this.direction++;

		if (this.direction > 4) {
			this.direction = 1;
		}

		this.refresh_state();
		area.refresh_cell(this.x + 1, this.y);
		area.refresh_cell(this.x, this.y + 1);
		area.refresh_cell(this.x - 1, this.y);
		area.refresh_cell(this.x, this.y - 1);
	}
}

class LogicalNot extends Block {
	constructor(x, y) {
		super(x,
			y,
			'logical_not',
			'70%',
			'./images/logical_not.png',
			'./images/logical_not_white.png',
			'hsl(45, 100%, 40%)');
		this.direction = 1;
		this.is_active = true;
		this.refresh_state();
	}

	get styles() {
		let styles = super.styles;

		if (this.direction == 2) {
			styles += 'transform: rotate(90deg);';
		}
		else if (this.direction == 3) {
			styles += 'transform: rotate(180deg);';
		}
		else if (this.direction == 4) {
			styles += 'transform: rotate(270deg);';
		}

		return styles;
	}

	refresh_state() {
		this.is_active = (this.number_of_redstone_sources > 0 ? false : true);

		this.draw();

		let sides = [
			[this.x, this.y - 1],
			[this.x + 1, this.y],
			[this.x, this.y + 1],
			[this.x - 1, this.y]
		];

		if (this.is_active) {
			for (let i = 0; i < 4; i++) {
				if (i + 1 == this.direction) {
					area.get_cell(sides[i][0], sides[i][1]).add_redstone_source(this.x, this.y);
				}
				else {
					area.get_cell(sides[i][0], sides[i][1]).remove_redstone_source(this.x, this.y);
				}
			}
		}
		else {
			for (let i = 0; i < 4; i++) {
				area.get_cell(sides[i][0], sides[i][1]).remove_redstone_source(this.x, this.y);
			}
		}

		if (this.direction == 1) {
			area.refresh_cell(this.x, this.y - 1);
		}
		else if (this.direction == 2) {
			area.refresh_cell(this.x + 1, this.y);
		}
		else if (this.direction == 3) {
			area.refresh_cell(this.x, this.y + 1);
		}
		else if (this.direction == 4) {
			area.refresh_cell(this.x - 1, this.y);
		}
	}

	click() {
		this.direction++;

		if (this.direction > 4) {
			this.direction = 1;
		}

		this.refresh_state();
		area.refresh_cell(this.x + 1, this.y);
		area.refresh_cell(this.x, this.y + 1);
		area.refresh_cell(this.x - 1, this.y);
		area.refresh_cell(this.x, this.y - 1);
	}
}