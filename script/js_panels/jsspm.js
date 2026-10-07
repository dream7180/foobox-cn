//foobox https://github.com/dream7180, jsspm http://br3tt.deviantart.com
window.DefinePanel('JS Smooth Playlist Manager', {author: 'Br3tt, Asion, dreamawake, always_beta(CN)', version: '20151115-1000-151', features: {drag_n_drop: true} });
include(fb.ProfilePath + 'foobox\\script\\js_common\\common.js');
include(fb.ProfilePath + 'foobox\\script\\js_common\\JScommon.js');
include(fb.ProfilePath + 'foobox\\script\\js_common\\JSinputbox.js');
include(fb.ProfilePath + 'foobox\\script\\js_common\\JScomponents.js');
include(fb.ProfilePath + 'foobox\\script\\js_panels\\search.js');
commoncfg = commoncfg.split(",");
var sys_scrollbar =  Number(commoncfg[3]);
var zdpi = 1, dark_mode = 0;
var default_sort =  window.GetProperty("_PROPERTY: New playlist sortorder", "%album% | %discnumber% | %tracknumber% | %title%");
var g_font, g_font_b, g_font_track;
var g_color_line, g_color_line_div, g_color_playing_txt = c_white;
var plIco = {
	"媒体库": "\uF0E0",
	"最近添加": "\uF00F",
	"历史记录": "\uEB21",
	"最常播放": "\uEDA1",
	"喜爱的音轨": "\uF5C7"
}
var brw = null;
var isScrolling = false;

// --- Playlist Group 扩展变量（虚拟分组） ---
// 安全解析属性 JSON：属性不存在/被清空/格式非法时回退默认值，避免顶层 JSON.parse 抛错
function parsePropJson(name, fallback) {
	var val = window.GetProperty(name, fallback);
	if (typeof val !== "string" || val.trim() === "") val = fallback;
	try {
		return JSON.parse(val);
	} catch (e) {
		return JSON.parse(fallback);
	}
}
// [静态白名单] 永远处于一级目录，不会被吸入任何分组！
var nonGrouped = [];
// 虚拟分组列表：[{id, name, collapsed}]
var Groups = [];
// 分组映射：{ playlistGuid: groupId }
var GroupMap = {};

get_gdata();
function getGroupMemberIndices(groupId) {
	var indices = [];
	for (var i = 0; i < plman.PlaylistCount; i++) {
		if (GroupMap[plman.GetGUID(i)] === groupId) indices.push(i);
	}
	return indices;
}
// 辅助函数：获取分组成员数量
function getGroupMemberCount(groupId) {
	return getGroupMemberIndices(groupId).length;
}
// 辅助函数：按 GUID 查找播放列表当前索引（播放列表增删后索引会漂移，GUID 查址稳定可靠）
function findPlIndexByGuid(guid) {
	for (var i = 0; i < plman.PlaylistCount; i++) {
		if (plman.GetGUID(i) === guid) return i;
	}
	return -1;
}

// 公共函数：切换分组折叠状态（复用鼠标点击逻辑）
function toggleGroupCollapse(groupRow) {
	// --- [修改] 使用 GUID 作为折叠状态键 ---
	var g_row = groupRow;
	for (var gi = 0; gi < Groups.length; gi++) {
		if (Groups[gi].id === g_row.groupId) { Groups[gi].collapsed = !Groups[gi].collapsed; break; }
	}
	save_gdata();
	
	// 视口锚定：记录组头行的可视位置 + 组头之后的第一行内容标识，
	// 折叠/展开后把它滚回原可视位置，避免列表跳回顶部
	var anchorTopOffset = brw.rows[cPlaylistManager.drag_group_rowId].y - brw.y;
	var nextContentId = null;
	if (!brw.rows[cPlaylistManager.drag_group_rowId].isExpanded) {
		// 即将展开（当前存储的是折叠后状态）：锚定组头自身即可
		nextContentId = { type: "group", id: g_row.groupId };
	} else {
		// 即将折叠：锚定组头之后第一个内容行
		for (var nc = cPlaylistManager.drag_group_rowId + 1; nc < brw.rows.length; nc++) {
			var ncRow = brw.rows[nc];
			if (ncRow.isVGroup) { nextContentId = { type: "group", id: ncRow.groupId }; break; }
			if (ncRow.idx >= 0) { nextContentId = { type: "pl", guid: plman.GetGUID(ncRow.idx) }; break; }
		}
	}
	// 重置所有拖拽状态
	brw.actionRows.splice(0, brw.actionRows.length);
	brw.activeRow = -1;
	cPlaylistManager.drag_clicked = false;
	cPlaylistManager.drag_is_group = false;
	cPlaylistManager.drag_group_rowId = -1;
	cPlaylistManager.drag_target_id = -1;
	cPlaylistManager.drag_moved = false; // 必须重置
	brw.populate(true, false);
	// 按锚定行恢复滚动（锚定行不可得时仍需 check_scroll 收敛，防折叠后旧 scroll 越界）
	var restoreRow = -1;
	if (nextContentId) {
		for (var rr = 0; rr < brw.rows.length; rr++) {
			var rrRow = brw.rows[rr];
			if (nextContentId.type === "group" && rrRow.isVGroup && rrRow.groupId === nextContentId.id) { restoreRow = rr; break; }
			if (nextContentId.type === "pl" && !rrRow.isGroup && rrRow.idx >= 0 && plman.GetGUID(rrRow.idx) === nextContentId.guid) { restoreRow = rr; break; }
		}
	}
	if (restoreRow !== -1) {
		scroll = check_scroll(restoreRow * ppt.rowHeight - anchorTopOffset);
	} else {
		scroll = check_scroll(scroll);
	}
	scroll_ = scroll;
	brw.scrollbar.updateScrollbar();
	brw.repaint();
}

// 辅助函数：顺序变动（MovePlaylist）后，按 GUID 把 actionRows/activeRow 重新解析到新行号。
// actionRows 存的是 UI 行号而不是 plman 索引，列表一移动，旧行号就指向了别的列表，
// 高亮会错位（例：选 2/3/4 拖到 6 后 → 行号 1/2/3 上是 5/6/2，选中看起来变成 5/6/2）。
// movePlan: [{guid, origIdx}] —— 本次被移动的项（按新顺序遍历行集，故结果自然有序）
// keepActiveRow = true 时不动 activeRow（外部变更场景：光标应留在原处，不该跳到选中块）
function remapSelectionByGuids(movePlan, keepActiveRow) {
	if (!movePlan || movePlan.length === 0) return;
	// 先建 GUID 集合：避免 rows × movePlan 的二重循环（全选时会退化成上万次 GetGUID）
	var guidSet = {};
	for (var m = 0; m < movePlan.length; m++) guidSet[movePlan[m].guid] = true;
	var newRows = [];
	for (var i = 0; i < brw.rows.length; i++) {
		var r = brw.rows[i];
		if (!r || r.isGroup || r.idx < 0) continue;
		var guid = plman.GetGUID(r.idx);
		if (guidSet.hasOwnProperty(guid) && guidSet[guid]) newRows.push(i);
	}
	// 选中项已全部不在当前行集（被删除 / 折叠 / 过滤掉）：必须清空，
	// 否则残留的旧行号会越界，后续 this.rows[actionRows[i]].xxx 直接崩溃
	if (newRows.length === 0) {
		brw.actionRows.splice(0, brw.actionRows.length);
		if (brw.activeRow >= brw.rows.length) brw.activeRow = brw.rows.length - 1;
		return;
	}
	brw.actionRows.splice(0, brw.actionRows.length);
	for (var k = 0; k < newRows.length; k++) brw.actionRows.push(newRows[k]);
	if (!keepActiveRow) brw.activeRow = newRows[0];
}

// 辅助函数：行集重建【之前】快照当前选中项的 GUID，配合 remapSelectionByGuids 使用。
// 用于外部变更（on_playlists_changed、过滤）导致行集重排的场景。
function snapshotSelectionGuids() {
	var out = [];
	var seen = {};
	for (var i = 0; i < brw.actionRows.length; i++) {
		var r = brw.rows[brw.actionRows[i]];
		if (!r || r.isGroup || r.idx < 0) continue;
		var guid = plman.GetGUID(r.idx);
		if (seen.hasOwnProperty(guid)) continue;
		seen[guid] = true;
		out.push({ guid: guid });
	}
	return out;
}

// 辅助函数：停掉拖拽边缘自动滚动定时器。
// 它只在 move 分支"鼠标回到列表行上"和 up 分支末尾被清除，而分组拖拽 / 拖入分组
// 这两条分支会提前 return 跳过清除；又因为它们都把 drag_moved 置回 false，
// 松手后 move 分支的清除块再也进不去 —— 结果就是列表一直自动滚到顶/底才停。
function stopAutoScrollTimer() {
	if (timers.movePlaylist) {
		window.ClearInterval(timers.movePlaylist);
		timers.movePlaylist = false;
	}
}

// 辅助函数：清掉 GroupMap / independent_lists 里已不存在的播放列表 GUID。
// 在别处（foobar2000 主界面、其它面板）删除列表后，这些映射会变成脏数据：
// 分组显示"3 项"实际只有 2 项、空分组不消失。原来只在脚本启动时清一次，
// 运行中删除会残留到下次重载；现在 on_playlists_changed 也会调用。
// 只在确实发现脏数据时才写盘，避免每次变更都做无用 I/O。
function purgeDeadGuids() {
	var validGuids = {};
	for (var vi = 0; vi < plman.PlaylistCount; vi++) {
		validGuids[plman.GetGUID(vi)] = true;
	}
	var mapChanged = false;
	for (var vk in GroupMap) {
		if (!validGuids.hasOwnProperty(vk)) {
			delete GroupMap[vk];
			mapChanged = true;
		}
	}
	if (mapChanged) {
		save_gdata();
	}
	return mapChanged;
}

// 辅助函数：按 GUID 查址批量删除 actionRows 选中的播放列表（跳过分组头）。
// 不能用 "行号 idx - i" 做偏移：选中项不连续或夹有分组头时偏移会算错；
// 且 RemovePlaylistSwitch 会触发行集重建，边删边取行号会错乱误删
function removeActionRowsByGuid() {
	var delGuids = [];
	for (var i = 0; i < brw.actionRows.length; i++) {
		var prow = brw.rows[brw.actionRows[i]];
		if (prow && prow.idx >= 0) delGuids.push(plman.GetGUID(prow.idx));
	}
	for (var d = 0; d < delGuids.length; d++) {
		var cidx = findPlIndexByGuid(delGuids[d]);
		if (cidx >= 0) plman.RemovePlaylistSwitch(cidx);
	}
}

var g_filterbox = null;
var g_searchbox = null;
var filter_text = "";

// drag'n drop from windows system
var g_dragndrop_status = false;
var g_dragndrop_x = -1;
var g_dragndrop_y = -1;
var g_dragndrop_trackId = -1;
var g_dragndrop_rowId = -1;
var g_dragndrop_targetPlaylistId = -1;
//
var ww = 0, wh = 0;
var m_x = 0, m_y = 0;
var g_active_playlist = null;
// color vars
var g_color_normal_bg = 0;
var g_color_selected_bg = 0;
var g_color_normal_txt = 0;
var g_color_selected_txt = 0;
var g_color_highlight = 0;
var c_default_hl = 0;
var g_first_populate_launched = false;
//
var repaintforced = false, repaint_main = true, repaint_main1 = true, repaint_main2 = true;
var window_visible = false;
var scroll_ = 0, scroll = 0, scroll_prev = 0;
var g_start_ = 0, g_end_ = 0;
var radiom3u = [], radioname = [], radiolist = fb.ProfilePath + "foobox\\config\\radio.list";

ppt = {
	defaultRowHeight: Number(commoncfg[1]),
	rowHeight: 0,
	rowScrollStep: Number(commoncfg[2]),
	scrollSmoothness: 2.0,
	refreshRate: 20,
	showFilter: window.GetProperty("_DISPLAY: Show Filter", true),
	lockReservedPlaylist: window.GetProperty("_PROPERTY: Lock Reserved Playlist", false),
	SearchBarHeight: 28,
	headerBarHeight: 28,
	showGrid: window.GetProperty("_PROPERTY: Show Grid", true),
	confirmRemove: window.GetProperty("_PROPERTY: Confirm Before Removing", true),
	enableTouchControl: window.GetProperty("_PROPERTY: Touch control", true)
};
commoncfg.length = 0;
var rowScrollStep_org = ppt.rowScrollStep;

// --- [修改] 增加分组拖拽状态变量 ---
cPlaylistManager = {
	drag_clicked: false,
	drag_droped: false,
	drag_target_id: -1,
	// 新增分组拖拽状态
	drag_is_group: false,
	drag_group_rowId: -1,
	drag_start_x: 0,
	drag_start_y: 0,
    // 新增：拖拽进入分组相关
    drag_into_group: false,
    drag_into_group_rowId: -1,
	// 新增：用于指示高亮线在上方还是下方
    drag_above: false
};

cTouch = {
	down: false,
	y_start: 0,
	y_end: 0,
	y_current: 0,
	y_prev: 0,
	y_move: 0,
	scroll_delta: 0,
	t1: null,
	timer: false,
	multiplier: 0,
	delta: 0
};

cFilterBox = {
	enabled: window.GetProperty("_PROPERTY: Enable Filter Box", true),
	x: 14,
	y: 4,
	w: 106,
	h: 20
};

cSearchBox = {
	x: 11,
	y: 3,
	w: 106,
	h: 22
};

cScrollBar = {
	visible: true,
	width: 12,
	minCursorHeight: 25,
	maxCursorHeight: 110,
	timerID: false,
	timerCounter: -1
};

images = {};

blink = {
	x: 0,
	y: 0,
	totaltracks: 0,
	id: -1,
	counter: -1,
	timer: false
};

timers = {
	mouseDown: false,
	movePlaylist: false
};

// --- [新增] 名称唯一性检查 ---
function isPlaylistNameTaken(name, excludeIdx) {
    var total = plman.PlaylistCount;
    for (var i = 0; i < total; i++) {
        if (i === excludeIdx) continue;
        if (plman.GetPlaylistName(i) === name) return true;
    }
    return false;
}

// --- [新增] 生成唯一的分组名称 ---
function getUniqueGroupName(baseName) {
    baseName = baseName || "新分组";
    function isGroupNameTaken(name) {
        for (var i = 0; i < Groups.length; i++) {
            if (Groups[i].name === name) return true;
        }
        return false;
    }
    if (!isGroupNameTaken(baseName)) return baseName;
    var i = 2;
    while (true) {
        var candidate = baseName + " (" + i + ")";
        if (!isGroupNameTaken(candidate)) return candidate;
        i++;
    }
}

// --- [新增] 生成唯一的普通列表名称（不含分组前缀） ---
function getUniquePlaylistName(baseName, excludeIdx) {
    baseName = baseName || "拖入的项目";
    if (!isPlaylistNameTaken(baseName, excludeIdx)) return baseName;
    var i = 2;
    while (true) {
        var candidate = baseName + " (" + i + ")";
        if (!isPlaylistNameTaken(candidate, excludeIdx)) return candidate;
        i++;
    }
}

//=================================================// Extra functions for playlist manager panel
 function renamePlaylist(autopl_pending) {
	// 安全防线：如果输入框ID越界或行数据不存在，直接中止
	if (brw.inputboxID === -1 || !brw.rows[brw.inputboxID]) {
		brw.inputboxID = -1;
		return;
	}
	
	let org_name = brw.rows[brw.inputboxID].raw_name;
	let rowid = brw.rows[brw.inputboxID].idx;
	let isGroup = brw.rows[brw.inputboxID].isGroup;
	let isVGroup = brw.rows[brw.inputboxID].isVGroup;

	if (!brw.inputbox.text || brw.inputbox.text == "") brw.inputbox.text = brw.rows[brw.inputboxID].name;
	if (brw.inputbox.text.length > 0) {
		let typed_text = brw.inputbox.text;

		if (isVGroup) {
			// 虚拟分组重命名：更新 Groups 数组
			var groupId = brw.rows[brw.inputboxID].groupId;
			for (var gi = 0; gi < Groups.length; gi++) {
				if (Groups[gi].id === groupId) { Groups[gi].name = typed_text; break; }
			}
			save_gdata();
			brw.rows[brw.inputboxID].name = typed_text;
			brw.rows[brw.inputboxID].raw_name = typed_text;
		} else {
			// 普通列表重命名
			let finalName = typed_text;
			let oldName = brw.rows[brw.inputboxID].raw_name;
			brw.rows[brw.inputboxID].raw_name = finalName;
			brw.rows[brw.inputboxID].name = typed_text;
			plman.RenamePlaylist(rowid, finalName);
			window.NotifyOthers("Playlist_Renamed", [oldName, finalName]);
		}
		window.SetCursor(IDC_ARROW);
		brw.repaint();
	};
	brw.inputboxID = -1;
	if(autopl_pending) plman.ShowAutoPlaylistUI(rowid);
}

function DeletePlaylist(){
    // --- [新增] 判断选中项是否全部为分组，以调整提示文字 ---
    var allGroups = true;
    for (var i = 0; i < brw.actionRows.length; i++) {
        if (!brw.rows[brw.actionRows[i]].isGroup) {
            allGroups = false;
            break;
        }
    }
    var itemType = allGroups ? "分组" : "播放列表";
    var title = allGroups ? "删除分组" : "删除播放列表";

    // --- [修改] 构建列表名称时，分组使用去掉前缀的显示名称 ---
    var parsed_tabname = "";
    for (var i = 0; i < brw.actionRows.length; i++) {
        if (i > 20) {
            parsed_tabname += "......";
            break;
        }
        var row = brw.rows[brw.actionRows[i]];
        var displayName = row.name; // row.name 已经去掉前缀，普通列表就是原名
        if (i == 0) parsed_tabname += displayName;
        else parsed_tabname += ", " + displayName;
    }

    // --- [修改] 弹窗前 rows 尚有效，先把选中项解析为稳定标识（分组 ID / 列表 GUID），
    // 回调中按标识操作：避免 RemovePlaylistSwitch 触发行集重建导致后续循环行号错乱误删，
    // 也避免 "idx - i" 偏移在选中项不连续或夹有分组头时算出错误索引 ---
    var pendingGroupIds = [];
    var pendingPlGuids = [];
    for (var i = 0; i < brw.actionRows.length; i++) {
        var prow = brw.rows[brw.actionRows[i]];
        if (prow.isVGroup) {
            pendingGroupIds.push(prow.groupId);
        } else if (prow.idx >= 0) {
            pendingPlGuids.push(plman.GetGUID(prow.idx));
        }
    }

    function delete_confirmation(status, confirmed) {
        if(confirmed){
            // 删除虚拟分组：按分组 ID 匹配（不依赖行号），子列表变为独立
            for (var p = 0; p < pendingGroupIds.length; p++) {
                var gid = pendingGroupIds[p];
                for (var g = Groups.length - 1; g >= 0; g--) {
                    if (Groups[g].id === gid) { Groups.splice(g, 1); break; }
                }
                for (var guid in GroupMap) {
                    if (GroupMap[guid] === gid) {
                        delete GroupMap[guid];
                    }
                }
            }
            if (pendingGroupIds.length > 0) {
				save_gdata();
            }
            // 删除播放列表：按 GUID 查址（每次删除后其上方索引前移，重查最稳妥）
            var removedAnyPlaylist = false;
            for (var d = 0; d < pendingPlGuids.length; d++) {
                var cidx = findPlIndexByGuid(pendingPlGuids[d]);
                if (cidx >= 0) { plman.RemovePlaylistSwitch(cidx); removedAnyPlaylist = true; }
            }
            if (pendingGroupIds.length > 0 && !removedAnyPlaylist) {
                // 只删虚拟分组时不触发 on_playlists_changed，必须手动刷新 UI
                brw.populate(true);
            }
            brw.actionRows = [];
            brw.activeRow = -1;
        }
    }

    var content = "确定要删除下列 " + brw.actionRows.length + " 个" + itemType + "吗?<p class=line_name>" + parsed_tabname + "</p>";
    HtmlDialog(title, content, "是", "否", delete_confirmation);
}

function HtmlDialog(msg_title, msg_content, btn_yes_label, btn_no_label, confirm_callback){
	utils.ShowHtmlDialog(window.ID, `file://${fb.ProfilePath}foobox\\script\\html\\ConfirmDialog.html`, {
		data: [msg_title, msg_content, btn_yes_label, btn_no_label, confirm_callback],
	});
}

// --- [修改] 简化 moveGroup，复用 getBlockCount ---
function moveGroup(rowId, direction) {
    if (brw.is_moving_group) return;
    var group = brw.rows[rowId];
    if (!group || !group.isGroup) return;
    var members = getGroupMemberIndices(group.groupId);
    // ===== 空分组：无成员可移，改走锚点路径（上移=锚到上一块之前，下移=锚到下一块之后）=====
    if (members.length === 0) {
        var emptyTarget = -1;
        if (direction === "up") {
            for (var s = rowId - 1; s >= 0; s--) {
                if (brw.rows[s].isGroup || brw.rows[s].level === 0) { emptyTarget = s; break; }
            }
        } else {
            if (rowId + 1 < brw.rows.length) emptyTarget = rowId + 1;
        }
        if (emptyTarget !== -1 && emptyTarget !== rowId) moveGroupTo(rowId, emptyTarget);
        return;
    }
    brw.is_moving_group = true;
    var current_start = members[0];
    var current_count = members.length;
    if (direction === "up") {
        if (current_start <= 0) { brw.is_moving_group = false; return; }
        var prev_end = current_start - 1;
        var prev_start = prev_end;
        var prevGuid = plman.GetGUID(prev_start);
        var prevGroupId = GroupMap[prevGuid];
        if (prevGroupId) {
            for (var i = prev_start - 1; i >= 0; i--) {
                if (GroupMap[plman.GetGUID(i)] !== prevGroupId) break;
                prev_start = i;
            }
        }
        for (var i = 0; i < current_count; i++) {
            plman.MovePlaylist(current_start + i, prev_start + i);
        }
    } else if (direction === "down") {
        var next_start = current_start + current_count;
        if (next_start >= plman.PlaylistCount) { brw.is_moving_group = false; return; }
        var nextGuid = plman.GetGUID(next_start);
        var nextGroupId = GroupMap[nextGuid];
        var next_count = 1;
        if (nextGroupId) {
            for (var i = next_start + 1; i < plman.PlaylistCount; i++) {
                if (GroupMap[plman.GetGUID(i)] !== nextGroupId) break;
                next_count++;
            }
        }
        for (var i = 0; i < next_count; i++) {
            plman.MovePlaylist(next_start + i, current_start + i);
        }
    }
    brw.populate(true);
    var newRowId = -1;
    for (var i = 0; i < brw.rows.length; i++) {
        if (brw.rows[i].isVGroup && brw.rows[i].groupId === group.groupId) {
            newRowId = i; break;
        }
    }
    if (newRowId !== -1) { brw.activeRow = newRowId; brw.actionRows = []; }
    brw.is_moving_group = false;
}

// --- [新增] 空分组/无成员目标行的锚点解析：用相邻真实列表换算 plman 插入索引 ---
// 与 resolveTarget 的空分组口径一致：useAbove → 插到锚上行之后或锚下行之前
function findAnchorPlIdx(rowId, useAbove) {
    var anchorAbove = -1;
    var anchorBelow = -1;
    for (var s = rowId - 1; s >= 0; s--) {
        var r = brw.rows[s];
        if (r && !r.isGroup && r.idx >= 0) { anchorAbove = r.idx; break; }
    }
    for (var s2 = rowId + 1; s2 < brw.rows.length; s2++) {
        var r2 = brw.rows[s2];
        if (r2 && !r2.isGroup && r2.idx >= 0) { anchorBelow = r2.idx; break; }
    }
    if (useAbove) return (anchorAbove !== -1) ? (anchorAbove + 1) : (anchorBelow !== -1 ? anchorBelow : plman.PlaylistCount);
    return (anchorBelow !== -1) ? anchorBelow : (anchorAbove !== -1 ? (anchorAbove + 1) : plman.PlaylistCount);
}

// --- [新增] 将分组移动到目标行位置（用于拖拽） ---
function moveGroupTo(groupRowId, targetRowId) {
    if (brw.is_moving_group) return;
    var group = brw.rows[groupRowId];
    if (!group || !group.isGroup) return;
    if (targetRowId < 0 || targetRowId >= brw.rows.length) return;
    if (targetRowId === groupRowId) return;
    brw.is_moving_group = true;
    var members = getGroupMemberIndices(group.groupId);

    // ===== 空分组：无成员可移动，改为更新渲染锚点（拖到哪就锚到落点旁的列表） =====
    if (members.length === 0) {
        var targetRow0 = brw.rows[targetRowId];
        var anchorGuid = null;
        var anchorPos = (targetRowId < groupRowId) ? "above" : "below";
        if (targetRow0.isVGroup) {
            // 目标是分组头：锚定到块外最近列表，方向与渲染端的块边界换算配合保证落点正确
            // - 移到目标分组之前（above 语义）：锚上方最近列表的下方（渲染在其后 = 目标分组块之前）
            // - 移到目标分组之后（below 语义）：锚下方最近列表：
            //     若它是目标分组自己的成员（展开非空）→ 锚下方（渲染换算到成员块尾后）
            //     否则（独立列表/下方其他分组首成员）→ 锚上方
            var anchorRow0 = -1;
            if (targetRowId < groupRowId) {
                for (var s0 = targetRowId - 1; s0 >= 0; s0--) {
                    var r0 = brw.rows[s0];
                    if (r0 && !r0.isGroup && r0.idx >= 0) { anchorRow0 = s0; anchorPos = "below"; break; }
                }
            } else {
                for (var s1 = targetRowId + 1; s1 < brw.rows.length; s1++) {
                    var r1 = brw.rows[s1];
                    if (r1 && !r1.isGroup && r1.idx >= 0) {
                        anchorRow0 = s1;
                        anchorPos = (GroupMap[plman.GetGUID(r1.idx)] === targetRow0.groupId) ? "below" : "above";
                        break;
                    }
                }
            }
            if (anchorRow0 !== -1) anchorGuid = plman.GetGUID(brw.rows[anchorRow0].idx);
        } else if (targetRow0.idx >= 0) {
            anchorGuid = plman.GetGUID(targetRow0.idx);
        }
        if (anchorGuid) {
            for (var gi = 0; gi < Groups.length; gi++) {
                if (Groups[gi].id === group.groupId) {
                    Groups[gi].anchor = { guid: anchorGuid, pos: anchorPos };
                    break;
                }
            }
			save_gdata();
            brw.populate(true);
            var newRowId0 = -1;
            for (var i0 = 0; i0 < brw.rows.length; i0++) {
                if (brw.rows[i0].isVGroup && brw.rows[i0].groupId === group.groupId) { newRowId0 = i0; break; }
            }
            if (newRowId0 !== -1) { brw.activeRow = newRowId0; brw.actionRows = []; }
        }
        brw.is_moving_group = false;
        return;
    }

    var current_start = members[0];
    var blockCount = members.length;
    var targetPlaylistIdx;
    var targetRow = brw.rows[targetRowId];
    if (targetRow.isVGroup) {
        var targetMembers = getGroupMemberIndices(targetRow.groupId);
        if (targetMembers.length > 0) {
            if (targetRowId < groupRowId) {
                targetPlaylistIdx = targetMembers[0];
            } else {
                targetPlaylistIdx = targetMembers[targetMembers.length - 1] + 1;
            }
        } else {
            // 目标是空分组：用相邻真实列表换算插入索引，避免 NaN
            targetPlaylistIdx = findAnchorPlIdx(targetRowId, targetRowId < groupRowId);
        }
    } else {
        if (targetRowId < groupRowId) {
            targetPlaylistIdx = targetRow.idx;
        } else {
            // 向下拖 = 插到目标行之后：取下一行的 idx 作为插入位。
            // 下一行若是虚拟分组头（idx 恒为 -1），直接取会让落点变负 → 676 行保护失效、
            // 679 行 "-1 < current_start" 恒真 → 整块被搬到列表最前。此处按分组成员块换算。
            var nextRow = (targetRowId + 1 < brw.rows.length) ? brw.rows[targetRowId + 1] : null;
            if (nextRow && !nextRow.isGroup && nextRow.idx >= 0) {
                targetPlaylistIdx = nextRow.idx;
            } else if (nextRow && nextRow.isGroup) {
                var nextMembers = getGroupMemberIndices(nextRow.groupId);
                targetPlaylistIdx = (nextMembers.length > 0) ? nextMembers[0] : findAnchorPlIdx(targetRowId, false);
            } else {
                targetPlaylistIdx = plman.PlaylistCount;
            }
        }
    }
    if (targetPlaylistIdx >= current_start && targetPlaylistIdx < current_start + blockCount) {
        brw.is_moving_group = false; return;
    }
    if (targetPlaylistIdx < current_start) {
        for (var i = 0; i < blockCount; i++) {
            plman.MovePlaylist(current_start + i, targetPlaylistIdx + i);
        }
    } else {
        for (var i = 0; i < blockCount; i++) {
            plman.MovePlaylist(current_start + blockCount - 1 - i, targetPlaylistIdx - 1 - i);
        }
    }
    brw.populate(true);
    var newRowId = -1;
    for (var i = 0; i < brw.rows.length; i++) {
        if (brw.rows[i].isVGroup && brw.rows[i].groupId === group.groupId) {
            newRowId = i; break;
        }
    }
    if (newRowId !== -1) { brw.activeRow = newRowId; brw.actionRows = []; }
    brw.is_moving_group = false;
}

// --- [新增] 分组失去最后一个成员时，按其当前渲染位置设置锚点，避免掉到末尾 ---
// excludeGuids：本次被移走的列表 GUID（锚点跳过它们，让空分组留在原位而非跟随移动）
function setAnchorForGroupOnEmpty(groupRowId, excludeGuids) {
    var row = brw.rows[groupRowId];
    if (!row || !row.isGroup) return;
    for (var s = groupRowId + 1; s < brw.rows.length; s++) {
        var r = brw.rows[s];
        if (!r.isGroup && r.idx >= 0) {
            var g = plman.GetGUID(r.idx);
            if (!excludeGuids || excludeGuids.indexOf(g) === -1) {
                setGroupAnchor(row.groupId, g, "above");
                return;
            }
        }
    }
    for (var s2 = groupRowId - 1; s2 >= 0; s2--) {
        var r2 = brw.rows[s2];
        if (!r2.isGroup && r2.idx >= 0) {
            var g2 = plman.GetGUID(r2.idx);
            if (!excludeGuids || excludeGuids.indexOf(g2) === -1) {
                setGroupAnchor(row.groupId, g2, "below");
                return;
            }
        }
    }
}

// --- [新增] 设置/清除分组锚点并持久化 ---
function setGroupAnchor(groupId, guid, pos) {
    for (var i = 0; i < Groups.length; i++) {
        if (Groups[i].id === groupId) {
            if (guid) Groups[i].anchor = { guid: guid, pos: pos };
            else delete Groups[i].anchor;
			save_gdata();
            return;
        }
    }
}

// --- [修正] 将多个列表移动到目标分组，保持原顺序 ---
function movePlaylistsToGroup(rowIds, targetGroupRowId) {
    if (brw.is_moving_group) return;
    if (!rowIds || rowIds.length === 0) return;
    if (targetGroupRowId < 0 || targetGroupRowId >= brw.rows.length) return;
    var targetGroup = brw.rows[targetGroupRowId];
    if (!targetGroup || !targetGroup.isGroup) return;
    var targetGroupId = targetGroup.groupId;

    // ========== Step 1: 在修改 GroupMap 之前，先确定插入锚点 ==========
    // （关键！写 GroupMap 后再 getGroupMemberIndices 会把待移动项也算入成员，导致锚点错误）
    var origMembers = getGroupMemberIndices(targetGroupId); // 原有成员，不含本次待入组
    var insertPos;
    if (origMembers.length > 0) {
        insertPos = origMembers[origMembers.length - 1] + 1; // 现有成员块末尾的下一个位置
    } else {
        // 空分组：寻找相邻锚点
        // 优先用"分组行下面最近的真实列表"作为插入位置（below）；若无就用"上面最近列表 +1"；再无就末尾
        var anchorBelow = -1;
        for (var s2 = targetGroupRowId + 1; s2 < brw.rows.length; s2++) {
            var r2 = brw.rows[s2];
            if (r2 && !r2.isGroup && r2.idx >= 0) { anchorBelow = r2.idx; break; }
        }
        var anchorAbove = -1;
        for (var s = targetGroupRowId - 1; s >= 0; s--) {
            var r = brw.rows[s];
            if (r && !r.isGroup && r.idx >= 0) { anchorAbove = r.idx; break; }
        }
        if (anchorBelow !== -1) insertPos = anchorBelow;
        else if (anchorAbove !== -1) insertPos = anchorAbove + 1;
        else insertPos = plman.PlaylistCount;
    }

    // ========== Step 2: 收集被移动项 GUID，清理 independent_lists ==========
    var moveItems = [];
    var needSaveIndep = false;
    var srcGroupIds = []; // 被移动项的原分组（入组后源分组可能清空）
    for (var i = 0; i < rowIds.length; i++) {
        var row = brw.rows[rowIds[i]];
        if (!row || row.isGroup || row.idx < 0) continue;
        // Hard Constraint:  永远不进入任何分组
        if (nonGrouped.indexOf(row.name) > -1) {fb.ShowPopupMessage("操作未完成或被调整\n-------------------------\n该播放列表被保留，不能移入分组.", "提示");continue;}
        var guid = plman.GetGUID(row.idx);
        var srcGroupId = GroupMap[guid];
        if (srcGroupId && srcGroupId !== targetGroupId && srcGroupIds.indexOf(srcGroupId) === -1) {
            srcGroupIds.push(srcGroupId);
        }
        moveItems.push({ guid: guid });
    }
    if (moveItems.length === 0) return;

    // ========== Step 3: 写 GroupMap（必须在锚点之后）==========
    var movedGuidsArr = [];
    for (var i = 0; i < moveItems.length; i++) {
        GroupMap[moveItems[i].guid] = targetGroupId;
        movedGuidsArr.push(moveItems[i].guid);
    }
	save_gdata();
    // 入组导致源分组清空：按当前渲染位置补锚点（保持空分组原位）
    if (srcGroupIds.length > 0) {
        for (var eg = 0; eg < srcGroupIds.length; eg++) {
            var egId = srcGroupIds[eg];
            var stillHas = false;
            for (var gmKey in GroupMap) {
                if (GroupMap[gmKey] === egId) { stillHas = true; break; }
            }
            if (!stillHas) {
                var egRow = -1;
                for (var er = 0; er < brw.rows.length; er++) {
                    if (brw.rows[er].isVGroup && brw.rows[er].groupId === egId) { egRow = er; break; }
                }
                if (egRow !== -1) setAnchorForGroupOnEmpty(egRow, movedGuidsArr);
            }
        }
    }
    // 目标分组原先为空：获得成员后清除锚点（锚点仅对空分组生效）
    if (origMembers.length === 0) {
        setGroupAnchor(targetGroupId, null, null);
    }

    // ========== Step 4: 按 GUID 稳查 plman idx，逐个 MovePlaylist（保持原顺序）==========
    brw.is_moving_group = true;
    for (var j = 0; j < moveItems.length; j++) {
        var currentIdx = -1;
        for (var k = 0; k < plman.PlaylistCount; k++) {
            if (plman.GetGUID(k) === moveItems[j].guid) { currentIdx = k; break; }
        }
        if (currentIdx === -1) continue;
        var tgt = insertPos;
        // 修正：源在目标之前（currentIdx < tgt）→ 弹出后目标会前移，所以真正的目的地是 tgt - 1
        if (currentIdx < tgt) tgt = tgt - 1;
        if (currentIdx !== tgt && tgt >= 0 && tgt <= plman.PlaylistCount) {
            plman.MovePlaylist(currentIdx, tgt);
        }
        insertPos = tgt + 1; // 下一个插入到本次之后，保持连续
    }
    brw.populate(true);
    brw.actionRows = [];
    brw.activeRow = -1;
    brw.is_moving_group = false;
}

// --- [修正] 将多个列表移出分组，保持原顺序（升序） ---
function movePlaylistsOutOfGroup(rowIds) {
    if (brw.is_moving_group) return;
    if (!rowIds || rowIds.length === 0) return;
    var moveItems = [];
    for (var i = 0; i < rowIds.length; i++) {
        var row = brw.rows[rowIds[i]];
        if (!row || row.isGroup || row.idx < 0) continue;
        if (row.level > 0) {
            var guid = plman.GetGUID(row.idx);
            moveItems.push({ guid: guid, rowId: rowIds[i] });
        }
    }
    if (moveItems.length === 0) return;
    // rowIds 是点击顺序（Ctrl 多选时先点下面的就排在前面），直接用会让出组后的
    // 末尾块次序被打乱。这里按 UI 行号升序还原"原来的上下次序"。
    moveItems.sort(function (a, b) { return a.rowId - b.rowId; });
    brw.is_moving_group = true;
    // 记录源分组：出组后若清空，按当前渲染位置补锚点（保持分组原位）
    var emptiedGroupIds = [];
    var movedGuids = [];
    for (var i = 0; i < moveItems.length; i++) {
        var srcGroupId = GroupMap[moveItems[i].guid];
        if (srcGroupId && emptiedGroupIds.indexOf(srcGroupId) === -1) {
            emptiedGroupIds.push(srcGroupId);
        }
        movedGuids.push(moveItems[i].guid);
        delete GroupMap[moveItems[i].guid];
    }
	save_gdata();
    // 出组导致源分组清空：补锚点（行结构仍是出组前的，邻居查找准确）
    if (emptiedGroupIds.length > 0) {
        for (var eg = 0; eg < emptiedGroupIds.length; eg++) {
            var egId = emptiedGroupIds[eg];
            var stillHas = false;
            for (var gmKey in GroupMap) {
                if (GroupMap[gmKey] === egId) { stillHas = true; break; }
            }
            if (!stillHas) {
                var egRow = -1;
                for (var er = 0; er < brw.rows.length; er++) {
                    if (brw.rows[er].isVGroup && brw.rows[er].groupId === egId) { egRow = er; break; }
                }
                if (egRow !== -1) setAnchorForGroupOnEmpty(egRow, movedGuids);
            }
        }
    }
    // 将列表移动到末尾
    // 循环内不重建行集：这里只读 plman 索引与 GUID，完全不消费 brw.rows；
    // 且 MovePlaylist 本身会触发 on_playlists_changed（那里已经重建过一次），
    // 循环结束后还有 populate(true) 兜底。留着只会让行集被重复重建 N 次。
    for (var j = 0; j < moveItems.length; j++) {
        var currentIdx = findPlIndexByGuid(moveItems[j].guid);
        if (currentIdx === -1) continue;
        plman.MovePlaylist(currentIdx, plman.PlaylistCount - 1);
    }
    brw.populate(true);
    brw.actionRows = [];
    brw.activeRow = -1;
    brw.is_moving_group = false;
}

// --- [修正] 排序分组内的子列表（使用播放列表 API） ---
function sortGroupChildren(groupRowId, sortType) {
    if (brw.is_moving_group) return;
    var groupRow = brw.rows[groupRowId];
    if (!groupRow || !groupRow.isGroup) return;
    var members = getGroupMemberIndices(groupRow.groupId);
    if (members.length < 2) return;
    var children = [];
    for (var i = 0; i < members.length; i++) {
        children.push({
            guid: plman.GetGUID(members[i]),
            name: plman.GetPlaylistName(members[i]),
            count: plman.PlaylistItemCount(members[i])
        });
    }
    switch (sortType) {
        case 'name_asc': children.sort(function(a, b) { return a.name.localeCompare(b.name); }); break;
        case 'name_desc': children.sort(function(a, b) { return b.name.localeCompare(a.name); }); break;
        case 'count_asc': children.sort(function(a, b) { return a.count - b.count; }); break;
        case 'count_desc': children.sort(function(a, b) { return b.count - a.count; }); break;
        case 'random':
            for (var i = children.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = children[i]; children[i] = children[j]; children[j] = temp;
            }
            break;
        default: return;
    }
    brw.is_moving_group = true;
    for (var i = 0; i < children.length; i++) {
        var currentMembers = getGroupMemberIndices(groupRow.groupId);
        var insertPos = currentMembers[0] + i;
        var currentIdx = -1;
        for (var k = 0; k < plman.PlaylistCount; k++) {
            if (plman.GetGUID(k) === children[i].guid) { currentIdx = k; break; }
        }
        if (currentIdx === -1) continue;
        if (currentIdx !== insertPos) plman.MovePlaylist(currentIdx, insertPos);
        brw.populate(false);
    }
    brw.populate(true);
    brw.actionRows = [];
    brw.activeRow = -1;
    brw.is_moving_group = false;
}

//==============Objects======================================================
oPlaylist = function(idx, rowId, name) {
	this.idx = idx;
	this.rowId = rowId;
	this.raw_name = name; // 保留原始名称
	
	this.isGroup = false; // 虚拟群头由 init_groups 设置
	this.isVGroup = false;
	this.name = name;

	this.isAutoPlaylist = (idx >= 0) ? plman.IsAutoPlaylist(idx) : false;
	this.islocked = false;
	if (ppt.lockReservedPlaylist && this.name == "媒体库" && this.idx == 0) this.islocked = true;

	this.level = 0; // 0 为父级 (或独立列表), 1 为子级
	this.groupId = null;
	this.isExpanded = true;
};

oBrowser = function() {
	this.rows = [];
	this.scrollbar = new oScrollbar();
	this.inputbox = null;
	this.inputboxID = -1;
	this.actionRows = [];
	this.new_bt = null;

	this.images = {
		topbar_btn: null
	};

	this.getImages = function() {
		var gb;
		var bt_h = z(24);
		
		this.images.topbar_btn = gdi.CreateImage(bt_h, bt_h);
		gb = this.images.topbar_btn.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillRoundRect(zdpi, zdpi, z(22)-1, z(22)-1, z(3), z(3), g_color_bt_overlay);
		this.images.topbar_btn.ReleaseGraphics(gb);

		this.new_bt = new button(false, this.images.topbar_btn, this.images.topbar_btn);
		this.new_menu = new button(false, this.images.topbar_btn, this.images.topbar_btn);
	};
	this.getImages();
	
	this.launch_populate = function() {
		var launch_timer = window.SetTimeout(function() {
			brw.populate(true, true);
			launch_timer && window.ClearTimeout(launch_timer);
			launch_timer = false;
		}, 5);
	};

	this.repaint = function() {
		repaint_main1 = repaint_main2;
	};

	this.setSize = function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.marginLR = 0;
		this.paddingLeft = 8;
		this.paddingRight = cScrollBar.width + 1;
		this.totalRows = Math.ceil(this.h / ppt.rowHeight);
		this.totalRowsVis = Math.floor(this.h / ppt.rowHeight);

		this.getlimits();

		g_filterbox.setSize(cFilterBox.w, cFilterBox.h);
		g_searchbox.setSize(cSearchBox.x, cSearchBox.y, cSearchBox.w, cSearchBox.h);

		if (this.inputboxID > -1) {
			var rh = ppt.rowHeight - 10;
			var tw = this.w - rh - 10;
			this.inputbox && this.inputbox.setSize(tw, rh);
		};

		this.scrollbar.setSize();

		scroll = Math.round(scroll / ppt.rowHeight) * ppt.rowHeight;
		scroll = check_scroll(scroll);
		scroll_ = scroll;

		// scrollbar update       
		this.scrollbar.updateScrollbar();
	};

	this.init_groups = function() {
		var rowId = 0;
		var total = plman.PlaylistCount;
		this.previous_playlistCount = total;

		this.rows.splice(0, this.rows.length);
		var str_filter = process_string(filter_text);
		var hasFilter = str_filter.length > 0;
		var seenGroups = {};

		// 预计算：群名是否匹配 filter
		var groupMatchesFilter = {};
		if (hasFilter) {
			for (var g = 0; g < Groups.length; g++) {
				groupMatchesFilter[Groups[g].id] = match(Groups[g].name, str_filter);
			}
		}

		for (var i = 0; i < total; i++) {
			var name = plman.GetPlaylistName(i);
			var guid = plman.GetGUID(i);
			var groupId = GroupMap[guid];

			var nameMatches = hasFilter ? match(name, str_filter) : true;
			var groupMatches = hasFilter && groupId ? !!groupMatchesFilter[groupId] : false;
			var toAdd = nameMatches || groupMatches || !hasFilter;
			if (!toAdd) continue;

			if (groupId) {
				// 分组成员
				if (!seenGroups[groupId]) {
					var grp = null;
					for (var g = 0; g < Groups.length; g++) {
						if (Groups[g].id === groupId) { grp = Groups[g]; break; }
					}
					if (grp) {
						var header = new oPlaylist(-1, rowId, grp.name);
						header.isGroup = true;
						header.isVGroup = true;
						header.groupId = grp.id;
						// 过滤时群内内容强制展开，方便用户看到命中的成员
						header.isExpanded = hasFilter ? true : !grp.collapsed;
						header.level = 0;
						header.groupTrackCount = 0;
						header.containsPlaying = false;
						header.raw_name = grp.name;
						this.rows.push(header);
						rowId++;
						seenGroups[groupId] = header;
					}
				}
				var hdr = seenGroups[groupId];
				if (hdr) {
					hdr.groupTrackCount += plman.PlaylistItemCount(i);
					if (i === plman.PlayingPlaylist) hdr.containsPlaying = true;
				}
				if (hdr && !hdr.isExpanded && !hasFilter) continue;
				var p = new oPlaylist(i, rowId, name);
				p.level = 1;
				p.groupId = groupId;
				this.rows.push(p);
				rowId++;
			} else {
				// 独立列表
				var p = new oPlaylist(i, rowId, name);
				p.level = 0;
				this.rows.push(p);
				rowId++;
			}
		}
		// 空分组按锚点渲染：anchor = { guid: 目标列表 GUID, pos: "above"|"below" }
		// - 优先锚定到与其相邻的独立列表（拖拽落点旁的行）
		// - 无锚点或锚点列表已不存在 → 兜底追加到末尾（行为同旧版）
		// - 锚点列表是分组成员 → 跟随该分组整体渲染（视觉上仍在分组头附近）
		for (var g = 0; g < Groups.length; g++) {
			if (!seenGroups[Groups[g].id]) {
				if (hasFilter && !groupMatchesFilter[Groups[g].id]) continue;
				var header = new oPlaylist(-1, rowId, Groups[g].name);
				header.isGroup = true;
				header.isVGroup = true;
				header.groupId = Groups[g].id;
				header.isExpanded = !Groups[g].collapsed;
				header.level = 0;
				header.groupTrackCount = 0;
				header.containsPlaying = false;
				header.raw_name = Groups[g].name;
				var anchor = Groups[g].anchor;
				if (anchor && anchor.guid) {
					// 查找锚点列表当前所在的行位置（可能作为分组成员渲染在某群头下）
					var anchorRow = -1;
					var anchorIsGroupMember = false;
					for (var ar = 0; ar < this.rows.length; ar++) {
						var arRow = this.rows[ar];
						if (!arRow.isGroup && arRow.idx >= 0 && plman.GetGUID(arRow.idx) === anchor.guid) {
							anchorRow = ar;
							anchorIsGroupMember = GroupMap[anchor.guid] ? true : false;
							break;
						}
					}
					if (anchorRow !== -1) {
					var insertAt;
					if (anchorIsGroupMember) {
						// 锚点是分组成员：渲染位置换算到该分组块边界（above→块首前，below→块尾后）
						if (anchor.pos === "below") {
							// 找到该分组成员块的最后一行，插到其后
							var lastMemberRow = anchorRow;
							for (var mm = anchorRow + 1; mm < this.rows.length; mm++) {
								if (this.rows[mm].isGroup || this.rows[mm].level === 0) break;
								lastMemberRow = mm;
							}
							insertAt = lastMemberRow + 1;
						} else {
							// 找到该分组的群头行，插到其前
							var headerRow = anchorRow;
							for (var hh = anchorRow - 1; hh >= 0; hh--) {
								if (this.rows[hh].isGroup) { headerRow = hh; break; }
							}
							insertAt = headerRow;
						}
					} else {
						insertAt = (anchor.pos === "below") ? anchorRow + 1 : anchorRow;
					}
					this.rows.splice(insertAt, 0, header);
					rowId++;
					continue;
				}
				}
				this.rows.push(header);
				rowId++;
			}
		}
		this.rowsCount = rowId;
		this.getlimits();
	};

	this.getlimits = function() {
		if (this.rowsCount <= this.totalRowsVis) {
			var start_ = 0;
			var end_ = this.rowsCount - 1;
		} else {
			if (scroll_ < 0) scroll_ = scroll;
			var start_ = Math.round(scroll_ / ppt.rowHeight + 0.4);
			var end_ = start_ + this.totalRows;
			// check boundaries
			start_ = start_ > 0 ? start_ - 1 : start_;
			if (start_ < 0) start_ = 0;
			if (end_ >= this.rows.length) end_ = this.rows.length - 1;
		};
		g_start_ = start_;
		g_end_ = end_;
	};

	this.populate = function(repaint_now, reset_scroll) {
		this.init_groups();
		// 行集刚重建：把 activeRow 收敛回合法范围，否则列表被删后
		// this.rows[activeRow] 取到 undefined，后续访问属性就崩
		if (this.activeRow >= this.rows.length) this.activeRow = this.rows.length - 1;
		if (this.activeRow < -1) this.activeRow = -1;
		if (reset_scroll) scroll = scroll_ = 0;
		this.scrollbar.updateScrollbar();
		if(repaint_now) this.repaint();
	};

	 this.getRowIdFromIdx = function(idx) {
		// 核心修正：移除 8.13 的过滤框长度为0短路短路语句。
		// 在分组功能下，UI行数不再总等于播放列表序号，必须强制全局遍历，否则折叠后点击必发生乱序错位。
		//if(g_filterbox.inputbox.text.length == 0) return idx;
		var total = this.rows.length;
		var rowId = -1;
		if (plman.PlaylistCount > 0) {
			for (var i = 0; i < total; i++) {
				if (this.rows[i].idx == idx) {
					rowId = i;
					break;
				};
			};
		};
		return rowId;
	};

	this.isVisiblePlaylist = function(idx) {
		var rowId = this.getRowIdFromIdx(idx);
		var offset_active_pl = ppt.rowHeight * rowId;
		if (offset_active_pl < scroll || offset_active_pl + ppt.rowHeight > scroll + this.h) {
			return false;
		}
		else {
			return true;
		};
	};

	this.isVisibleRow = function(rowid) {
		var offset_activerow = ppt.rowHeight * rowid;
		if (offset_activerow < scroll || offset_activerow + ppt.rowHeight > scroll + this.h) {
			return false;
		}
		else {
			return true;
		};
	};

	this.showActiveRow = function() {
		if (!this.isVisibleRow(this.activeRow)) {
			scroll = (this.activeRow - Math.floor(this.totalRowsVis / 2)) * ppt.rowHeight;
			scroll = check_scroll(scroll);
			this.scrollbar.updateScrollbar();
		} else this.repaint();
	};

	this.showActivePlaylist = function() {
		var rowId = this.getRowIdFromIdx(plman.ActivePlaylist);
		if (!this.isVisiblePlaylist(plman.ActivePlaylist)) {
			scroll = (rowId - Math.floor(this.totalRowsVis / 2)) * ppt.rowHeight;
			scroll = check_scroll(scroll);
			this.scrollbar.updateScrollbar();
		};
	};
	
	this.callRename = function(id, pl_idx, autopl_pending) {
		var rh = ppt.rowHeight - 10;
		var tw = this.w - rh - 20;
		
		// 虚拟分组直接使用行名称，普通列表从后台读取
	var actual_name;
	if (this.rows[id] && this.rows[id].isVGroup) {
		actual_name = this.rows[id].name;
	} else {
		actual_name = plman.GetPlaylistName(pl_idx);
	}
		
		this.inputbox = new oInputbox(tw, rh, actual_name, "", g_color_normal_txt, g_color_normal_bg, c_black, g_color_selected_bg, autopl_pending ? "renamePlaylist(true)" : "renamePlaylist(false)", "brw");
		this.inputboxID = id;
		// activate inputbox for edit
		this.inputbox.on_focus(true);
		this.inputbox.edit = true;
		this.inputbox.Cpos = this.inputbox.text.length;
		this.inputbox.anchor = this.inputbox.Cpos;
		if (!cInputbox.timer_cursor) {
			this.inputbox.resetCursorTimer();
		};
		this.inputbox.dblclk = true;
		this.inputbox.SelBegin = 0;
		this.inputbox.SelEnd = this.inputbox.text.length;
		this.inputbox.text_selected = this.inputbox.text;
		this.inputbox.select = true;
		this.repaint();
	}

	this.draw = function(gr) {
		if (repaint_main || !repaintforced) {
			repaint_main = false;
			repaintforced = false;
			gr.FillGradRect(0, 0, 1, wh, 0, g_color_normal_bg, g_color_normal_bg, 1);//bug of win10 border
			if (this.rows.length > 0) {
				var ax = this.marginLR;
				var ay = 0;
				var aw = this.w + cScrollBar.width;
				var ah = ppt.rowHeight;
				var rh = g_font.Size * 2;
				for (var i = g_start_; i <= g_end_; i++) {
					ay = Math.floor(this.y + (i * ah) - scroll_);
					this.rows[i].x = ax;
					this.rows[i].y = ay;
					if (ay > this.y - ppt.headerBarHeight - ah && ay < this.y + this.h) {
						// row bg
						var track_color_txt = blendColors(g_color_normal_bg, g_color_normal_txt, 0.65);
						if(ppt.showGrid) gr.DrawLine(ax, ay + ah, aw, ay + ah, 1, g_color_line);
						
						// active playlist row bg
						if (this.rows[i].idx >= 0 && this.rows[i].idx == plman.ActivePlaylist) {
							track_color_txt = g_color_normal_txt;
							gr.FillSolidRect(ax, ay, aw, ah, g_color_selected_bg);
							gr.FillGradRect(ax, ay, 1, ah, 0, g_color_selected_bg, g_color_selected_bg, 1);//bug of win10 border
						} else if(this.actionRows.indexOf(i) > -1){
							track_color_txt = g_color_normal_txt;
							gr.FillSolidRect(ax, ay, aw, ah, g_color_selected_bg &0x75ffffff);
						}
						
						// 动态判断当前行是否应该高亮 (包括折叠的分组内有正在播放的列表时)
						var is_playing_row = fb.IsPlaying && (
							(this.rows[i].idx >= 0 && this.rows[i].idx == plman.PlayingPlaylist) ||
							(this.rows[i].isGroup && !this.rows[i].isExpanded && this.rows[i].containsPlaying)
						);

						if (is_playing_row) {
							gr.FillSolidRect(ax, ay, aw, ah, g_color_highlight);
							gr.FillGradRect(ax, ay, 1, ah, 0, g_color_highlight, g_color_highlight, 1);//bug of win10 border
						}
        
						// 高亮拖拽进入分组的目标行
						if (cPlaylistManager.drag_into_group && cPlaylistManager.drag_into_group_rowId == i) {
							gr.FillSolidRect(ax, ay, aw, ah, g_color_highlight & 0x60ffffff);
						}
						
						// hover item
						if (i == this.activeRow && !g_dragndrop_status && !cPlaylistManager.drag_clicked) {
							gr.FillSolidRect(ax, ay, 4, ah, g_color_highlight);
							gr.FillGradRect(ax, ay, 1, ah, 0, g_color_highlight, g_color_highlight, 1);//bug of win10 border
						};
						// target location mark
						if (cPlaylistManager.drag_target_id == i && !this.rows[i].islocked) {
							// 只有处于拖拽状态时才绘制高亮线
							if (cPlaylistManager.drag_is_group || cPlaylistManager.drag_clicked || cPlaylistManager.drag_moved) {
								var isAbove = false;
								if (cPlaylistManager.drag_is_group) {
									// 拖拽整个分组：比较目标行与源行的前后关系来定线上/下
									var srcRow = cPlaylistManager.drag_group_rowId;
									if (srcRow >= 0 && srcRow < this.rows.length) {
										isAbove = (cPlaylistManager.drag_target_id < srcRow);
									} else {
										isAbove = false;
									}
								} else {
									// 统一锚定：不管目标行是普通列表还是分组，线的顶/底端一律按"目标相对源的整体前后"
									// - 目标在源之前（行号 < 源锚）→ 线画在目标顶端（above）
									// - 目标在源之后（行号 > 源锚）→ 线画在目标底端（below）
									// 这样线在整个目标对象范围内保持恒定，跨普通行 ↔ 分组行边界时不跳变
									var srcAnchor = -1;
									if (this.actionRows && this.actionRows.length > 0) {
										srcAnchor = this.actionRows[0];
									}
									if (srcAnchor >= 0) {
										isAbove = (cPlaylistManager.drag_target_id < srcAnchor);
									} else {
										// 没有源锚（极个别情况），fallback 到鼠标热区判定保持一致
										isAbove = cPlaylistManager.drag_above;
									}
								}
								var lineY = isAbove ? ay + 1 : ay + ppt.rowHeight - 2;
								gr.FillSolidRect(ax, lineY, aw - 1, 2, RGBA(0, 0, 0, 105));
								gr.FillSolidRect(ax, lineY, aw - 1, 2, g_color_highlight);
							}
						}
						if (g_dragndrop_status && this.rows[i].idx == g_dragndrop_targetPlaylistId && !this.rows[i].isAutoPlaylist && !this.rows[i].isGroup) {
							gr.FillSolidRect(ax, ay, aw, ah, g_color_draghover);
						};
						// draw blink rectangle after an external drag'n drop files
						if (blink.counter > -1) {
							if (i == blink.id && !this.rows[i].isAutoPlaylist) {
								if (blink.counter <= 5 && Math.floor(blink.counter / 2) == Math.ceil(blink.counter / 2)) {
									gr.DrawRect(ax + 1, ay + 1, aw - 2, ah - 2, 2.0, g_color_selected_bg);
								};
							};
						};
						
						// =====
						// text & Font Icons adapted for Groups
						// =====
						var playlist_icon = playlistName2icon(this.rows[i].name, this.rows[i].isAutoPlaylist);
						
						var font = is_playing_row ? g_font_b : g_font;
						var name_color = is_playing_row ? g_color_playing_txt : g_color_normal_txt;
						var track_color = is_playing_row ? g_color_playing_txt : track_color_txt;

						// 精准计算图标的 X 坐标，实现树状缩进
						var icon_x = ax + this.paddingLeft;
						var list_font = font; // 独立变量，不污染原版 font 计算体系
						
						if (this.rows[i].isGroup) {
							var fold_icon = this.rows[i].isExpanded ? "\uEA4E" : "\uEA6E";
							// 分组使用 remixicon 字体 (g_fnico1) 渲染指定的折叠箭头
							gr.GdiDrawText(fold_icon, g_fnico1, name_color, icon_x + 4 * zdpi, ay, rh, ah, lc_txt);
							list_font = g_font_b; 
						} else {
							if (this.rows[i].level === 1) {
								// 子列表图标向右缩进 16px
								icon_x += 16 * zdpi; 
								name_color = track_color_txt; // 仅改颜色，不缩小字体，保持原版一致
							}
							// 渲染原有的 remixicon 字体图标
							gr.GdiDrawText(playlist_icon, g_fnico1, name_color, icon_x, ay, rh, ah, cc_txt);
						}

						// 文字和输入框跟随缩进的图标进行排布
						var tx = icon_x + rh + 4 * zdpi;

						// fields (分组读取专属合计量，单列表读取实际量)
						var track_total = this.rows[i].isGroup ? this.rows[i].groupTrackCount : plman.PlaylistItemCount(this.rows[i].idx);
						track_total = track_total.toString(); // 强制转为字符串，确保系统渲染稳定
						
						// 修复核心：原版的精髓是用大一圈的 font 测算宽度，完美留出安全边距防截断！
						var track_total_w = gr.CalcTextWidth(track_total, font); 
						
						if (this.inputboxID == i) {
							this.inputbox.draw(gr, tx + 2, ay + 5);
						}
						else {
							gr.GdiDrawText(this.rows[i].name, list_font, name_color, tx, ay, aw - tx - track_total_w - this.paddingRight - 5, ah, lc_txt);
							gr.GdiDrawText(track_total, g_font_track, track_color, ax + aw - track_total_w - this.paddingRight, ay, track_total_w, ah, rc_txt);
						};
					};
				};
			}
			gr.FillSolidRect(0, 0, ww, ppt.headerBarHeight+1, g_color_normal_bg);
			gr.FillSolidRect(0, 0, ww, ppt.SearchBarHeight - 2, g_color_topbar);
			gr.FillGradRect(0, 0, 1, ppt.headerBarHeight+1, 0, g_color_normal_bg, g_color_normal_bg, 1);//bug of win10 border
			if(ppt.showFilter){
				var boxText;
				if (filter_text.length > 0) {
					var str_filter = process_string(filter_text);
					var count = 0;
					// 预计算命中的分组 id
					var gMatch = {};
					for (var gi = 0; gi < Groups.length; gi++) {
						gMatch[Groups[gi].id] = match(Groups[gi].name, str_filter);
					}
					for (var i = 0; i < plman.PlaylistCount; i++) {
						var name = plman.GetPlaylistName(i);
						var guid = plman.GetGUID(i);
						var gId = GroupMap[guid];
						var nameHit = match(name, str_filter);
						var groupHit = gId ? !!gMatch[gId] : false;
						if (nameHit || groupHit) count++;
					}
					boxText = count.toString();
				} else {
					boxText = plman.PlaylistCount.toString();
				}
				var tw = gr.CalcTextWidth(boxText+" ", g_font_track);
				gr.GdiDrawText(boxText, g_font_track, g_color_normal_txt, this.w - tw, 0, tw, ppt.headerBarHeight + ppt.SearchBarHeight - 1, rc_txt);
			}
			gr.DrawLine(0, ppt.SearchBarHeight, ww, ppt.SearchBarHeight, 1, g_color_line_div);
			var bt_y = Math.round((ppt.SearchBarHeight - brw.images.topbar_btn.Height)/2 - zdpi);
			this.new_menu.draw(gr, Math.round(ww - 2*brw.images.topbar_btn.Width), bt_y, 255);
			this.new_bt.draw(gr, Math.round(ww - brw.images.topbar_btn.Width),  bt_y, 255);
			gr.GdiDrawText("\uEA4D", g_fnico1, g_color_normal_txt, this.new_menu.x, bt_y, this.new_menu.w, this.new_menu.h, cc_txt);
			gr.FillGradRect(Math.round(ww - brw.images.topbar_btn.Width-1), 0, 1, ppt.SearchBarHeight, 90, RGBA(0, 0, 0, 3), RGBA(0, 0, 0, 35), 0.5);
			gr.FillSolidRect(Math.round(ww - brw.images.topbar_btn.Width), 0, 1, ppt.SearchBarHeight - 2, g_color_normal_bg);
			gr.GdiDrawText("\uEA13", g_fnico1, g_color_normal_txt, this.new_bt.x, bt_y, this.new_bt.w, this.new_bt.h, cc_txt);
			brw.scrollbar && brw.scrollbar.draw(gr);
		};
	};

// --------------------------------------------------------------------


	this._isHover = function(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	};

	this.on_mouse = function(event, x, y) {
		this.ishover = this._isHover(x, y);

		// get hover row index (mouse cursor hover)
		this.activeRow = -1;
		if (this.ishover) {
			if (y > this.y && y < this.y + this.h) {
				this.activeRow = Math.ceil((y + scroll_ - this.y) / ppt.rowHeight - 1);
				if (this.activeRow >= this.rows.length) this.activeRow = -1;
			}
		}
		if (brw.activeRow != brw.activeRowSaved) {
			brw.activeRowSaved = brw.activeRow;
			window.RepaintRect(0, 0, 5, wh);
		};

		switch (event) {
		case "down":
			this.down = true;
			if (!cTouch.down && !timers.mouseDown && this.ishover && this.activeRow > -1 && Math.abs(scroll - scroll_) < 2) {
				if (this.activeRow == this.inputboxID) {
					this.inputbox.check("down", x, y, true);
				} else {
					if (this.inputboxID > -1) {
						this.inputbox.check("down", x, y, true);
						this.inputboxID = -1;
					}
					
					// --- [修改] 点击分组：不立即折叠，而是记录拖拽状态，在 up 中判断 ---
					if (this.rows[this.activeRow].isGroup) {
						// 准备拖拽，但不在 down 中折叠
						cPlaylistManager.drag_clicked = true;
						cPlaylistManager.drag_is_group = true;
						cPlaylistManager.drag_group_rowId = this.activeRow;
						cPlaylistManager.drag_start_x = x;
						cPlaylistManager.drag_start_y = y;
						// 清空选择状态
						this.actionRows.splice(0, this.actionRows.length);
						this.repaint();
						return;
					}
					// -----------------------------

					if(utils.IsKeyPressed(VK_CONTROL)){
						var cid = this.getRowIdFromIdx(plman.ActivePlaylist);
						var rid = this.actionRows.indexOf(this.activeRow);
						if(rid < 0) {
							if(!this.rows[this.activeRow].islocked) this.actionRows.push(this.activeRow);
						}
						else if(rid != cid) this.actionRows.splice(rid, 1);
					} else if(utils.IsKeyPressed(VK_SHIFT)){
						var cid = this.getRowIdFromIdx(plman.ActivePlaylist);
						if(cid > this.activeRow){
							var _start = this.activeRow;
							var _end = cid;
						} else{
							var _start = cid;
							var _end = this.activeRow;
						}
						this.actionRows.splice(0, this.actionRows.length);
						for (var i = _start; i <= _end; i++) {
							if(!this.rows[i].islocked) this.actionRows.push(i);
						};
					} else {
						var rid = this.actionRows.indexOf(this.activeRow);
						if(rid < 0) {
							this.actionRows.splice(0, this.actionRows.length);
							this.actionRows.push(this.activeRow);
							if (this.rows[this.activeRow].idx >= 0 && plman.ActivePlaylist != this.rows[this.activeRow].idx) {
								plman.ActivePlaylist = this.rows[this.activeRow].idx;
							}
						};
					}
					if (!this.rows[this.activeRow].islocked) {
						if (!this.up) {
							// set dragged item to reorder list
							cPlaylistManager.drag_clicked = true;
							// 记录按下点：move 里据此判断是否真正拖拽（与分组的 dist < 5 同一口径）
							cPlaylistManager.drag_start_x = x;
							cPlaylistManager.drag_start_y = y;
						};
					}
				};
				this.repaint();
			} else {
				if (this.inputboxID > -1) {
					this.inputbox.check("down", x, y, true);
					this.inputboxID = -1;
					this.repaint();
				}
				// scrollbar
				if (cScrollBar.visible) {
					this.scrollbar && this.scrollbar.on_mouse(event, x, y);
				};
				this.new_bt.checkstate("down", x, y);
				if (this.new_menu.checkstate("down", x, y) == ButtonStates.down) {
					this.buttonClicked = true;
					this.new_menu.state = ButtonStates.hover;
				};
			};
			this.up = false;
			break;
		case "up":
			this.up = true;
			if (this.down) {
				// ---- 分组拖拽处理 ----
				if (cPlaylistManager.drag_is_group) {
					// 计算鼠标移动距离，判断是点击还是拖拽
					var dist = Math.sqrt(
						Math.pow(x - cPlaylistManager.drag_start_x, 2) +
						Math.pow(y - cPlaylistManager.drag_start_y, 2)
					);
					if (dist < 5) {
					// 点击：折叠/展开
					// --- [修改] 使用 GUID 作为折叠状态键 ---
					var g_row = this.rows[cPlaylistManager.drag_group_rowId];
					for (var gi = 0; gi < Groups.length; gi++) {
						if (Groups[gi].id === g_row.groupId) { Groups[gi].collapsed = !Groups[gi].collapsed; break; }
					}
					save_gdata();
					// 视口锚定：记录组头行的可视位置 + 组头之后的第一行内容标识，
					// 折叠/展开后把它滚回原可视位置，避免列表跳回顶部
					var anchorTopOffset = this.rows[cPlaylistManager.drag_group_rowId].y - this.y;
					var nextContentId = null;
					if (!this.rows[cPlaylistManager.drag_group_rowId].isExpanded) {
						// 即将展开（当前存储的是折叠后状态）：锚定组头自身即可
						nextContentId = { type: "group", id: g_row.groupId };
					} else {
						// 即将折叠：锚定组头之后第一个内容行
						for (var nc = cPlaylistManager.drag_group_rowId + 1; nc < this.rows.length; nc++) {
							var ncRow = this.rows[nc];
							if (ncRow.isVGroup) { nextContentId = { type: "group", id: ncRow.groupId }; break; }
							if (ncRow.idx >= 0) { nextContentId = { type: "pl", guid: plman.GetGUID(ncRow.idx) }; break; }
						}
					}
					// 重置所有拖拽状态
					this.actionRows.splice(0, this.actionRows.length);
					this.activeRow = -1;
					cPlaylistManager.drag_clicked = false;
					cPlaylistManager.drag_is_group = false;
					cPlaylistManager.drag_group_rowId = -1;
					cPlaylistManager.drag_target_id = -1;
					cPlaylistManager.drag_moved = false; // 必须重置
					this.populate(true, false);
					// 按锚定行恢复滚动（锚定行不可得时仍需 check_scroll 收敛，防折叠后旧 scroll 越界）
					var restoreRow = -1;
					if (nextContentId) {
						for (var rr = 0; rr < this.rows.length; rr++) {
							var rrRow = this.rows[rr];
							if (nextContentId.type === "group" && rrRow.isVGroup && rrRow.groupId === nextContentId.id) { restoreRow = rr; break; }
							if (nextContentId.type === "pl" && !rrRow.isGroup && rrRow.idx >= 0 && plman.GetGUID(rrRow.idx) === nextContentId.guid) { restoreRow = rr; break; }
						}
					}
					if (restoreRow !== -1) {
						scroll = check_scroll(restoreRow * ppt.rowHeight - anchorTopOffset);
					} else {
						scroll = check_scroll(scroll);
					}
					scroll_ = scroll;
					this.scrollbar.updateScrollbar();
					this.repaint();
					return;
				} else {
					// 拖拽：移动分组到目标位置
					var targetRowId = cPlaylistManager.drag_target_id;
					if (targetRowId >= 0 && targetRowId < this.rows.length) {
						var groupRowId = cPlaylistManager.drag_group_rowId;
						if (targetRowId !== groupRowId) {
							moveGroupTo(groupRowId, targetRowId);
						}
					}
					// 重置所有拖拽状态
					cPlaylistManager.drag_clicked = false;
					cPlaylistManager.drag_is_group = false;
					cPlaylistManager.drag_group_rowId = -1;
					cPlaylistManager.drag_target_id = -1;
					cPlaylistManager.drag_into_group = false;
					cPlaylistManager.drag_into_group_rowId = -1;
					cPlaylistManager.drag_moved = false; // 必须重置
					stopAutoScrollTimer(); // 提前 return 会跳过 up 分支末尾的清除
					brw.repaint();
					return;
				}
				}
				// ---- 分组拖拽处理结束 ----

                // ---- 处理拖拽列表进入分组 ----
                if (cPlaylistManager.drag_into_group) {
                    var groupRowId = cPlaylistManager.drag_into_group_rowId;
                    if (groupRowId >= 0 && groupRowId < this.rows.length) {
                        var rowsToMove = (this.actionRows.length > 0) ? this.actionRows : [this.activeRow];
                        var filtered = [];
                        for (var i = 0; i < rowsToMove.length; i++) {
                            var r = this.rows[rowsToMove[i]];
                            if (!r.isGroup) {
                                filtered.push(rowsToMove[i]);
                            }
                        }
                        if (filtered.length > 0) {
                            movePlaylistsToGroup(filtered, groupRowId);
                        }
                    }
                    // 重置状态
                    cPlaylistManager.drag_into_group = false;
                    cPlaylistManager.drag_into_group_rowId = -1;
                    cPlaylistManager.drag_clicked = false;
                    cPlaylistManager.drag_moved = false;
                    cPlaylistManager.drag_target_id = -1;
                    brw.repaint();
                    // 终止后续处理（不执行原有的拖放排序等）
                    this.down = false;
                    if (cPlaylistManager.drag_moved) window.SetCursor(IDC_ARROW);
                    cPlaylistManager.drag_clicked = false;
                    cPlaylistManager.drag_moved = false;
                    cPlaylistManager.drag_target_id = -1;
                    stopAutoScrollTimer(); // 提前 return 会跳过 up 分支末尾的清除
                    return; // 跳出 case "up"
                }
                // ---- 结束 ----

				// scrollbar
				if (cScrollBar.visible) {
					brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
				};

				if (this.new_bt.checkstate("up", x, y) == ButtonStates.hover) {
					var total = plman.PlaylistCount;
					var pl_idx = total;
					plman.CreatePlaylist(pl_idx, "");
					plman.ActivePlaylist = pl_idx;
					// 动态获取安全行号，防止分组折叠导致越界
					var real_id = this.getRowIdFromIdx(pl_idx);
					if (real_id !== -1) this.callRename(real_id, pl_idx);
				};
				
				if (this.buttonClicked && this.new_menu.checkstate("up", x, y) == ButtonStates.hover) {
					this.context_menu(Math.round(ww - 2*brw.images.topbar_btn.Width), ppt.SearchBarHeight - 3*zdpi, null, true);
					this.new_menu.state = ButtonStates.normal;
					this.new_menu.repaint();
				}
				this.buttonClicked = false;

				if (this.inputboxID >= 0) {
					this.inputbox.check("up", x, y);
				} else {
					// drop playlist switch
					if(this.actionRows.indexOf(this.activeRow) > -1) {
						if((!utils.IsKeyPressed(VK_SHIFT) && !utils.IsKeyPressed(VK_CONTROL)) || !cPlaylistManager.drag_clicked) {
							this.actionRows.splice(0, this.actionRows.length);
							if(!this.rows[this.activeRow].islocked) this.actionRows.push(this.activeRow);
							if (this.rows[this.activeRow].idx >= 0 && plman.ActivePlaylist != this.rows[this.activeRow].idx) {
								plman.ActivePlaylist = this.rows[this.activeRow].idx;
							};
							this.repaint();
						}
					}
					this.actionRows.sort(function(a,b){return a - b});
					if (cPlaylistManager.drag_target_id > (ppt.lockReservedPlaylist ? 0 : -1)) {
						if (this.actionRows.indexOf(cPlaylistManager.drag_target_id) < 0) {
							cPlaylistManager.drag_droped = true;
							// ===== 修复：根据目标位置上下文直接判断是否出组（在 MovePlaylist 之前） =====
							var targetIsRoot = false; // 目标是否为根级位置（level=0）
							var tgtId = cPlaylistManager.drag_target_id;
							if (tgtId >= 0 && tgtId < this.rows.length) {
								var tgtRow = this.rows[tgtId];
								if (tgtRow.isGroup) {
									// 目标是虚拟分组行（插入到分组上方/下方热区）→ 根级
									targetIsRoot = true;
								} else {
									// 目标是普通列表行：level=0 → 根级；level=1 → 分组内
									targetIsRoot = (tgtRow.level === 0);
								}
							} else if (tgtId === this.rowsCount || tgtId > this.rows.length) {
								// 末尾位置 → 根级（独立列表）
								targetIsRoot = true;
							}

							var movedItems = [];
						var needSaveGroup = false;
						var needSaveIndep = false;
						var emptiedGroupIds = []; // 本次拖到根级而失去成员的分组 id
						var movedGuidsForAnchor = [];
						for (var i = 0; i < this.actionRows.length; i++) {
							var row = this.rows[this.actionRows[i]];
							if (row.idx < 0 || row.isGroup) continue; // 跳过虚拟群头
							var guid = plman.GetGUID(row.idx);
							var wasInGroup = (row.level > 0); // 原来是分组成员

							if (targetIsRoot && wasInGroup) {
								// 从分组拖到根级位置：清除 GroupMap 映射 + 加入 independent_lists（GUID）
								// 记录源分组，若因此清空则补锚点（保持分组原位而非掉到末尾）
								var srcGroupId = GroupMap[guid];
								if (srcGroupId && emptiedGroupIds.indexOf(srcGroupId) === -1) {
									emptiedGroupIds.push(srcGroupId);
								}
								movedGuidsForAnchor.push(guid);
								delete GroupMap[guid];
								needSaveGroup = true;
							} else if (!targetIsRoot && !wasInGroup) {
								// 独立列表拖进分组内部（拖到某 level=1 行的位置）：
								// Hard Constraint: ROOT_PLAYLISTS 永远不进入任何分组
								if (nonGrouped.indexOf(row.name) > -1) {
									// 跳过，保持独立
									fb.ShowPopupMessage("操作未完成或被调整\n-------------------------\n该播放列表被保留，不能移入分组.", "提示");
								} else {
									// 根据目标行的分组归属加入 GroupMap，并从 independent_lists 移除
									var tgtRowLocal = tgtId >= 0 && tgtId < this.rows.length ? this.rows[tgtId] : null;
									if (tgtRowLocal && !tgtRowLocal.isGroup && tgtRowLocal.level > 0 && tgtRowLocal.groupId) {
										GroupMap[guid] = tgtRowLocal.groupId;
										needSaveGroup = true;
									}
								}
							}
								movedItems.push({ idx: row.idx, guid: guid });
							}
							if (needSaveGroup/* || needSaveIndep*/) {
								save_gdata();
							}
							// 保存被移动行 GUID，供移动后保护末尾根级位置用
							var movedGuidsForRoot = targetIsRoot ? movedItems.slice() : [];
							// =====================================================================

							// ===== 关键修复：把 drag_target_id（UI行号）解析成真实的 plman 目标索引 =====
							// 虚拟分组行 idx === -1，直接传给 MovePlaylist 会失效！
							// calcInsertIdx 契约（见 project_memory）：
							//   group above = 分组成员块首 idx；group below = 成员块尾 idx + 1
							//   普通列表 above = 列表 idx；普通列表 below = 列表 idx + 1
							//   末尾/越界 = plman.PlaylistCount
							(function resolveTarget(){
								var tId = cPlaylistManager.drag_target_id;
								// 越界或末尾：追加到最后
								if (tId < 0 || tId >= brw.rows.length) {
									cPlaylistManager.drag_target_plidx = plman.PlaylistCount;
									return;
								}
								var tRow = brw.rows[tId];
								if (!tRow) { cPlaylistManager.drag_target_plidx = plman.PlaylistCount; return; }
								if (tRow.isGroup) {
									// 虚拟分组：落位锚点 useAbove 与绘制端的画线端采用同一口径（目标相对源的整体前后），
									// 保证"眼睛看到的线在哪一端"和"释放后落下的位置"严格一致。
									// 三段式热区仍保留语义：上1/4 和 下1/4 → 插入模式；中2/4 → 拖入分组
									var members = getGroupMemberIndices(tRow.groupId);
									// 统一锚定源：拖的是分组块用 drag_group_rowId，否则用 actionRows[0]
									var srcAnchor2 = -1;
									if (cPlaylistManager.drag_is_group) {
										srcAnchor2 = cPlaylistManager.drag_group_rowId;
									} else if (brw.actionRows.length > 0) {
										srcAnchor2 = brw.actionRows[0];
									}
									var useAbove = false;
									if (srcAnchor2 >= 0) {
										useAbove = (tId < srcAnchor2);
									} else {
										useAbove = cPlaylistManager.drag_above; // fallback
									}
									if (members.length > 0) {
										cPlaylistManager.drag_target_plidx = useAbove ? members[0] : (members[members.length - 1] + 1);
									} else {
										// 空分组：用相邻真实列表作锚
										var anchorAbove = -1;
										var anchorBelow = -1;
										for (var s = tId - 1; s >= 0; s--) {
											var r = brw.rows[s];
											if (r && !r.isGroup && r.idx >= 0) { anchorAbove = r.idx; break; }
										}
										for (var s2 = tId + 1; s2 < brw.rows.length; s2++) {
											var r2 = brw.rows[s2];
											if (r2 && !r2.isGroup && r2.idx >= 0) { anchorBelow = r2.idx; break; }
										}
										if (useAbove) {
											cPlaylistManager.drag_target_plidx = (anchorAbove !== -1) ? (anchorAbove + 1) : (anchorBelow !== -1 ? anchorBelow : plman.PlaylistCount);
										} else {
											cPlaylistManager.drag_target_plidx = (anchorBelow !== -1) ? anchorBelow : (anchorAbove !== -1 ? (anchorAbove + 1) : plman.PlaylistCount);
										}
									}
								} else {
									// 普通真实列表：用"drag_target_id 与 actionRows[0] 相对大小"推断方向（和绘制端一致，保持视觉-落位同步）
									//   drag_target_id < actionRows[0] → 目标在源之前 → 插到目标行之上（above）
									//   drag_target_id > actionRows[0] → 目标在源之后 → 插到目标行之下（below）
									var inferredAbove = true;
									if (brw.actionRows.length > 0) {
										var firstSrcRow = brw.actionRows[0];
										if (tId > firstSrcRow) inferredAbove = false;
										else if (tId === firstSrcRow) inferredAbove = true;
									}
									cPlaylistManager.drag_target_plidx = inferredAbove ? tRow.idx : (tRow.idx + 1);
								}
							})();
							var origDragTargetPlidx = cPlaylistManager.drag_target_plidx;

							// ===== 执行移动（稳定 GUID 版）=====
							// 先收集所有真实源的 GUID 和原始 plman idx
							var movePlan = [];
							for (var i = 0; i < this.actionRows.length; i++) {
								var row = this.rows[this.actionRows[i]];
								if (!row || row.idx < 0 || row.isGroup) continue;
								movePlan.push({ guid: plman.GetGUID(row.idx), origIdx: row.idx });
							}
							// 排序：目标位置在源之前（origIdx > origDragTargetPlidx）→ 按 origIdx 升序处理
							//       目标位置在源之后（origIdx < origDragTargetPlidx）→ 按 origIdx 降序处理
							// 避免移动过程中目标位置相对于未处理元素漂移
							var targetBeforeAll = movePlan.every(function (m) { return m.origIdx > origDragTargetPlidx; });
							var targetAfterAll = movePlan.every(function (m) { return m.origIdx < origDragTargetPlidx; });
							if (targetBeforeAll) {
								movePlan.sort(function (a, b) { return a.origIdx - b.origIdx; });
							} else if (targetAfterAll) {
								movePlan.sort(function (a, b) { return b.origIdx - a.origIdx; });
							}
							// 逐个移动：每次重查 GUID 找当前 plman idx，移到当前目标位置
							var currentTarget = origDragTargetPlidx;
							for (var ii = 0; ii < movePlan.length; ii++) {
								var curSrcIdx = -1;
								for (var jj = 0; jj < plman.PlaylistCount; jj++) {
									if (plman.GetGUID(jj) === movePlan[ii].guid) { curSrcIdx = jj; break; }
								}
								if (curSrcIdx === -1) continue;
								// 源在目标之前（curSrcIdx < currentTarget）→ 弹出源会让锚点前移一位，插入位 = 锚点 - 1
								var movingUp = (curSrcIdx < currentTarget);
								var tgt = movingUp ? currentTarget - 1 : currentTarget;
								if (curSrcIdx !== tgt && tgt >= 0 && tgt <= plman.PlaylistCount) {
									plman.MovePlaylist(curSrcIdx, tgt);
								}
								// 锚点推进方向必须与 movePlan 的处理顺序一致，否则多选块会被逐个倒插成逆序：
								// 降序（目标在所有源之后）→ 逐个插到上一个元素之前，锚点 = 本次插入位
								// 升序（目标在所有源之前）→ 逐个插到上一个元素之后，锚点 = 本次插入位 + 1
								currentTarget = movingUp ? tgt : tgt + 1;
							}
						// 出组导致源分组清空：按当前渲染位置补锚点，让空分组留在原位
						// （必须在 populate 之前调用：此时行结构还是移动前的，邻居查找准确）
						if (emptiedGroupIds.length > 0) {
							for (var eg = 0; eg < emptiedGroupIds.length; eg++) {
								var egId = emptiedGroupIds[eg];
								var stillHas = false;
								for (var gmKey in GroupMap) {
									if (GroupMap[gmKey] === egId) { stillHas = true; break; }
								}
								if (!stillHas) {
									var egRow = -1;
									for (var er = 0; er < this.rows.length; er++) {
										if (this.rows[er].isVGroup && this.rows[er].groupId === egId) { egRow = er; break; }
									}
									if (egRow !== -1) setAnchorForGroupOnEmpty(egRow, movedGuidsForAnchor);
								}
							}
						}
						// 最终刷新显示
						brw.populate(true);
						// 修复：行集重建后按 GUID 重新定位选中项，避免高亮错位到占位列表上
						remapSelectionByGuids(movePlan);
						brw.repaint();
						}
					}
				};
				stopAutoScrollTimer();
			};

			this.down = false;

			if (cPlaylistManager.drag_moved) window.SetCursor(IDC_ARROW);

			cPlaylistManager.drag_clicked = false;
			cPlaylistManager.drag_moved = false;
			cPlaylistManager.drag_target_id = -1;
			break;
		case "dblclk":
			if (this.ishover && this.activeRow > -1 && Math.abs(scroll - scroll_) < 2) {
				if (this.rows[this.activeRow].idx >= 0) {
					var focus_item = plman.GetPlaylistFocusItemIndex(plman.ActivePlaylist);
					if(focus_item > -1)
						plman.ExecutePlaylistDefaultAction(this.rows[this.activeRow].idx, focus_item);
					else
						plman.ExecutePlaylistDefaultAction(this.rows[this.activeRow].idx, 0);
				}
			}
			else {
				if (cScrollBar.visible) {
					brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
				};
			};
			break;
		case "move":
			this.up = false;
			if (this.inputboxID >= 0) {
				this.inputbox.check("move", x, y);
			}
			else {
			if (cPlaylistManager.drag_clicked) {
				// 拖拽阈值：与分组拖拽的 dist < 5 判定保持同一口径，
				// 否则按下后手抖 1px 就会被当作重排（原来 move 一下就置 drag_moved）
				var ddx = x - cPlaylistManager.drag_start_x;
				var ddy = y - cPlaylistManager.drag_start_y;
				if (Math.sqrt(ddx * ddx + ddy * ddy) >= 5) {
					cPlaylistManager.drag_moved = true;
				}
			};
				if (cPlaylistManager.drag_moved) {
					if (this.activeRow > -1) {
					stopAutoScrollTimer();
						// --- [新增] 检测是否拖拽到分组上方（加入分组） -分组行区域划分：上1/4、中2/4、下1/4 ---
						var targetRow = this.rows[this.activeRow];
						var isGroup = targetRow && targetRow.isGroup;
						if (isGroup) {
							var relY = y - targetRow.y;
							var quarter = ppt.rowHeight / 4;
							if (relY >= quarter && relY < 3 * quarter) {
								// 中间 2/4：加入分组
								cPlaylistManager.drag_into_group = true;
								cPlaylistManager.drag_into_group_rowId = this.activeRow;
								cPlaylistManager.drag_target_id = -1; // 不显示高亮线
								cPlaylistManager.drag_above = false; // 重置
							} else {
								// 上1/4 或 下1/4：普通插入
								cPlaylistManager.drag_into_group = false;
								cPlaylistManager.drag_into_group_rowId = -1;
								cPlaylistManager.drag_target_id = this.activeRow;
								cPlaylistManager.drag_above = (relY < quarter); // 上1/4为 true，下1/4为 false
							}
						} else {
							// 非分组：普通真实列表
							// drag_above 不用半高热区分段判定（否则会和分组行的 1/4/3/4 翻边阈值不一致，导致跨行跳变）
							// 画线端统一走"drag_target_id 与源锚相对前后"的锚定算法（绘制端和 resolveTarget 都一致）
							cPlaylistManager.drag_into_group = false;
							cPlaylistManager.drag_into_group_rowId = -1;
							cPlaylistManager.drag_above = false;
							if (this.actionRows.indexOf(this.activeRow) < 0) {
								cPlaylistManager.drag_target_id = this.activeRow;
							}
							// rowsCount 为 0 时 rows[-1] 是 undefined，取 .y 会抛异常并挂掉面板
					else if (this.rowsCount > 0 && y > this.rows[this.rowsCount - 1].y + ppt.rowHeight && y < this.rows[this.rowsCount - 1].y + ppt.rowHeight * 2) {
								cPlaylistManager.drag_target_id = this.rowsCount;
								cPlaylistManager.drag_above = false;
							}
							else {
								cPlaylistManager.drag_target_id = -1;
							}
						}
					}
					else {
						cPlaylistManager.drag_into_group = false;
						cPlaylistManager.drag_into_group_rowId = -1;
						cPlaylistManager.drag_above = false;
						if (y < this.y) {
							if (!timers.movePlaylist) {
									timers.movePlaylist = window.SetInterval(function() {
										scroll -= ppt.rowHeight;
										scroll = check_scroll(scroll);
										// 修正：drag_target_id=-1 表示无目标，不映射为 0；this.rowsCount 捕获为局部变量
										var rowsCount = brw.rowsCount;
										cPlaylistManager.drag_target_id = cPlaylistManager.drag_target_id > -1 ? cPlaylistManager.drag_target_id - 1 : -1;
									}, 100);
								}
						}
						else if (y > this.y + this.h) {
							if (!timers.movePlaylist) {
									timers.movePlaylist = window.SetInterval(function() {
										scroll += ppt.rowHeight;
										scroll = check_scroll(scroll);
										// 修正：this.rowsCount 捕获为局部变量
										var rowsCount = brw.rowsCount;
										cPlaylistManager.drag_target_id = cPlaylistManager.drag_target_id < rowsCount - 1 ? cPlaylistManager.drag_target_id + 1 : rowsCount - 1;
									}, 100);
								}
						};
					};
					brw.repaint();
				};
			};

			// scrollbar
			if (cScrollBar.visible) {
				brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
			};

			this.new_bt.checkstate("move", x, y);
			this.new_menu.checkstate("move", x, y);
			break;
		case "right":
			if (this.inputboxID >= 0) {
				if (!this.inputbox.hover) {
					this.inputboxID = -1;
					this.on_mouse("right", x, y);
				}
				else {
					this.inputbox.check("right", x, y);
				};
			}
			else {
				if (this.ishover) {
					if (this.activeRow > -1 && Math.abs(scroll - scroll_) < 2) {
						if(this.actionRows.indexOf(this.activeRow) < 0){
							this.actionRows.splice(0, this.actionRows.length);
							if(!this.rows[this.activeRow].islocked) this.actionRows.push(this.activeRow);
						}
					}
					this.context_menu(x, y, this.activeRow);
				}
				else {
					if (cScrollBar.visible) {
						brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
					};
				};
			};
			break;
		case "leave":
			this.new_bt.checkstate("leave", x, y);
			this.check_leavemenu();
			// scrollbar
			if (cScrollBar.visible) {
				this.scrollbar && this.scrollbar.on_mouse(event, 0, 0);
			};
		// --- 重置所有拖拽状态，防止残留 ---
		cPlaylistManager.drag_target_id = -1;
		cPlaylistManager.drag_is_group = false;
		cPlaylistManager.drag_clicked = false;
		cPlaylistManager.drag_moved = false;
		cPlaylistManager.drag_group_rowId = -1;
		// 这三个漏掉会导致：拖出面板再拖回来松手时，用残留的旧分组执行 movePlaylistsToGroup
		cPlaylistManager.drag_into_group = false;
		cPlaylistManager.drag_into_group_rowId = -1;
		cPlaylistManager.drag_above = false;
		// 边缘自动滚动定时器：拖出面板时不会被 up 分支清掉，会一直滚
			stopAutoScrollTimer();
		break;
		case "drag_over":
			if (this.rows.length > 0) {
				if (y > brw.y) {
					if (this.activeRow > -1 && this.rows[this.activeRow].idx >= 0) {
						if (this.rows[this.activeRow].isAutoPlaylist) {
							g_dragndrop_targetPlaylistId = -2;
						}
						else {
							g_dragndrop_targetPlaylistId = this.rows[this.activeRow].idx;//this.activeRow;
						};
					}
					else {
						g_dragndrop_targetPlaylistId = -1;
					};
				} else if(y > ppt.headerBarHeight) g_dragndrop_targetPlaylistId = -1;
			}
			else {
				g_dragndrop_bottom = true;
				g_dragndrop_trackId = 0;
				g_dragndrop_rowId = 0;
			};
			break;
		};
	};

//  ----------------------------------------------------

	if (this.g_time) {
		window.ClearInterval(this.g_time);
		this.g_time = false;
	};
	this.g_time = window.SetInterval(function() {
		if (!window.IsVisible) {
			window_visible = false;
			return;
		};

		var repaint_1 = false;

		if (!window_visible) {
			window_visible = true;
		};

		if (!g_first_populate_launched) {
			g_first_populate_launched = true;
			brw.launch_populate();
		};

		if (repaint_main1 == repaint_main2) {
			repaint_main2 = !repaint_main1;
			repaint_1 = true;
		};

		scroll = check_scroll(scroll);
		if (Math.abs(scroll - scroll_) >= 1) {
			scroll_ += (scroll - scroll_) / ppt.scrollSmoothness;
			repaint_1 = true;
			isScrolling = true;
			//
			if (scroll_prev != scroll) brw.scrollbar.updateScrollbar();
		}
		else {
			if (isScrolling) {
				if (scroll_ < 1) scroll_ = 0;
				isScrolling = false;
				repaint_1 = true;
			};
		};

		if (repaint_1) {
			if (brw.rows.length > 0) brw.getlimits();
			repaintforced = true;
			repaint_main = true;
			window.Repaint();
		};
		scroll_prev = scroll;
	}, ppt.refreshRate);
	
	this.check_leavemenu = function(){
		var _state = this.new_menu.state;
		if(this.buttonClicked && _state == ButtonStates.hover) this.buttonClicked = false;
		else this.new_menu.state = ButtonStates.normal;
		if(this.new_menu.state != _state) this.new_menu.repaint();
	}

	this.context_menu = function(x, y, id, setting_mode) {
		var _menu = window.CreatePopupMenu();
		var _newplaylist = window.CreatePopupMenu();
		var _autoplaylist = window.CreatePopupMenu();
		var _options = window.CreatePopupMenu();
		var PLRecManager = plman.PlaylistRecycler;
		var _restorepl = window.CreatePopupMenu();
		var _radiolist = window.CreatePopupMenu();
		var idx;
		var total_area, visible_area;
		var bout, z;
		var add_mode = (id == null || id < 0);
		var total = plman.PlaylistCount;
		
		if(setting_mode){
			_menu.AppendMenuItem(MF_STRING, 21, "列表中搜索");
			_menu.AppendMenuItem(MF_STRING, 22, "媒体库搜索");
			_menu.CheckMenuRadioItem(21, 22, ppts.source + 20);
			_menu.AppendMenuSeparator();
	
			var SearchHistoryMenu = window.CreatePopupMenu();
			var SearchOptionMenu = window.CreatePopupMenu();

			for (var i = g_searchbox.historylist.length - 1; i >= 0; i--) {
				SearchHistoryMenu.AppendMenuItem(MF_STRING, i + 51, g_searchbox.historylist[i][0].replace("&", "&&"));
			}
			if (g_searchbox.historylist.length == 0) {
				SearchHistoryMenu.AppendMenuItem(MF_GRAYED, 40, "无记录");
			} else {
				SearchHistoryMenu.AppendMenuSeparator();
				SearchHistoryMenu.AppendMenuItem(MF_STRING, ppts.historymaxitems + 60, "清除记录");
			}

			SearchHistoryMenu.AppendTo(_menu, MF_STRING, "搜索记录");

			if (ppts.source == 1) {
				_menu.AppendMenuItem(MF_STRING, 1, "启用自动搜索");
				_menu.CheckMenuItem(1, ppts.autosearch ? 1 : 0);
				SearchOptionMenu.AppendMenuItem(MF_STRING, 2, "搜索:智能");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 3, "搜索:艺术家");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 4, "搜索:专辑");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 5, "搜索:标题");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 6, "搜索:流派");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 7, "搜索:日期");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 8, "搜索:文件名");
				SearchOptionMenu.AppendMenuSeparator();
				SearchOptionMenu.AppendMenuItem(MF_STRING, 9, "搜索:注释");
				SearchOptionMenu.CheckMenuRadioItem(2, 9, ppts.scope + 2);

			} else if (ppts.source == 2) {
				var now_playing_track = ppts.followcursor ? fb.GetFocusItem() : (fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem());
				var quickSearchMenu = window.CreatePopupMenu();
				quickSearchMenu.AppendMenuItem(MF_STRING, 35, "相同标题");
				quickSearchMenu.AppendMenuItem(MF_STRING, 36, "相同艺术家");
				quickSearchMenu.AppendMenuItem(MF_STRING, 37, "相同专辑");
				quickSearchMenu.AppendMenuItem(MF_STRING, 38, "相同流派");
				quickSearchMenu.AppendMenuItem(MF_STRING, 39, "相同日期");
				quickSearchMenu.AppendMenuSeparator();
				quickSearchMenu.AppendMenuItem(MF_STRING, 30, "跟随播放");
				quickSearchMenu.AppendMenuItem(MF_STRING, 31, "跟随光标");
				quickSearchMenu.CheckMenuRadioItem(30, 31, ppts.followcursor + 30);
				quickSearchMenu.AppendTo(_menu, MF_STRING, "快速搜索...");
				_menu.AppendMenuItem(MF_STRING, 27, "保留之前的搜索列表");
				_menu.CheckMenuItem(27, ppts.multiple ? 1 : 0);
				SearchOptionMenu.AppendMenuItem(MF_STRING, 2, "搜索:智能");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 3, "搜索:艺术家");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 4, "搜索:专辑");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 5, "搜索:标题");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 6, "搜索:流派");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 7, "搜索:日期");
				SearchOptionMenu.AppendMenuItem(MF_STRING, 8, "搜索:文件名");
				SearchOptionMenu.AppendMenuSeparator();
				SearchOptionMenu.AppendMenuItem(MF_STRING, 9, "搜索:注释");
				SearchOptionMenu.CheckMenuRadioItem(2, 9, ppts.scope + 2);
			}
			SearchOptionMenu.AppendTo(_menu, MF_STRING, "搜索范围");
			_menu.AppendMenuSeparator();
		}
		
		if (!add_mode) {
			_menu.AppendMenuItem(this.rows[id].islocked ? MF_DISABLED : MF_STRING, 10, "移除");
			_menu.AppendMenuSeparator();
			_menu.AppendMenuItem(this.rows[id].islocked ? MF_DISABLED : MF_STRING, 11, "重命名");
			_menu.AppendMenuItem(MF_STRING, 12, "复制");
            
            // --- 分组与独立状态菜单 ---
			if (this.rows[id].isGroup) {
				_menu.AppendMenuSeparator();
				_menu.AppendMenuItem(MF_STRING, 100, "分组列表 上移");
				_menu.AppendMenuItem(MF_STRING, 101, "分组列表 下移");
				_menu.AppendMenuSeparator();
				// 添加排序子菜单
				var sortSubMenu = window.CreatePopupMenu();
				sortSubMenu.AppendMenuItem(MF_STRING, 104, "按名称排序 (A→Z)");
				sortSubMenu.AppendMenuItem(MF_STRING, 105, "按名称排序 (Z→A)");
				sortSubMenu.AppendMenuItem(MF_STRING, 106, "按曲目数量排序 (升序)");
				sortSubMenu.AppendMenuItem(MF_STRING, 107, "按曲目数量排序 (降序)");
				sortSubMenu.AppendMenuItem(MF_STRING, 108, "随机排序");
				sortSubMenu.AppendTo(_menu, MF_STRING, "排序子列表");
			}
            
			if (this.rows[id].idx >= 0 && plman.IsAutoPlaylist(this.rows[id].idx)) {
				_menu.AppendMenuSeparator();
				_menu.AppendMenuItem(MF_STRING, 13, "智能列表属性...");
				_menu.AppendMenuItem(this.rows[id].islocked ? MF_DISABLED : MF_STRING, 14, "转换为普通列表");
			}
			_menu.AppendMenuSeparator();

			// --- [新增] 多选加入分组 / 移出分组 ---
			var selectedRows = (this.actionRows.length > 0) ? this.actionRows : [id];
			// 检查选中的行是否包含分组（分组不可移动）
			var hasGroup = false;
			var hasSub = false;
			for (var ri = 0; ri < selectedRows.length; ri++) {
				var r = this.rows[selectedRows[ri]];
				if (r.isGroup) { hasGroup = true; break; }
				if (r.level > 0) hasSub = true;
			}
			if (!hasGroup) {
				// 如果选中的都是非分组列表
				// 先添加“移出分组”选项（如果选中的列表中有子列表）
				if (hasSub) {
				_menu.AppendMenuItem(MF_STRING, 102, "移出分组");
			}
				// 添加“移到分组”子菜单，列出所有分组
				var groupMenu = window.CreatePopupMenu();
				var groupCount = 0;
				for (var gi = 0; gi < this.rows.length; gi++) {
					if (this.rows[gi].isGroup) {
						// 使用 getBlockCount 计算实际子列表数量，不受折叠影响
						var subCount = getGroupMemberCount(this.rows[gi].groupId);
						var displayName = this.rows[gi].name + " [" + subCount + "]";
						groupMenu.AppendMenuItem(MF_STRING, 500 + gi, displayName);
						groupCount++;
					}
				}
				if (groupCount > 0) {
					groupMenu.AppendMenuSeparator();
					groupMenu.AppendMenuItem(MF_STRING, 103, "新建分组并移入");
					groupMenu.AppendTo(_menu, MF_STRING, "移到分组");
				} else {
					// 如果没有分组，只显示"新建分组并移入"
					_menu.AppendMenuItem(MF_STRING, 103, "新建分组并移入");
				}
			}
			// ----------
		}

		if (!add_mode) {
			var pl_idx = this.rows[id].idx;
			var newPlGroup = -1;
			if (pl_idx === -1 && this.rows[id].isVGroup) {
				// 分组行没有真实列表索引：计算组内插入位置（锚点算法同 movePlaylistsToGroup）
				newPlGroup = this.rows[id].groupId;
				var grpMembers = getGroupMemberIndices(newPlGroup);
				if (grpMembers.length > 0) {
					pl_idx = grpMembers[grpMembers.length - 1] + 1;
				} else {
					// 空分组：优先插到分组下方第一个真实列表之前，否则上方最近真实列表之后，否则列表末尾
					var anchorBelow = -1;
					for (var gmi = id + 1; gmi < this.rowsCount; gmi++) {
						if (!this.rows[gmi].isGroup && this.rows[gmi].idx >= 0) { anchorBelow = this.rows[gmi].idx; break; }
					}
					if (anchorBelow !== -1) {
						pl_idx = anchorBelow;
					} else {
						var anchorAbove = -1;
						for (var gmj = id - 1; gmj >= 0; gmj--) {
							if (!this.rows[gmj].isGroup && this.rows[gmj].idx >= 0) { anchorAbove = this.rows[gmj].idx; break; }
						}
						pl_idx = (anchorAbove !== -1) ? anchorAbove + 1 : total;
					}
				}
			}
			_newplaylist.AppendTo(_menu, (g_filterbox.inputbox.text.length > 0 ? MF_GRAYED | MF_DISABLED : MF_STRING), "插入列表/分组...");
		}
		else {
			id = this.rowsCount;
			var pl_idx = total;
			var newPlGroup = -1;
			_newplaylist.AppendTo(_menu, (g_filterbox.inputbox.text.length > 0 ? MF_GRAYED | MF_DISABLED : MF_STRING), "添加列表/分组...");
			_menu.AppendMenuItem(MF_STRING, 162, "编辑不可分组的播放列表");
		};
        _newplaylist.AppendMenuItem(MF_STRING, 112, "新建分组");
		_newplaylist.AppendMenuSeparator();
		_newplaylist.AppendMenuItem(MF_STRING, 110, "新建播放列表");
		_newplaylist.AppendMenuItem(MF_STRING, 111, "新建智能列表");
		_autoplaylist.AppendTo(_newplaylist, MF_STRING, "预设智能列表");
		_autoplaylist.AppendMenuItem(MF_STRING, 150, "媒体库 (完整)");
		_autoplaylist.AppendMenuItem(MF_STRING, 151, "未播放过的音轨");
		_autoplaylist.AppendMenuItem(MF_STRING, 152, "历史记录 (一个星期内播放过的音轨)");
		_autoplaylist.AppendMenuItem(MF_STRING, 153, "最常播放的音轨");
		_autoplaylist.AppendMenuItem(MF_STRING, 154, "最近添加的音轨");
		_autoplaylist.AppendMenuSeparator();
		_autoplaylist.AppendMenuItem(MF_STRING, 155, "喜爱的音轨");
		_autoplaylist.AppendMenuSeparator();
		_autoplaylist.AppendMenuItem(MF_STRING, 156, "音轨评级为 5");
		_autoplaylist.AppendMenuItem(MF_STRING, 157, "音轨评级为 4");
		_autoplaylist.AppendMenuItem(MF_STRING, 158, "音轨评级为 3");
		_autoplaylist.AppendMenuItem(MF_STRING, 159, "音轨评级为 2");
		_autoplaylist.AppendMenuItem(MF_STRING, 160, "音轨评级为 1");
		_autoplaylist.AppendMenuItem(MF_STRING, 161, "音轨未评级");
		_radiolist.AppendTo(_newplaylist, MF_STRING, "网络电台列表");
		_radiolist.AppendMenuItem(MF_STRING, 29, "编辑电台列表地址");
		_radiolist.AppendMenuSeparator();
		if(radioname.length > 0){
			for(var i = 0; i < radioname.length; i++){
				_radiolist.AppendMenuItem(MF_STRING, 200 + i, radioname[i]);
			}
		}
		
		// --- 文件操作菜单：仅当空白处或非分组列表时显示 ---
		if (add_mode || (this.rows[id] && !this.rows[id].isGroup)) {
			_menu.AppendMenuSeparator();
			_menu.AppendMenuItem(MF_STRING, 15, "载入播放列表");
			_menu.AppendMenuItem(MF_STRING, 16, "保存所有播放列表");
			if (!add_mode) {
				_menu.AppendMenuItem(MF_STRING, 17, "保存播放列表");
				_menu.AppendMenuSeparator();
				_restorepl.AppendTo(_menu, PLRecManager.Count >= 1 ? MF_STRING : MF_GRAYED | MF_DISABLED, "列表记录");
				if (PLRecManager.Count >= 1) {
					for (var irm = 0; irm < PLRecManager.Count; irm++) {
						_restorepl.AppendMenuItem(MF_STRING, 901 + irm, PLRecManager.GetName(irm));
					}
					_restorepl.AppendMenuItem(MF_SEPARATOR, 0, 0);
					_restorepl.AppendMenuItem(MF_STRING, 900, "清除列表记录");
				}
				if (this.rows[id].idx >= 0 && !plman.IsAutoPlaylist(this.rows[id].idx)) {
					_menu.AppendMenuSeparator();
					var plc = (this.rows[id].idx >= 0) ? plman.PlaylistItemCount(this.rows[id].idx) : 0;
					_menu.AppendMenuItem((plc >= 1) ? MF_STRING : MF_GRAYED | MF_DISABLED, 18, "清空列表");
					_menu.AppendMenuItem((plc >= 1) ? MF_STRING : MF_GRAYED | MF_DISABLED, 19, "移除重复项");
					_menu.AppendMenuItem((plc >= 1) ? MF_STRING : MF_GRAYED | MF_DISABLED, 20, "移除无效项");
				}
			}
		}
		
		if(setting_mode){
			_menu.AppendMenuSeparator();
			_options.AppendTo(_menu, MF_STRING, "面板选项");
			_options.AppendMenuItem(MF_STRING, 23, "删除播放列表需确认");
			_options.CheckMenuItem(23, ppt.confirmRemove);
			_options.AppendMenuSeparator();
			_options.AppendMenuItem(MF_STRING, 24, "显示过滤栏");
			_options.CheckMenuItem(24, ppt.showFilter);
			_options.AppendMenuItem(MF_STRING, 25, "显示网格线");
			_options.CheckMenuItem(25, ppt.showGrid);
			_options.AppendMenuItem(MF_STRING, 26, "面板属性");
		}
		idx = _menu.TrackPopupMenu(x, y);

		switch (true) {
		case (idx == 1):
			ppts.autosearch = !ppts.autosearch;
			g_searchbox.inputbox.autovalidation = ppts.autosearch;
			window.SetProperty("Search Box: Auto-validation", ppts.autosearch);
			break;
		case (idx >= 2 && idx <= 9):
			ppts.scope = idx - 2;
			window.SetProperty("Search Box: Scope", ppts.scope);
			break;
		case (idx == 27):
			ppts.multiple = !ppts.multiple;
			window.SetProperty("Search Box: Keep Playlist", ppts.multiple);
			break;
		case (idx >= 21 && idx <= 22):
			window.SetProperty("Search Source", ppts.source = idx - 20);
			g_searchbox.inputbox.autovalidation = (ppts.source > 1) ? false : ppts.autosearch;
			g_searchbox.inputbox.empty_text = (ppts.source == 1) ? "搜索当前列表" : "搜索媒体库";
			g_searchbox.repaint();
			break;
		case (idx == 30):
			ppts.followcursor = 0;
			window.SetProperty("Quick Search: Follow Cursor", ppts.followcursor);
			break;
		case (idx == 31):
			ppts.followcursor = 1;
			window.SetProperty("Quick Search: Follow Cursor", ppts.followcursor);
			break;
		case (idx == 35):
			quickSearch(now_playing_track, "title");
			break;
		case (idx == 36):
			quickSearch(now_playing_track, "artist");
			break;
		case (idx == 37):
			quickSearch(now_playing_track, "album");
			break;
		case (idx == 38):
			quickSearch(now_playing_track, "genre");
			break;
		case (idx == 39):
			quickSearch(now_playing_track, "date");
			break;
		case (idx >= 51 && idx <= ppts.historymaxitems + 51):
			g_searchbox.inputbox.text = g_searchbox.historylist[idx - 51][0];
			g_searchbox.on_char();
			g_searchbox.repaint();
			break;
		case (idx == ppts.historymaxitems + 60):
			g_searchbox.historyreset();
			break;
		case (idx == 29):
			utils.EditTextFile(radiolist);
			break;
		case (idx >= 200 && idx < 200 + radiom3u.length):
			LoadRadio("网络电台", radiom3u[idx - 200]);
			break;
            
        // --- 分组与新建逻辑 ---
		case (idx == 112): {
			var uniqueName = getUniqueGroupName("新分组");
			var newGroupId = "grp_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
			// 新建空分组：若从某行右键发起，锚定到该行相邻列表（贴近操作位置；空白区发起则无锚点，按旧版落末尾）
			if (id >= 0 && id < this.rows.length) {
				var selfRow112 = this.rows[id];
				if (selfRow112 && !selfRow112.isGroup && selfRow112.idx >= 0) {
					Groups.push({ id: newGroupId, name: uniqueName, collapsed: false, anchor: { guid: plman.GetGUID(selfRow112.idx), pos: "above" } });
				} else {
					Groups.push({ id: newGroupId, name: uniqueName, collapsed: false });
				}
			} else {
				Groups.push({ id: newGroupId, name: uniqueName, collapsed: false });
			}
			save_gdata();
			var selSnap102 = snapshotSelectionGuids();
			brw.populate(false);
			// 插入分组头会把后面的行号整体推后，选中必须按 GUID 还原，否则错位到别的列表上
			remapSelectionByGuids(selSnap102, true);
			// 查找新分组行号
			var real_id = -1;
			for (var k = 0; k < brw.rows.length; k++) {
				if (brw.rows[k].isVGroup && brw.rows[k].groupId === newGroupId) { real_id = k; break; }
			}
			if (real_id !== -1) brw.callRename(real_id, -1);
			break;
		}
		case (idx == 110): {
			plman.CreatePlaylist(total, "");
			plman.MovePlaylist(total, pl_idx);
			var newGuid110 = plman.GetGUID(pl_idx);
			if (newPlGroup !== -1) {
				// 插入到分组内：写入 GroupMap 归入该分组
				GroupMap[newGuid110] = newPlGroup;
				save_gdata();
			}
			plman.ActivePlaylist = pl_idx;
			brw.populate(false);
			var real_id = brw.getRowIdFromIdx(pl_idx);
			if (real_id !== -1) brw.callRename(real_id, pl_idx);
			break;
		}
		case (idx == 111): {
			plman.CreateAutoPlaylist(total, "", "在这里输入你的查询", "", 0);
			plman.MovePlaylist(total, pl_idx);
			var newGuid111 = plman.GetGUID(pl_idx);
			if (newPlGroup !== -1) {
				// 插入到分组内：写入 GroupMap 归入该分组
				GroupMap[newGuid111] = newPlGroup;
				save_gdata();
			}
			plman.ActivePlaylist = pl_idx;
			brw.populate(false);
			var real_id = brw.getRowIdFromIdx(pl_idx);
			if (real_id !== -1) brw.callRename(real_id, pl_idx, true);
			break;
		}
            
        case (idx == 100):
            moveGroup(id, "up");
            break;
        case (idx == 101):
            moveGroup(id, "down");
            break;
        // --- [新增] 多选列表移出分组 ---
        case (idx == 102):
            var selectedOut = (this.actionRows.length > 0) ? this.actionRows : [id];
            var filteredOut = [];
            for (var outi = 0; outi < selectedOut.length; outi++) {
                var r = this.rows[selectedOut[outi]];
                if (!r.isGroup && r.level > 0) {
                    filteredOut.push(selectedOut[outi]);
                }
            }
            if (filteredOut.length > 0) {
                movePlaylistsOutOfGroup(filteredOut);
            }
            break;
            
        // --- [新增] 移到分组（目标分组行号由菜单项 ID 编码）---
        case (idx >= 500 && idx < 500 + this.rows.length):
            var targetGroupRow = idx - 500;
            var selectedIn = (this.actionRows.length > 0) ? this.actionRows : [id];
            var filteredIn = [];
            for (var ini = 0; ini < selectedIn.length; ini++) {
                var r = this.rows[selectedIn[ini]];
                if (!r.isGroup) {
                    filteredIn.push(selectedIn[ini]);
                }
            }
            if (filteredIn.length > 0) {
                movePlaylistsToGroup(filteredIn, targetGroupRow);
            }
            break;
            
		case (idx == 103):  // 新建分组并移入
			var selectedIds = (this.actionRows.length > 0) ? this.actionRows : [id];
			var moveGuids = [];
			var skippedNames = [];
			for (var nwi = 0; nwi < selectedIds.length; nwi++) {
				var r = this.rows[selectedIds[nwi]];
				if (!r.isGroup && r.idx >= 0) {
					if (nonGrouped.indexOf(r.name) > -1) {
						skippedNames.push(r.name);
						continue;
					}
					var g = plman.GetGUID(r.idx);
					moveGuids.push(g);
				}
			}
			if (skippedNames.length > 0) {
				fb.ShowPopupMessage("以下播放列表被保留，不能移入分组:\n-------------------------\n" + skippedNames.join("\n"), "提示");
			}
			if (moveGuids.length === 0) break;
			// 创建虚拟分组
			var uniqueName = getUniqueGroupName("新分组");
			var newGroupId = "grp_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
			Groups.push({ id: newGroupId, name: uniqueName, collapsed: false });
			for (var i = 0; i < moveGuids.length; i++) {
				GroupMap[moveGuids[i]] = newGroupId;
			}
			save_gdata();
			// 将列表移动到一起（参照 movePlaylistsToGroup 的正确逻辑：修正偏移 + 更新 insertPos）
			if (moveGuids.length > 0) {
				// 先按 plman 当前索引升序排序，保证移动后保持原有相对顺序
				var guidIdxPairs = [];
				for (var j = 0; j < moveGuids.length; j++) {
					for (var k = 0; k < plman.PlaylistCount; k++) {
						if (plman.GetGUID(k) === moveGuids[j]) {
							guidIdxPairs.push({ guid: moveGuids[j], idx: k });
							break;
						}
					}
				}
				guidIdxPairs.sort(function(a, b) { return a.idx - b.idx; });
				// 逐个移动到末尾，保持连续
				var insertPos = plman.PlaylistCount;
				for (var j = 0; j < guidIdxPairs.length; j++) {
					var currentIdx = -1;
					for (var k = 0; k < plman.PlaylistCount; k++) {
						if (plman.GetGUID(k) === guidIdxPairs[j].guid) { currentIdx = k; break; }
					}
					if (currentIdx === -1) continue;
					var tgt = insertPos;
					if (currentIdx < tgt) tgt = tgt - 1;
					if (currentIdx !== tgt && tgt >= 0 && tgt <= plman.PlaylistCount) {
						plman.MovePlaylist(currentIdx, tgt);
					}
					insertPos = tgt + 1;
				}
			}
			brw.populate(true);
			// 行集重建（插入分组头 + 成员被移到末尾）后按 GUID 还原选中：
			// actionRows 存的是行号，不还原就会整体错位，变成"分组头 + 少一个的成员"
			if (moveGuids.length > 0) {
				var selPlan103 = [];
				for (var sg = 0; sg < moveGuids.length; sg++) selPlan103.push({ guid: moveGuids[sg] });
				remapSelectionByGuids(selPlan103, true);
			}
			// 重命名新分组
			var renameRowId = -1;
			for (var k = 0; k < brw.rows.length; k++) {
				if (brw.rows[k].isVGroup && brw.rows[k].groupId === newGroupId) { renameRowId = k; break; }
			}
			if (renameRowId !== -1) {
				brw.activeRow = renameRowId;
				brw.callRename(renameRowId, -1);
			}
			break;
		case (idx == 104): // 名称 A→Z
			sortGroupChildren(id, 'name_asc');
			break;
		case (idx == 105): // 名称 Z→A
			sortGroupChildren(id, 'name_desc');
			break;
		case (idx == 106): // 曲目数量升序
			sortGroupChildren(id, 'count_asc');
			break;
		case (idx == 107): // 曲目数量降序
			sortGroupChildren(id, 'count_desc');
			break;
		case (idx == 108): // 随机
			sortGroupChildren(id, 'random');
			break;
		case (idx == 15):
			fb.RunMainMenuCommand("文件/载入播放列表...");
			break;
		case (idx == 16):
			fb.RunMainMenuCommand("文件/保存所有播放列表...");
			break;
		case (idx == 11):
			this.callRename(id, pl_idx);
			break;
		case (idx == 17):
			fb.RunMainMenuCommand("文件/保存播放列表...");
			break;
		case (idx == 12):
		// 先快照待复制列表的 GUID 再按 GUID 查址复制：
		// DuplicatePlaylist 同样会触发行集重建，边循环边取行号会错乱；
		// "idx + i" 偏移在选中项不连续或夹有分组头（被跳过仍占 i 计数）时也不成立
		var dupGuids = [];
		for(var i = 0; i < brw.actionRows.length; i++){
			var drow = brw.rows[brw.actionRows[i]];
			if (drow && drow.idx >= 0) dupGuids.push(plman.GetGUID(drow.idx));
		}
		for(var d = 0; d < dupGuids.length; d++){
			var cidx = findPlIndexByGuid(dupGuids[d]);
			if (cidx >= 0) plman.DuplicatePlaylist(cidx, plman.GetPlaylistName(cidx) + " (复件)");
		}
		brw.actionRows.splice(0, brw.actionRows.length);
		break;
		case (idx == 13):
			plman.ShowAutoPlaylistUI(pl_idx);
			break;
		case (idx == 14):
			plman.DuplicatePlaylist(pl_idx, plman.GetPlaylistName(pl_idx));
			plman.RemovePlaylist(pl_idx);
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 10):
			if (brw.rowsCount > 0) {
				if(ppt.confirmRemove){
					DeletePlaylist();
				} else {
					removeActionRowsByGuid();
				}
				brw.actionRows.splice(0, brw.actionRows.length);
			}
			break;
		case (idx == 24):
			ppt.showFilter = !ppt.showFilter;
			window.SetProperty("_DISPLAY: Show Filter", ppt.showFilter);
			ppt.headerBarHeight = ppt.SearchBarHeight + (ppt.showFilter ? ppt.rowHeight : 0);
			brw.setSize(0, ppt.headerBarHeight, ww - cScrollBar.width, wh - ppt.headerBarHeight);
			brw.repaint();
			break;
		case (idx == 18):
			fb.RunMainMenuCommand("编辑/清除");
			break;
		case (idx == 19):
			fb.RunMainMenuCommand("编辑/移除重复项");
			break;
		case (idx == 20):
			fb.RunMainMenuCommand("编辑/移除无效项");
			break;
		case (idx == 26):
			window.ShowProperties();
			break;
		case (idx == 23):
			ppt.confirmRemove = !ppt.confirmRemove;
			window.SetProperty("_PROPERTY: Confirm Before Removing", ppt.confirmRemove);
			break;
		case (idx == 25):
			ppt.showGrid = !ppt.showGrid;
			window.SetProperty("_PROPERTY: Show Grid", ppt.showGrid);
			brw.repaint();
			break;
		case (idx == 150):
			if (ppt.lockReservedPlaylist) checkMediaLibrayPlaylist();
			else {
				var total = plman.PlaylistCount;
				plman.CreateAutoPlaylist(total, "媒体库", "ALL", default_sort, 0);
				plman.MovePlaylist(total, pl_idx);
				if (newPlGroup !== -1) {
					GroupMap[plman.GetGUID(pl_idx)] = newPlGroup;
					save_gdata();
				}
				plman.ActivePlaylist = pl_idx;
			}
			break;
		case (idx == 151):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "未播放过的音轨", "%play_count% IS 0", default_sort, 1);
			plman.MovePlaylist(total, pl_idx);
			if (newPlGroup !== -1) {
				GroupMap[plman.GetGUID(pl_idx)] = newPlGroup;
				save_gdata();
			}
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 152):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "历史记录", "%last_played% DURING LAST 1 WEEK SORT DESCENDING BY %last_played%", "", 1);
			plman.MovePlaylist(total, pl_idx);
			if (newPlGroup !== -1) {
				GroupMap[plman.GetGUID(pl_idx)] = newPlGroup;
				save_gdata();
			}
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 153):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "最常播放", "%play_count% GREATER 0 SORT DESCENDING BY %play_count%", "", 1);
			plman.MovePlaylist(total, pl_idx);
			if (newPlGroup !== -1) {
				GroupMap[plman.GetGUID(pl_idx)] = newPlGroup;
				save_gdata();
			}
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 154):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "最近添加", "%added% DURING LAST 12 WEEKS SORT DESCENDING BY %added%", "", 1);
			plman.MovePlaylist(total, pl_idx);
			if (newPlGroup !== -1) {
				GroupMap[plman.GetGUID(pl_idx)] = newPlGroup;
				save_gdata();
			}
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 161):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "音轨未评级", "%rating% MISSING", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			if (newPlGroup !== -1) {
				GroupMap[plman.GetGUID(pl_idx)] = newPlGroup;
				save_gdata();
			}
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 162):
			var ngFile = fb.ProfilePath + "foobox\\config\\nongrouped";
			utils.WriteTextFile(ngFile, nonGrouped.join("\r\n"));
			utils.EditTextFile(ngFile);
			var ngContent = utils.ReadTextFile(ngFile, 0);
			if (ngContent !== null && ngContent !== undefined) {
				var ngArr = ngContent.split(/\r\n|\n/);
				var ngNew = [];
				for (var ni = 0; ni < ngArr.length; ni++) {
					var ngName = ngArr[ni].replace(/^\s+|\s+$/g, "");
					if (ngName.length > 0 && ngNew.indexOf(ngName) < 0) ngNew.push(ngName);
				}
				if (ngNew.indexOf("媒体库") < 0) ngNew.push("媒体库");
				nonGrouped = ngNew;
				save_gdata();
			}
			try { utils.RemovePath(ngFile); } catch(e) {}
			break;
		case (idx == 160):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "音轨评级为 1", "%rating% IS 1", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			if (newPlGroup !== -1) {
				GroupMap[plman.GetGUID(pl_idx)] = newPlGroup;
				save_gdata();
			}
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 159):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "音轨评级为 2", "%rating% IS 2", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			if (newPlGroup !== -1) {
				GroupMap[plman.GetGUID(pl_idx)] = newPlGroup;
				save_gdata();
			}
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 158):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "音轨评级为 3", "%rating% IS 3", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			if (newPlGroup !== -1) {
				GroupMap[plman.GetGUID(pl_idx)] = newPlGroup;
				save_gdata();
			}
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 157):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "音轨评级为 4", "%rating% IS 4", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			if (newPlGroup !== -1) {
				GroupMap[plman.GetGUID(pl_idx)] = newPlGroup;
				save_gdata();
			}
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 156):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "音轨评级为 5", "%rating% IS 5", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			if (newPlGroup !== -1) {
				GroupMap[plman.GetGUID(pl_idx)] = newPlGroup;
				save_gdata();
			}
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 155):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "喜爱的音轨", "%mood% GREATER 0", default_sort, 0);
			plman.MovePlaylist(total, pl_idx);
			if (newPlGroup !== -1) {
				GroupMap[plman.GetGUID(pl_idx)] = newPlGroup;
				save_gdata();
			}
			plman.ActivePlaylist = pl_idx;
			break;
		case (idx == 900):
			var affectedItems = Array();
			for (var i = 0; i < PLRecManager.Count; i++) {
				affectedItems.push(i);
			}
			PLRecManager.Purge(affectedItems);
			break;
		case (idx > 900):
			if (idx <= 900 + PLRecManager.Count) {
				PLRecManager.Restore(idx - 901);
			}
			break;
		};
		brw.repaint();
		return true;
	};
};

//=================================== Main ================================================================

function on_init() {
	window.DlgCode = DLGC_WANTALLKEYS;
	get_font();
	get_colors();
	get_metrics();
	g_active_playlist = plman.ActivePlaylist;
	
	// --- [新增] 自动保护所有根级列表（不在任何分组内的列表） ---
	g_filterbox = new oFilterBox();
	g_searchbox = new searchbox();
	g_searchbox.on_init();
	brw = new oBrowser();

	// --- 清理已不存在列表的 GUID（列表被删除后的残留脏数据） ---
	purgeDeadGuids();

	// 先进行一次分组结构初始化，获取当前行数据
	brw.init_groups();
	
	if(ppt.lockReservedPlaylist && fb.IsLibraryEnabled()) checkMediaLibrayPlaylist();
	try{
		var _radiolist = utils.ReadTextFile(radiolist, 0);
		_radiolist = _radiolist.split("\r\n");
		if(_radiolist.length) {
			for(var i = 0; i < _radiolist.length; i++){
				let radio_i = _radiolist[i].split(": ");
				radioname.push(radio_i[0]);
				radiom3u.push(radio_i[1]);
			}
		} else reset_radiolist();
	}catch(e){
		reset_radiolist();
	}
};
on_init();

// START

function on_size() {
	ww = window.Width;
	wh = window.Height;
	if (!ww || !wh) return;
	window.MinWidth = ppt.SearchBarHeight;
	window.MinHeight = ppt.SearchBarHeight;
	cFilterBox.w = Math.floor(ww * 0.6);
	cSearchBox.w = ww - brw.images.topbar_btn.Width * 2 - cSearchBox.x;
	// set Size of browser
	brw.setSize(0, ppt.headerBarHeight, ww - cScrollBar.width, wh - ppt.headerBarHeight);
	brw.repaint();
};

function on_paint(gr) {
	if (!ww) return;
	gr.FillSolidRect(0, 0, ww, wh, g_color_normal_bg);
	brw && brw.draw(gr);
	if(ppt.showFilter && g_filterbox.inputbox.w >25) g_filterbox.draw(gr, cFilterBox.x, cFilterBox.y, true);
	if(g_searchbox.inputbox.w >5) g_searchbox.draw(gr);
};

function on_mouse_lbtn_down(x, y) {
	// stop inertia
	if (cTouch.timer) {
		window.ClearInterval(cTouch.timer);
		cTouch.timer = false;
		// stop scrolling but not abrupt, add a little offset for the stop
		if (Math.abs(scroll - scroll_) > ppt.rowHeight) {
			scroll = (scroll > scroll_ ? scroll_ + ppt.rowHeight : scroll_ - ppt.rowHeight);
			scroll = check_scroll(scroll);
		};
	};

	var is_scroll_enabled = brw.rowsCount > brw.totalRowsVis;
	if (ppt.enableTouchControl && is_scroll_enabled) {
		if (brw._isHover(x, y) && !brw.scrollbar._isHover(x, y)) {
			if (!timers.mouseDown) {
				cTouch.y_prev = y;
				cTouch.y_start = y;
				if (cTouch.t1) {
					cTouch.t1.Reset();
				}
				else {
					cTouch.t1 = fb.CreateProfiler("t1");
				};
				timers.mouseDown = window.SetTimeout(function() {
					window.ClearTimeout(timers.mouseDown);
					timers.mouseDown = false;
					if (Math.abs(cTouch.y_start - m_y) > 015) {
						cTouch.down = true;
					}
					else {
						brw.on_mouse("down", x, y);
					};
				}, 50);
			};
		}
		else {
			brw.on_mouse("down", x, y);
		};
	}
	else {
		brw.on_mouse("down", x, y);
	};
	if(ppt.showFilter) g_filterbox.on_mouse("lbtn_down", x, y);
	g_searchbox.on_mouse("lbtn_down", x, y);
};

function on_mouse_lbtn_up(x, y) {
	if(ppt.showFilter) g_filterbox.on_mouse("lbtn_up", x, y);	
	brw.on_mouse("up", x, y);
	g_searchbox.on_mouse("lbtn_up", x, y);
	if (timers.mouseDown) {
		window.ClearTimeout(timers.mouseDown);
		timers.mouseDown = false;
		if (Math.abs(cTouch.y_start - m_y) <= 030) {
			brw.on_mouse("down", x, y);
		};
	};
	// create scroll inertia on mouse lbtn up
	if (cTouch.down) {
		cTouch.down = false;
		cTouch.y_end = y;
		cTouch.scroll_delta = scroll - scroll_;
		if (Math.abs(cTouch.scroll_delta) > 030) {
			cTouch.multiplier = ((1000 - cTouch.t1.Time) / 20);
			cTouch.delta = Math.round((cTouch.scroll_delta) / 030);
			if (cTouch.multiplier < 1) cTouch.multiplier = 1;
			if (cTouch.timer) window.ClearInterval(cTouch.timer);
			cTouch.timer = window.SetInterval(function() {
				scroll += cTouch.delta * cTouch.multiplier;
				scroll = check_scroll(scroll);
				cTouch.multiplier = cTouch.multiplier - 1;
				cTouch.delta = cTouch.delta - (cTouch.delta / 10);
				if (cTouch.multiplier < 1) {
					window.ClearInterval(cTouch.timer);
					cTouch.timer = false;
				};
			}, 75);
		};
	};
};

function on_mouse_lbtn_dblclk(x, y, mask) {
	if (y >= brw.y) {
		brw.on_mouse("dblclk", x, y);
	}
	else if (ppt.showFilter && x > brw.x && y > cSearchBox.h && y < cSearchBox.h + ppt.rowHeight) {
		brw.showActivePlaylist();
	}
};

function on_mouse_rbtn_down(x, y, mask) {
};

function on_mouse_rbtn_up(x, y) {
	if (!utils.IsKeyPressed(VK_SHIFT)) {
		if(ppt.showFilter) g_filterbox.on_mouse("rbtn_down", x, y);
		g_searchbox.on_mouse("rbtn_down", x, y);
		brw.on_mouse("right", x, y);
	};
	return true;
};

function on_mouse_move(x, y) {
	if(m_x == x && m_y == y) return;
	if (!cPlaylistManager.drag_moved) {
		if(ppt.showFilter) g_filterbox.on_mouse("move", x, y);
		g_searchbox.on_mouse("move", x, y);
	};
	if (cTouch.down) {
		cTouch.y_current = y;
		cTouch.y_move = (cTouch.y_current - cTouch.y_prev);
		if (x < brw.w) {
			scroll -= cTouch.y_move;
			cTouch.scroll_delta = scroll - scroll_;
			if (Math.abs(cTouch.scroll_delta) < 030) cTouch.y_start = cTouch.y_current;
			cTouch.y_prev = cTouch.y_current;
		};
	}
	else brw.on_mouse("move", x, y);
	m_x = x;
	m_y = y;
};

function on_mouse_wheel(step) {
	if (cTouch.timer) {
		window.ClearInterval(cTouch.timer);
		cTouch.timer = false;
	};
	if (brw.rowsCount >0) {
		/*var g_start_y = brw.rows[g_start_].y;
		if(g_start_ && g_start_y) {
			var voffset = g_start_y - ppt.rowHeight - ppt.headerBarHeight;
			scroll -= step * ppt.rowHeight * (ppt.rowScrollStep - step/Math.abs(step)) - voffset;
		}
		else */
		scroll -= step * ppt.rowHeight * ppt.rowScrollStep;
		scroll = check_scroll(scroll);
	}
};

function on_mouse_leave() {
	if(ppt.showFilter) g_filterbox.on_mouse("leave", 0, 0);
	g_searchbox.on_mouse("leave");
	brw.on_mouse("leave", 0, 0);
};

//=================================================// Metrics & Fonts & Colors & Images

function get_metrics() {
	cScrollBar.minCursorHeight = 25*zdpi;
	if(sys_scrollbar){
		cScrollBar.width = get_system_scrollbar_width();
		cScrollBar.maxCursorHeight = 125*zdpi;
	}else{
		cScrollBar.width = 12*zdpi;
		cScrollBar.maxCursorHeight = 110*zdpi;
	}
	ppt.rowHeight = Math.round(ppt.defaultRowHeight * zdpi);
	ppt.SearchBarHeight = z(26) + 2;
	ppt.headerBarHeight = ppt.SearchBarHeight + (ppt.showFilter ? ppt.rowHeight : 0);
	cFilterBox.h = Math.min(ppt.rowHeight, z(20));
	cFilterBox.y = Math.round(ppt.SearchBarHeight + (ppt.rowHeight - cFilterBox.h)/2);
	cSearchBox.h = 22 * zdpi;
	cSearchBox.y = Math.round((ppt.SearchBarHeight - cSearchBox.h)/2);
};

function playlistName2icon(name, auto_playlist) {
	var ico = "\uEA27";
	if (auto_playlist){
		ico = plIco[name];
		if(!ico) ico = "\uEEBD";
	}else{
		if(name == "网络电台") ico = "\uEAF9";
	}
	return ico;
}

function get_font() {
	g_font = window.GetFontDUI(FontTypeDUI.playlists);
	zdpi = g_font.Size / 12;
	g_font_b = GdiFont(g_font.Name, g_font.Size, 1);
	g_track_size = Math.max(10, g_font.Size - 2);
	g_font_track = GdiFont(g_font.Name, g_track_size, g_font.Style);
	g_fnico1 = GdiFont("remixicon", g_font.Size+4, 0);
};

function get_colors() {
	g_color_normal_txt = window.GetColourDUI(ColorTypeDUI.text);
	g_color_normal_bg_default = window.GetColourDUI(ColorTypeDUI.background);
	g_color_selected_bg_default = window.GetColourDUI(ColorTypeDUI.selection);
	c_default_hl = window.GetColourDUI(ColorTypeDUI.highlight);
	g_color_selected_txt = g_color_normal_txt;
	g_color_normal_bg = g_color_normal_bg_default;
	g_color_bt_overlay = g_color_normal_txt & 0x35ffffff;
	g_scroll_color = g_color_normal_txt & 0x95ffffff;
	g_color_selected_bg = g_color_selected_bg_default;
	g_color_highlight = c_default_hl;
	g_color_draghover = g_color_highlight & 0x50ffffff;
	if(isDarkMode(g_color_normal_bg)){
		dark_mode = 1;
		g_color_topbar = RGBA(0, 0, 0, 30);
		g_color_line = RGBA(0, 0, 0, 25);
		g_color_line_div = RGBA(0, 0, 0, 55);
	}else{
		dark_mode = 0;
		g_color_topbar = RGBA(0, 0, 0, 15);
		g_color_line = RGBA(0, 0, 0, 18);
		g_color_line_div = RGBA(0, 0, 0, 45);
	}
};

function on_script_unload() {
	brw.g_time && window.ClearInterval(brw.g_time);
	brw.g_time = false;
};

//=================================================// Keyboard Callbacks

function on_key_up(vkey) {
	if(ppt.showFilter) g_filterbox.on_key("up", vkey);
	g_searchbox.on_key("up", vkey);
	// scroll keys up and down RESET (step and timers)
	cScrollBar.timerCounter = -1;
	if(cScrollBar.timerID){
		window.ClearTimeout(cScrollBar.timerID);
		cScrollBar.timerID = false;
		brw.repaint();
	}
};

function on_key_down(vkey) {
	var mask = GetKeyboardMask();
	if (brw.inputboxID >= 0) {
		if (mask == KMask.none) {
			switch (vkey) {
			case VK_ESCAPE:
			case 222:
				brw.inputboxID = -1;
				window.SetCursor(IDC_ARROW);
				brw.repaint();
				break;
			default:
				brw.inputbox.on_key_down(vkey);
			};
		} else {
			brw.inputbox.on_key_down(vkey);
		}
	} else {
		if(ppt.showFilter) g_filterbox.on_key("down", vkey);
		g_searchbox.on_key("down", vkey);

		if (mask == KMask.none) {
			switch (vkey) {
			case VK_F2:
				if (brw.rowsCount > 0) {
					var rowId = brw.activeRow;
					if (rowId > (ppt.lockReservedPlaylist ? 0 : -1)) {
						brw.callRename(rowId, brw.rows[rowId].idx);
					};
				}
				break;
			case VK_F3:
				brw.showActivePlaylist();
				break;
			case VK_F5:
				brw.repaint();
				break;
			case VK_ESCAPE:
			case 222:
				brw.inputboxID = -1;
				break;
			case VK_UP:
				if (brw.rowsCount > 0) {
					if (ppt.showFilter && g_filterbox.inputbox.edit) return;
					var rowId = brw.activeRow;
					if (rowId > 0) {
						if (brw.inputboxID > -1) brw.inputboxID = -1;
						brw.activeRow--;
						if (brw.activeRow < 0) brw.activeRow = 0;
						brw.showActiveRow();
					};
				};
				break;
			case VK_DOWN:
				if (brw.rowsCount > 0) {
					if (ppt.showFilter && g_filterbox.inputbox.edit) return;
					var rowId = brw.activeRow;
					if (rowId < brw.rowsCount - 1) {
						if (brw.inputboxID > -1) brw.inputboxID = -1;
						brw.activeRow++;
						if (brw.activeRow > brw.rowsCount - 1) brw.activeRow = brw.rowsCount - 1;
						brw.showActiveRow();
					};
				};
				break;
			case VK_RETURN:
				if (brw.rowsCount > 0) {
					if (ppt.showFilter && g_filterbox.inputbox.edit) return;
					if (g_searchbox.inputbox.edit) return;
					if(brw.activeRow > -1) {
						var row = brw.rows[brw.activeRow];
						if (row.isVGroup) {
							// 分组头：切换折叠/展开状态（复用鼠标点击逻辑）
							cPlaylistManager.drag_group_rowId = brw.activeRow;
							toggleGroupCollapse(row);
						} else {
							// 普通列表：切换到该播放列表
							plman.ActivePlaylist = row.idx;
							brw.actionRows.splice(0, brw.actionRows.length);
						}
					}
				};
				break;
			case VK_PGUP:
				if (cTouch.timer) {
					window.ClearInterval(cTouch.timer);
					cTouch.timer = false;
				};
				scroll -= brw.totalRowsVis * ppt.rowHeight;
				scroll = check_scroll(scroll);
				break;
			case VK_PGDN:
				if (cTouch.timer) {
					window.ClearInterval(cTouch.timer);
					cTouch.timer = false;
				};
				if (brw.rowsCount >0){
					var g_start_y = brw.rows[g_start_].y;
					var voffset = g_start_y - ppt.headerBarHeight;
					scroll += ppt.rowHeight * (brw.totalRowsVis - 1) - voffset;
					scroll = check_scroll(scroll);
				}
				break;
			case VK_END:
				if (brw.rowsCount > 0) {
					if (ppt.showFilter && g_filterbox.inputbox.edit) return;
					if (brw.inputboxID > -1) brw.inputboxID = -1;
					brw.activeRow = brw.rowsCount - 1;
					brw.showActiveRow();
				};
				break;
			case VK_HOME:
				if (brw.rowsCount > 0) {
					if (ppt.showFilter && g_filterbox.inputbox.edit) return;
					if (brw.inputboxID > -1) brw.inputboxID = -1;
					brw.activeRow = 0;
					brw.showActiveRow();
				};
				break;
			case VK_DELETE:
				if(ppt.showFilter && g_filterbox.inputbox.edit) return;
				if (brw.rowsCount > 0) {
					if(!brw.actionRows.length && brw.activeRow > -1 && brw.activeRow < brw.rowsCount) brw.actionRows.push(brw.activeRow);
					if(ppt.confirmRemove){
					DeletePlaylist();
				} else {
					removeActionRowsByGuid();
				}
					brw.actionRows.splice(0, brw.actionRows.length);
				}
				break;
			}
		} else if (mask == KMask.alt) {
			if(vkey == 115) fb.RunMainMenuCommand("文件/退出");
		} else if (mask == KMask.ctrl) {
			if(vkey == 65) { // CTRL+A
				brw.actionRows.splice(0, brw.actionRows.length);
				for(var i = 0; i < brw.rows.length; i++){
					if(!brw.rows[i].islocked) brw.actionRows.push(i);
				}
				brw.repaint();
			} else if(vkey == 49){
				if(rowScrollStep_org != 1){
					if(ppt.rowScrollStep != 1) ppt.rowScrollStep = 1;
					else ppt.rowScrollStep = rowScrollStep_org;
				}
			}
		}
	}
};

function on_char(code) {
	// rename inputbox
	if (brw.inputboxID >= 0) {
		brw.inputbox.on_char(code);
	}
	else {
		if(ppt.showFilter) g_filterbox.on_char(code);
		g_searchbox.on_char(code);
	};
};

//=================================================// Playlist Callbacks
var playing_pl = null;
function on_playback_new_track(metadb) {
	if(playing_pl != plman.PlayingPlaylist) {
		playing_pl = plman.PlayingPlaylist;
		window.Repaint();
	}
};
function on_playback_stop() {
	playing_pl = null;
	window.Repaint();
}

function on_playlists_changed() {
	// 行集即将因外部变更重排：先按 GUID 快照选中项，populate 后再还原。
	// 不这么做的话，在 foobar2000 主界面/其它面板增删或移动列表后，本面板的高亮会错位到别的列表上。
	var selSnapshot = snapshotSelectionGuids();
	purgeDeadGuids();
	if (cPlaylistManager.drag_droped) {
		window.SetCursor(IDC_ARROW);
		cPlaylistManager.drag_droped = false;
	}
	else {
		if (ppt.showFilter && (brw.previous_playlistCount != plman.PlaylistCount)) g_filterbox.clearInputbox();
	};
	// ---- 修复：同分组成员连续性聚合 ----
	// 成员不连续时渲染会被撕开（分组头在上、成员缩进跟在别的列表后面），折叠后成员甚至直接消失，
	// 所以必须修。但只修【外部】变更（foobar2000 主界面 / 其它面板 / 快捷键）：
	// 本面板自己造成的变更（拖拽落位、分组移动）若也修，刚拖好的位置会被搬回 arr[0]，
	// 表现为"拖到这儿又跳回去"。这里用交互中的即时状态判断，不额外引入需要手动清除的标志。
	var selfDriven = cPlaylistManager.drag_clicked || cPlaylistManager.drag_moved || brw.is_moving_group;
	if (!selfDriven) {
	(function fixGroupContinuity(){
		try {
			var seenGroupFirstIdx = {};   // groupId -> 第一次出现的 plman idx
			var groupMembers = {};        // groupId -> [idx...]  按遍历顺序收集
			for (var i = 0; i < plman.PlaylistCount; i++) {
				var grp = GroupMap[plman.GetGUID(i)];
				if (!grp) continue;
				if (!(grp in groupMembers)) groupMembers[grp] = [];
				groupMembers[grp].push(i);
			}
			var dirty = false;
			for (var gid in groupMembers) {
				if (!groupMembers.hasOwnProperty(gid)) continue;
				var arr = groupMembers[gid];
				// 判断是否连续
				var contiguous = true;
				for (var k = 1; k < arr.length; k++) {
					if (arr[k] !== arr[k-1] + 1) { contiguous = false; break; }
				}
				if (contiguous) continue;
				// 不连续：按顺序重新排列，锚定到第一个成员位置
				var anchor = arr[0];
				// 找当前 arr 的 plman idx（可能随 MovePlaylist 变化），所以每次重查 GUID
				var guids = [];
				for (var kk = 0; kk < arr.length; kk++) {
					guids.push(plman.GetGUID(arr[kk]));
				}
				// 逐个移动到 anchor + offset
				for (var kk = 0; kk < guids.length; kk++) {
					var curIdx = -1;
					for (var jj = 0; jj < plman.PlaylistCount; jj++) {
						if (plman.GetGUID(jj) === guids[kk]) { curIdx = jj; break; }
					}
					if (curIdx === -1) continue;
					var dest = anchor + kk;
					if (curIdx !== dest) {
						plman.MovePlaylist(curIdx, dest);
						dirty = true;
					}
				}
			}
			if (dirty) {
				// 连续性修复会再次触发 on_playlists_changed，但 drag_droped=false，
				// 再次进入会扫描一遍已连续，性能可接受
			}
		} catch(e) { /* 忽略修复期异常，避免面板挂起 */ }
	})();
	}
	brw.populate(false, false);
	if (selSnapshot.length > 0) {
		// keepActiveRow = true：外部变更时不抢光标，只把高亮跟回原列表
		remapSelectionByGuids(selSnapshot, true);
	} else if (brw.actionRows.length > 0) {
		// 选中的全是分组头（GUID 快照为空）：行号同样失效，直接清空
		brw.actionRows.splice(0, brw.actionRows.length);
	}
	brw.repaint();
};

function on_playlist_switch() {
	g_active_playlist = plman.ActivePlaylist;
	brw.showActivePlaylist();
	brw.repaint();
};

function on_playlist_items_added(playlist_idx) {
	brw.repaint();
};

function on_playlist_items_removed(playlist_idx, new_count) {
	brw.repaint();
};

function on_focus(is_focused) {
	g_searchbox.on_focus(is_focused);
	if(ppt.showFilter) g_filterbox.on_focus(is_focused);
	if (brw.inputboxID >= 0) {
		brw.inputbox.on_focus(is_focused, true);
	};
	if (!is_focused) {
		brw.inputboxID = -1;
		//brw.repaint();
	};
};

//====== Custom functions ======//
function get_gdata(){
	var gdata_arr = "";
	try{
		gdata_arr = utils.ReadTextFile(fb.ProfilePath + "foobox\\config\\pmgroups", 0);
	} catch(e) {
		nonGrouped = ["媒体库", "媒体库视图", "默认列表", "搜索结果", "媒体库视图(正在播放)"];
	}
	if (gdata_arr != "") {
		gdata_arr = gdata_arr.split("\r\n");
		nonGrouped = JSON.parse(gdata_arr[0]);
		Groups = JSON.parse(gdata_arr[1]);
		GroupMap = JSON.parse(gdata_arr[2]);
	}
}

function save_gdata(){
	var tmp = JSON.stringify(nonGrouped) + "\r\n" + JSON.stringify(Groups) + "\r\n" + JSON.stringify(GroupMap);
	utils.WriteTextFile(fb.ProfilePath + "foobox\\config\\pmgroups", tmp);
}

function reset_radiolist() {
	radioname.push("boxRadios (github)");
	radiom3u.push("https://raw.githubusercontent.com/dream7180/Resource/main/radio/radio.fpl");
	radioname.push("boxRadios (github CDN)");
	radiom3u.push("https://cdn.gh-proxy.org/https://raw.githubusercontent.com/dream7180/Resource/main/radio/radio.fpl");
	utils.WriteTextFile(radiolist, radioname[0]+": "+radiom3u[0]+"\r\n"+radioname[1]+": "+radiom3u[1]);
};

function match(input, str) {
	var temp = "";
	input = input.toLowerCase();
	for (var j in str) {
		if (input.indexOf(str[j]) < 0) return false;
	};
	return true;
};

function process_string(str) {
	str_ = [];
	str = str.toLowerCase();
	while (str != (temp = str.replace("  ", " ")))
	str = temp;
	var str = str.split(" ").sort();
	for (var i in str) {
		if (str[i] != "") str_[str_.length] = str[i];
	};
	return str_;
};

function checkMediaLibrayPlaylist() {
	// check if library playlist is present
	var isMediaLibraryFound = false;
	var total = plman.PlaylistCount;
	for (var i = 0; i < total; i++) {
		if (plman.GetPlaylistName(i) == "媒体库") {
			var mediaLibraryIndex = i;
			isMediaLibraryFound = true;
			break;
		};
	};
	if (!isMediaLibraryFound) {
		plman.CreateAutoPlaylist(total, "媒体库", "%path% PRESENT", default_sort, 0);
		// Move it to the top
		plman.MovePlaylist(total, 0);
	}
	else if (mediaLibraryIndex > 0) {
		// Always move it to the top
		plman.MovePlaylist(mediaLibraryIndex, 0);
	};
};

function check_scroll(scroll___) {
	if (scroll___ < 0) scroll___ = 0;
	var end_limit = (brw.rowsCount * ppt.rowHeight) - brw.scrollbar.totalRowsVish;
	if (scroll___ != 0 && scroll___ > end_limit) {
		scroll___ = end_limit;
	};
	if (scroll___ == 1) scroll___ = 0;
	return scroll___;
};

function g_sendResponse() {
	if (g_filterbox.inputbox.text.length == 0) {
		filter_text = "";
	}
	else {
		filter_text = g_filterbox.inputbox.text;
	};
	// filter in current panel
	brw.actionRows.splice(0, brw.actionRows.length);
	brw.populate(true);
};

function on_font_changed() {
	get_font();
	get_metrics();
	g_searchbox.inputbox.FontUpdte();
	g_searchbox.getImages();
	brw.getImages();
	g_filterbox.inputbox.FontUpdte();
	g_filterbox.getImages();
	cSearchBox.w = ww - brw.images.topbar_btn.Width * 2 - cSearchBox.x;
	brw.setSize(0, ppt.headerBarHeight, ww - cScrollBar.width, wh - ppt.headerBarHeight);
	brw.repaint();
};

function on_colours_changed() {
	get_colors();
	g_searchbox.getImages();
	g_searchbox.reset_colors();
	brw.getImages();
	if (brw)
		brw.scrollbar.setNewColors();
	g_filterbox.getImages();
	g_filterbox.reset_colors();
	brw.repaint();
};

function on_notify_data(name, info) {
	switch (name) {
	case "color_scheme_updated":
		if(!info) {
			g_color_highlight = c_default_hl;
			g_color_normal_bg = g_color_normal_bg_default;
			g_color_selected_bg = g_color_selected_bg_default;
		} else {
			g_color_highlight = RGB(info[0], info[1], info[2]);
			if(info.length > 3) {
				g_color_normal_bg = RGB(info[3], info[4], info[5]);
				g_color_selected_bg = RGB(info[6], info[7], info[8]);
			}
		}
		g_color_draghover = g_color_highlight & 0x50ffffff;
		brw.repaint();
		break;
	case "lock_lib_playlist":
		if (ppt.lockReservedPlaylist == info) break;
		ppt.lockReservedPlaylist = info;
		window.SetProperty("_PROPERTY: Lock Reserved Playlist", ppt.lockReservedPlaylist);
		if (ppt.lockReservedPlaylist) checkMediaLibrayPlaylist();
		brw.actionRows.splice(0, brw.actionRows.length);
		brw.populate(true, false);
		break;
	case "scrollbar_width":
		sys_scrollbar = info;
		cScrollBar.width = sys_scrollbar ? get_system_scrollbar_width() : 12*zdpi;
		cScrollBar.maxCursorHeight = sys_scrollbar ? 125*zdpi : 110*zdpi;
		get_metrics();
		brw.scrollbar.updateScrollbar();
		brw.scrollbar.setSize();
		brw.setSize(0, ppt.headerBarHeight, ww - cScrollBar.width, wh - ppt.headerBarHeight);
		brw.repaint();
		break;
	case "ScrollStep":
		ppt.rowScrollStep = info;
		rowScrollStep_org = ppt.rowScrollStep;
		break;
	case "row_height_changed":
		ppt.defaultRowHeight = info;
		get_metrics();
		brw.setSize(0, ppt.headerBarHeight, ww - cScrollBar.width, wh - ppt.headerBarHeight);
		brw.repaint();
		break;
	}
};

//=================================================// Drag'n'Drop Callbacks

function on_drag_enter() {
	g_dragndrop_status = true;
};

function on_drag_leave() {
	g_dragndrop_status = false;
	g_dragndrop_trackId = -1;
	g_dragndrop_rowId = -1;
	g_dragndrop_targetPlaylistId = -1;
	brw.buttonClicked = false;
	cScrollBar.timerID && window.ClearInterval(cScrollBar.timerID);
	cScrollBar.timerID = false;
	brw.repaint();
};

function on_drag_over(action, x, y, mask) {
	if (x == g_dragndrop_x && y == g_dragndrop_y) return true;
	g_dragndrop_trackId = -1;
	g_dragndrop_rowId = -1;
	g_dragndrop_targetPlaylistId = -1;
	g_dragndrop_bottom = false;
	brw.on_mouse("drag_over", x, y);
	brw.repaint();
	g_dragndrop_x = x;
	g_dragndrop_y = y;
};

function on_drag_drop(action, x, y, mask) {
	if (y < ppt.headerBarHeight) {
		action.Effect = 0;
	} else {
		var drop_done = false;
		if (g_dragndrop_targetPlaylistId == -1) {
			// blank area, drop to new playlist
			drop_done = true;
			// --- [修改] 生成唯一的列表名称 ---
			var newName = getUniquePlaylistName("拖入的项目");
			var total_pl = plman.PlaylistCount;
			plman.CreatePlaylist(total_pl, newName);
			// 刷新行数据，确保独立列表立即生效
			brw.populate(false);
			// -------------------------------------------------
			action.Playlist = total_pl;
			action.Base = plman.PlaylistItemCount(total_pl);
			action.ToSelect = plman.PlaylistCount == 1; // switch to and set focus if only playlist
			action.Effect = 1;
		} else if (g_dragndrop_targetPlaylistId == -2 || plman.IsPlaylistLocked(g_dragndrop_targetPlaylistId)) {
			// mouse over an existing playlist but can't drop there
			action.Effect = 0;
			fb.ShowPopupMessage("  错误信息\n----------------\n目标播放列表是智能列表或已被锁定，不可以手动添加音轨.", "不允许的操作");
		} else {
			// drop to an existing playlist
			drop_done = true;
			action.Playlist = g_dragndrop_targetPlaylistId;
			action.Base = plman.PlaylistItemCount(g_dragndrop_targetPlaylistId);
			action.ToSelect = false;
			action.Effect = 1;
		}
		if(brw.rows[brw.activeRow].isGroup) drop_done = false;
		if (drop_done) {
			if (!blink.timer) {
				blink.x = x;
				blink.y = y;
				blink.totaltracks = 1;
				blink.id = brw.activeRow;
				blink.counter = 0;
				blink.timer = window.SetInterval(function () {
					blink.counter++;
					if (blink.counter > 5) {
						blink.timer && window.ClearInterval(blink.timer);
						blink.timer = false;
						blink.counter = -1;
						blink.id = null;
					};
					brw.repaint();
				}, 125);
			}
		}
	}
	g_dragndrop_status = false;
	brw.repaint();
};