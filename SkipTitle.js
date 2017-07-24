/*:
 * @plugindesc ָ����Ϸ��ʼ�ĳ�����֧���Զ���ĳ�����
 * @author Iisnow
 *
 * @param scene
 * @desc ѡ��ʼ����������
 * @default Scene_Map
 *
 * @param addscript
 * @desc �����������
 * @default 
 *
 * @help �ű�û�м����µĽű�����
 * ��Ĭ��������ܹ��������⻭��
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