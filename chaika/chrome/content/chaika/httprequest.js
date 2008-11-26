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
* HTTP �ꥯ�����Ȥ�Ԥ����֥�������
*
* @param aURLSpec string �ꥯ�����Ȥ����� URL
* @param aListener Bbs2chHttpRequestListener �ꥹ�ʡ�
* @param aReferrerSpec string ��ե��� URL
*/
function Bbs2chHttpRequest(aURLSpec, aListener, aReferrerSpec){
	this.uriSpec = aURLSpec;
	this.listener = aListener;
	this.referrerSpec = aReferrerSpec;
}

Bbs2chHttpRequest.prototype = {
	_ioService: Components.classes["@mozilla.org/network/io-service;1"]
					.getService(Components.interfaces.nsIIOService),
	_URI: Components.classes["@mozilla.org/network/standard-url;1"]
						.createInstance(Components.interfaces.nsIURI),
	_channel: null,
	_loading: false,
	_dataArray: new Array(),
	_headers: null,


// ********** ********* ��� ********** **********


	/**
	 * ������ URL
	 * @return number
	 */
	get ERROR_BAD_URL(){ return 1 },

	/**
	 * ¸�ߤ��ʤ� URL
	 * @return number
	 */
	get ERROR_NOT_AVAILABLE(){ return 2 },

	/**
	 * �ꥯ�����Ȥμ���
	 * @return number
	 */
	get ERROR_FAILURE(){ return 3 },


// ********** ********* �ץ�ѥƥ� ********** **********


	/**
	 * �ꥯ�����ȤΥ쥹�ݥ�
	 * @return string
	 */
	get responseText(){
		return this._dataArray.join("");
	},


	/**
	 * �ꥯ�����Ȥ� HTTP ���ơ�����
	 * @return number
	 */
	get status(){
		return this._channel.responseStatus;
	},

	/**
	 * �쥹�ݥ󥹥إå��Υϥå�������
	 * @return array
	 */
	get headers(){
		return this._headers;
	},


// ********** ********* �᥽�å� ********** **********


	/**
	 * HTTP GET �򳫻�
	 */
	get: function(){
		this.getRange();
	},


	/**
	 * ��ʬ GET
	 * ����̤��������̾�GET
	 *
	 * @param aRange number Range
	 * @param aModifiedSince number If-Modified-Since
	 */
	getRange: function(aRange, aModifiedSince){
		this._channel = null;
		try{
			this._URI.spec = this.uriSpec;

			var bbs2chService = Components.classes["@mozilla.org/bbs2ch-service;1"]
					.getService(Components.interfaces.nsIBbs2chService);

			this._channel = bbs2chService.getHttpChannel(this._URI);
			this._channel.loadFlags = this._channel.LOAD_BYPASS_CACHE;

				// ��ե��������
			if(this.referrerSpec)
				this._channel.setRequestHeader("Referer", this.referrerSpec, false);

				// ��ʬGET
			if(aRange && aModifiedSince){
				//this._channel.setRequestHeader("Accept-Encoding", "identity", false);
				this._channel.setRequestHeader("Accept-Encoding", "", false);
				this._channel.setRequestHeader("If-Modified-Since", aModifiedSince, false);
				this._channel.setRequestHeader("Range", "bytes=" + aRange + "-", false);
			}else{
				this._channel.setRequestHeader("Accept-Encoding", "gzip", false);
			}

			this.clearData();
			this._loading = true;
			this._headers = null;
		}catch(e){
			this.listener.onHttpError(this.ERROR_BAD_URL);
			return;
		}

		try{
			this._channel.requestMethod = "GET";
			this._channel.asyncOpen(this, this);
		}catch(e){
			this.listener.onHttpError(this.ERROR_FAILURE);		
		}
	},



	/**
	 * HTTP POST �򳫻�(�����Τ�ʸ����Τ�)
	 *
	 * @param aPostString string ����ʸ����
	 */
	post: function(aPostString){
		this._channel = null;
		try{
			this._URI.spec = this.uriSpec;

			var bbs2chService = Components.classes["@mozilla.org/bbs2ch-service;1"]
					.getService(Components.interfaces.nsIBbs2chService);
			this._channel = bbs2chService.getHttpChannel(this._URI);
			this._channel.setRequestHeader("Content-Type",
								"application/x-www-form-urlencoded", false);

				// ��ե��������
			if(this.referrerSpec)
				this._channel.setRequestHeader("Referer", this.referrerSpec, false);

			this.clearData();
			this._loading = true;
			this._headers = null;
		}catch(e){
			this.listener.onHttpError(this.ERROR_BAD_URL);
			return;
		}

			// nsIUploadChannel �ν���
		var uploadChannel = this._channel.QueryInterface(Components.interfaces.nsIUploadChannel);
		var strIStream = Components.classes["@mozilla.org/io/string-input-stream;1"]
								.createInstance(Components.interfaces.nsIStringInputStream)
		strIStream = strIStream.QueryInterface(Components.interfaces.nsISeekableStream);
		
		aPostString = String(aPostString);
		strIStream.setData(aPostString, aPostString.length);
		uploadChannel.setUploadStream(strIStream, 
							"application/x-www-form-urlencoded", -1);

		try{
			this._channel.requestMethod = "POST";
			this._channel.asyncOpen(this, this);
		}catch(e){
			this.listener.onHttpError(this.ERROR_FAILURE);		
		}
	},


	/**
	 * �ꥯ�����Ȥ����
	 */
	abort: function(){
		this._loading = false;
		this._dataArray = new Array();
	 	try{
			this._channel.cancel(0);
		}catch(e){}
	},


	/**
	 * �쥹�ݥ󥹥إå����ͤ��֤�
	 *
	 * @param aHeader string �쥹�ݥ󥹥إå�̾
	 * @return string
	 */
	getResponseHeader: function(aHeader){
	 	try{
			return this._channel.getResponseHeader(aHeader);
		}catch(e){}
		return "";
	},


	/**
	 * �쥹�ݥ󥹥ƥ����Ȥ򥯥ꥢ
	 */
	clearData: function(){
		this._dataArray = new Array();
	},


// ********** ********* implements nsIHttpHeaderVisitor ********** **********


	visitHeader: function(aHeader, aValue){
		this._headers[aHeader] = aValue;
	},


// ********** ********* implements nsIStreamListener ********** **********


	onDataAvailable: function (aRequest, aContext, aInputStream, aOffset, aCount) {
		this._bInputStream.setInputStream(aInputStream);
		var availableData = this._bInputStream.readBytes(aCount);
		availableData = availableData.replace(/\x00/g, "*");
		this._dataArray.push(availableData);
		this.listener.onHttpDataAvailable(availableData, this._channel.responseStatus);
	},

	onStartRequest: function(aRequest, aContext){
		this._bInputStream = Components.classes["@mozilla.org/binaryinputstream;1"]
					.createInstance(Components.interfaces.nsIBinaryInputStream),
		this.listener.onHttpStart();
	},

	onStopRequest: function(aRequest, aContext, aStatus) {
		this._loading = false;
		if(aStatus == 0){
			try{
					// �쥹�ݥ󥹥إå��μ���
				this._headers = new Array();
				this._channel.visitResponseHeaders(this);
				this.listener.onHttpStop(this.responseText, this._channel.responseStatus);
			}catch(e){
				this.listener.onHttpError(this.ERROR_NOT_AVAILABLE);
			}
		}else{
			this.listener.onHttpError(this.ERROR_NOT_AVAILABLE);
		}
		this._channel = null;
	}
}




/**
 * Bbs2chHttpRequest �Υꥹ�ʡ�
 */
var Bbs2chHttpRequestListener = {
	/**
	 * �ꥯ�����Ȥγ���
	 */
	onHttpStart: function(){
	},


	/**
	 * �ꥯ�����Ȥν�λ
	 *
	 * @param aResponseText string �ꥯ�����ȤΥ쥹�ݥ�
	 * @param aStatus number �ꥯ�����Ȥ� HTTP ���ơ�����
	 */
	onHttpStop: function(aResponseText, aStatus){
	},


	/**
	 * �ꥯ�����ȤΥ쥹�ݥ󥹤�����
	 *
	 * @param aAvailableData string �ꥯ�����ȤΥ쥹�ݥ�
	 * @param aStatus number �ꥯ�����Ȥ� HTTP ���ơ�����
	 */
	onHttpDataAvailable: function(aAvailableData, aStatus){
	},


	/**
	 * �ꥯ�����Ȥμ���
	 *
	 * @param aErrorCode number ���顼������(ERROR_XXX)
	 */
	onHttpError: function(aErrorCode){
	}
}