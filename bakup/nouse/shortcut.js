function ShortcutMask(mask, vkey) {
	switch (mask) {
		case KMask.ctrl:
			switch (vkey){
			case 65:// CTRL+A
				fb.RunMainMenuCommand("编辑/全选");
				break;
			case 70:if// CTRL+F
				fb.RunMainMenuCommand("编辑/搜索");
				break;
			case 78:// CTRL+N
				fb.RunMainMenuCommand("文件/新建播放列表");
				break;
			case 79:// CTRL+O
				fb.RunMainMenuCommand("文件/打开...");
				break;
			case 80:// CTRL+P
				fb.RunMainMenuCommand("文件/参数选项");
				break;
			case 83:// CTRL+S
				fb.RunMainMenuCommand("文件/保存播放列表...");
				break;
			case 85:// CTRL+U
				fb.RunMainMenuCommand("文件/添加位置...");
				break;
			case 87:// CTRL+W
				fb.RunMainMenuCommand("文件/移除播放列表");
				break;
			}
			break;
		case KMask.alt:
			switch (vkey) {
			case 65:// ALT+A
				fb.RunMainMenuCommand("视图/总在最上面");
				break;
			case 108:// ALT+A
				fb.RunMainMenuCommand("属性");
				break;
			case 115://Alt+F4
				fb.RunMainMenuCommand("文件/退出");
				break;
			};
			break;
	}
}

function ShortcutMaskEn(mask, vkey) {
	switch (mask) {
		case KMask.ctrl:
			switch (vkey){
			case 65:// CTRL+A
				fb.RunMainMenuCommand("Edit/Select all");
				break;
			case 70:if// CTRL+F
				fb.RunMainMenuCommand("Edit/Search");
				break;
			case 78:// CTRL+N
				fb.RunMainMenuCommand("File/New playlist");
				break;
			case 79:// CTRL+O
				fb.RunMainMenuCommand("File/Open...");
				break;
			case 80:// CTRL+P
				fb.RunMainMenuCommand("File/Preferences");
				break;
			case 83:// CTRL+S
				fb.RunMainMenuCommand("File/Save playlist...");
				break;
			case 85:// CTRL+U
				fb.RunMainMenuCommand("File/Add location...");
				break;
			case 87:// CTRL+W
				fb.RunMainMenuCommand("File/Remove playlist");
				break;
			}
			break;
		case KMask.alt:
			switch (vkey) {
			case 65:// ALT+A
				fb.RunMainMenuCommand("View/Always on Top");
				break;
			case 108:// ALT+A
				fb.RunMainMenuCommand("Properties");
				break;
			case 115://Alt+F4
				fb.RunMainMenuCommand("File/Exit");
				break;
			};
			break;
	}
}
