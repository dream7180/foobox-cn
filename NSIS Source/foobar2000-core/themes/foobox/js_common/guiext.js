TOOLTIP_PADDING_LEFT = 8;
TOOLTIP_PADDING_TOP = 3;
TOOLTIP_PADDING_RIGHT = 8;
TOOLTIP_PADDING_BOTTOM = 3;
TOOLTIP_TEXT_PADDING_LEFT = 6;
TOOLTIP_TEXT_PADDING_TOP = 2;
TOOLTIP_TEXT_PADDING_RIGHT = 6;
TOOLTIP_TEXT_PADDING_BOTTOM = 2;

function UISlider(ImgBg, ImgOverlay, ImgKnob, paddingLeft, paddingRight) {
	this.Enabled = true;
	this.State = 0; //0-normal 1-mouse hover 2-mouse down
	this.Value = 0;
	this.MinValue = 0;
	this.MaxValue = 100;
	
	this.setSize = function (x, y, w, h){
		this.X = x;
		this.Y = y;
		this.Width = w;
		this.Height = h;
	}

	this.ChangeValue = function(value) {
		this.Value = value;
		this.Repaint();
	}

	this.Paint = function(gr) {
		if (this.Enabled) {
			var pos = (this.Value / (this.MaxValue - this.MinValue) * this.Width) | 0;
			DrawThemedBox(gr, this.X, this.Y, this.Width, this.Height, ImgBg, paddingLeft, 0, paddingRight, 0);
			DrawThemedBox(gr, this.X, this.Y, pos, this.Height, ImgOverlay, paddingLeft, 0, paddingRight, 0);
			gr.DrawImage(ImgKnob, Math.floor(this.X + pos - (ImgKnob.Width / 2)), this.Y, ImgKnob.Width, ImgKnob.Height, 0, 0, ImgKnob.Width, ImgKnob.Height, 0);
		}
	}

	this.MouseDown = function(_x, _y) {
		if (this.State == 1) {
			this.State = 2;
			if (_x > this.X && _x < this.X + this.Width) {
				var pos = _x - this.X;
				this.Value = (pos * (this.MaxValue - this.MinValue) / this.Width) | 0;
				this.Repaint();
			}
			return true;
		} else return false;
	}

	this.MouseMove = function(_x, _y) {
		var _value;
		if (this.State == 2) {
			if (_x <= this.X) _value = this.MinValue;
			else {
				if (_x >= this.X + this.Width) _value = this.MaxValue;
				else {
					var pos = _x - this.X;
					_value = (pos * (this.MaxValue - this.MinValue) / this.Width) | 0;
				}
			}
			this.Value = _value;
			this.Repaint();
			return true;
		} else {
			if (_x > this.X - ImgKnob.Width / 2 && _x < this.X + this.Width + ImgKnob.Width / 2 && _y > this.Y && _y < this.Y + this.Height && this.Enabled) {
				this.State = 1;
				return true;
			} else this.State = 0;
		}
		return false;
	}

	this.MouseUp = function() {
		if (this.State == 2) {
			this.State = 0;
			return true;
		}
	}

	this.MouseWheel = function(step, valueStep) {
		if (this.State == 1) {
			var newValue = this.Value + (step * valueStep);
			if (newValue < this.MinValue) newValue = this.MinValue;
			if (newValue > this.MaxValue) newValue = this.MaxValue;
			this.ChangeValue(newValue);
			return true;
		}
		return false;
	}

	this.Repaint = function() {
		try{window.RepaintRect(this.X - (ImgKnob.Width / 2), this.Y, this.Width + ImgKnob.Width, this.Height)};
		catch(e){};
	}

}
//////////////////////

function DrawThemedBox(gr, x, y, w, h, ImageObj, paddingLeft, paddingTop, paddingRight, paddingBottom) {
	var r = x + w;
	var b = y + h;
	var imgWidth = ImageObj.Width;
	var imgHeight = ImageObj.Height;
	var imgMidWidth = imgWidth - paddingLeft - paddingRight;
	var imgMidHeight = imgHeight - paddingTop - paddingBottom;
	var midWidth = w - paddingLeft - paddingRight;
	var midHeight = h - paddingTop - paddingBottom;

	gr.DrawImage(ImageObj, (x + paddingLeft), (y + paddingTop), midWidth, midHeight, paddingLeft, paddingTop, imgMidWidth, imgMidHeight);
}

function UITooltip(x, y, txt, FontObj, color, TipBG) {
	this.Visible = false;
	this.X = x;
	this.Y = y;
	this.Width = 0;
	this.Height = 0
	this.Text = txt;
	var BgImageObj = TipBG;

	this.Paint = function(gr) {
		this.Width = gr.CalcTextWidth(this.Text, FontObj) + TOOLTIP_TEXT_PADDING_LEFT + TOOLTIP_TEXT_PADDING_RIGHT;
		this.Height = gr.CalcTextHeight(this.Text, FontObj) + TOOLTIP_TEXT_PADDING_TOP + TOOLTIP_TEXT_PADDING_BOTTOM;
		if (this.Visible) {
			DrawThemedBox(gr, this.X, this.Y, this.Width, this.Height, BgImageObj, 0, 0, 0, 0);
			gr.GdiDrawText(this.Text, FontObj, color, this.X + TOOLTIP_TEXT_PADDING_LEFT, this.Y + TOOLTIP_TEXT_PADDING_TOP, gr.CalcTextWidth(this.Text, FontObj), FontObj.Height, DT_NOPREFIX);
		}
	}

	this.Repaint = function() {
		window.RepaintRect(this.X, this.Y, this.Width, this.Height);
	}

	this.Activate = function() {
		this.Visible = true;
		this.Repaint();
	}

	this.Deactivate = function() {
		this.Visible = false;
		this.Repaint();
	}
}

function UITextView(x, y, w, h, txt, FontObj, color, formatStr) {
	this.X = x;
	this.Y = y;
	this.Width = w;
	this.Height = h;
	this.Text = txt;

	this.ChangeText = function(txt) {
		this.Text = txt;
		window.RepaintRect(this.X, this.Y, this.Width, this.Height);
	}

	this.Repaint = function() {
		window.RepaintRect(this.X, this.Y, this.Width, this.Height);
	}

	this.NewTrack = function() {
		this.ChangeText(TF(this.Text));
	}

	this.Paint = function(gr) {
		gr.GdiDrawText(this.Text, FontObj, color, this.X, this.Y, this.Width, this.Height, formatStr | DT_NOPREFIX);
	}
}