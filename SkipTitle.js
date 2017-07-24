/*:
 * @plugindesc 指定游戏开始的场景（支持自定义的场景）
 * @author Iisnow
 *
 * @param scene
 * @desc 选择开始场景的名称
 * @default Scene_Map
 *
 * @param addscript
 * @desc 场景布置语句
 * @default 
 *
 * @help 脚本没有加入新的脚本命令
 * 在默认情况下能够跳过标题画面
 */

(function() {

	var parameters = PluginManager.parameters('SkipTitle');
	var scenetogo = parameters['scene'];
	var addscript = parameters['addscript'];

	Scene_Boot.prototype.start = function() {
		Scene_Base.prototype.start.call(this);
		SoundManager.preloadImportantSounds();
		if (DataManager.isBattleTest()) {
			DataManager.setupBattleTest();
			SceneManager.goto(Scene_Battle);
		} else if (DataManager.isEventTest()) {
			DataManager.setupEventTest();
			SceneManager.goto(Scene_Map);
		} else {
			this.checkPlayerLocation();
			DataManager.setupNewGame();
			if(scenetogo.length>0){
				SceneManager.goto(eval(scenetogo));
				eval(addscript);
			}else{
				SceneManager.goto(Scene_Title);
				Window_TitleCommand.initCommandPosition();
			}
		}
		this.updateDocumentTitle();
	};
})();