<?php
/*
Plugin Name: Gistify
*/

defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

const GISTIFY_JS_PATH = 'https://rawgit.com/kodgemisi/gistify/dev-init/dist/gistify.js';
const GISTIFY_CSS_PATH = 'https://rawgit.com/kodgemisi/gistify/dev-init/dist/gistify.css';
const MODAL_HTML = '
<div id="gistify-modal" style="display:none;">
  <header style=" background-color: #ccc; height: 30px; margin: -15px;position: fixed;width: 1560px;z-index: 5;">
    <span style=" line-height: 30px; margin-left: 20px; font-size: 20px; ">Gistify</span>
    <div class="tb-close-icon" onclick="tb_remove()"></div>
  </header>
  <section style="padding-top: 25px;"></section>
</div>
';

add_action('admin_head', 'kodgemisi_gistify_add_button_to_admin');
add_action( 'admin_enqueue_scripts', 'gistify_plugin_assets_for_admin' );
add_action( 'wp_enqueue_scripts', 'gistify_plugin_assets' );

function kodgemisi_gistify_add_button_to_admin() {
  global $typenow;

  // check user permissions
  if ( !current_user_can('edit_posts') && !current_user_can('edit_pages') ) {
    return;
  }

  // verify the post type
  if( ! in_array( $typenow, array( 'post', 'page' ) ) ) {
    return;
  }

  // check if WYSIWYG is enabled
  if ( get_user_option('rich_editing') == 'true') {
    add_filter("mce_external_plugins", "gistify_add_tinymce_plugin");
    add_filter('mce_buttons', 'gistify_register_button');

    add_thickbox();
    echo MODAL_HTML;
  }
}

function gistify_add_tinymce_plugin($plugin_array) {
  $plugin_array['kodgemisi_gistify_button'] = plugins_url( '/gistify-button.js', __FILE__ );
  return $plugin_array;
}

function gistify_register_button($buttons) {
  array_push($buttons, "kodgemisi_gistify_button");
  return $buttons;
}


// Add Gistify jQuery plugin script and style
// ==========================================
function gistify_plugin_assets() {
  wp_enqueue_style( 'gistify-css', GISTIFY_CSS_PATH );
  wp_enqueue_script( 'gistify-js', GISTIFY_JS_PATH, array( 'jquery' ) );
  wp_enqueue_script( 'gistify-render-js', plugins_url('gistify-render.js', __FILE__), array( 'jquery' ) );
}

function gistify_plugin_assets_for_admin($hook) {
  if ( 'post.php' != $hook && 'post-new.php' != $hook) {
    return;
  }
  gistify_plugin_assets();
  wp_enqueue_style( 'gistify-admin-css', plugins_url('gistify-admin.css', __FILE__) );
}

// Add plugin admin_menu
// =====================
add_action( 'admin_menu', 'gistify_plugin_menu' );

function gistify_plugin_menu() {
  add_options_page( 'Gistify Options', 'Gistify', 'manage_options', 'my-unique-identifier', 'gistify_plugin_options' );
}

function gistify_plugin_options() {
  if ( !current_user_can( 'manage_options' ) )  {
    wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
  }
  echo '<div class="wrap">';
  echo '<p>Here is where the form would go if I actually had options.</p>';
  echo '</div>';


    add_thickbox(); ?>

    <div id="my-content-id" style="display:none;">
         <p>
              This is my hidden content! It will appear in ThickBox when the link is clicked.
         </p>
    </div>

    <a href="#TB_inline?width=600&height=550&inlineId=my-content-id" class="thickbox">View my inline content!</a>

    tb_show('','#TB_inline?width=600&height=550&inlineId=my-content-id','')
<?php

}

// Register shortcode
// ==================
function gistify_shortcode( $atts ) {
  $a = shortcode_atts( array(
  'id' => '',
  'simple' => 'false',
  'description' => 'false',
  'files' => ''
  ), $atts );

  return '<div class="gistify-target" data-gist-id="'.$a['id'].'" data-gistify-description="'.$a['description'].'" data-gistify-simple="'.$a['simple'].'" data-gistify-files="'.$a['files'].'"></div>';
}
add_shortcode( 'gistify', 'gistify_shortcode' );