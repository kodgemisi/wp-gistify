(function($) {
  var gistifyShortCodeRx = /(\[gistify.*?\])(?!\s*<\/span>)/gm;
  var gistifyShortCodeAttributesRx =/\s(.*?)="(.*?)"/g;

  tinymce.PluginManager.add('kodgemisi_gistify_button', function( editor, url ) {

    editor.on('LoadContent', function(e) {

      console.log('CLick event is bind to .gistify-shortcode');

      // switching from text tab in editor invokes this event
      // In change event's handler isDirty returns false
      // So wee need to bind click events here
      bindClickToShortcodes(editor);

      // Add stylesheet to editor iframe to style shortcodes
      if($(editor.iframeElement.contentWindow.document.body).find('#gistify-style').size() == 0) {
        $(editor.iframeElement.contentWindow.document.body)
          .append('<style type="text/css" id="gistify-style">.gistify-shortcode {background: #efefef;border: 1px solid #ddd;font-family: monospace;cursor: pointer;display: inline-block;}</style>')
      }
    });

    editor.on('change', function(e) {
      if(editor.isDirty()) {
        bindClickToShortcodes(editor);
      }
    });

    editor.addButton( 'kodgemisi_gistify_button', {
      title: 'Add code <Gist>',
      icon: 'wp_code',
      onclick: function() {

        editor.windowManager.open( {
            title: 'Enter Gist Id',
            body: [
            {
              type   : 'container',
              label  : 'Usage',
              html   : '<p>Leave <strong>Gist Id</strong> empty for creating new gists</p>'
            },
            {
              type: 'textbox',
              name: 'gistId',
              label: 'Gist Id',
              tooltip: 'gist_id part of gist.github.com/<username>/<gist_id>'
            },
            {
              type: 'textbox',
              name: 'files',
              label: 'Files',
              tooltip: 'Comma separated list of files'
            },
            {
              type: 'checkbox',
              name: 'description',
              label: 'Show Description'
            },
            {
              type: 'checkbox',
              name: 'simple',
              label: 'Show Simple',
              tooltip: 'Without headers'
            }],
            onsubmit: function(e) {
              editor.insertContent('<span>[gistify id="' + e.data.gistId + '"]</span>&nbsp;');
            }
        });

      }
    });
  });// tinymce.PluginManager.add

  function shortcodeClickHandler (argument) {
    console.log(this);

    $('#gistify-modal>section').empty().append('<div id="gistify-target">');

    var options = extractGistAttribute($(this).text());

    $('#gistify-target').gistify(options);

    tb_show('','#TB_inline?width=auto&height=auto&modal=true&inlineId=gistify-modal','');
    $('#TB_window').attr('style', 'width: auto; height: auto; margin: auto; top: 20px; visibility: visible;left: 20px;right: 20px;bottom:20px;overflow:auto;');
    $('#TB_ajaxContent').removeAttr('style');
    $('#gistify-modal>header').css('height', jQuery('#TB_window').width());
  }

  function bindClickToShortcodes(editor) {
    $(editor.getBody()).find('>:contains([gistify)')
      .off('click')
      .on('click', shortcodeClickHandler);
  }

  function filterInt(value) {
    if(/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
      return Number(value);
    return NaN;
  }

  function extractGistAttribute(gistShortcode) {
    var attributeToOptionKeyMap = {
      id: 'gistId',
      simple: 'showSimple',
      description: 'description',
      files: 'files'
    };

    var result = {};
    gistifyShortCodeAttributesRx.lastIndex = 0;
    var match;
    while( (match = gistifyShortCodeAttributesRx.exec(gistShortcode)) ) {
      var key = match[1].trim();
      var val = match[2].trim();

      val = val === 'true' ? true : val;
      val = val === 'false' ? false : val;

      val = isNaN(filterInt(val)) ? val : parseInt(val);

      result[attributeToOptionKeyMap[key]] = val;
    }
    result.mode = result.gistId ? 'edit' : 'create';
    return result;
  }
})(jQuery);