define(["jquery-ui","app/prompt", "app/tree", "app/storage", "ui.combobox", "app/util", "app/ssl", "app/loading"], function () {
var prompt = require('app/prompt');
var tree = require('app/tree');
var storage = require('app/storage');
var lang = require('app/lang').lang;
var util = require('app/util');
var ssl = require('app/ssl');
var loading = require('app/loading');

var sites = [];
var currentSite = storage.get('currentSite');

var combobox;

function init() {
    combobox = $( "#sites" ).combobox({
        select: function (event, ui) {
            //connect to site
            open(ui.item.value);
        },
        change: function (event, ui) {
            //connect to site
            open(ui.item.value);
        },
        create: function( event, ui ) {
            load();
        }
    });

    $( "#refresh_site" ).button({
        icons: {
           primary: "ui-icon-refresh"
        },
        text: false
    })
    .click(function() {
        tree.refresh();
    });

    //button menu
    var items = [{
        id: 'newsite',
        text: 'New site..',
        handler: function() {},
        disabled: false
    }, {
        id: 'editsite',
        text: 'Edit site..',
        handler: function() {},
        disabled: false
    }, {
        id: 'duplicate',
        text: 'Duplicate..',
        handler: function() {},
        disabled: false
    }, {
        id: 'deletesite',
        text: 'Delete site',
        handler: function() {},
        disabled: false
    }, '-', {
        id: 'deletesite',
        text: 'Delete site',
        handler: function() {},
        disabled: false
    }, {
        id: 'import',
        text: 'Import..',
        handler: function() {},
        disabled: false
    }, {
        id: 'export',
        text: 'Export',
        handler: function() {},
        disabled: false
    }, {
        id: 'share',
        text: 'Share site',
        handler: function() {},
        disabled: false
    }, {
        id: 'download',
        text: 'Download revisions',
        handler: function() {},
        disabled: false
    }, '-', {
        id: 'phpmyadmin',
        text: 'PhpMyAdmin',
        handler: function() {},
        disabled: false
    }, '-', {
        id: 'deletesite',
        text: 'SSH Terminal',
        handler: function() {},
        disabled: true
    }, {
        id: 'deletesite',
        text: 'Reboot',
        handler: function() {},
        disabled: true
    }];

    var el = $("#siteMenu");
    var context;
    items.forEach(function(item) {
        if(item==='-') {
            el.append('<li>-</li>');
        } else {
            var itemEl = $('<li>\
                <a href="#">'+item.text+'</a>\
            </li>').appendTo(el);

            if(item.disabled) {
                itemEl.addClass('ui-state-disabled');
            }

            if(item.handler) {
                itemEl.click(jQuery.proxy(item.handler, undefined, context));
            }
        }
    });

    var menu = $("#siteMenu").menu().hide();

    $("#siteNenuBtn").button({
        icons: {
            primary: "ui-icon-gear"
        },
        text: false
    })
    .click(function() {
        // Make use of the general purpose show and position operations
        // open and place the menu where we want.
        menu.show().position({
              my: "left top",
              at: "left bottom",
              of: this
        });

        // Register a click outside the menu to close it
        $( document ).on( "click", function() {
              menu.hide();
        });

        // Make sure to return false here or the click registration
        // above gets invoked.
        return false;
    });
}

function open(siteId, password) {
    currentSite = null;

    var site = getSettings(siteId);

	if (!loading.start('Connecting to site '+site.name, function(){
		console.log('abort opening site');
		ajax.abort();
		opening = {};
	})) {
		console.log('in queue');
		return;
	}

    var ajax = $.ajax({
        url: '/api/sites?site='+siteId,
	    method: 'POST',
	    dataType: 'json',
	    data: {
	        password: password,
	        save_password: 1
	    }
    })
    .then(function (data) {
        loading.stop();
        //console.log(data);

        if(data.success){
            currentSite = siteId;
            storage.set('currentSite', currentSite);

            //load file tree
            var options = getAjaxOptions('/api/files?site='+siteId);
            tree.setAjaxOptions(options);
        }else{
            if (data.require_password) {
    			loading.stop();

        		password = site.ftp_pass;

        		/*
        		if (prefs.useMasterPassword) {
        			if (password) {
        				password = (Aes.Ctr.decrypt(password, shiftedit.app.storage.get('masterPassword'), 256));
        			}
        		}
        		*/

    			prompt.prompt({
    			    title: 'Require server password for '+site.name,
    			    msg: lang.passwordText,
    			    value: password,
    			    password: true,
    			    fn: function(btn, password) {
    			        switch(btn) {
    			            case 'ok':
                                /*
    							var prefs = prefs.get_prefs();
    							if (prefs.useMasterPassword) {
    								if (params.password) {
    									params.password = Aes.Ctr.encrypt(params.password, storage.get('masterPassword'), 256);
    								}
    							}
    							*/

    							open(siteId, password);
			                break;
    			        }
    			    }
    			});
            }else{
                prompt.alert({title:'Error', msg:data.error});
            }
        }
    }).fail(function() {
        loading.stop();
		prompt.alert({title:lang.failedText, msg:'Error opening site'});
    });

    return ajax;
}

function load() {
    return $.getJSON('/api/sites')
        .then(function (data) {
            sites = data.sites;

            $( "#sites" ).children('option').remove();

            $.each(sites, function( index, site ) {
                $( "#sites" ).append( '<option value="'+site.id+'">'+site.name+'</option>' );
            });

            if(currentSite){
                $( "#sites" ).val(currentSite).change();
            }

            return sites;
        });
}

function active() {
    return currentSite;
}

function getSettings(siteId) {
    if(!siteId) {
        siteId = currentSite;
    }

    site = false;
    sites.forEach(function(entry) {
        if(entry.id==siteId){
            site = entry;
            return;
        }
    });

    return site;
}

function getAjaxOptions(ajaxUrl) {
    var settings = getSettings();
    var params = {};

    if(settings.server_type == 'AJAX' || settings.turbo == 1) {
        if(settings.turbo){
        	if( settings.web_url ){
        		ajaxUrl = settings.web_url+'shiftedit-proxy.php?ModPagespeed=off';
        	}else{
        		prompt.alert({title:lang.errorText, msg:'Missing web URL'});
        	}

    		//var prefs = shiftedit.app.get_prefs();

    		//fixme prompt for master password
    		//var pass = prefs.useMasterPassword ? Aes.Ctr.decrypt(settings.ftp_pass, shiftedit.app.storage.get('masterPassword'), 256) : settings.ftp_pass;

    		var pass = settings.ftp_pass;

    		params = {
    			user: settings.ftp_user,
    			pass: util.sha1(pass)
    		};
        }else{
        	ajaxUrl = settings.domain;

        	if( settings.encryption == '1' ){
        		ajaxUrl = 'https://'+ajaxUrl;
        	}else{
        		ajaxUrl = 'http://'+ajaxUrl;
        	}
        }

        if(util.startsWith(ajaxUrl, 'http://') && ssl.check_blocked()){
            prompt.alert({title:'Proxy Blocked', msg:'Click Shield icon in address bar, then "Load Unsafe Script"'});
        }
    }

    return {
        site: settings.id,
        url: ajaxUrl,
        params: params
    };
}

return {
    init: init,
    load: load,
    active: active,
    getSettings: getSettings,
    getAjaxOptions: getAjaxOptions
};

});