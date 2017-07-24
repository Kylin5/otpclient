//=============================================================================
// OTP.js
//=============================================================================
 
/*:
 * @plugindesc Online Trading Platform Ver 1.01 
 * @author Morpho(dongdongDJH)
 * 
 *
 * @param WebSocket_IP
 * @desc WebSocket IP地址
 * @default www.otpserver.com
 *
 * @param WebSocket_Port
 * @desc WebSocket 端口号
 * @default 9000
 *
 * @help 
 *
 */

//=============================================================================
// 全局变量
//=============================================================================
var parameters = PluginManager.parameters('OTP');
var WebSocket_IP = String(parameters['WebSocket_IP'] || "127.0.0.1");
var WebSocket_Port = Number(parameters['WebSocket_Port'] || 9000);

//=============================================================================
// 生成插件指令
//=============================================================================
var Morpho_Game_Interpreter_prototype_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    Morpho_Game_Interpreter_prototype_pluginCommand.call(command, args);
    if (command === 'OTPServer') {
        $OtpClient.CreateWebSocket();
    };
};

//=============================================================================
// 连接WebSocket
//=============================================================================
var $OtpClient = new OtpClient();

function OtpClient() {};

OtpClient.prototype.initialize = function() {
    this._WebSocketUrl = null;
    this._WebSocket = null;
};

OtpClient.prototype.CreateWebSocket = function() {
	var url = "ws://" + WebSocket_IP + ":" + WebSocket_Port;

	this._WebSocket = new WebSocket(url);
	
	this._WebSocket.onopen = function() {
		this.send("Connect");
	};
	this._WebSocket.onclose = function() {
		this.close();
	};
	this._WebSocket.onerror = function() {
		alert("服务器正在维护中！")
	};
	this._WebSocket.onmessage = function(evt) {
		var data = evt.data;
		var data2json = JSON.parse(data);
		$OtpClient.ProcessMsg(data2json);
	};
};

OtpClient.prototype.SendMsg = function(msg) {
	var msg = msg;
	if (this._WebSocket) {
		this._WebSocket.send(msg);
	};
};

OtpClient.prototype.ProcessMsg = function(msg) {
	var action = msg["action"];
	if (action == "Connect") {
		SceneManager.push(Scene_OTP);
	};
	if (action == "Sell") {
		$gameParty.loseItem(this.Scene()._item, 1)
		this.Scene().activateOTPSellWindow();
	};
};

OtpClient.prototype.Scene = function() {
	return SceneManager._scene;
};

//=============================================================================
// Window Socket ID
//=============================================================================
function Window_SocketID() {
    this.initialize.apply(this, arguments);
};

Window_SocketID.prototype = Object.create(Window_Base.prototype);
Window_SocketID.prototype.constructor = Window_SocketID;

Window_SocketID.prototype.initialize = function(x, y) {
    var width = Graphics.boxWidth - 240;
    var height = this.fittingHeight(1);
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._id = null;
    this.refresh();
};

Window_SocketID.prototype.uuid = function() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    };
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}

Window_SocketID.prototype.refresh = function() {
    if (this._id == null) {
        this._id = this.uuid()
    };
    this.drawIDText(this._id);
};

Window_SocketID.prototype.drawIDText = function(text) {
    var x = this.textPadding();
    var width = this.contents.width - this.textPadding() * 2;
    var text = "ID: " + text;
    this.drawText(text, x, 0, width, 'center');
};

//=============================================================================
// Window OTP Command
//=============================================================================
function Window_OTPCommand() {
    this.initialize.apply(this, arguments);
};

Window_OTPCommand.prototype = Object.create(Window_Command.prototype);
Window_OTPCommand.prototype.constructor = Window_OTPCommand;

Window_OTPCommand.prototype.initialize = function() {
    Window_Command.prototype.initialize.call(this, 0, 0);
};

Window_OTPCommand.prototype.numVisibleRows = function() {
    return this.maxItems();
};

Window_OTPCommand.prototype.makeCommandList = function() {
    this.addCommand("购买",       'buy');
    this.addCommand("出售",       'sell');
    this.addCommand("下架",       'get');
    this.addCommand("取消",       'cancel');
};

//=============================================================================
// Window OTP Item Category
//=============================================================================
function Window_OTPItemCategory() {
    this.initialize.apply(this, arguments);
};

Window_OTPItemCategory.prototype = Object.create(Window_ItemCategory.prototype);
Window_OTPItemCategory.prototype.constructor = Window_OTPItemCategory;

Window_OTPItemCategory.prototype.initialize = function() {
    Window_HorzCommand.prototype.initialize.call(this, 0, 0);
};

Window_OTPItemCategory.prototype.windowWidth = function() {
    return Graphics.boxWidth - 240;
};

Window_OTPItemCategory.prototype.maxCols = function() {
    return 2;
};

Window_OTPItemCategory.prototype.makeCommandList = function() {
    this.addCommand(TextManager.weapon, 'weapon');
    this.addCommand(TextManager.armor,  'armor');
};

//=============================================================================
// Window OTP Sell
//=============================================================================
function Window_OTPSell() {
    this.initialize.apply(this, arguments);
};

Window_OTPSell.prototype = Object.create(Window_ShopSell.prototype);
Window_OTPSell.prototype.constructor = Window_OTPSell;

Window_OTPSell.prototype.initialize = function(x, y, width, height) {
    Window_ShopSell.prototype.initialize.call(this, x, y, width, height);
};

Window_OTPSell.prototype.maxCols = function() {
    return 1
};

//=============================================================================
// Window Choice Command
//=============================================================================
function Window_ChoiceCommand() {
    this.initialize.apply(this, arguments);
};

Window_ChoiceCommand.prototype = Object.create(Window_HorzCommand.prototype);
Window_ChoiceCommand.prototype.constructor = Window_ChoiceCommand;

Window_ChoiceCommand.prototype.initialize = function() {
    Window_HorzCommand.prototype.initialize.call(this, 0, 0);
};

Window_ChoiceCommand.prototype.windowWidth = function() {
    return Graphics.boxWidth - 240;
};

Window_ChoiceCommand.prototype.maxCols = function() {
    return 2;
};

Window_ChoiceCommand.prototype.makeCommandList = function() {
    this.addCommand("确认",       'ok')
    this.addCommand("取消",       'cancel');
};

//=============================================================================
// Scene_OTP
//=============================================================================
function Scene_OTP() {
    this.initialize.apply(this, arguments);
};

Scene_OTP.prototype = Object.create(Scene_MenuBase.prototype);
Scene_OTP.prototype.constructor = Scene_OTP;

Scene_OTP.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

//=============================================================================
// Create Windows
//=============================================================================
Scene_OTP.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createHelpWindow();
    this.createGoldWindow();
    this.createDummyWindow();
    this.createSocketIDWindow();
    this.createOTPCommandWindow();
    this.createCategoryWindow();
    this.createOTPSellWindow();
};

Scene_OTP.prototype.createGoldWindow = function() {
    this._goldWindow = new Window_Gold(0, 0);
    this._goldWindow.y = Graphics.boxHeight - this._goldWindow.height;
    this.addWindow(this._goldWindow);
};

Scene_OTP.prototype.createDummyWindow = function() {
    var wx = this._goldWindow.width;
    var wy = this._helpWindow.height;
    var ww = Graphics.boxWidth - wx;
    var wh = Graphics.boxHeight - wy - this._goldWindow.height;
    this._dummyWindow = new Window_Base(wx, wy, ww, wh);
    this.addWindow(this._dummyWindow);
};

Scene_OTP.prototype.createSocketIDWindow = function() {
    this._socketidWindow = new Window_SocketID(0, 0);
    this._socketidWindow.x = this._goldWindow.width;
    this._socketidWindow.y = this._goldWindow.y;
    this.addWindow(this._socketidWindow);
};

Scene_OTP.prototype.createOTPCommandWindow = function() {
    this._otpcommandWindow = new Window_OTPCommand();
    this._otpcommandWindow.y = this._helpWindow.height;
    //this._otpcommandWindow.setHandler('buy',     this.commandBuy.bind(this));
    this._otpcommandWindow.setHandler('sell',    this.commandSell.bind(this));
    //this._otpcommandWindow.setHandler('get',     this.commandGet.bind(this));
    this._otpcommandWindow.setHandler('cancel',  this.commandCancle.bind(this));
    this.addWindow(this._otpcommandWindow);
};

Scene_OTP.prototype.createCategoryWindow = function() {
    this._categoryWindow = new Window_OTPItemCategory();
    this._categoryWindow.setHelpWindow(this._helpWindow);
    this._categoryWindow.x = this._otpcommandWindow.width;
    this._categoryWindow.y = this._helpWindow.height;
    this._categoryWindow.setHandler('ok',       this.onCategoryOk.bind(this));
    this._categoryWindow.setHandler('cancel',   this.onCategoryCancel.bind(this));
    this._categoryWindow.deactivate();
    this._categoryWindow.hide();
    this.addWindow(this._categoryWindow);
};

Scene_OTP.prototype.createOTPSellWindow = function() {
    var wx = this._otpcommandWindow.width;
    var wy = this._categoryWindow.y + this._categoryWindow.height;
    var ww = Graphics.boxWidth - wx;
    var wh = Graphics.boxHeight - wy - this._goldWindow.height;
    this._otpsellWindow = new Window_OTPSell(wx, wy, ww, wh);
    this._otpsellWindow.setHelpWindow(this._helpWindow);
    this._otpsellWindow.hide();
    this._otpsellWindow.setHandler('ok',    this.onSellOk.bind(this));
    this._otpsellWindow.setHandler('cancel',this.onSellCancel.bind(this));
    this._categoryWindow.setItemWindow(this._otpsellWindow);
    this.addWindow(this._otpsellWindow);
};

//=============================================================================
// Set Commands
//=============================================================================
Scene_OTP.prototype.commandSell = function() {
    this._dummyWindow.hide();
    this._categoryWindow.show();
    this._categoryWindow.activate();
    this._otpsellWindow.show();
    this._otpsellWindow.deselect();
    this._otpsellWindow.refresh()
};

Scene_OTP.prototype.commandCancle = function() {
    this.popScene();
    $OtpClient.SendMsg("Close");
};

Scene_OTP.prototype.onCategoryOk = function() {
    this.activateOTPSellWindow();
    this._otpsellWindow.select(0);
};

Scene_OTP.prototype.activateOTPSellWindow = function() {
    this._categoryWindow.show();
    this._otpsellWindow.refresh();
    this._otpsellWindow.show();
    this._otpsellWindow.activate();
};

Scene_OTP.prototype.onCategoryCancel = function() {
    this._otpcommandWindow.activate();
    this._dummyWindow.show();
    this._categoryWindow.hide();
    this._otpsellWindow.hide();
};

Scene_OTP.prototype.onSellOk = function() {
    this._item = this._otpsellWindow.item();
    var type = (DataManager.isWeapon(this._item) ? 0 : 1);
    var id = (type == 0 ? this._item.wtypeId : this._item.atypeId);
    var owner = this._socketidWindow._id;
    var msg = "Sell|" + type + "|" + id + "|" + owner;
    $OtpClient.SendMsg(msg);
};

Scene_OTP.prototype.onSellCancel = function() {
    this._otpsellWindow.deselect();
    this._categoryWindow.activate();
    this._helpWindow.clear();
};
//=============================================================================
// Set Others
//=============================================================================
Scene_OTP.prototype.money = function() {
    return this._goldWindow.value();
};