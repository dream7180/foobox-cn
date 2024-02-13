// *****************************************************************************************************************************************
// SETTINGS functions by Br3tt aka Falstaff (c)2015, mod for foobox https://github.com/dream7180
// *****************************************************************************************************************************************

// Objects linked functions
function settings_checkboxes_action(id, status, parentId) {
	var fin;
	switch (parentId) {
	case 0:
		switch (id) {
		case 0:
			eval(p.settings.pages[parentId].elements[id].linkedVariable + " = " + status);
			window.SetProperty("CUSTOM Enable Smooth Scrolling", status);
			p.settings.pages[parentId].elements[id].repaint();
			break;
		case 1:
			eval(p.settings.pages[parentId].elements[id].linkedVariable + " = " + status);
			window.SetProperty("SYSTEM.Enable Touch Scrolling", status);
			p.settings.pages[parentId].elements[id].repaint();
		case 6:
			eval(p.settings.pages[parentId].elements[id].linkedVariable + " = " + status);
			window.SetProperty("CUSTOM Enable Selection Menu", status);
			p.settings.pages[parentId].elements[id].repaint();
			break;
			break;
		case 7:
			eval(p.settings.pages[parentId].elements[id].linkedVariable + " = " + status);
			window.SetProperty("PLAYBACK: Repeat playlists", status);
			p.settings.pages[parentId].elements[id].repaint();
			break;
		};
		break;
	case 3:
		switch (id) {
		case 2:
			if (status) {
				rating2tag = true;
			}
			else {
				rating2tag = false;
			}
			window.NotifyOthers("set_rating_2_tag", rating2tag);
			window.SetProperty("foobox.rating.write.to.file", rating2tag);
			p.settings.pages[parentId].elements[id].repaint();
			break;
		case 3:
			if (status) {
				follow_cursor = true;
			}
			else {
				follow_cursor = false;
			}
			window.NotifyOthers("foobox_infoArt_followcursor", follow_cursor);
			window.SetProperty("foobox.infoArt.follow.cursor", follow_cursor);
			p.settings.pages[parentId].elements[id].repaint();
			break;
		case 4:
			if (status) {
				color_bycover = true;
			}
			else {
				color_bycover = false;
			}
			window.NotifyOthers("foobox_color_bycover", color_bycover);
			if(!color_bycover) {
				window.NotifyOthers("color_scheme_updated", null);
				if(g_color_highlight != c_default_hl){
					g_color_highlight = c_default_hl;
					get_images_color();
					full_repaint();
				}
			}
			window.SetProperty("foobox.color.by.cover", color_bycover);
			p.settings.pages[parentId].elements[id].repaint();
			break;
		case 5:
			if (status) {
				albcov_lt = true;
			}
			else {
				albcov_lt = false;
			}
			get_covercahe_config();
			window.NotifyOthers("alb_ignoring_art", albcov_lt);
			window.SetProperty("Album.cover.ignoring.artist", albcov_lt);
			p.settings.pages[parentId].elements[id].repaint();
			break;
		case 7:
			if (status) {
				show_extrabtn = true;
			}
			else {
				show_extrabtn = false;
			}
			window.NotifyOthers("Show_open_stop_buttons", show_extrabtn);
			window.SetProperty("foobox.show.Open.Stop.buttons", show_extrabtn);
			p.settings.pages[parentId].elements[id].repaint();
			break;
		}
		break;
	case 4:
		var selectedLayoutId = p.settings.pages[parentId].elements[0].selectedId;
		switch (id) {
		case 1:
			if (status) {
				layout.config[selectedLayoutId][1] = "1";
				if(selectedLayoutId == layout.index) layout.showCover = 1;
			}
			else {
				layout.config[selectedLayoutId][1] = "0";
				if(selectedLayoutId == layout.index) layout.showCover = 0;
			}
			save_config("config");
			p.settings.pages[parentId].elements[id].repaint();
			break;
		case 2:
			if (status) {
				layout.config[selectedLayoutId][2] = "1";
				if(selectedLayoutId == layout.index) layout.autocollapse = 1;
			}
			else {
				layout.config[selectedLayoutId][2] = "0";
				if(selectedLayoutId == layout.index) layout.autocollapse = 0;
			}
			save_config("config");
			p.settings.pages[parentId].elements[id].repaint();
			break;
		}
		break;
	};
};

function settings_radioboxes_action(id, status, parentId) {
	var pid = parentId;
	switch (pid) {
	case 0:
		switch (id) {
		case 4:
			p.settings.pages[pid].elements[4].status = true;
			p.settings.pages[pid].elements[5].status = false;
			properties.defaultPlaylistItemAction = "播放";
			window.SetProperty("SYSTEM.Default Playlist Action", properties.defaultPlaylistItemAction);
			break;
		case 5:
			p.settings.pages[pid].elements[4].status = false;
			p.settings.pages[pid].elements[5].status = true;
			properties.defaultPlaylistItemAction = "添加到播放队列";
			window.SetProperty("SYSTEM.Default Playlist Action", properties.defaultPlaylistItemAction);
			break;
		};
		full_repaint();
		break;
	case 1:
		var selectedColumnId = p.settings.pages[1].elements[0].selectedId;
		switch (id) {
		case 5:
			p.settings.pages[pid].elements[5].status = true;
			p.settings.pages[pid].elements[6].status = false;
			p.settings.pages[pid].elements[7].status = false;
			p.headerBar.columns[selectedColumnId].align = 0;
			p.headerBar.saveColumns();
			break;
		case 6:
			p.settings.pages[pid].elements[5].status = false;
			p.settings.pages[pid].elements[6].status = true;
			p.settings.pages[pid].elements[7].status = false;
			p.headerBar.columns[selectedColumnId].align = 1;
			p.headerBar.saveColumns();
			break;
		case 7:
			p.settings.pages[pid].elements[5].status = false;
			p.settings.pages[pid].elements[6].status = false;
			p.settings.pages[pid].elements[7].status = true;
			p.headerBar.columns[selectedColumnId].align = 2;
			p.headerBar.saveColumns();
			break;
		};
		full_repaint();
		break;
	case 3:
		switch (id) {
		case 0:
			p.settings.pages[pid].elements[0].status = true;
			p.settings.pages[pid].elements[1].status = false;
			sys_scrollbar = true;
			window.NotifyOthers("scrollbar_width", sys_scrollbar);
			cScrollBar.width = get_system_scrollbar_width();
			properties.cursor_max = 125*zdpi;
			//if (!properties.showscrollbar) {p.settings.setSize(0, 0, ww, wh);}
			//else{
				p.headerBar && p.headerBar.setButtons();
				resize_panels();
			//}
			break;
		case 1:
			p.settings.pages[pid].elements[0].status = false;
			p.settings.pages[pid].elements[1].status = true;
			sys_scrollbar = false;
			window.SetProperty("foobox.ui.scrollbar.system", sys_scrollbar);
			window.NotifyOthers("scrollbar_width", sys_scrollbar);
			cScrollBar.width = 12*zdpi;
			properties.cursor_max = 110*zdpi;
			//if (!properties.showscrollbar) {p.settings.setSize(0, 0, ww, wh);}
			//else{
				p.headerBar && p.headerBar.setButtons();
				resize_panels();
			//}
			break;
		case 8:
			p.settings.pages[pid].elements[8].status = true;
			p.settings.pages[pid].elements[9].status = false;
			libbtn_fuc = true;
			window.NotifyOthers("Lib_button_function", libbtn_fuc);
			window.SetProperty("foobox.library.button: Show.Albumlist", libbtn_fuc);
			break;
		case 9:
			p.settings.pages[pid].elements[8].status = false;
			p.settings.pages[pid].elements[9].status = true;
			libbtn_fuc = false;
			window.NotifyOthers("Lib_button_function", libbtn_fuc);
			window.SetProperty("foobox.library.button: Show.Albumlist", libbtn_fuc);
			break;
		};
		full_repaint();
		break;
	case 4:
		var selectedLayoutId = p.settings.pages[pid].elements[0].selectedId;
		switch (id) {
			// collapsed height
		case 3:
			p.settings.pages[pid].elements[3].status = true;
			p.settings.pages[pid].elements[4].status = false;
			p.settings.pages[pid].elements[5].status = false;
			p.settings.pages[pid].elements[6].status = false;
			if (!p.settings.pages[pid].elements[7].status) {
				p.settings.pages[pid].elements[7].status = true;
				p.settings.pages[pid].elements[8].status = false;
				p.settings.pages[pid].elements[9].status = false;
				p.settings.pages[pid].elements[10].status = false;
				layout.config[selectedLayoutId][4] = "0";
				if(selectedLayoutId == layout.index) layout.expandedHeight = 0;
			};
			layout.config[selectedLayoutId][3] = "0";
			if(selectedLayoutId == layout.index) layout.collapsedHeight = 0;
			save_config("config");
			break;
		case 4:
			p.settings.pages[pid].elements[3].status = false;
			p.settings.pages[pid].elements[4].status = true;
			p.settings.pages[pid].elements[5].status = false;
			p.settings.pages[pid].elements[6].status = false;
			if (p.settings.pages[pid].elements[7].status) {
				p.settings.pages[pid].elements[7].status = false;
				p.settings.pages[pid].elements[8].status = true;
				p.settings.pages[pid].elements[9].status = false;
				p.settings.pages[pid].elements[10].status = false;
				layout.config[selectedLayoutId][4] = "1";
				if(selectedLayoutId == layout.index) layout.expandedHeight = 1;
			};
			layout.config[selectedLayoutId][3] = "1";
			if(selectedLayoutId == layout.index) layout.collapsedHeight = 1;
			save_config("config");
			break;
		case 5:
			p.settings.pages[pid].elements[3].status = false;
			p.settings.pages[pid].elements[4].status = false;
			p.settings.pages[pid].elements[5].status = true;
			p.settings.pages[pid].elements[6].status = false;
			if (p.settings.pages[pid].elements[7].status) {
				p.settings.pages[pid].elements[7].status = false;
				p.settings.pages[pid].elements[8].status = false;
				p.settings.pages[pid].elements[9].status = true;
				p.settings.pages[pid].elements[10].status = false;
				layout.config[selectedLayoutId][4] = "2";
				if(selectedLayoutId == layout.index) layout.expandedHeight = 2;
			};
			layout.config[selectedLayoutId][3] = "2";
			if(selectedLayoutId == layout.index) layout.collapsedHeight = 2;
			save_config("config");
			break;
		case 6:
			p.settings.pages[pid].elements[3].status = false;
			p.settings.pages[pid].elements[4].status = false;
			p.settings.pages[pid].elements[5].status = false;
			p.settings.pages[pid].elements[6].status = true;
			if (p.settings.pages[pid].elements[7].status) {
				p.settings.pages[pid].elements[7].status = false;
				p.settings.pages[pid].elements[8].status = false;
				p.settings.pages[pid].elements[9].status = false;
				p.settings.pages[pid].elements[10].status = true;
				layout.config[selectedLayoutId][4] = "3";
				if(selectedLayoutId == layout.index) layout.expandedHeight = 3;
			};
			layout.config[selectedLayoutId][3] = "3";
			if(selectedLayoutId == layout.index) layout.collapsedHeight = 3;
			save_config("config");
			break;
			// expanded height
		case 7:
			p.settings.pages[pid].elements[7].status = true;
			p.settings.pages[pid].elements[8].status = false;
			p.settings.pages[pid].elements[9].status = false;
			p.settings.pages[pid].elements[10].status = false;
			if (!p.settings.pages[pid].elements[3].status) {
				p.settings.pages[pid].elements[3].status = true;
				p.settings.pages[pid].elements[4].status = false;
				p.settings.pages[pid].elements[5].status = false;
				p.settings.pages[pid].elements[6].status = false;
				layout.config[selectedLayoutId][3] = "0";
				if(selectedLayoutId == layout.index) layout.collapsedHeight = 0;
			};
			layout.config[selectedLayoutId][4] = "0";
			if(selectedLayoutId == layout.index) layout.expandedHeight = 0;
			save_config("config");
			break;
		case 8:
			p.settings.pages[pid].elements[7].status = false;
			p.settings.pages[pid].elements[8].status = true;
			p.settings.pages[pid].elements[9].status = false;
			p.settings.pages[pid].elements[10].status = false;
			if (p.settings.pages[pid].elements[3].status) {
				p.settings.pages[pid].elements[3].status = false;
				p.settings.pages[pid].elements[4].status = true;
				p.settings.pages[pid].elements[5].status = false;
				p.settings.pages[pid].elements[6].status = false;
				layout.config[selectedLayoutId][3] = "1";
				if(selectedLayoutId == layout.index) layout.collapsedHeight = "1";
			};
			layout.config[selectedLayoutId][4] = "1";
			if(selectedLayoutId == layout.index) layout.expandedHeight = 1;
			save_config("config");
			break;
		case 9:
			p.settings.pages[pid].elements[7].status = false;
			p.settings.pages[pid].elements[8].status = false;
			p.settings.pages[pid].elements[9].status = true;
			p.settings.pages[pid].elements[10].status = false;
			if (p.settings.pages[pid].elements[3].status) {
				p.settings.pages[pid].elements[3].status = false;
				p.settings.pages[pid].elements[4].status = false;
				p.settings.pages[pid].elements[5].status = true;
				p.settings.pages[pid].elements[6].status = false;
				layout.config[selectedLayoutId][3] = "2";
				if(selectedLayoutId == layout.index) layout.collapsedHeight = 2;
			};
			layout.config[selectedLayoutId][4] = "2";
			if(selectedLayoutId == layout.index) layout.expandedHeight = 2;
			save_config("config");
			break;
		case 10:
			p.settings.pages[pid].elements[7].status = false;
			p.settings.pages[pid].elements[8].status = false;
			p.settings.pages[pid].elements[9].status = false;
			p.settings.pages[pid].elements[10].status = true;
			if (p.settings.pages[pid].elements[3].status) {
				p.settings.pages[pid].elements[3].status = false;
				p.settings.pages[pid].elements[4].status = false;
				p.settings.pages[pid].elements[5].status = false;
				p.settings.pages[pid].elements[6].status = true;
				layout.config[selectedLayoutId][3] = "3";
				if(selectedLayoutId == layout.index) layout.collapsedHeight = 3;
			};
			layout.config[selectedLayoutId][4] = "3";
			if(selectedLayoutId == layout.index) layout.expandedHeight = 3;
			save_config("config");
			break;
		case 11:
			p.settings.pages[pid].elements[11].status = true;
			p.settings.pages[pid].elements[12].status = false;
			layout.config[selectedLayoutId][5] = "1";
			if(selectedLayoutId == layout.index) layout.collapseGroupsByDefault = 1;
			save_config("config");
			break;
		case 12:
			p.settings.pages[pid].elements[11].status = false;
			p.settings.pages[pid].elements[12].status = true;
			layout.config[selectedLayoutId][5] = "0";
			if(selectedLayoutId == layout.index) layout.collapseGroupsByDefault = 0;
			save_config("config");
			break;
		};
		full_repaint();
		break;	
	};
};

function settings_listboxes_action(pageId, id, selectedId) {
	switch (pageId) {
	case 1:
		switch (id) {
		case 0:
			try {
				// if textbox was active (edit = true) before new click on the listbox entry, save the new input before updating the textboxes
				p.settings.pages[1].elements[1].inputbox.check("down", 0, 0);
				p.settings.pages[1].elements[2].inputbox.check("down", 0, 0);
				p.settings.pages[1].elements[3].inputbox.check("down", 0, 0);
				p.settings.pages[1].elements[4].inputbox.check("down", 0, 0);
				// update textboxes values / selected column Id in the listbox
				p.settings.pages[1].elements[0].selectedId = selectedId;
				var txtbox_value = p.headerBar.columns[selectedId].label;
				p.settings.pages[1].elements[1].inputbox.text = txtbox_value;
				p.settings.pages[1].elements[1].inputbox.default_text = txtbox_value;
				txtbox_value = p.headerBar.columns[selectedId].tf;
				p.settings.pages[1].elements[2].inputbox.text = txtbox_value;
				p.settings.pages[1].elements[2].inputbox.default_text = txtbox_value;
				txtbox_value = p.headerBar.columns[selectedId].tf2;
				p.settings.pages[1].elements[3].inputbox.text = txtbox_value;
				p.settings.pages[1].elements[3].inputbox.default_text = txtbox_value;
				txtbox_value = p.headerBar.columns[selectedId].sortOrder;
				p.settings.pages[1].elements[4].inputbox.text = txtbox_value;
				p.settings.pages[1].elements[4].inputbox.default_text = txtbox_value;
				// update radio buttons values / selected column Id in the listbox
				switch (p.headerBar.columns[selectedId].align) {
				case 0:
					// Left align
					p.settings.pages[1].elements[5].status = true;
					p.settings.pages[1].elements[6].status = false;
					p.settings.pages[1].elements[7].status = false;
					break;
				case 1:
					// Center align
					p.settings.pages[1].elements[5].status = false;
					p.settings.pages[1].elements[6].status = true;
					p.settings.pages[1].elements[7].status = false;
					break;
				case 2:
					// Right align
					p.settings.pages[1].elements[5].status = false;
					p.settings.pages[1].elements[6].status = false;
					p.settings.pages[1].elements[7].status = true;
					break;
				};
				// update checkbox status / selected column Id in the listbox
				p.settings.pages[1].elements[0].status = (p.headerBar.columns[selectedId].percent > 0);
			}
			catch (e) {
				console.log("WSH Error catched: settings_listboxes_action");
			};
			full_repaint();
			break;
		};
		break;
	case 2:
		var txtbox_value = "";
		switch (id) {
		case 0:
			try {
				// if textbox was active (edit = true) before new click on the listbox entry, save the new input before updating the textboxes
				p.settings.pages[2].elements[1].inputbox.check("down", 0, 0);
				p.settings.pages[2].elements[2].inputbox.check("down", 0, 0);
				p.settings.pages[2].elements[3].inputbox.check("down", 0, 0);
				//p.settings.pages[2].elements[4].inputbox.check("down", 0, 0);
				p.settings.pages[2].elements[4].inputbox.check("down", 0, 0);
				p.settings.pages[2].elements[5].inputbox.check("down", 0, 0);
				p.settings.pages[2].elements[6].inputbox.check("down", 0, 0);
				p.settings.pages[2].elements[7].inputbox.check("down", 0, 0);
				// update textboxes values / selected column Id in the listbox
				p.settings.pages[2].elements[0].selectedId = selectedId;
				//
				txtbox_value = p.list.groupby[selectedId].label;
				p.settings.pages[2].elements[1].inputbox.text = txtbox_value;
				p.settings.pages[2].elements[1].inputbox.default_text = txtbox_value;
				txtbox_value = p.list.groupby[selectedId].tf;
				p.settings.pages[2].elements[2].inputbox.text = txtbox_value;
				p.settings.pages[2].elements[2].inputbox.default_text = txtbox_value;
				txtbox_value = p.list.groupby[selectedId].sortOrder;
				p.settings.pages[2].elements[3].inputbox.text = txtbox_value;
				p.settings.pages[2].elements[3].inputbox.default_text = txtbox_value;

				txtbox_value = p.list.groupby[selectedId].l1;
				p.settings.pages[2].elements[4].inputbox.text = txtbox_value;
				p.settings.pages[2].elements[4].inputbox.default_text = txtbox_value;
				txtbox_value = p.list.groupby[selectedId].r1;
				p.settings.pages[2].elements[5].inputbox.text = txtbox_value;
				p.settings.pages[2].elements[5].inputbox.default_text = txtbox_value;
				txtbox_value = p.list.groupby[selectedId].l2;
				p.settings.pages[2].elements[6].inputbox.text = txtbox_value;
				p.settings.pages[2].elements[6].inputbox.default_text = txtbox_value;
				txtbox_value = p.list.groupby[selectedId].r2;
				p.settings.pages[2].elements[7].inputbox.text = txtbox_value;
				p.settings.pages[2].elements[7].inputbox.default_text = txtbox_value;
			} catch (e) {
				console.log("WSH Error catched: settings_listboxes_action");
			};
			full_repaint();
			break;
		};
		break;
	case 4:
		switch (id) {
		case 0:
			try {
				p.settings.pages[4].elements[0].selectedId = selectedId;
				layout.setting_idx = selectedId;
				if(layout.config[selectedId][1] == "1") p.settings.pages[4].elements[1].status = true;
				else p.settings.pages[4].elements[1].status = false;
				if(layout.config[selectedId][2] == "1") p.settings.pages[4].elements[2].status = true;
				else p.settings.pages[4].elements[2].status = false;
				switch(layout.config[selectedId][3]){
				case "0":
					p.settings.pages[4].elements[3].status = true;
					p.settings.pages[4].elements[4].status = false;
					p.settings.pages[4].elements[5].status = false;
					p.settings.pages[4].elements[6].status = false;
					break;
				case "1":
					p.settings.pages[4].elements[3].status = false;
					p.settings.pages[4].elements[4].status = true;
					p.settings.pages[4].elements[5].status = false;
					p.settings.pages[4].elements[6].status = false;
					break;
				case "2":
					p.settings.pages[4].elements[3].status = false;
					p.settings.pages[4].elements[4].status = false;
					p.settings.pages[4].elements[5].status = true;
					p.settings.pages[4].elements[6].status = false;
					break;
				case "3":
					p.settings.pages[4].elements[3].status = false;
					p.settings.pages[4].elements[4].status = false;
					p.settings.pages[4].elements[5].status = false;
					p.settings.pages[4].elements[6].status = true;
					break;
				}
				switch(layout.config[selectedId][4]){
				case "0":
					p.settings.pages[4].elements[7].status = true;
					p.settings.pages[4].elements[8].status = false;
					p.settings.pages[4].elements[9].status = false;
					p.settings.pages[4].elements[10].status = false;
					break;
				case "1":
					p.settings.pages[4].elements[7].status = false;
					p.settings.pages[4].elements[8].status = true;
					p.settings.pages[4].elements[9].status = false;
					p.settings.pages[4].elements[10].status = false;
					break;
				case "2":
					p.settings.pages[4].elements[7].status = false;
					p.settings.pages[4].elements[8].status = false;
					p.settings.pages[4].elements[9].status = true;
					p.settings.pages[4].elements[10].status = false;
					break;
				case "3":
					p.settings.pages[4].elements[7].status = false;
					p.settings.pages[4].elements[8].status = false;
					p.settings.pages[4].elements[9].status = false;
					p.settings.pages[4].elements[10].status = true;
					break;
				}
				switch (layout.config[selectedId][5]) {
				case "0":
					p.settings.pages[4].elements[11].status = false;
					p.settings.pages[4].elements[12].status = true;
					break;
				case "1":
					p.settings.pages[4].elements[11].status = true;
					p.settings.pages[4].elements[12].status = false;
					break;
				}
			} catch(e){}
			full_repaint();
			break;
		}
	};
};

function settings_textboxes_action(pageId, elementId) {
	switch (pageId) {
	case 0:
		var selectedColumnId = p.settings.pages[pageId].elements[0].selectedId;
		switch (elementId) {
		case 2:
			cList.scrollstep = Number(p.settings.pages[pageId].elements[elementId].inputbox.text);
			if(cList.scrollstep < 0) cList.scrollstep = 1;
			else if(cList.scrollstep > 20) cList.scrollstep = 20;
			window.SetProperty("SYSTEM.Playlist Scroll Step", cList.scrollstep);
			window.NotifyOthers("ScrollStep", cList.scrollstep);
			break;
		case 3:
			cList.touchstep = Number(p.settings.pages[pageId].elements[elementId].inputbox.text);
			if(cList.touchstep < 0) cList.touchstep = 1;
			else if(cList.touchstep > 20) cList.touchstep = 20;
			window.SetProperty("SYSTEM.Playlist Scroll Step", cList.touchstep);
			break;
		case 8:
			p.settings.ext_app[0] = p.settings.pages[pageId].elements[elementId].inputbox.text;
			if(p.settings.ext_app[0] != "") track_edit_app = p.settings.ext_app[0] + p.settings.ext_app[1];
			else track_edit_app = "";
			save_misccfg();
			break;
		case 9:
			p.settings.ext_app[1] = p.settings.pages[pageId].elements[elementId].inputbox.text;
			if(p.settings.ext_app[0] != "") track_edit_app = p.settings.ext_app[0] + p.settings.ext_app[1];
			else track_edit_app = "";
			save_misccfg();
			break;
		}
		break;
	case 1:
		// Columns
		var selectedColumnId = p.settings.pages[pageId].elements[0].selectedId;
		switch (elementId) {
		case 1:
			var label = p.headerBar.columns[selectedColumnId].label;
			var new_label = p.settings.pages[pageId].elements[elementId].inputbox.text;
			if (new_label == "") new_label = label;
			if (new_label) {
				p.headerBar.columns[selectedColumnId].label = new_label;
				p.headerBar.saveColumns();
				// update listbox array
				p.settings.pages[pageId].elements[0].arr.splice(0, p.settings.pages[pageId].elements[0].arr.length);
				var fin = p.headerBar.columns.length;
				for (var i = 0; i < fin; i++) {
					p.settings.pages[pageId].elements[0].arr.push(p.headerBar.columns[i].label);
				};
				full_repaint();
			};
			break;
		case 2:
			var tf = p.headerBar.columns[selectedColumnId].tf;
			var new_tf = p.settings.pages[pageId].elements[elementId].inputbox.text;
			if (new_tf == "") new_tf = tf;
			if (new_tf) {
				p.headerBar.columns[selectedColumnId].tf = new_tf;
				p.headerBar.saveColumns();
			};
			break;
		case 3:
			var tf2 = p.headerBar.columns[selectedColumnId].tf2;
			var new_tf2 = p.settings.pages[pageId].elements[elementId].inputbox.text;
			if (new_tf2 == "") new_tf2 = tf2;
			if (new_tf2) {
				p.headerBar.columns[selectedColumnId].tf2 = new_tf2;
				p.headerBar.saveColumns();
			};
			break;
		case 4:
			var sortOrder = p.headerBar.columns[selectedColumnId].sortOrder;
			var new_sortOrder = p.settings.pages[pageId].elements[elementId].inputbox.text;
			if (new_sortOrder == "") new_sortOrder = sortOrder;
			if (new_sortOrder) {
				p.headerBar.columns[selectedColumnId].sortOrder = new_sortOrder;
				p.headerBar.saveColumns();
			};
			break;
		};
		break;
	case 2:
		// Groups
		var selectedColumnId = p.settings.pages[pageId].elements[0].selectedId;
		switch (elementId) {
		case 1:
			var label = p.list.groupby[selectedColumnId].label;
			var new_label = p.settings.pages[pageId].elements[elementId].inputbox.text;
			if (new_label == "") new_label = label;
			if (new_label) {
				p.list.groupby[selectedColumnId].label = new_label;
				p.list.saveGroupBy();
				// update listbox array
				p.settings.pages[pageId].elements[0].arr.splice(0, p.settings.pages[pageId].elements[0].arr.length);
				var fin = p.list.groupby.length;
				for (var i = 0; i < fin; i++) {
					p.settings.pages[pageId].elements[0].arr.push(p.list.groupby[i].label);
				};
				full_repaint();
			};
			break;
		case 2:
			var tf = p.list.groupby[selectedColumnId].tf;
			var new_tf = p.settings.pages[pageId].elements[elementId].inputbox.text;
			if (new_tf == "") new_tf = tf;
			if (new_tf) {
				p.list.groupby[selectedColumnId].tf = new_tf;
				p.list.saveGroupBy();
			};
			break;
		case 3:
			var sortOrder = p.list.groupby[selectedColumnId].sortOrder;
			var new_sortOrder = p.settings.pages[pageId].elements[elementId].inputbox.text;
			if (new_sortOrder == "") new_sortOrder = sortOrder;
			if (new_sortOrder) {
				p.list.groupby[selectedColumnId].sortOrder = new_sortOrder;
				p.list.saveGroupBy();
			};
			break;
		case 4:
			var l1 = p.list.groupby[selectedColumnId].l1;
			var new_l1 = p.settings.pages[pageId].elements[elementId].inputbox.text;
			if (new_l1 != l1) {
				p.list.groupby[selectedColumnId].l1 = new_l1;
				p.list.saveGroupBy();
			};
			break;
		case 5:
			var r1 = p.list.groupby[selectedColumnId].r1;
			var new_r1 = p.settings.pages[pageId].elements[elementId].inputbox.text;
			if (new_r1 != r1) {
				p.list.groupby[selectedColumnId].r1 = new_r1;
				p.list.saveGroupBy();
			};
			break;
		case 6:
			var l2 = p.list.groupby[selectedColumnId].l2;
			var new_l2 = p.settings.pages[pageId].elements[elementId].inputbox.text;
			if (new_l2 != l2) {
				p.list.groupby[selectedColumnId].l2 = new_l2;
				p.list.saveGroupBy();
			};
			break;
		case 7:
			var r2 = p.list.groupby[selectedColumnId].r2;
			var new_r2 = p.settings.pages[pageId].elements[elementId].inputbox.text;
			if (new_r2 != r2) {
				p.list.groupby[selectedColumnId].r2 = new_r2;
				p.list.saveGroupBy();
			};
			break;
		};
		break;
	case 3:
		switch (elementId) {
		case 6:
			var _dir = dir_cover_name;
			var new_dir = p.settings.pages[pageId].elements[elementId].inputbox.text;
			if (new_dir == "") new_dir = _dir;
			if (new_dir){
				dir_cover_name = new_dir;
				window.SetProperty("foobox.cover.folder.name", dir_cover_name);
			}
			window.NotifyOthers("set_dir_name", dir_cover_name);
			break;
		case 10:
			var _radiom3u = radiom3u;
			var new_m3u = p.settings.pages[pageId].elements[elementId].inputbox.text;
			if (new_m3u == "") new_m3u = _radiom3u;
			if (new_m3u){
				radiom3u = new_m3u;
				save_misccfg();
			}
			window.NotifyOthers("Radio_list", radiom3u);
			break;
		}
		break;
	};
};

// =================================================================== // Objects

oLink = function (){
	//thix.id = id;
	this.x = 0;
	this.y = 0;
	this.h = p.settings.lineHeight;
	this.link_hover = 0;
	var pic = gdi.CreateImage(200, 200);
		gpic = pic.GetGraphics();
	this.w1 = gpic.CalcTextWidth("参数选项", g_font);
	this.x2 = gpic.CalcTextWidth("参数选项  |  ", g_font);
	this.w2 = gpic.CalcTextWidth("foobx 帮助", g_font);
	this.x3 = gpic.CalcTextWidth("参数选项  |  foobx 帮助  |  ", g_font);
	this.w3 = gpic.CalcTextWidth("foobar2000 汉化版", g_font);
	this.w_sep = gpic.CalcTextWidth("  |  ", g_font);
	this.w = this.x3 + this.w3;
	pic.ReleaseGraphics(gpic);
	
	this.draw = function(gr, x, y){
		this.x = x;
		this.y = y;
		gr.GdiDrawText("参数选项", (this.link_hover == 1) ? g_font_ud : g_font, g_color_highlight, this.x, this.y, this.w1, this.h, lc_txt);
		gr.GdiDrawText("  |  ", g_font, g_color_highlight, this.x + this.w1, this.y, this.w_sep, this.h, lc_txt);
		gr.GdiDrawText("foobx 帮助", (this.link_hover == 2) ? g_font_ud : g_font, g_color_highlight, this.x + this.x2, this.y, this.w2, this.h, lc_txt);
		gr.GdiDrawText("  |  ", g_font, g_color_highlight, this.x + this.x2 + this.w2, this.y, this.w_sep, this.h, lc_txt);
		gr.GdiDrawText("foobar2000 汉化版", (this.link_hover == 3) ? g_font_ud : g_font, g_color_highlight, this.x + this.x3, this.y, this.w3, this.h, lc_txt);
	}
	this.repaint = function(){
		window.RepaintRect(this.x, this.y, this.w, this.h);
	}
	this._isHover = function(x, y) {
		return (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);
	};
	this.ShellExecute = function (arg1, arg2, arg3, arg4, arg5) {
		try {
			var shellObj = new ActiveXObject("Shell.Application");
		} catch (e) {
			PopMessage("Can not create ActiveX object (Shell.Application), command can't be execute. Please check your system authorities.", 16);
			return;
		}
		shellObj.ShellExecute(arg1, arg2, arg3, arg4, arg5);
	}
	this.on_mouse = function(event, x, y) {
		var link_old = this.link_hover;
		this.ishover = this._isHover(x, y);
		switch (event) {
		case "move":
			if(this.ishover){
				if(x < this.x + this.w1) this.link_hover = 1;
				else if (x > this.x + this.x3) this.link_hover = 3;
				else if (x > this.x + this.x2 && x < this.x + this.x2 + this.w2) this.link_hover = 2;
				else this.link_hover = 0;
				if(this.link_hover) window.SetCursor(IDC_HAND);
			}
			else {
				this.link_hover = 0;
				window.SetCursor(IDC_ARROW);
			}
			break;
		case "up":
			if (this.link_hover > 0){
			switch (this.link_hover) {
				case 1:
					fb.RunMainMenuCommand("文件/参数选项");
					break;
				case 2:
					this.ShellExecute("https://dream7180.gitee.io/2023/foobox-release/", "", "", "open", 1);
					break;
				case 3:
					//if(Number(fb.Version.substr(0, 1)) > 1) this.ShellExecute("https://www.esnpc.com/foobar2000-20-simplified-chinese-version/", "", "", "open", 1);
					//else 
						this.ShellExecute("https://www.cnblogs.com/asionwu", "", "", "open", 1);
					break;
			};
			this.link_hover = 0;
			}
			break;
		case "leave":
			this.link_hover = 0;
			window.SetCursor(IDC_ARROW);
			break;
		}
		if(this.link_hover != link_old) this.repaint();
		return this.ishover;
	}
}

oCheckBox = function(id, x, y, label, linkedVariable, func, parentPageId) {
	this.objType = "CB";
	this.id = id;
	this.x = x;
	this.y = y;
	this.parentPageId = parentPageId;
	this.ly = this.y - (p.settings.pages[this.parentPageId].offset * cSettings.rowHeight);
	this.label = label;
	this.linkedVariable = linkedVariable;
	this.status = eval(linkedVariable);
	this.prevStatus = this.status;
	var gfunc = func;

	this.setButtons = function() {
		// normal unchecked box
		this.checkbox_normal_off = gdi.CreateImage(48, 48);
		var gb = this.checkbox_normal_off.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(6, 6, 36, 36, 6, p.settings.color1);
		this.checkbox_normal_off.ReleaseGraphics(gb);
		// hover unchecked box
		this.checkbox_hover_off = gdi.CreateImage(48, 48);
		gb = this.checkbox_hover_off.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(6, 6, 36, 36, 6, p.settings.color2);
		this.checkbox_hover_off.ReleaseGraphics(gb);
		// normal checked box
		this.checkbox_normal_on = gdi.CreateImage(48, 48);
		var gb = this.checkbox_normal_on.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(6, 6, 36, 36, 6, p.settings.color1);
		gb.FillEllipse(12, 12, 24, 24, p.settings.color1);
		this.checkbox_normal_on.ReleaseGraphics(gb);
		// hover checked box
		this.checkbox_hover_on = gdi.CreateImage(48, 48);
		gb = this.checkbox_hover_on.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(6, 6, 36, 36, 6, p.settings.color2);
		gb.FillEllipse(12, 12, 24, 24, p.settings.color2);
		this.checkbox_hover_on.ReleaseGraphics(gb);

		var button_zoomSize = g_z16;
		// button
		if (this.status) {
			this.button = new button(this.checkbox_normal_on.Resize(button_zoomSize, button_zoomSize, 2), this.checkbox_hover_on.Resize(button_zoomSize, button_zoomSize, 2), this.checkbox_hover_on.Resize(button_zoomSize, button_zoomSize, 2));
		}
		else {
			this.button = new button(this.checkbox_normal_off.Resize(button_zoomSize, button_zoomSize, 2), this.checkbox_hover_off.Resize(button_zoomSize, button_zoomSize, 2), this.checkbox_hover_off.Resize(button_zoomSize, button_zoomSize, 2));
		};
	};
	this.setButtons();

	this.draw = function(gr) {
		this.status = eval(this.linkedVariable);
		if (this.status != this.prevStatus) {
			var button_zoomSize = g_z16;
			if (this.status) {
				this.button.update(this.checkbox_normal_on.Resize(button_zoomSize, button_zoomSize, 2), this.checkbox_hover_on.Resize(button_zoomSize, button_zoomSize, 2), this.checkbox_hover_on.Resize(button_zoomSize, button_zoomSize, 2));
			}
			else {
				this.button.update(this.checkbox_normal_off.Resize(button_zoomSize, button_zoomSize, 2), this.checkbox_hover_off.Resize(button_zoomSize, button_zoomSize, 2), this.checkbox_hover_off.Resize(button_zoomSize, button_zoomSize, 2));
			};
			this.prevStatus = this.status;
		};
		this.ly = this.y - (p.settings.pages[this.parentPageId].offset * cSettings.rowHeight);
		if (this.ly > cSettings.topBarHeight) {
			var button_y = this.ly - 1 + Math.ceil((p.settings.lineHeight - this.button.h) / 2);
			this.button.draw(gr, this.x, button_y, 255);
			var label_x = this.x + this.button.w + g_z5;
			gr.GdiDrawText(this.label, p.settings.font, (this.status ? p.settings.color2 : p.settings.color1), label_x, this.ly, p.settings.w, p.settings.lineHeight, lc_txt);
		};
	};
	
	this.repaint = function(){
		window.RepaintRect(this.x, this.ly, ww, p.settings.lineHeight);
	}

	this.on_mouse = function(event, x, y, delta) {
		if (this.ly <= cSettings.topBarHeight) {
			return;
		};
		var state = this.button.checkstate(event, x, y);
		switch (event) {
		case "up":
			if (state == ButtonStates.hover) {
				this.status = !this.status;
				eval(gfunc + "(" + this.id + "," + this.status + "," + this.parentPageId + ")");
			};
			break;
		};
		return state;
	};

	this.on_key = function(event, vkey) {};
	this.on_char = function(code) {};
	this.on_focus = function(is_focused) {};
};

oRadioButton = function(id, x, y, label, linkedVariable, func, parentPageId) {
	this.objType = "RB";
	this.id = id;
	this.x = x;
	this.y = y;
	this.parentPageId = parentPageId;
	this.ly = this.y - (p.settings.pages[this.parentPageId].offset * cSettings.rowHeight);
	this.label = label;
	this.status = eval(linkedVariable);
	this.prevStatus = this.status;
	var gfunc = func;

	this.setButtons = function() {
		// normal unchecked box
		this.radiobt_normal_off = gdi.CreateImage(48, 48);
		var gb = this.radiobt_normal_off.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(6, 6, 36, 36, 6, p.settings.color1);
		this.radiobt_normal_off.ReleaseGraphics(gb);
		// hover unchecked box
		this.radiobt_hover_off = gdi.CreateImage(48, 48);
		gb = this.radiobt_hover_off.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(6, 6, 36, 36, 6, p.settings.color2);
		this.radiobt_hover_off.ReleaseGraphics(gb);
		// normal checked box
		this.radiobt_normal_on = gdi.CreateImage(48, 48);
		var gb = this.radiobt_normal_on.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(6, 6, 36, 36, 6, p.settings.color1);
		gb.FillEllipse(12, 12, 24, 24, p.settings.color1);
		this.radiobt_normal_on.ReleaseGraphics(gb);
		// hover checked box
		this.radiobt_hover_on = gdi.CreateImage(48, 48);
		gb = this.radiobt_hover_on.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawEllipse(6, 6, 36, 36, 6, p.settings.color2);
		gb.FillEllipse(12, 12, 24, 24, p.settings.color2);
		this.radiobt_hover_on.ReleaseGraphics(gb);

		var button_zoomSize = g_z16;
		// button
		if (this.status) {
			this.button = new button(this.radiobt_normal_on.Resize(button_zoomSize, button_zoomSize, 2), this.radiobt_hover_on.Resize(button_zoomSize, button_zoomSize, 2), this.radiobt_hover_on.Resize(button_zoomSize, button_zoomSize, 2));
		}
		else {
			this.button = new button(this.radiobt_normal_off.Resize(button_zoomSize, button_zoomSize, 2), this.radiobt_hover_off.Resize(button_zoomSize, button_zoomSize, 2), this.radiobt_hover_off.Resize(button_zoomSize, button_zoomSize, 2));
		};
	};
	this.setButtons();

	this.draw = function(gr) {
		var button_zoomSize = g_z16;
		if (this.status) {
			this.button.update(this.radiobt_normal_on.Resize(button_zoomSize, button_zoomSize, 2), this.radiobt_hover_on.Resize(button_zoomSize, button_zoomSize, 2), this.radiobt_hover_on.Resize(button_zoomSize, button_zoomSize, 2));
		}
		else {
			this.button.update(this.radiobt_normal_off.Resize(button_zoomSize, button_zoomSize, 2), this.radiobt_hover_off.Resize(button_zoomSize, button_zoomSize, 2), this.radiobt_hover_off.Resize(button_zoomSize, button_zoomSize, 2));
		};
		this.ly = this.y - (p.settings.pages[this.parentPageId].offset * cSettings.rowHeight);
		if (this.ly > cSettings.topBarHeight) {
			var button_y = this.ly - 1 + Math.ceil((p.settings.lineHeight - this.button.h) / 2);
			this.button.draw(gr, this.x, button_y, 255);
			var label_x = this.x + this.button.w + g_z5;
			gr.GdiDrawText(this.label, p.settings.font, (this.status ? p.settings.color2 : p.settings.color1), label_x, this.ly, p.settings.w, p.settings.lineHeight, lc_txt);
		};
	};

	this.on_mouse = function(event, x, y, delta) {
		if (this.ly <= cSettings.topBarHeight) {
			return;
		};
		var state = this.button.checkstate(event, x, y);
		switch (event) {
		case "up":
			if (state == ButtonStates.hover) {
				eval(gfunc + "(" + this.id + "," + this.status + "," + this.parentPageId + ")");
			};
			break;
		};
		return state;
	};

	this.on_key = function(event, vkey) {};

	this.on_char = function(code) {};

	this.on_focus = function(is_focused) {};
};

oTextBox = function(id, x, y, w, h, label, value, func, parentPageId) {
	this.objType = "TB";
	this.id = id;
	this.x = x;
	this.y = y;
	this.parentPageId = parentPageId;
	this.ly = this.y - (p.settings.pages[this.parentPageId].offset * cSettings.rowHeight);
	this.w = w;
	this.h = h;
	this.label = label;
	this.value = value;
	var gfunc = func;

	this.inputbox = new oInputbox(this.w, this.h, this.value, "", RGB(0, 0, 0), RGB(240, 240, 240), RGB(180, 180, 180), g_color_selected_bg, gfunc + "(" + this.parentPageId + ", " + this.id + ")", "p.settings.pages[" + this.parentPageId + "].elements[" + this.id + "]", this.id, p.settings.txtHeight, 255);
	this.inputbox.autovalidation = false;

	this.repaint = function() {
		window.RepaintRect(this.x, this.ly, this.w, this.h * 2);
	};

	this.draw = function(gr) {
		this.ly = this.y - (p.settings.pages[this.parentPageId].offset * cSettings.rowHeight);
		if (this.ly + this.h > cSettings.topBarHeight) {
			gr.GdiDrawText(this.label, g_font_b, p.settings.color1, this.x, this.ly, p.list.w - p.settings.pages[this.parentPageId].scrollbarWidth - 10, this.h, lc_txt);
			this.inputbox.draw(gr, this.x, this.ly + this.h);
		};
	};

	this.on_mouse = function(event, x, y, delta) {
		if (this.ly + this.h <= cSettings.topBarHeight) return;
		if(p.settings.currentPageId == 1 && p.settings.pages[1].elements[0].ishover) return;
		if(p.settings.currentPageId == 2 && p.settings.pages[2].elements[0].ishover) return;
		if (this.ly > cSettings.topBarHeight + g_z5) {
			this.inputbox.check(event, x, y, delta);
		};
	};

	this.on_key = function(event, vkey) {
		switch (event) {
		case "down":
			this.inputbox.on_key_down(vkey);
			break;
		};

		var kmask = GetKeyboardMask();
		// specific action on RETURN for the textbox Object           
		if (kmask == KMask.none && vkey == VK_RETURN) {
			if (this.inputbox.edit) {
				this.inputbox.edit = false;
				this.inputbox.text_selected = "";
				this.inputbox.select = false;
				this.inputbox.default_text = this.inputbox.text; // set default text to new value validated
				this.inputbox.repaint();
			};
		};
		// specific action on TAB for the textbox Object
		if (this.inputbox.edit && !g_textbox_tabbed) {
			if (vkey == VK_TAB && (kmask == KMask.none || kmask == KMask.shift)) {
				// cancel textbox edit on current
				this.inputbox.edit = false;
				this.inputbox.text_selected = "";
				this.inputbox.select = false;
				this.inputbox.default_text = this.inputbox.text; // set default text to new value validated
				this.inputbox.SelBegin = 0;
				this.inputbox.SelEnd = 0;
				this.inputbox.repaint();

				if (kmask == KMask.none) {
					// scan elements to find objectType = "TB" / TextBox
					var first_textbox_id = -1;
					var next_textbox_id = -1;
					var fin = p.settings.pages[this.parentPageId].elements.length;
					for (var i = 0; i < fin; i++) {
						if (p.settings.pages[this.parentPageId].elements[i].objType == "TB") {
							if (first_textbox_id < 0) {
								first_textbox_id = i;
							};
							if (next_textbox_id < 0 && i > this.id) {
								next_textbox_id = i;
								break;
							};
						};
					};
					if (next_textbox_id < 0) {
						next_textbox_id = first_textbox_id;
					};
				}
				else {
					// scan elements to find objectType = "TB" / TextBox
					var first_textbox_id = -1;
					var next_textbox_id = -1;
					var debut = p.settings.pages[this.parentPageId].elements.length - 1;
					for (var i = debut; i >= 0; i--) {
						if (p.settings.pages[this.parentPageId].elements[i].objType == "TB") {
							if (first_textbox_id < 0) {
								first_textbox_id = i;
							};
							if (next_textbox_id < 0 && i < this.id) {
								next_textbox_id = i;
								break;
							};
						};
					};
					if (next_textbox_id < 0) {
						next_textbox_id = first_textbox_id;
					};
				};

				// set focus and edit mode to the next textbox found
				p.settings.pages[this.parentPageId].elements[next_textbox_id].inputbox.on_focus(true);
				p.settings.pages[this.parentPageId].elements[next_textbox_id].inputbox.edit = true;
				p.settings.pages[this.parentPageId].elements[next_textbox_id].inputbox.Cpos = p.settings.pages[this.parentPageId].elements[next_textbox_id].inputbox.text.length; // this.GetCPos(x);
				p.settings.pages[this.parentPageId].elements[next_textbox_id].inputbox.anchor = p.settings.pages[this.parentPageId].elements[next_textbox_id].inputbox.Cpos;
				p.settings.pages[this.parentPageId].elements[next_textbox_id].inputbox.SelBegin = p.settings.pages[this.parentPageId].elements[next_textbox_id].inputbox.Cpos;
				p.settings.pages[this.parentPageId].elements[next_textbox_id].inputbox.SelEnd = p.settings.pages[this.parentPageId].elements[next_textbox_id].inputbox.Cpos;
				p.settings.pages[this.parentPageId].elements[next_textbox_id].inputbox.repaint();
				p.settings.pages[this.parentPageId].elements[next_textbox_id].inputbox.resetCursorTimer();
				g_textbox_tabbed = true;
				// then check if scroll required (update page offset to show the new activated textbox)
				var next_ly = p.settings.pages[this.parentPageId].elements[next_textbox_id].ly;
				if (next_ly < p.settings.pages[this.parentPageId].y + cSettings.rowHeight * 2) {
					var d = Math.ceil((p.settings.pages[this.parentPageId].y + cSettings.rowHeight * 2 - next_ly) / cSettings.rowHeight);
					p.settings.pages[this.parentPageId].offset -= d;
					if (p.settings.pages[this.parentPageId].offset < 0) p.settings.pages[this.parentPageId].offset = 0;
					p.settings.pages[this.parentPageId].scrollbar.reSet(p.settings.pages[this.parentPageId].total_rows, cSettings.rowHeight, p.settings.pages[this.parentPageId].offset);
					full_repaint();
				}
				else if (next_ly > p.settings.pages[this.parentPageId].y + p.settings.pages[this.parentPageId].h - cSettings.rowHeight * 3) {
					var maxOffset = p.settings.pages[this.parentPageId].total_rows - p.settings.pages[this.parentPageId].totalRowsVis;
					var d = Math.ceil((next_ly - (p.settings.pages[this.parentPageId].y + p.settings.pages[this.parentPageId].h) + cSettings.rowHeight * 3) / cSettings.rowHeight);
					p.settings.pages[this.parentPageId].offset += d;
					if (p.settings.pages[this.parentPageId].offset >= maxOffset) p.settings.pages[this.parentPageId].offset = maxOffset;
					p.settings.pages[this.parentPageId].scrollbar.reSet(p.settings.pages[this.parentPageId].total_rows, cSettings.rowHeight, p.settings.pages[this.parentPageId].offset);
					full_repaint();
				};
			};
		};
	};

	this.on_char = function(code) {
		this.inputbox.on_char(code);
	};

	this.on_focus = function(is_focused) {
		this.inputbox.on_focus(is_focused);
	};
};

oListBox = function(id, object_name, x, y, w, row_num, row_height, label, arr, selectedId, func, parentObject, parentPageId, offset) {
	this.objType = "LB";
	this.rowHeight = row_height;
	this.id = id;
	this.objectName = object_name;
	this.parentObject = parentObject;
	this.x = x;
	this.y = y;
	this.parentPageId = parentPageId;
	this.ly = this.y - (p.settings.pages[this.parentPageId].offset * cSettings.rowHeight);
	this.w = w;
	this.h = row_num * this.rowHeight;
	this.totalRows = Math.floor(this.h / this.rowHeight);
	this.label = label;
	this.offset = offset;
	this.arr = arr;
	this.total = this.arr.length;
	this.selectedId = selectedId;
	var gfunc = func;
	// scrollbar instance
	this.scrollbar = new oScrollBar(this.id, this.objectName + ".scrollbar", this.x + this.w - cScrollBar.width, this.ly, cScrollBar.width, this.h, this.arr.length, this.rowHeight, this.offset, this.objectName, false, 3, true);
	this.scrollbarWidth = 0;

	this.repaint = function() {
		window.RepaintRect(this.x, this.ly, this.w, this.h);
	};

	this.showSelected = function(rowId) {
		this.selectedId = rowId;
		if (this.scrollbar.visible) {
			var max_offset = this.total - this.totalRows;
			this.offset = rowId > max_offset ? max_offset : rowId;
			this.scrollbar.updateCursorPos(this.offset);
		}
		else {
			this.offset = 0;
		};
		eval(gfunc + "(" + this.parentPageId + ", " + this.id + ", " + this.selectedId + ")");
	};

	this.reSet = function(list_array) {
		this.arr = list_array;
		this.total = this.arr.length;
		this.max = (this.total > this.totalRows ? this.totalRows : this.total);
		// scrollbar reset
		this.scrollbar.reSet(this.total, this.rowHeight, this.offset);
		if (this.scrollbar.visible) {
			this.scrollbarWidth = this.scrollbar.w;
		}
		else {
			this.scrollbarWidth = 0;
		};
	};
	this.reSet(this.arr);

	this.resize = function(x, y, w, h, arr) {
		this.x = x;
		this.y = y;
		this.ly = this.y - (p.settings.pages[this.parentPageId].offset * cSettings.rowHeight);
		this.w = w;
		this.h = 3 * this.rowHeight;

		this.arr = arr;
		this.total = this.arr.length;
		this.max = (this.total > this.totalRows ? this.totalRows : this.total);
		this.offset = 0;

		// scrollbar resize
		this.scrollbar.reSize(this.x + this.w - cScrollBar.width, this.ly, cScrollBar.width, this.h, this.arr.length, this.rowHeight, this.offset);
		if (this.scrollbar.visible) {
			this.scrollbarWidth = this.scrollbar.w;
		}
		else {
			this.scrollbarWidth = 0;
		};
	};

	this.draw = function(gr) {
		var row = 0;
		this.ly = this.y - (p.settings.pages[this.parentPageId].offset * cSettings.rowHeight);

		this.scrollbar.y = this.ly;
		// scrollbar reset
		this.scrollbar.reSet(this.total, this.rowHeight, this.offset);
		if (this.scrollbar.visible) {
			this.scrollbarWidth = this.scrollbar.w;
		}
		else {
			this.scrollbarWidth = 0;
		};

		var text_padding = 5;

		// listbox bg
		if (this.label.length > 0) {
			gr.GdiDrawText(this.label, g_font_b, p.settings.color1, this.x, this.ly - this.rowHeight - g_z2, this.w, this.rowHeight, lc_txt);
		};
		gr.FillSolidRect(this.x, this.ly, this.w, this.h + 1, RGB(240, 240, 240));
		gr.DrawRect(this.x - 1, this.ly - 1, this.w + 1, this.h + 2, 1.0, RGB(180, 180, 180));

		// scrollbar
		if (this.scrollbar.visible) this.scrollbar.draw(gr);

		// items
		var isCustom = false;
		var fin = this.max + this.offset;
		for (var i = this.offset; i < fin; i++) {
			gr.SetSmoothingMode(0);
			switch (this.parentPageId) {
			case 1:
				isCustom = (p.headerBar.columns[i].ref.substr(0, 3) == "自定义");
				break;
			case 2:
				isCustom = (p.list.groupby[i].ref.substr(0, 3) == "自定义");
				break;
			};
			if (i == this.selectedId) gr.FillSolidRect(this.x + 1, this.ly + row * this.rowHeight + 1, this.w - this.scrollbarWidth - 2, this.rowHeight - 1, RGB(155, 155, 155));
			gr.GdiDrawText((isCustom ? "[" : "") + this.arr[i] + (isCustom ? "]" : ""), (i == this.selectedId ? g_font_b : p.settings.font), RGB(0, 0, 0), this.x + text_padding, this.ly + row * this.rowHeight, this.w - this.scrollbarWidth - text_padding * 2, this.rowHeight, lc_txt);
			row++;
		};
	};

	this.isHoverObject = function(x, y) {
		var test = (x >= this.x && x <= this.x + this.w && y >= this.ly && y <= this.ly + this.h);
		return test;
	};

	this.on_mouse = function(event, x, y, delta) {
		this.ishover = this.isHoverObject(x, y);
		var maxHeight = this.max * this.rowHeight;
		this.ishoverRow = (x >= this.x && x <= this.x + this.w - this.scrollbarWidth && y >= this.ly && y <= this.ly + maxHeight);

		switch (event) {
		case "down":
			if (this.scrollbar.visible) this.scrollbar.check(event, x, y, delta);
			// get row number clicked
			if (y > cSettings.topBarHeight + cSettings.rowHeight) {
				if (this.ishoverRow) {
					var new_selectedId = Math.floor((y - this.ly) / this.rowHeight) + this.offset;
					eval(gfunc + "(" + this.parentPageId + ", " + this.id + ", " + new_selectedId + ")");
				};
			};
			break;
		case "dblclk":
			this.on_mouse("down", x, y);
			break;
		case "up":
			if (this.scrollbar.visible) this.scrollbar.check(event, x, y, delta);
			break;
		case "right":
			// get row number right-clicked
			if (y > cSettings.topBarHeight + cSettings.rowHeight) {
				if (this.ishoverRow) {
					var new_selectedId = Math.floor((y - this.ly) / this.rowHeight) + this.offset;
					eval(gfunc + "(" + this.parentPageId + ", " + this.id + ", " + new_selectedId + ")");
					this.contextMenu(x, y, new_selectedId);
				};
			};
			break;
		case "move":
			if (this.scrollbar.visible) this.scrollbar.check(event, x, y, delta);
			break;
		case "wheel":
			if (this.ishover) {
				if (this.scrollbar.visible && this.ishover) this.scrollbar.check(event, x, y, delta);
			};
			break;
		};
	};

	this.on_key = function(event, vkey) {
		switch (event) {
		case "down":
			switch (vkey) {
			case VK_UP:
				var new_selectedId = (this.selectedId > 0 ? this.selectedId - 1 : 0);
				eval(gfunc + "(" + this.parentPageId + ", " + this.id + ", " + new_selectedId + ")");
				var row_idx = this.selectedId - this.offset;
				if (row_idx <= 0) {
					this.showSelected(new_selectedId);
				};
				break;
			case VK_DOWN:
				var new_selectedId = (this.selectedId < this.arr.length - 1 ? this.selectedId + 1 : this.arr.length - 1);
				eval(gfunc + "(" + this.parentPageId + ", " + this.id + ", " + new_selectedId + ")");
				var row_idx = this.selectedId - this.offset;
				if (row_idx > 2) { // 2 = max index row of the listbox, because listbox height is 3 rows
					this.showSelected(new_selectedId);
				};
				break;
			};
			break;
		};
	};

	this.on_char = function(code) {};

	this.on_focus = function(is_focused) {};

	this.contextMenu = function(x, y, id) {
		var fin;
		var idx;
		var _menu = window.CreatePopupMenu();

		switch (this.parentPageId) {
		case 1:
			if (p.headerBar.totalColumns < properties.max_columns) {
				var source_ref = p.headerBar.columns[id].ref;
				if (source_ref != "封面" && source_ref != "状态" && source_ref != "喜爱" && source_ref != "等级") {
					_menu.AppendMenuItem(MF_STRING, 10, "复制");
				};
			};
			break;
		case 2:
			if (p.list.totalGroupBy < properties.max_patterns) {
				_menu.AppendMenuItem(MF_STRING, 20, "复制");
			};
			break;
		};

		idx = _menu.TrackPopupMenu(x, y);
		switch (true) {
		case (idx == 10):
			// action
			var no_user = 1;
			var tmp_array = [];
			// copy columns array to a tmp array in order to sort it
			fin = p.headerBar.columns.length;
			for (var i = 0; i < fin; i++) {
				tmp_array.push(p.headerBar.columns[i].ref);
			};
			tmp_array.sort();
			// get free number to affect to the new User column to create
			fin = tmp_array.length;
			for (var i = 0; i < fin; i++) {
				if (tmp_array[i].substr(0, 3) == "自定义") {
					if (tmp_array[i].substr(tmp_array[i].length - 2, 2) == num(no_user, 2)) {
						no_user++;
					};
				};
			};

			var c0 = p.headerBar.columns[id].label;
			var c1 = p.headerBar.columns[id].tf;
			var c2 = p.headerBar.columns[id].tf2;
			var c3 = p.headerBar.columns[id].align;
			var c4 = p.headerBar.columns[id].sortOrder;

			p.headerBar.columns.push(new oColumn(c0 + " 副本", c1, c2, "自定义 " + num(no_user, 2), c3, c4, 0));
			p.headerBar.totalColumns++;
			var arr = [];
			fin = p.headerBar.columns.length;
			for (var i = 0; i < fin; i++) {
				arr.push(p.headerBar.columns[i].ref);
			};
			p.settings.pages[1].elements[0].reSet(arr);
			p.headerBar.saveColumns(true);
			p.settings.pages[1].elements[0].showSelected(p.headerBar.columns.length - 1);
			full_repaint();
			break;
		case (idx == 20):
			// action
			var c0 = p.list.groupby[id].label;
			var c1 = p.list.groupby[id].tf;
			var c2 = p.list.groupby[id].sortOrder;
			var c3 = p.list.groupby[id].l1;
			var c4 = p.list.groupby[id].r1;
			var c5 = p.list.groupby[id].l2;
			var c6 = p.list.groupby[id].r2;

			p.list.groupby.push(new oGroupBy(c0 + " 副本", c1, c2, "自定义", c3, c4, c5, c6));
			p.list.totalGroupBy++;
			var arr = [];
			fin = p.list.groupby.length;
			for (var i = 0; i < fin; i++) {
				arr.push(p.list.groupby[i].label);
			};
			p.settings.pages[2].elements[0].reSet(arr);
			p.list.saveGroupBy();
			p.settings.pages[2].elements[0].showSelected(p.list.groupby.length - 1);
			full_repaint();
			break;
		};
		//_menu.Dispose();
		return true;
	};
};

oPage = function(id, objectName, label, nbrows) {
	this.id = id;
	this.objectName = objectName;
	this.label = label;
	this.label_w = 0;
	this.elements = [];
	this.offset = 0;
	this.rows = [];
	this.total_rows = nbrows;
	this.x = p.settings.x;
	this.y = p.settings.y + cSettings.topBarHeight;
	this.w = p.settings.w;
	this.h = p.settings.h - cSettings.topBarHeight;
	this.totalRowsVis = Math.floor((this.h - cHeaderBar.height) / cSettings.rowHeight);
	// scrollbar instance
	this.scrollbar = new oScrollBar(this.id, this.objectName + ".scrollbar", p.settings.x + p.settings.w - cScrollBar.width, p.settings.y + cSettings.topBarHeight + cHeaderBar.height, cScrollBar.width, p.settings.h - cSettings.topBarHeight - cHeaderBar.height, this.total_rows, cSettings.rowHeight, this.offset, this.objectName, false, 3, false);
	this.scrollbar.setCustomColors(g_color_normal_bg, g_color_normal_txt);
	this.scrollbarWidth = 0;

	this.repaint = function() {
		full_repaint();
	};

	this.init = function() {
		var txtbox_x = 20;
		var oTextBox_1 = 600*zdpi;//ww - txtbox_x * 2 - this.scrollbarWidth;
		var oTextBox_2 = 340*zdpi;
		var oTextBox_3 = 250*zdpi;
		switch (this.id) {
		case 0:
			// General
			var rh = cSettings.rowHeight;
			// Behaviour options
			this.elements.push(new oCheckBox(0, 20, cSettings.topBarHeight + rh * 2.25, "平滑滚动", "properties.smoothscrolling", "settings_checkboxes_action", this.id));
			this.elements.push(new oCheckBox(1, 20, cSettings.topBarHeight + rh * 3.25, "触屏滚动控制 (禁用拖放)", "properties.enableTouchControl", "settings_checkboxes_action", this.id));
			
			this.elements.push(new oTextBox(2, txtbox_x, Math.ceil(cSettings.topBarHeight + rh * 4.25), 50*zdpi, cHeaderBar.height, "滚轮滚动步长（全局）", cList.scrollstep.toString(), "settings_textboxes_action", this.id));
			this.elements.push(new oTextBox(3, txtbox_x + 180*zdpi, Math.ceil(cSettings.topBarHeight + rh * 4.25), 50*zdpi, cHeaderBar.height, "触屏滚动步长", cList.touchstep.toString(), "settings_textboxes_action", this.id));
			// play option
			var spaceBetween_w = zoom(70, zdpi);
			this.elements.push(new oRadioButton(4, txtbox_x, cSettings.topBarHeight + rh * 7.25, "播放", (properties.defaultPlaylistItemAction == "播放"), "settings_radioboxes_action", this.id));
			this.elements.push(new oRadioButton(5, txtbox_x + spaceBetween_w, cSettings.topBarHeight + rh * 7.25, "添加到播放队列", (properties.defaultPlaylistItemAction == "添加到播放队列"), "settings_radioboxes_action", this.id));

			this.elements.push(new oCheckBox(6, 20, cSettings.topBarHeight + rh * 9.25, "右键菜单添加 \"选择\" 子菜单", "properties.selectionmenu", "settings_checkboxes_action", this.id));
			this.elements.push(new oCheckBox(7, 20, cSettings.topBarHeight + rh * 10.25, "顺序播放时自动播放下一个播放列表", "repeat_pls", "settings_checkboxes_action", this.id));
			this.elements.push(new oTextBox(8, txtbox_x, Math.ceil(cSettings.topBarHeight + rh * 11.75), oTextBox_2, cHeaderBar.height, "音轨外部编辑程序路径", p.settings.ext_app[0], "settings_textboxes_action", this.id));
			this.elements.push(new oTextBox(9, txtbox_x+oTextBox_2+p.settings.btn_off.Width+20*zdpi, Math.ceil(cSettings.topBarHeight + rh * 11.75), 115*zdpi, cHeaderBar.height, "程序名称", p.settings.ext_app[1], "settings_textboxes_action", this.id));
			break;
		case 1:
			// Columns
			// Create Columns ListBox object
			var arr = [];
			var rh = cSettings.rowHeight;
			var fin = p.headerBar.columns.length;
			for (var i = 0; i < fin; i++) {
				arr.push(p.headerBar.columns[i].label);
			};
			var listBoxRowHeight = zoom(21, zdpi);
			var listBoxRowNum = 6;
			var listBoxWidth = zoom(120, zdpi);
			var listBoxCurrentId = 0;
			this.elements.push(new oListBox(0, "p.settings.pages[" + this.id.toString() + "].elements[0]", 20, Math.floor(cSettings.topBarHeight + rh * 1.75 + p.settings.txtHeight), listBoxWidth + cScrollBar.width, listBoxRowNum, listBoxRowHeight, "列", arr, listBoxCurrentId, "settings_listboxes_action", "p.settings.pages[" + this.id.toString() + "]", this.id, 0));

			// Create TextBoxes
			var txtbox_value = p.headerBar.columns[listBoxCurrentId].label;
			this.elements.push(new oTextBox(1, txtbox_x, Math.ceil(cSettings.topBarHeight + rh * 6.75), oTextBox_3, cHeaderBar.height, "标签", txtbox_value, "settings_textboxes_action", this.id));
			txtbox_value = p.headerBar.columns[listBoxCurrentId].tf;
			this.elements.push(new oTextBox(2, txtbox_x, Math.ceil(cSettings.topBarHeight + rh * 8.75), oTextBox_1, cHeaderBar.height, "标题格式化 (输入 'null' ：无)", txtbox_value, "settings_textboxes_action", this.id));
			txtbox_value = p.headerBar.columns[listBoxCurrentId].tf2;
			this.elements.push(new oTextBox(3, txtbox_x, Math.ceil(cSettings.topBarHeight + rh * 10.75), oTextBox_1, cHeaderBar.height, "附加行标题格式化 (输入 'null' ：无)", txtbox_value, "settings_textboxes_action", this.id));
			txtbox_value = p.headerBar.columns[listBoxCurrentId].sortOrder;
			this.elements.push(new oTextBox(4, txtbox_x, Math.ceil(cSettings.topBarHeight + rh * 12.75), oTextBox_1, cHeaderBar.height, "排序 (输入 'null' ：不排序)", txtbox_value, "settings_textboxes_action", this.id));

			// Create radio buttons
			var spaceBetween_w = zoom(80, zdpi);
			this.elements.push(new oRadioButton(5, txtbox_x, cSettings.topBarHeight + rh * 15.75, "左", (p.headerBar.columns[listBoxCurrentId].align == 0), "settings_radioboxes_action", this.id));
			this.elements.push(new oRadioButton(6, txtbox_x + spaceBetween_w, cSettings.topBarHeight + rh * 15.75, "居中", (p.headerBar.columns[listBoxCurrentId].align == 1), "settings_radioboxes_action", this.id));
			this.elements.push(new oRadioButton(7, txtbox_x + spaceBetween_w * 2, cSettings.topBarHeight + rh * 15.75, "右", (p.headerBar.columns[listBoxCurrentId].align == 2), "settings_radioboxes_action", this.id));
			break;
		case 2:
			// Groups
			// Create Groups Pattern ListBox object
			var arr = [];
			var rh = cSettings.rowHeight;
			var fin = p.list.groupby.length;
			for (var i = 0; i < fin; i++) {
				arr.push(p.list.groupby[i].label);
			};
			var listBoxRowHeight = zoom(21, zdpi);
			var listBoxRowNum = 6;
			var listBoxWidth = zoom(175, zdpi);
			var listBoxCurrentId = layout.pattern_idx;
			this.elements.push(new oListBox(0, "p.settings.pages[" + this.id.toString() + "].elements[0]", 20, Math.floor(cSettings.topBarHeight + rh * 1.75 + p.settings.txtHeight), listBoxWidth + cScrollBar.width, listBoxRowNum, listBoxRowHeight, "分组模版", arr, listBoxCurrentId, "settings_listboxes_action", "p.settings.pages[" + this.id.toString() + "]", this.id, 0));

			// Create TextBoxes
			var txtbox_value = p.list.groupby[listBoxCurrentId].label;
			this.elements.push(new oTextBox(1, txtbox_x, Math.ceil(cSettings.topBarHeight + rh * 6.5), oTextBox_3, cHeaderBar.height, "标签", txtbox_value, "settings_textboxes_action", this.id));
			txtbox_value = p.list.groupby[listBoxCurrentId].tf;
			this.elements.push(new oTextBox(2, txtbox_x, Math.ceil(cSettings.topBarHeight + rh * 8.5), oTextBox_1, cHeaderBar.height, "标题格式化 (输入 'null' ：无)", txtbox_value, "settings_textboxes_action", this.id));
			txtbox_value = p.list.groupby[listBoxCurrentId].sortOrder;
			this.elements.push(new oTextBox(3, txtbox_x, Math.ceil(cSettings.topBarHeight + rh * 10.5), oTextBox_1, cHeaderBar.height, "排序 (输入 'null' ：不排序)", txtbox_value, "settings_textboxes_action", this.id));
			var txtbox_value = p.list.groupby[listBoxCurrentId].l1;
			this.elements.push(new oTextBox(4, txtbox_x, Math.ceil(cSettings.topBarHeight + rh * 13.5), oTextBox_1, cHeaderBar.height, "标题第 1 行,左侧字段", txtbox_value, "settings_textboxes_action", this.id));
			txtbox_value = p.list.groupby[listBoxCurrentId].r1;
			this.elements.push(new oTextBox(5, txtbox_x, Math.ceil(cSettings.topBarHeight + rh * 15.5), oTextBox_1, cHeaderBar.height, "标题第 1 行,右侧字段", txtbox_value, "settings_textboxes_action", this.id));
			txtbox_value = p.list.groupby[listBoxCurrentId].l2;
			this.elements.push(new oTextBox(6, txtbox_x, Math.ceil(cSettings.topBarHeight + rh * 17.5), oTextBox_1, cHeaderBar.height, "标题第 2 行,左侧字段", txtbox_value, "settings_textboxes_action", this.id));
			txtbox_value = p.list.groupby[listBoxCurrentId].r2;
			this.elements.push(new oTextBox(7, txtbox_x, Math.ceil(cSettings.topBarHeight + rh * 19.5), oTextBox_1, cHeaderBar.height, "标题第 2 行,右侧字段", txtbox_value, "settings_textboxes_action", this.id));
			break;
		case 3:
			//foobox options
			var rh = cSettings.rowHeight;
			this.elements.push(new oRadioButton(0, 20, cSettings.topBarHeight + rh * 2.25, "系统", (sys_scrollbar == true), "settings_radioboxes_action", this.id));
			this.elements.push(new oRadioButton(1, zoom(120, zdpi), cSettings.topBarHeight + rh * 2.25, "较窄", (sys_scrollbar == false), "settings_radioboxes_action", this.id));
			this.elements.push(new oCheckBox(2, 20, cSettings.topBarHeight + rh * 4.25, "同时写入文件标签", "rating2tag ? true : false", "settings_checkboxes_action", this.id));
			this.elements.push(new oCheckBox(3, 20, cSettings.topBarHeight + rh * 6.25, "封面信息面板总是跟随光标而非播放", "follow_cursor ? true : false", "settings_checkboxes_action", this.id));
			this.elements.push(new oCheckBox(4, 20, cSettings.topBarHeight + rh * 7.25, "高亮色跟随封面颜色", "color_bycover ? true : false", "settings_checkboxes_action", this.id));
			this.elements.push(new oCheckBox(5, 20, cSettings.topBarHeight + rh * 8.25, "性能优先，缓存专辑封面的依据不区分专辑艺术家", "albcov_lt ? true : false", "settings_checkboxes_action", this.id));
			this.elements.push(new oTextBox(6, txtbox_x, Math.ceil(cSettings.topBarHeight + rh * 9.25), oTextBox_3, cHeaderBar.height, "以文件夹分组时的封面文件名，含扩展名，以分号 ';' 来分隔 (封面在该文件夹内)", dir_cover_name, "settings_textboxes_action", this.id));			
			this.elements.push(new oCheckBox(7, 20, cSettings.topBarHeight + rh * 12.5, "显示 '打开' 和 '停止' 按钮", "show_extrabtn ? true : false", "settings_checkboxes_action", this.id));
			this.elements.push(new oRadioButton(8, 20, cSettings.topBarHeight + rh * 14.25, "专辑列表", (libbtn_fuc == true), "settings_radioboxes_action", this.id));
			this.elements.push(new oRadioButton(9, zoom(120, zdpi), cSettings.topBarHeight + rh * 14.25, "分面", (libbtn_fuc == false), "settings_radioboxes_action", this.id));
			this.elements.push(new oTextBox(10, txtbox_x, Math.ceil(cSettings.topBarHeight + rh * 15.55), oTextBox_1, cHeaderBar.height, "播放列表管理面板中添加网络电台的地址 (若多个地址，以分号 ';' 来分隔)", radiom3u, "settings_textboxes_action", this.id));
			break;
		case 4:
			var arr = [];
			var rh = cSettings.rowHeight;
			var fin = layout.ids.length;
			//var listBoxCurrentId = 0;
			for (var i = 0; i < fin; i++) {
				arr.push(layout.ids[i]);
				if(layout.playlistName == arr[i]) layout.setting_idx = i;
			};
			var listBoxRowHeight = zoom(21, zdpi);
			var listBoxRowNum = 6;
			var listBoxWidth = zoom(175, zdpi);
			this.elements.push(new oListBox(0, "p.settings.pages[" + this.id.toString() + "].elements[0]", 20, Math.floor(cSettings.topBarHeight + rh * 1.75 + p.settings.txtHeight), listBoxWidth + cScrollBar.width, listBoxRowNum, listBoxRowHeight, "播放列表布局", arr, layout.setting_idx, "settings_listboxes_action", "p.settings.pages[" + this.id.toString() + "]", this.id, 0));
			this.elements.push(new oCheckBox(1, txtbox_x, cSettings.topBarHeight + rh * 7.75, "在分组标题中显示封面 (分组标题高度 ≥ 2，及不显示封面列时生效. 推荐值: 勾选)", "layout.config[layout.setting_idx][1] == '1' ? true : false", "settings_checkboxes_action", this.id));
			this.elements.push(new oCheckBox(2, txtbox_x, cSettings.topBarHeight + rh * 8.75, "自动折叠", "layout.config[layout.setting_idx][2] == '1' ? true : false", "settings_checkboxes_action", this.id));
			/*if (layout.gopts[3] < 0 || layout.gopts[3] > 3) {
				layout.gopts[3] = (layout.gopts[3] < 0 ? 0 : 3);
			};*/
			var spaceBetween_w = zoom(50, zdpi);
			var v = layout.config[layout.setting_idx][3];
			this.elements.push(new oRadioButton(3, txtbox_x, cSettings.topBarHeight + rh * 10.75, "0", (v == "0"), "settings_radioboxes_action", this.id));
			this.elements.push(new oRadioButton(4, txtbox_x + spaceBetween_w, cSettings.topBarHeight + rh * 10.75, "1", (v == "1"), "settings_radioboxes_action", this.id));
			this.elements.push(new oRadioButton(5, txtbox_x + spaceBetween_w * 2, cSettings.topBarHeight + rh * 10.75, "2", (v == "2"), "settings_radioboxes_action", this.id));
			this.elements.push(new oRadioButton(6, txtbox_x + spaceBetween_w * 3, cSettings.topBarHeight + rh * 10.75, "3", (v == "3"), "settings_radioboxes_action", this.id));
			// Create radio buttons / group header EXPANDED height
			/* force value if set to an unauthirized one [0;3]
			if (layout.gopts[4] < 0 || layout.gopts[4] > 3) {
				layout.gopts[4] = (layout.gopts[4] < 0 ? 0 : 3);
				//p.list.saveGroupBy();
			};*/
			var v = layout.config[layout.setting_idx][4];
			this.elements.push(new oRadioButton(7, txtbox_x, cSettings.topBarHeight + rh * 12.5, "0", (v == "0"), "settings_radioboxes_action", this.id));
			this.elements.push(new oRadioButton(8, txtbox_x + spaceBetween_w, cSettings.topBarHeight + rh * 12.5, "1", (v == "1"), "settings_radioboxes_action", this.id));
			this.elements.push(new oRadioButton(9, txtbox_x + spaceBetween_w * 2, cSettings.topBarHeight + rh * 12.5, "2", (v == "2"), "settings_radioboxes_action", this.id));
			this.elements.push(new oRadioButton(10, txtbox_x + spaceBetween_w * 3, cSettings.topBarHeight + rh * 12.5, "3", (v == "3"), "settings_radioboxes_action", this.id));
			spaceBetween_w = zoom(90, zdpi);
			this.elements.push(new oRadioButton(11, txtbox_x, cSettings.topBarHeight + rh * 14.5, "折叠", (layout.config[layout.setting_idx][5] == "1"), "settings_radioboxes_action", this.id));
			this.elements.push(new oRadioButton(12, txtbox_x + spaceBetween_w, cSettings.topBarHeight + rh * 14.5, "展开", (layout.config[layout.setting_idx][5] == "0"), "settings_radioboxes_action", this.id));
			break;
		};
	};

	this.setSize = function() {
		this.x = p.settings.x;
		this.y = p.settings.y + cSettings.topBarHeight;
		this.w = p.settings.w;
		this.h = p.settings.h - cSettings.topBarHeight;

		// scrollbar resize
		this.offset = 0;
		this.scrollbar.reSize(p.settings.x + p.settings.w - cScrollBar.width, p.settings.y + cSettings.topBarHeight + cHeaderBar.height, cScrollBar.width, p.settings.h - cSettings.topBarHeight - cHeaderBar.height, this.total_rows, cSettings.rowHeight, this.offset);
		if (this.scrollbar.visible) {
			this.scrollbarWidth = this.scrollbar.w;
		}
		else {
			this.scrollbarWidth = 0;
		};
	};

	this.draw = function(gr) {
		var fin = this.elements.length;
		for (var i = 0; i < fin; i++) {
			this.elements[i].draw(gr);
		};
		// draw extra elements
		var rh = cSettings.rowHeight;
		var txtbox_x = 20;
		var txt_width = p.settings.w - 10;

		switch (this.id) {
		case 0:
			gr.GdiDrawText("行为", g_font_b, p.settings.color1, txtbox_x, cSettings.topBarHeight + rh * 1.5 - (this.offset * cSettings.rowHeight), txt_width, p.settings.lineHeight, lc_txt);
			gr.GdiDrawText("(范围: 1-20)", g_font, p.settings.color1, txtbox_x + 82*zdpi, cSettings.topBarHeight + rh * 5.25 - (this.offset * cSettings.rowHeight), txt_width, p.settings.lineHeight, lc_txt);
			gr.GdiDrawText("双击项目默认操作", g_font_b, p.settings.color1, txtbox_x, cSettings.topBarHeight + rh * 6.5 - (this.offset * cSettings.rowHeight), txt_width, p.settings.lineHeight, lc_txt);
			gr.GdiDrawText("其他", g_font_b, p.settings.color1, txtbox_x, cSettings.topBarHeight + rh * 8.5 - (this.offset * cSettings.rowHeight), txt_width, p.settings.lineHeight, lc_txt);
			gr.GdiDrawText("设置后可在右键菜单里调用， 如 MusicTag, Mp3tag 等", g_font, p.settings.color1, txtbox_x, cSettings.topBarHeight + rh * 13.75 - (this.offset * cSettings.rowHeight), txt_width, p.settings.lineHeight, lc_txt);
			var bx = txtbox_x+350*zdpi, by = cSettings.topBarHeight + rh * 12.55 - (this.offset * cSettings.rowHeight);
			p.settings.browsebutton.draw(gr, bx, by, 255);
			gr.GdiDrawText("浏览", g_font_b, p.settings.color2, bx, by, p.settings.btn_off.Width, p.settings.btn_off.Height, cc_txt);
			break;
		case 1:
			var listBoxWidth = zoom(120, zdpi);
			gr.GdiDrawText("对齐方式", g_font_b, p.settings.color1, txtbox_x, cSettings.topBarHeight + rh * 15 - (this.offset * cSettings.rowHeight), txt_width, p.settings.lineHeight, lc_txt);
			// new column button
			var nx = 20 + listBoxWidth + g_z30;
			var ny = Math.floor(cSettings.topBarHeight + rh * 2.1) - (this.offset * cSettings.rowHeight);
			if (p.headerBar.columns.length < properties.max_columns) {
				p.settings.newbutton.draw(gr, nx, ny, 255);
				gr.GdiDrawText("新建", g_font_b, p.settings.color2, nx, ny, p.settings.btn_off.Width, p.settings.btn_off.Height, cc_txt);
			}
			else {
				gr.DrawImage(p.settings.btn_no, nx, ny, p.settings.btn_no.Width, p.settings.btn_no.Height, 0, 0, p.settings.btn_no.Width, p.settings.btn_no.Height, 0, 255);
				gr.GdiDrawText("新建", g_font_b, p.settings.color4, nx, ny, p.settings.btn_no.Width, p.settings.btn_no.Height, cc_txt);
			};
			// delete user column button
			var spaceBetween_w = g_z10;
			var dx = 20 + listBoxWidth + g_z30;
			var dy = Math.floor(cSettings.topBarHeight + rh * 2.1 + g_z5 + p.settings.btn_no.Height) - (this.offset * cSettings.rowHeight);
			var idx = p.settings.pages[1].elements[0].selectedId;
			var ref = p.headerBar.columns[idx].ref;
			if (ref.substr(0, 3) == "自定义") {
				p.settings.delbutton.draw(gr, dx, dy, 255);
				gr.GdiDrawText("删除", g_font_b, p.settings.color2, dx, dy, p.settings.btn_off.Width, p.settings.btn_off.Height, cc_txt);
			}
			else {
				gr.DrawImage(p.settings.btn_no, dx, dy, p.settings.btn_no.Width, p.settings.btn_no.Height, 0, 0, p.settings.btn_no.Width, p.settings.btn_no.Height, 0, 255);
				gr.GdiDrawText("删除", g_font_b, p.settings.color4, dx, dy, p.settings.btn_no.Width, p.settings.btn_no.Height, cc_txt);
			};
			break;
		case 2:
			var listBoxWidth = zoom(175, zdpi);
			// new pattern button
			var nx = 20 + listBoxWidth + g_z30;
			var ny = Math.floor(cSettings.topBarHeight + rh * 2.1) - (this.offset * cSettings.rowHeight);
			if (p.headerBar.columns.length < properties.max_columns) {
				p.settings.newbuttonPattern.draw(gr, nx, ny, 255);
				gr.GdiDrawText("新建", g_font_b, p.settings.color2, nx, ny, p.settings.btn_off.Width, p.settings.btn_off.Height, cc_txt);
			}
			else {
				gr.DrawImage(p.settings.btn_no, nx, ny, p.settings.btn_no.Width, p.settings.btn_no.Height, 0, 0, p.settings.btn_no.Width, p.settings.btn_no.Height, 0, 255);
				gr.GdiDrawText("新建", g_font_b, p.settings.color4, nx, ny, p.settings.btn_no.Width, p.settings.btn_no.Height, cc_txt);
			};
			// delete pattern button
			var spaceBetween_w = g_z10;
			var dx = 20 + listBoxWidth + g_z30;
			var dy = Math.floor(cSettings.topBarHeight + rh * 2.1 + g_z5 + p.settings.btn_no.Height) - (this.offset * cSettings.rowHeight);
			var idx = p.settings.pages[2].elements[0].selectedId;
			var ref = p.list.groupby[idx].ref;
			if (ref.substr(0, 3) == "自定义") {
				p.settings.delbuttonPattern.draw(gr, dx, dy, 255);
				gr.GdiDrawText("删除", g_font_b, p.settings.color2, dx, dy, p.settings.btn_off.Width, p.settings.btn_off.Height, cc_txt);
			}
			else {
				gr.DrawImage(p.settings.btn_no, dx, dy, p.settings.btn_no.Width, p.settings.btn_no.Height, 0, 0, p.settings.btn_no.Width, p.settings.btn_no.Height, 0, 255);
				gr.GdiDrawText("删除", g_font_b, p.settings.color4, dx, dy, p.settings.btn_no.Width, p.settings.btn_no.Height, cc_txt);
			};
			gr.GdiDrawText("分组标题字段", g_font_blank, p.settings.color2, txtbox_x, cSettings.topBarHeight + rh * 12.75 - (this.offset * cSettings.rowHeight), txt_width, p.settings.lineHeight, lc_txt);
			gr.GdiDrawText("注: 第二行右侧字段定义仅在分组标题高度为 3 时生效.", g_font, p.settings.color2, txtbox_x, cSettings.topBarHeight + rh * 21.5 - (this.offset * cSettings.rowHeight), txt_width, p.settings.lineHeight, lc_txt);
			break;
		case 3:
			gr.GdiDrawText("滚动条宽度", g_font_b, p.settings.color1, txtbox_x, cSettings.topBarHeight + rh * 1.5 - (this.offset * cSettings.rowHeight), txt_width, p.settings.lineHeight, lc_txt);
			gr.GdiDrawText("评级数据", g_font_b, p.settings.color1, txtbox_x, cSettings.topBarHeight + rh * 3.5 - (this.offset * cSettings.rowHeight), txt_width, p.settings.lineHeight, lc_txt);
			gr.GdiDrawText("封面相关", g_font_b, p.settings.color1, txtbox_x, cSettings.topBarHeight + rh * 5.5 - (this.offset * cSettings.rowHeight), txt_width, p.settings.lineHeight, lc_txt);
			gr.GdiDrawText("底部工具栏", g_font_b, p.settings.color1, txtbox_x, cSettings.topBarHeight + rh * 11.75 - (this.offset * cSettings.rowHeight), txt_width, p.settings.lineHeight, lc_txt);
			gr.GdiDrawText("媒体库按钮功能 (仅 foobar2000 v2+ 有效)", g_font, p.settings.color1, txtbox_x, cSettings.topBarHeight + rh * 13.5 - (this.offset * cSettings.rowHeight), txt_width, p.settings.lineHeight, lc_txt);
			p.settings.g_link.draw(gr, txtbox_x, cSettings.topBarHeight + rh * 18 - (this.offset * cSettings.rowHeight));
			break;
		case 4:
			var listBoxWidth = zoom(175, zdpi);
			var dx = 20 + listBoxWidth + g_z30;
			var dy = Math.floor(cSettings.topBarHeight + rh * 2.1) - (this.offset * cSettings.rowHeight);
			if (p.settings.pages[4].elements[0].selectedId != 0) {
				p.settings.delbuttonLayout.draw(gr, dx, dy, 255);
				gr.GdiDrawText("删除", g_font_b, p.settings.color2, dx, dy, p.settings.btn_off.Width, p.settings.btn_off.Height, cc_txt);
			}
			else {
				gr.DrawImage(p.settings.btn_no, dx, dy, p.settings.btn_no.Width, p.settings.btn_no.Height, 0, 0, p.settings.btn_no.Width, p.settings.btn_no.Height, 0, 255);
				gr.GdiDrawText("删除", g_font_b, p.settings.color4, dx, dy, p.settings.btn_no.Width, p.settings.btn_no.Height, cc_txt);
			};
			p.settings.delbuttonLayouts.draw(gr, dx, dy + rh *1.2, 255);
			gr.GdiDrawText("清除无效布局", g_font_b, p.settings.color2, dx, dy + rh *1.2, p.settings.btn_off_2.Width, p.settings.btn_off_2.Height, cc_txt);
			gr.GdiDrawText("布局中的分组选项:", g_font_b, p.settings.color1, txtbox_x, cSettings.topBarHeight + rh * 6.75 - (this.offset * cSettings.rowHeight), txt_width, p.settings.lineHeight, lc_txt);
			gr.GdiDrawText("折叠高度", g_font_b, p.settings.color1, txtbox_x, cSettings.topBarHeight + rh * 10 - (this.offset * cSettings.rowHeight), txt_width, p.settings.lineHeight, lc_txt);
			gr.GdiDrawText("展开高度", g_font_b, p.settings.color1, txtbox_x, cSettings.topBarHeight + rh * 11.75 - (this.offset * cSettings.rowHeight), txt_width, p.settings.lineHeight, lc_txt);
			gr.GdiDrawText("默认分组状态", g_font_b, p.settings.color1, txtbox_x, cSettings.topBarHeight + rh * 13.75 - (this.offset * cSettings.rowHeight), txt_width, p.settings.lineHeight, lc_txt);
			break;
		};

		// draw scrollbar
		if (this.scrollbarWidth > 0) {
			this.scrollbar.drawXY(gr, p.settings.x + p.settings.w - cScrollBar.width, p.settings.y + cSettings.topBarHeight + cHeaderBar.height);
		};
	};

	this.newButtonCheck = function(event, x, y) {
		var fin;
		if (p.headerBar.columns.length >= properties.max_columns) return;

		var state = p.settings.newbutton.checkstate(event, x, y);
		switch (event) {
		case "up":
			if (state == ButtonStates.hover) {
				// action
				var no_user = 1;
				var tmp_array = [];
				// copy columns array to a tmp array in order to sort it
				fin = p.headerBar.columns.length;
				for (var i = 0; i < fin; i++) {
					tmp_array.push(p.headerBar.columns[i].ref);
				};
				tmp_array.sort();
				// get free number to affect to the new User column to create
				fin = tmp_array.length;
				for (var i = 0; i < fin; i++) {
					if (tmp_array[i].substr(0, 3) == "自定义") {
						if (tmp_array[i].substr(tmp_array[i].length - 2, 2) == num(no_user, 2)) {
							no_user++;
						};
					};
				};

				p.headerBar.columns.push(new oColumn("自定义 " + num(no_user, 2), "null", "null", "自定义 " + num(no_user, 2), 0, "null", 0));
				p.headerBar.totalColumns++;
				var arr = [];
				fin = p.headerBar.columns.length;
				for (var i = 0; i < fin; i++) {
					arr.push(p.headerBar.columns[i].ref);
				};
				p.settings.pages[1].elements[0].reSet(arr);
				p.headerBar.saveColumns(true);
				p.settings.pages[1].elements[0].showSelected(p.headerBar.columns.length - 1);
				full_repaint();
			};
			break;
		};
		return state;
	};

	this.delButtonCheck = function(event, x, y) {
		var fin;

		if (p.headerBar.columns.length <= 14) return;

		var state = p.settings.delbutton.checkstate(event, x, y);
		switch (event) {
		case "up":
			if (state == ButtonStates.hover) {
				// action
				var idx = p.settings.pages[1].elements[0].selectedId;
				var ref = p.headerBar.columns[idx].ref;
				if (ref.substr(0, 3) == "自定义") {
					// if the column is visible, percent are to be adjusted on other visible columns before deletinf it
					if (p.headerBar.columns[idx].percent > 0) {
						// check if it's not the last column visible, otherwise, we coundn't hide it!
						var nbvis = 0;
						fin = p.headerBar.columns.length;
						for (var k = 0; k < fin; k++) {
							if (p.headerBar.columns[k].percent > 0) {
								nbvis++;
							};
						};
						if (nbvis > 1) {
							var RemovedColumnSize = Math.abs(p.headerBar.columns[idx].percent);
							p.headerBar.columns[idx].percent = 0;
							var totalColsToResizeUp = 0;
							var last_idx = 0;
							fin = p.headerBar.columns.length;
							for (var k = 0; k < fin; k++) {
								if (k != idx && p.headerBar.columns[k].percent > 0) {
									totalColsToResizeUp++;
									last_idx = k;
								};
							};
							var add_value = Math.floor(RemovedColumnSize / totalColsToResizeUp);
							var reste = RemovedColumnSize - (add_value * totalColsToResizeUp);
							fin = p.headerBar.columns.length;
							for (var k = 0; k < fin; k++) {
								if (k != idx && p.headerBar.columns[k].percent > 0) {
									p.headerBar.columns[k].percent = Math.abs(p.headerBar.columns[k].percent) + add_value;
									if (reste > 0 && k == last_idx) {
										p.headerBar.columns[k].percent = Math.abs(p.headerBar.columns[k].percent) + reste;
									};
								};
								p.headerBar.columns[k].w = Math.abs(p.headerBar.w * p.headerBar.columns[k].percent / 10000);
							};
						}
						else {
							// it's the last column visible, delete not possile for now !!!
							return false;
						};
					};
					// ok, NOW we can delete this column, let's do it!
					var tmp_array = p.headerBar.columns.slice(0, p.headerBar.columns.length);
					p.headerBar.columns.splice(0, p.headerBar.columns.length);
					fin = tmp_array.length;
					for (var i = 0; i < fin; i++) {
						if (i != idx) {
							p.headerBar.columns.push(tmp_array[i]);
						};
					};
					//
					p.headerBar.totalColumns--;
					var arr = [];
					fin = p.headerBar.columns.length;
					for (var i = 0; i < fin; i++) {
						arr.push(p.headerBar.columns[i].ref);
					};
					p.settings.pages[1].elements[0].reSet(arr);
					p.headerBar.saveColumns(true);
					var new_idx = (idx == 0 ? 0 : idx - 1);
					p.settings.pages[1].elements[0].showSelected(new_idx);
					full_repaint();
				}
				else {
					// we could not delete a native column!
					return false;
				};
			};
			break;
		};
		return state;
	};

	this.newButtonPatternCheck = function(event, x, y) {
		if (p.list.groupby.length >= properties.max_patterns) return;
		var fin;
		var state = p.settings.newbuttonPattern.checkstate(event, x, y);
		switch (event) {
		case "up":
			if (state == ButtonStates.hover) {
				// action
				p.list.groupby.push(new oGroupBy("自定义模版", "null", "null", "自定义", "", "", "", ""));
				p.list.totalGroupBy++;
				var arr = [];
				fin = p.list.groupby.length;
				for (var i = 0; i < fin; i++) {
					arr.push(p.list.groupby[i].label);
				};
				p.settings.pages[2].elements[0].reSet(arr);
				p.list.saveGroupBy();
				p.settings.pages[2].elements[0].showSelected(p.list.groupby.length - 1);
				full_repaint();
			};
			break;
		};
		return state;
	};

	this.delButtonPatternCheck = function(event, x, y) {
		if (p.headerBar.columns.length <= 2) return;
		var fin;
		var state = p.settings.delbuttonPattern.checkstate(event, x, y);
		switch (event) {
		case "up":
			if (state == ButtonStates.hover) {
				// action
				var idx = p.settings.pages[2].elements[0].selectedId;
				var ref = p.list.groupby[idx].ref;
				if (ref.substr(0, 3) == "自定义") {
					var tmp_array = p.list.groupby.slice(0, p.list.groupby.length);
					p.list.groupby.splice(0, p.list.groupby.length);
					fin = tmp_array.length;
					for (var i = 0; i < fin; i++) {
						if (i != idx) {
							p.list.groupby.push(tmp_array[i]);
						};
					};
					p.list.totalGroupBy--;
					var arr = [];
					fin = p.list.groupby.length;
					for (var i = 0; i < fin; i++) {
						arr.push(p.list.groupby[i].label);
					};
					p.settings.pages[2].elements[0].reSet(arr);
					p.list.saveGroupBy();
					var new_idx = (idx == 0 ? 0 : idx - 1);
					p.settings.pages[2].elements[0].showSelected(new_idx);

					// reset pattern index after removing the selected one
					if (idx == layout.pattern_idx) {
						layout.pattern_idx = 0;
						layout.config[layout.index][0] = layout.pattern_idx.toString();
						layout.gopts[0] = layout.pattern_idx.toString();
						save_config("config");
						get_covercahe_config();
						plman.SortByFormatV2(plman.ActivePlaylist, p.list.groupby[layout.pattern_idx].sortOrder, 1);
						p.list.updateHandleList(plman.ActivePlaylist, false);
						p.list.setItems(true);
						p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
					};
					full_repaint();
				}
				else {
					// we could not delete a native "Group By" pattern!
					return false;
				};
			};
			break;
		};
		return state;
	};

	this.delButtonLayoutCheck = function(event, x, y) {
		if(p.settings.pages[4].elements[0].selectedId == 0) return;
		var state = p.settings.delbuttonLayout.checkstate(event, x, y);
		switch (event) {
		case "up":
			if (state == ButtonStates.hover) {
				var idx = p.settings.pages[4].elements[0].selectedId;
				layout.ids.splice(idx, 1);
				layout.config.splice(idx, 1);
				layout.columnWidth.splice(idx, 1);
				save_config("ids");
				save_config("config");
				save_config("columnWidth");
				if(idx == layout.index){
					get_layout_cache(layout.playlistName);
					p.headerBar.initColumns();
					get_grprow_minimum(p.headerBar.columns[0].w, false);
					if (!layout.showgroupheaders) {
						cGroup.collapsed_height = 0;
						cGroup.expanded_height = 0;
					};
				}
				var arr = [];
				for (var i = 0; i < layout.ids.length; i++) {
					arr.push(layout.ids[i]);
				};
				p.settings.pages[4].elements[0].reSet(arr);
				p.settings.pages[4].elements[0].showSelected(0);
				full_repaint();
			}
			break;
		}
		return state;
	}
	
	this.delButtonLayoutsCheck = function(event, x, y) {
		if(layout.config.length < 2) return;
		var state = p.settings.delbuttonLayouts.checkstate(event, x, y);
		switch (event) {
		case "up":
			if (state == ButtonStates.hover) {
				if (layout.ids.length == 1) return state;
				var todelete = [];
				var found = false;
				var old_len = layout.ids.length;
				for (var i = 1; i < layout.ids.length; i++){
					for (var j = 0; j < plman.PlaylistCount; j++){
						if(layout.ids[i] == plman.GetPlaylistName(j)) {
							found = true;
							break;
						}
					}
					if(!found) {
						layout.ids.splice(i, 1);
						layout.config.splice(i, 1);
						layout.columnWidth.splice(i, 1);
					}
					found = false;
				}
				if(old_len != layout.ids.length) {
					save_config("ids");
					save_config("config");
					save_config("columnWidth");
					var arr = [];
					for (var i = 0; i < layout.ids.length; i++) {
						arr.push(layout.ids[i]);
					};
					p.settings.pages[4].elements[0].reSet(arr);
					full_repaint();
				}
			}
			break;
		}
		return state;
	}

	this.browseButtonCheck = function(event, x, y) {
		var state = p.settings.browsebutton.checkstate(event, x, y);
		switch (event) {
		case "up":
			if (state == ButtonStates.hover) {
				let shellObj = new ActiveXObject("Shell.Application");
				let fso = new ActiveXObject("Scripting.FileSystemObject");
				let Folder = shellObj.BrowseForFolder(window.ID, "选择编辑程序所在的文件夹", 0, 0x11);
				if (Folder != null) {
					let FolderItem = Folder.Items().Item().Path;
					if(FolderItem.substr(FolderItem.length-1, 1) != "\\") FolderItem += "\\";
					p.settings.pages[0].elements[8].inputbox.text = FolderItem;
					p.settings.ext_app[0] = FolderItem;
					if (fso.FileExists(FolderItem + "MusicTag.exe")) {
						p.settings.ext_app[1] = "MusicTag.exe";
						p.settings.pages[0].elements[9].inputbox.text = "MusicTag.exe";
					} else if(fso.FileExists(FolderItem + "Mp3tag.exe")){
						p.settings.ext_app[1] = "Mp3tag.exe";
						p.settings.pages[0].elements[9].inputbox.text = "Mp3tag.exe";
					} else if(p.settings.ext_app[1] == "MusicTag.exe" || p.settings.ext_app[1] == "Mp3tag.exe"){
						p.settings.ext_app[1] = "";
						p.settings.pages[0].elements[9].inputbox.text = "";
					}
					if(p.settings.ext_app[0] != "") track_edit_app = p.settings.ext_app[0] + p.settings.ext_app[1];
					else track_edit_app = "";
					save_misccfg();
					full_repaint();
				}
			};
			break;
		};
		return state;
	};

	this.on_mouse = function(event, x, y, delta) {
		this.ishover = (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);
		switch (this.id) {
		case 1:
			var isHoverListBox = this.elements[0].isHoverObject(x, y);
			break;
		case 2:
			var isHoverListBox = this.elements[0].isHoverObject(x, y);
			break;
		default:
			var isHoverListBox = false;
		};

		switch (event) {
		case "dblclk":
			this.on_mouse("down", x, y);
			break;
		case "down":
		case "up":
		case "move":
		case "wheel":
			if (this.ishover) {
				if (!isHoverListBox) {
					if (this.scrollbar.visible) {
						this.scrollbar.check(event, x, y, delta);
					};
				};
			};
			break;
		};

		switch (this.id) {
		case 0:
			if(this.browseButtonCheck(event, x, y) != ButtonStates.hover) {
				var fin = this.elements.length;
				for (var i = 0; i < fin; i++) {
					this.elements[i].on_mouse(event, x, y, delta);
				};
			};
			break;
		case 1:
			if (this.delButtonCheck(event, x, y) != ButtonStates.hover) {
				if (this.newButtonCheck(event, x, y) != ButtonStates.hover) {
					var fin = this.elements.length;
					for (var i = 0; i < fin; i++) {
						this.elements[i].on_mouse(event, x, y, delta);
					};
				};
			};
			break;
		case 2:
			if (this.delButtonPatternCheck(event, x, y) != ButtonStates.hover) {
				if (this.newButtonPatternCheck(event, x, y) != ButtonStates.hover) {
					var fin = this.elements.length;
					for (var i = 0; i < fin; i++) {
						this.elements[i].on_mouse(event, x, y, delta);
					};
				};
			};
			break;
		case 3:
			if(!p.settings.g_link.on_mouse(event, x, y)) {
				var fin = this.elements.length;
				for (var i = 0; i < fin; i++) {
					this.elements[i].on_mouse(event, x, y, delta);
				};
			};
			break;
		case 4:
			if (this.delButtonLayoutCheck(event, x, y) != ButtonStates.hover) {
				if (this.delButtonLayoutsCheck(event, x, y) != ButtonStates.hover) {
					var fin = this.elements.length;
					for (var i = 0; i < fin; i++) {
						this.elements[i].on_mouse(event, x, y, delta);
					};
				};
			};
			break;
		default:
			var fin = this.elements.length;
			for (var i = 0; i < fin; i++) {
				this.elements[i].on_mouse(event, x, y, delta);
			};
		};
	};
};

oSettings = function() {
	// inputbox variables
	var temp_bmp = gdi.CreateImage(1, 1);
	var temp_gr = temp_bmp.GetGraphics();
	var g_timer_cursor = false;
	var g_cursor_state = true;

	this.pages = [];
	this.currentPageId = 0;
	this.tabButtons = [];
	this.page_loaded = [];
	//font
	this.setFont = function() {
		this.font = g_font;
		this.font_title = GdiFont(g_fname, g_fsize + 4, 1);
		this.tab_font = GdiFont(g_fname, g_fsize + 2, 1);
		this.txtHeight = g_fsize;
		this.lineHeight = this.txtHeight + 10;
	}
	this.setFont();
	// var for custom color settings (widgets/sliders)
	this.color_updated = false;
	this.colorWidgetFocusedId = -1;
	this.colorSliderFocusedId = -1;

	this.setColors = function() {
		// colors
		this.color0 = blendColors(g_color_normal_bg, g_color_normal_txt, 0.15);
		this.color1 = blendColors(g_color_normal_bg, g_color_normal_txt, 0.65);
		this.color2 = g_color_normal_txt;
		this.color3 = blendColors(g_color_normal_bg, g_color_normal_txt, 0.25);
		this.color4 = blendColors(g_color_normal_bg, g_color_normal_txt, 0.30);
	};
	this.setColors();

	this.repaint = function() {
		full_repaint();
	};
	
	this.ext_app = [];
	this.get_ext_app = function() {
		if(track_edit_app != ""){
			let arr = utils.SplitFilePath(track_edit_app);
			this.ext_app[0] = arr[0];
			this.ext_app[1] = arr[1] + arr[2];
		} else {
			this.ext_app[0] = "";
			this.ext_app[1] = "";
		}
	}
	this.get_ext_app();

	this.setButtons = function() {
		var x28 = zoom(28, zdpi), x32 = zoom(32, zdpi);
		var pic = gdi.CreateImage(500, 200);
		gpic = pic.GetGraphics();
		var button_zoomSize = 0,
			button_zoomSizeW = 0,
			button_zoomSizeH = 0,
			rect_w = 0;
		var lineWidth = zoom(1.5, zdpi);

		rect_w = gpic.CalcTextWidth("删除", g_font_b) + g_z30;
		this.btn_off = gdi.CreateImage(rect_w, x32);
		gb = this.btn_off.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillRoundRect(1, 1, rect_w - lineWidth * 2, x28, g_z5, g_z5, this.color4);
		gb.SetTextRenderingHint(4);
		this.btn_off.ReleaseGraphics(gb);

		this.btn_ov = gdi.CreateImage(rect_w, x32);
		gb = this.btn_ov.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillRoundRect(1, 1, rect_w - lineWidth * 2, x28, g_z5, g_z5, this.color3);
		gb.SetTextRenderingHint(4);
		this.btn_ov.ReleaseGraphics(gb);

		this.btn_no = gdi.CreateImage(rect_w, x32);
		gb = this.btn_no.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillRoundRect(1, 1, rect_w - lineWidth * 2, x28, g_z5, g_z5, this.color0);
		gb.SetTextRenderingHint(4);
		this.btn_no.ReleaseGraphics(gb);

		rect_w = gpic.CalcTextWidth("清除无效布局", g_font_b) + g_z30;
		this.btn_off_2 = gdi.CreateImage(rect_w, x32);
		gb = this.btn_off_2.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillRoundRect(1, 1, rect_w - lineWidth * 2, x28, g_z5, g_z5, this.color4);
		gb.SetTextRenderingHint(4);
		this.btn_off_2.ReleaseGraphics(gb);

		this.btn_ov_2 = gdi.CreateImage(rect_w, x32);
		gb = this.btn_ov_2.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillRoundRect(1, 1, rect_w - lineWidth * 2, x28, g_z5, g_z5, this.color3);
		gb.SetTextRenderingHint(4);
		this.btn_ov_2.ReleaseGraphics(gb);
		
		// Add a Custom Column
		this.newbutton = new button(this.btn_off, this.btn_ov, this.btn_ov);
		// Delete a Custom Column
		this.delbutton = new button(this.btn_off, this.btn_ov, this.btn_ov);
		// Add a Custom "Group By" Pattern
		this.newbuttonPattern = new button(this.btn_off, this.btn_ov, this.btn_ov);
		// Delete a Custom "Group By" Pattern
		this.delbuttonPattern = new button(this.btn_off, this.btn_ov, this.btn_ov);
		this.delbuttonLayout = new button(this.btn_off, this.btn_ov, this.btn_ov);
		this.delbuttonLayouts = new button(this.btn_off_2, this.btn_ov_2, this.btn_ov_2);
		//browse ext Apple
		this.browsebutton = new button(this.btn_off, this.btn_ov, this.btn_ov);

		// Close Settings Button (BACK)
		this.close_off = gdi.CreateImage(75, 75);
		gb = this.close_off.GetGraphics();
		gb.SetSmoothingMode(0);
		gb.DrawEllipse(3, 3, 66, 66, 6, this.color2);
		gb.SetSmoothingMode(2);
		gb.FillSolidRect(18, 34, 34, 6, this.color2);
		gb.SetSmoothingMode(2);
		gb.DrawLine(18, 38, 33, 21, 6, this.color2);
		gb.DrawLine(18, 36, 34, 52, 6, this.color2);
		gb.SetSmoothingMode(0);
		this.close_off.ReleaseGraphics(gb);

		this.close_ov = gdi.CreateImage(75, 75);
		gb = this.close_ov.GetGraphics();
		gb.SetSmoothingMode(0);
		gb.DrawEllipse(3, 3, 66, 66, 6, this.color1);
		gb.SetSmoothingMode(2);
		gb.FillSolidRect(18, 34, 34, 6, this.color1);
		gb.SetSmoothingMode(2);
		gb.DrawLine(18, 38, 33, 21, 6, this.color1);
		gb.DrawLine(18, 36, 34, 52, 6, this.color1);
		gb.SetSmoothingMode(0);
		this.close_ov.ReleaseGraphics(gb);

		button_zoomSize = Math.ceil(25 * zdpi);
		this.closebutton = new button(this.close_off.Resize(button_zoomSize, button_zoomSize, 2), this.close_ov.Resize(button_zoomSize, button_zoomSize, 2), this.close_ov.Resize(button_zoomSize, button_zoomSize, 2));
		
		this.tabButtons.splice(0, this.tabButtons.length);
		var fin = this.pages.length, tw = 0,
			th = this.txtHeight + g_z10 + cHeaderBar.borderWidth,
			tpad = 10 + cSettings.tabPaddingWidth;
		for (var i = 0; i < fin; i++) {
			tw = gpic.CalcTextWidth(this.pages[i].label, this.tab_font);
			this.pages[i].label_w = tw;
			this.tab_img = gdi.CreateImage(tw + tpad * 2, th + 4);
			gb = this.tab_img.GetGraphics();
			gb.SetTextRenderingHint(4);
			gb.DrawString(this.pages[i].label, this.tab_font, this.color1, tpad, 1, tw + tpad, th, lc_stringformat);
			this.tab_img.ReleaseGraphics(gb);
			// create tab button object
			this.tabButtons.push(new button(this.tab_img, this.tab_img, this.tab_img));
		};
		pic.ReleaseGraphics(gpic);
		this.g_link = new oLink();
		//pic.Dispose();
	};

	this.refreshColors = function() {
		//get_colors();
		this.setColors();
		this.setButtons();
		for (var p = 0; p < this.pages.length; p++) {
			this.pages[p].scrollbar.setCustomColors(g_color_normal_bg, g_color_normal_txt);
			for (var e = 0; e < this.pages[p].elements.length; e++) {
				switch (this.pages[p].elements[e].objType) {
				case "CB":
				case "RB":
					this.pages[p].elements[e].setButtons();
					break;
				};
			};
		};
	};
	
	this.initpages = function(){
		if (this.pages.length <= 0) {
			this.pages.push(new oPage(0, "p.settings.pages[0]", "播放列表视图", 14));
			this.pages.push(new oPage(1, "p.settings.pages[1]", "编辑列", 16));
			this.pages.push(new oPage(2, "p.settings.pages[2]", "编辑分组", 22));
			this.pages.push(new oPage(3, "p.settings.pages[3]", "foobox", 18));
			this.pages.push(new oPage(4, "p.settings.pages[4]", "播放列表布局", 15));
		};
		var fin = this.pages.length;
		for (var i = 0; i < fin; i++) {
			this.page_loaded.push(false);
		};
	}
	
	this.setSize = function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.pages[this.currentPageId].setSize();
	};

	this.draw = function(gr) {
		var padding = 10;
		var tx = 20,
			ty = cSettings.topBarHeight - zoom(1, zdpi),
			tw = 0,
			th = this.txtHeight + g_z10 + cHeaderBar.borderWidth,
			tpad = 10 + cSettings.tabPaddingWidth,
			cx = 0,
			cw = 0;
		// draw main background
		gr.FillSolidRect(this.x, this.y, this.w, this.h, g_color_normal_bg);
		// draw current page content
		this.pages[this.currentPageId].draw(gr);
		gr.FillSolidRect(this.x, this.y + (ty + th), this.w - cScrollBar.width, g_z4, g_color_normal_bg);
		// draw top background
		gr.FillSolidRect(this.x, this.y, this.w, (ty + th), blendColors(g_color_normal_bg, g_color_normal_txt, 0.035));
		gr.FillGradRect(this.x, this.y + (ty + th) - g_z3, this.w, g_z3, 87, 0, RGBA(0, 0, 0, 10), 1.0);
		// draw close button
		this.closebutton.draw(gr, this.x + 13, this.y + 10, 255);
		// draw Panel Title
		var title_x = this.x + this.closebutton.w + 20;
		gr.GdiDrawText("foobox 设置", this.font_title, this.color2, title_x, this.y + 10, this.w - 50, this.closebutton.h, lc_txt);
		gr.GdiDrawText("Version " + g_script_version, g_font_queue_idx, this.color1, this.x, this.y, this.w - 8, ty + th - 4, rb_txt);
		// draw page switcher (tabs!)
		var fin = this.pages.length;
		for (var i = 0; i < fin; i++) {
			tw = this.pages[i].label_w;
			if (i == this.currentPageId) {
				cx = tx;
				cw = tw + tpad * 2;
			};
			this.tabButtons[i].draw(gr, tx, ty - 3, 255);
			tx += tw + tpad * 2;
		};
		// active tab bg
		gr.FillSolidRect(cx + zoom(1, zdpi), ty - g_z2, cw - zoom(1, zdpi), th + g_z4, g_color_normal_bg);

		// draw tab lineart
		var lineStrength = 1;//zoom(1.0, zdpi);
		gr.FillSolidRect(0, ty + th, cx + lineStrength, lineStrength, this.color4);
		gr.FillSolidRect(cx, ty - g_z3, lineStrength, th + g_z4, this.color4);
		gr.FillSolidRect(cx, ty - g_z3, cw, lineStrength, this.color4);
		gr.FillSolidRect(cx + cw, ty - g_z3, lineStrength, th + g_z4, this.color4);
		gr.FillSolidRect(cx + cw, ty + th, ww - cw - cx, lineStrength, this.color4);
		// active tab text
		gr.SetTextRenderingHint(4);
		gr.DrawString(this.pages[this.currentPageId].label, this.tab_font, this.color2, cx + tpad, ty - 2, cw + tpad, th, lc_stringformat);
		gr.SetSmoothingMode(0);
	};

	this.closeButtonCheck = function(event, x, y) {
		var state = this.closebutton.checkstate(event, x, y);
		switch (event) {
		case "up":
			if (state == ButtonStates.hover) {
				// action
				p.settings.colorWidgetFocusedId = -1;
				p.settings.colorSliderFocusedId = -1;
				cSettings.visible = false;
				this.closebutton.state = ButtonStates.normal;
				resize_panels();
				update_playlist(layout.collapseGroupsByDefault);
				full_repaint();
			};
			break;
		};
		return state;
	};

	this.on_mouse = function(event, x, y, delta) {
		var state = null,
			found = false,
			fin = "";
		if (this.closeButtonCheck(event, x, y) != ButtonStates.hover) {
			fin = this.tabButtons.length;
			for (var i = 0; i < fin; i++) {
				state = this.tabButtons[i].checkstate(event, x, y);
				switch (event) {
				case "up":
					if (state == ButtonStates.hover) {
						// action
						found = true;
						this.currentPageId = i;
						if(!this.page_loaded[this.currentPageId]){
							this.pages[this.currentPageId].init();
							this.page_loaded[this.currentPageId] = true;
						}
						this.tabButtons[i].state = ButtonStates.normal;
						this.pages[this.currentPageId].setSize();
						if(this.currentPageId == 2) this.pages[this.currentPageId].elements[0].showSelected(layout.pattern_idx);
						else if(this.currentPageId == 4) this.pages[this.currentPageId].elements[0].showSelected(layout.index);
						full_repaint();
					};
					break;
				};
			};
			if (!found) {
				this.color_updated = false;
				this.pages[this.currentPageId].on_mouse(event, x, y, delta);
			};
		};
	};
	this.on_focus = function(is_focused) {};
};