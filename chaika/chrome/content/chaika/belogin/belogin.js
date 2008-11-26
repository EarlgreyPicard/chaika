/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is bbs2chreader.
 *
 * The Initial Developer of the Original Code is
 * flyson.
 * Portions created by the Initial Developer are Copyright (C) 2004
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *    flyson <flyson at users.sourceforge.jp>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */




/**
 * Be@2ch �ؤΥ�����������Ƚ�����Ԥ�
 */
var Bbs2chBeLogin = {


// ********** ********* �ץ�ѥƥ� ********** **********


	/**
	 * nsICookieService ���֤�
	 * @return nsICookieService
	 */
	get cookieService(){
		if(!this._cookieService){
			this._cookieService = Components.classes["@mozilla.org/cookieService;1"]
									.getService(Components.interfaces.nsICookieService);
		}
		return this._cookieService;
	},
	_cookieService: null,


	/**
	 * http://be.2ch.net/ �� nsIURI ���֤�
	 * @return nsIURI
	 */
	get beURI(){
		if(!this._beURI){
			var ioService = Components.classes["@mozilla.org/network/io-service;1"]
									.getService(Components.interfaces.nsIIOService);
			this._beURI = ioService.newURI("http://be.2ch.net/", null, null);
		}
		return this._beURI;
	},
	_beURI: null,


	/**
	 * Be@2ch �˥�������ʤ� ��
	 * @return boolean
	 */
	get logined(){
		var cookie = this.cookieService.getCookieString(this.beURI, null);
		if(cookie && cookie.indexOf("MDMD")!=-1 && cookie.indexOf("DMDM")!=-1)
			return true;
		return false;
	},


// ********** ********* �᥽�å� ********** **********


	/**
	 * Be@2ch �˥����󤹤�
	 * @param aBeCode string Be@2ch ��ǧ�ڥ�����
	 * @param aBeMail string Be@2ch ��ǧ�ڥ᡼�륢�ɥ쥹
	 */
	login: function(aBeCode, aBeMail){
		if(!aBeCode) return;
		if(!aBeMail) return;
	
			// cookie ��ͭ������
		var cookieExpires = new Date(2015, 11, 31).toString();

			// Be ǧ�ڥ����ɤ���Ͽ
		var cookieBeCode = "MDMD=" + aBeCode  + "; domain=.2ch.net; expires=" + cookieExpires;
		this.cookieService.setCookieString(this.beURI, null, cookieBeCode, null);

			// Be ǧ�ڥ᡼�����Ͽ
		var cookieBeMail = "DMDM=" + aBeMail + "; domain=.2ch.net; expires=" + cookieExpires;
		this.cookieService.setCookieString(this.beURI, null, cookieBeMail, null);
	},


	/**
	 * Be@2ch ����������Ȥ���
	 */
	logout: function(){
			// cookie ��ͭ������
		var cookieExpires = new Date(1995, 0, 1).toString();

			// ͭ�����¤˲�����ꤷ�� Be ǧ�ڥ����ɤκ��
		var cookieBeCode = "MDMD=; domain=.2ch.net; expires=" + cookieExpires;
		this.cookieService.setCookieString(this.beURI, null, cookieBeCode, null);

			// ͭ�����¤˲�����ꤷ�� Be ǧ�ڥ᡼��κ��
		var cookieBeMail = "DMDM=; domain=.2ch.net; expires=" + cookieExpires;
		this.cookieService.setCookieString(this.beURI, null, cookieBeMail, null);
	},


	/**
	 * ��������������򳫤�
	 */
	openLoginDialog:function(){
		var dialogURL = "chrome://chaika/content/belogin/belogin-dialog.xul";
		window.openDialog(dialogURL, "bbe2chBeDialog", "chrome,dialog,modal");
	}
}