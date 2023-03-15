TOOLTIP_TEXT_PADDING_LEFT = 6;
TOOLTIP_TEXT_PADDING_TOP = 2;
TOOLTIP_TEXT_PADDING_RIGHT = 6;
TOOLTIP_TEXT_PADDING_BOTTOM = 2;

function UISlider(ImgBg, ImgOverlay, ImgKnob, ImgDiv) {
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
			var pos = this.Value / (this.MaxValue - this.MinValue);
			if (pos > 1) pos = 1;
			pos = (pos * this.Width) | 0;
			DrawThemedBox(gr, this.X, this.Y, this.Width, this.Height, ImgBg);
			DrawThemedBox(gr, this.X, this.Y, pos, this.Height, ImgOverlay);
			if(ImgDiv) {
				for (var i = 1; i < 10; i++) {
					gr.DrawImage(ImgDiv, Math.ceil(this.X + this.Width/10*i), this.Y, ImgDiv.Width, this.Height, 0, 0, ImgDiv.Width, ImgDiv.Height);
				}
			}
			gr.DrawImage(ImgKnob, Math.floor(this.X + pos - (ImgKnob.Width / 2)), this.Y, ImgKnob.Width, ImgKnob.Height, 0, 0, ImgKnob.Width, ImgKnob.Height);
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
	
	this.MouseLeave = function() {
		this.State = 0;
	}

	this.Repaint = function() {
		try{window.RepaintRect(this.X - (ImgKnob.Width / 2), this.Y, this.Width + ImgKnob.Width, this.Height)}
		catch(e){};
	}

}
//////////////////////

function DrawThemedBox(gr, x, y, w, h, ImageObj) {
	gr.DrawImage(ImageObj, x, y, w, h, 0, 0, ImageObj.Width-2, ImageObj.Height);
}

function UITooltip(x, y, txt, FontObj, color, TipBG) {
	this.Visible = false;
	this.X = x;
	this.Y = y;
	this.Width = 0;
	this.Height = 0
	this.Text = txt;
	if(TipBG) var BgImageObj = TipBG;

	this.Paint = function(gr) {
		this.Width = gr.CalcTextWidth(this.Text, FontObj) + TOOLTIP_TEXT_PADDING_LEFT + TOOLTIP_TEXT_PADDING_RIGHT;
		this.Height = gr.CalcTextHeight(this.Text, FontObj) + TOOLTIP_TEXT_PADDING_TOP + TOOLTIP_TEXT_PADDING_BOTTOM;
		if (this.Visible) {
			if(TipBG) DrawThemedBox(gr, this.X, this.Y, this.Width, this.Height, BgImageObj);
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

function UITextView(txt, FontObj, color, formatStr) {
	this.X = 0;
	this.Y = 0;
	this.Width = 0;
	this.Height = 0;
	this.Text = txt;
	
	this.SetSize = function(x, y, w, h) {
		this.X = x;
		this.Y = y;
		this.Width = w;
		this.Height = h;
	}

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
		gr.GdiDrawText(this.Text, FontObj, color, this.X, this.Y, this.Width, this.Height, formatStr);
	}
}

//DEFINE CLASS ButtonUI 
function ButtonUI(img, tooltipText) {
	this.x = null;
	this.y = null;
	this.img = img;
	this.width = img.Width;
	this.height = img.Height/3;
	this.state = 0; //0-normal ;1-hover ;2-down ;3-disable
	if(tooltipText){
		this.Tooltip = window.CreateTooltip("",g_fsize);
		this.Tooltip.Text = tooltipText;
	} else this.Tooltip = null;
}

ButtonUI.prototype.SetXY = function(x, y){
	this.x = x;
	this.y = y;
}

ButtonUI.prototype.Paint = function(gr) {
	gr.DrawImage(this.img, this.x, this.y, this.width, this.height, 0, 0, this.width, this.height, 0);
	if(this.state > 0) gr.DrawImage(this.img, this.x, this.y, this.width, this.height, 0, this.state * this.height, this.width, this.height, 0);
}

ButtonUI.prototype.Repaint = function() {
	window.RepaintRect(this.x, this.y, this.width, this.height);
}

ButtonUI.prototype.MouseMove = function(x, y) {
	if (x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height) {
		if (this.state == 0) {
			this.state = 1;
			this.Tooltip && this.Tooltip.Activate();
			this.Repaint();
		}
		return true;
	} else {
		this.Reset();
		return false;
	}
}

ButtonUI.prototype.MouseDown = function(x, y) {
	if (this.state == 1) {
		this.state = 2;
		this.Repaint();
		return true;
	} else return false;
}

ButtonUI.prototype.MouseUp = function() {
	if (this.state == 2) {
		this.Reset();
		return true;
	} else return false;
}

ButtonUI.prototype.Reset = function() {
	if (this.state != 0) {
		this.state = 0;
		this.Tooltip && this.Tooltip.Deactivate();
		this.Repaint();
	}
}