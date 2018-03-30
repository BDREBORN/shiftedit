define(["./util",'./lang','./tabs','./menubar','./prefs', "jquery-contextmenu"], function (util, lang, tabs, menubar, preferences) {
lang = lang.lang;
var makeMenuText = util.makeMenuText;

function init() {
	//prevent gutter context menu
	$(document).on('contextmenu', '.editor', function(e) {
		if (e.target.classList.contains('ace_gutter-cell')) {
			e.preventDefault();
			e.stopImmediatePropagation();
		}
	});

	$.contextMenu({
		selector: '.ace_editor',
		callback: function(key, opt){
			var panel = $(this).closest("[role=tabpanel]");
			var tab = $("[role=tab][aria-controls="+panel.attr('id')+"]");
			var editor = tabs.getEditor(tab);

			switch(key) {
				case 'find':
					editor.exec('find', editor);
				break;
				case 'findPrev':
					editor.exec('findprevious', editor);
				break;
				case 'findNext':
					editor.exec('findnext', editor);
				break;
				case 'replace':
					editor.exec('replace', editor);
				break;
				case 'replaceAll':
					editor.exec('replaceall', editor);
				break;
				case 'selectAll':
					editor.selectAll();
				break;
				case 'undo':
					editor.undo();
				break;
				case 'redo':
					editor.redo();
				break;
				case 'collapseSelection':
					editor.commands.exec('fold', editor);
				break;
				case 'expandSelection':
					editor.commands.exec('unfold', editor);
				break;
				case 'applyHTMLComment':
					editor.commands.exec('wrapSelection', editor, ['<!--', '-->']);
				break;
				case 'applySlashStarComment':
					editor.commands.exec('wrapSelection', editor, ['/*', '*/']);
				break;
				case 'applySlashComment':
					editor.commands.exec('prependLineSelection', editor, ['//']);
				break;
				case 'convertSingleQuotes':
					editor.commands.exec('replaceInSelection', editor, ['\'', '"']);
				break;
				case 'convertDoubleQuotes':
					editor.commands.exec('replaceInSelection', editor, ['"', "\'"]);
				break;
				case 'convertTabs':
					editor.commands.exec('replaceInSelection', editor, ["\t", "    "]);
				break;
				case 'convertSpaces':
					editor.commands.exec('replaceInSelection', editor, ["    ", "\t"]);
				break;
				case 'addLineBreaks':
					editor.commands.exec('appendLineSelection', editor, ['<br>']);
				break;
				case 'convertToUppercase':
					editor.commands.exec('selectionToUppercase', editor);
				break;
				case 'convertToLowercase':
					editor.commands.exec('selectionToLowercase', editor);
				break;
			}
		},
		items: {
			"selection": {
				"name": "Selection",
				"items": {
					'collapseSelection': {
						name: makeMenuText(lang.collapseSelection, preferences.getKeyBinding('collapseSelection')),
						isHtmlName: true,
						disabled: noSelection
					},
					'expandSelection': {
						name: makeMenuText(lang.expandSelection, preferences.getKeyBinding('expandSelection')),
						isHtmlName: true
					},
					"sep1": "---------",
					'applyHTMLComment': {
						name: lang.applyHTMLComment,
						isHtmlName: true
					},
					'applySlashStarComment': {
						name: lang.applySlashStarComment,
						isHtmlName: true
					},
					'applySlashComment': {
						name: lang.applySlashComment,
						isHtmlName: true
					},
					"sep2": "---------",
					'convertSingleQuotes': {
						name: lang.convertSingleQuotes,
						isHtmlName: true,
						disabled: noSelection
					},
					'convertDoubleQuotes': {
						name: lang.convertDoubleQuotes,
						isHtmlName: true,
						disabled: noSelection
					},
					'convertTabs': {
						name: lang.convertTabs,
						isHtmlName: true,
						disabled: noSelection
					},
					'convertSpaces': {
						name: lang.convertSpaces,
						isHtmlName: true,
						disabled: noSelection
					},
					'addLineBreaks': {
						name: lang.addLineBreaks,
						isHtmlName: true,
						disabled: noSelection
					},
					"sep3": "---------",
					'convertToUppercase': {
						name: lang.convertToUppercase,
						isHtmlName: true,
						disabled: noSelection
					},
					'convertToLowercase': {
						name: lang.convertToLowercase,
						isHtmlName: true,
						disabled: noSelection
					}
				}
			},
			"find": {name: makeMenuText('Find', preferences.getKeyBinding('find'), 'find'), isHtmlName: true},
			"findPrev": {name: makeMenuText('Find Previous', 'Ctrl-Shift-K'), isHtmlName: true},
			"findNext": {name: makeMenuText('Find Next', 'Ctrl-K'), isHtmlName: true},
			"replace": {name: makeMenuText('Replace', 'Ctrl-R'), isHtmlName: true},
			"replaceAll": {name: makeMenuText('Replace All', 'Ctrl-Shift-R'), isHtmlName: true},
			"sep1": "---------",
			"selectAll": {name: makeMenuText('Select All', 'Ctrl-A'), isHtmlName: true},
			"sep2": "---------",
			"undo": {name: makeMenuText('Undo', 'Ctrl-Z'), isHtmlName: true, disabled: noUndo},
			"redo": {name: makeMenuText('Redo', 'Ctrl-Y'), isHtmlName: true, disabled: noRedo}
		}
	});
}

function noUndo() {
	return $('#menubar .undoBtn').hasClass('ui-state-disabled');
}

function noRedo() {
	return $('#menubar .redoBtn').hasClass('ui-state-disabled');
}

function noSelection() {
	var panel = $(this).closest("[role=tabpanel]");
	var tab = $("[role=tab][aria-controls="+panel.attr('id')+"]");
	var editor = tabs.getEditor(tab);
	return editor.session.getSelection().isEmpty();
}

return {
	init: init
};

});