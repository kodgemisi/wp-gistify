/*
Copyright © September, 2015 Kod Gemisi Ltd.

This Source Code Form is subject to
the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file,
You can obtain one at https://mozilla.org/MPL/2.0/.
*/

(function($) {
  var gistifyShortCodeAttributesRx =/\s(.*?)="(.*?)"/g;
  var shortcodeIdAttrRx = /id="\s*"/;

  tinymce.PluginManager.add('kodgemisi_gistify_button', function( editor, url ) {

    editor.on('LoadContent', function(e) {

      // switching from text tab in editor invokes this event
      // In change event's handler isDirty returns false
      // So wee need to bind click events here
      bindEventToShortcodes(editor);

      // !!! caution !!!
      // ----------------------------------
      // Below code is on hold because when style or class attribute added to the "<p>" tag
      // in iframe editor, behavior of it changes and explicit <p> tag is added to the content
      // which is undesired. Furthermore additional <p> elemet is ambigious for the end user when added
      // by the plugin.
      // So [gistify ...] shortcodes are decided to be appeared clean until a better
      // way to highlight them is found.

      // Add stylesheet to editor iframe to style shortcodes
      // if($(editor.iframeElement.contentWindow.document.body).find('#gistify-style').size() === 0) {
      //   $(editor.iframeElement.contentWindow.document.body)
      //     .append('<style type="text/css" id="gistify-style">.gistify-shortcode {background: #efefef;border: 1px solid #ddd;font-family: monospace;cursor: pointer;display: inline-block;}</style>');
      // }
    });

    editor.on('change', function(e) {
      if(editor.isDirty()) {
        bindEventToShortcodes(editor);
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
              var idAttr = ' id="'+ e.data.gistId + '"';
              var filesAttr = e.data.files ? ' files="'+ e.data.files + '"' : '';
              var simpleAttr = e.data.simple ? ' simple="'+ e.data.simple + '"' : '';
              var descriptionAttr = e.data.description ? ' description="'+ e.data.description + '"' : '';

              editor.insertContent(
                '<span>[gistify'
                + idAttr + filesAttr + simpleAttr + descriptionAttr
                + ']</span>&nbsp;');
            }
        });

      }
    });
  });// end of `tinymce.PluginManager.add`

  function shortcodeClickHandler () {
    var $shortCode = $(this);

    // in admin page, gistify-target is meant to be unique hence using 'id' instead of class
    // we are replacing the div so that previous gist is reset
    $('#gistify-target').replaceWith('<div id="gistify-target">');

    var options = extractGistAttribute($(this).text());

    // in this callback, if the gist is in create mode, created gist's id
    // will be inserted to gist shortcode in the editor as:
    // [gistify id="<inserted here>"]
    options.onGistCreated = function (gistData) {

      if( shortcodeIdAttrRx.test($shortCode.text()) ) {
        var updatedShortcode = $shortCode.text().replace(shortcodeIdAttrRx, 'id="'+ gistData.id +'"');
      }
      else {
        updatedShortcode = $shortCode.text().replace('[gistify', '[gistify id="'+ gistData.id +'"');
      }
      $shortCode.text(updatedShortcode);

      // TODO check if need to notify the editor about the change?
    };

    $('#gistify-target').gistify(options);

    showModal();
  }

  // Bind close-modal btn click handler
  $('#gistify-modal > header > button').click(function closeModal() {
    $('#gistify-modal>section, #gistify-modal>header, #gistify-modal-curtain')
      .fadeOut();
    $('body').removeClass('gistify-modal-open');
  });

  function showModal() {
    $('#gistify-modal>section, #gistify-modal>header, #gistify-modal-curtain')
      .show();
    $('body').addClass('gistify-modal-open');
  }

  function bindEventToShortcodes(editor) {
    $(editor.getBody()).find('>:contains([gistify)')
      .off('mouseenter mouseleave')
      .hover(shortcodeHoverInHandler, shortcodeHoverOutHandler);
  }

  function shortcodeHoverInHandler(e) {
    var iframeOffset = $('iframe').offset();
    var shortcodeOffset = $(this).offset();// this is the DOM element
    var offset = {
      top: iframeOffset.top + shortcodeOffset.top, //- $('#gistify-hover-menu').height()
      left: iframeOffset.left + shortcodeOffset.left
    };

    $('#gistify-hover-menu').offset(offset);
    $('#gistify-hover-menu').show();

    var that = this;
    $('#gistify-hover-menu').off('click').on('click', function () {
      shortcodeClickHandler.call(that, e);
      hideHoverMenu();
    });
  }

  function shortcodeHoverOutHandler() {
    $('#gistify-hover-menu').trigger('gistify-hide-requested');
  }

  $('#gistify-hover-menu').on('gistify-hide-requested', function () {
    setTimeout(function() {
      if(!$('#gistify-hover-menu').is(':hover')) {
        hideHoverMenu();
      }
    }, 50);
  });

  $('#gistify-hover-menu').on('mouseleave', hideHoverMenu);

  function hideHoverMenu() {
    $('#gistify-hover-menu').hide();
    $('#gistify-hover-menu').css('top', 0).css('left', 0);
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

    // reading shortcode's attributes
    while( (match = gistifyShortCodeAttributesRx.exec(gistShortcode)) ) {
      var key = match[1].trim();
      var val = match[2].trim();

      val = val === 'true' ? true : val;
      val = val === 'false' ? false : val;

      val = isNaN(filterInt(val)) ? val : parseInt(val, 10);

      result[attributeToOptionKeyMap[key]] = val;
    }
    result.mode = result.gistId ? 'edit' : 'create';

    // we only need this two in admin pages
    // above function is kept just in case
    // might be pruned in the future
    return {
      gistId: result.gistId,
      mode: result.mode
    };
  }

})(jQuery);