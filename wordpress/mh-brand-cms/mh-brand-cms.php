<?php
/**
 * Plugin Name: MH Brand CMS
 * Description: Headless CMS helpers for the Mariam Husssein personal brand site.
 * Version: 1.0.0
 * Author: OpenAI Codex
 */

if (! defined('ABSPATH')) {
	exit;
}

const MH_BRAND_OPTION = 'mh_brand_settings';
const MH_BRAND_SETUP_OPTION = 'mh_brand_setup_complete';

function mh_brand_defaults() {
	return [
		'hero_eyebrow' => 'Editorial notes',
		'hero_title' => 'A calm digital home for stories, lessons, and generous living.',
		'hero_subtitle' => 'A soft editorial website for essays, reflections, resources, and warm community building.',
		'hero_primary_label' => 'Read the journal',
		'hero_primary_url' => '/blog',
		'hero_secondary_label' => 'About Mariam',
		'hero_secondary_url' => '/about',
		'newsletter_eyebrow' => 'Stay close',
		'newsletter_title' => 'Letters worth slowing down for.',
		'newsletter_description' => 'Share thoughtful updates, reflections, and carefully chosen resources through this invite.',
		'newsletter_placeholder' => 'Enter your email address',
		'newsletter_button_label' => 'Subscribe',
		'newsletter_disclaimer' => 'No spam. Just intentional updates and occasional recommendations.',
		'contact_email' => get_option('admin_email'),
		'contact_phone' => '',
		'contact_location' => 'Nairobi, Kenya',
		'contact_availability' => 'Available for thoughtful collaborations, speaking, and partnerships.',
		'social_website' => '',
		'social_instagram' => '',
		'social_linkedin' => '',
		'social_pinterest' => '',
		'social_youtube' => '',
		'social_x' => '',
		'footer_blurb' => 'An editorial space for personal essays, resources, and beautifully managed storytelling.',
		'footer_copyright' => '© ' . gmdate('Y') . ' Mariam Husssein. All rights reserved.',
		'footer_newsletter_label' => 'Join the newsletter',
		'footer_newsletter_url' => '/newsletter',
	];
}

function mh_brand_settings() {
	$settings = get_option(MH_BRAND_OPTION, []);
	return wp_parse_args(is_array($settings) ? $settings : [], mh_brand_defaults());
}

function mh_brand_register_content() {
	register_post_type('testimonial', [
		'labels' => ['name' => 'Testimonials', 'singular_name' => 'Testimonial'],
		'public' => true,
		'publicly_queryable' => false,
		'exclude_from_search' => true,
		'show_in_rest' => true,
		'show_in_menu' => true,
		'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'page-attributes'],
		'has_archive' => false,
		'rewrite' => false,
		'menu_icon' => 'dashicons-format-status',
	]);

	register_post_type('faq', [
		'labels' => ['name' => 'FAQs', 'singular_name' => 'FAQ'],
		'public' => true,
		'publicly_queryable' => false,
		'show_in_rest' => true,
		'supports' => ['title', 'editor', 'page-attributes'],
		'has_archive' => false,
		'rewrite' => false,
		'menu_icon' => 'dashicons-editor-help',
	]);

	register_post_type('resource', [
		'labels' => ['name' => 'Resources', 'singular_name' => 'Resource'],
		'public' => true,
		'publicly_queryable' => false,
		'show_in_rest' => true,
		'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'page-attributes'],
		'has_archive' => false,
		'rewrite' => false,
		'menu_icon' => 'dashicons-welcome-learn-more',
	]);

	register_post_type('contact_message', [
		'labels' => ['name' => 'Contact Messages', 'singular_name' => 'Contact Message'],
		'public' => false,
		'show_ui' => true,
		'show_in_rest' => false,
		'supports' => ['title', 'editor'],
		'menu_icon' => 'dashicons-email-alt',
	]);

	register_nav_menus([
		'primary' => 'Primary Navigation',
		'footer'  => 'Footer Navigation',
	]);
}
add_action('init', 'mh_brand_register_content');
add_action('after_setup_theme', static function() {
	add_theme_support('custom-logo');
	add_theme_support('post-thumbnails', ['post', 'page', 'resource', 'testimonial']);
});
add_action('admin_init', 'mh_brand_maybe_seed_defaults');

register_activation_hook(__FILE__, static function() {
	if (! get_option(MH_BRAND_OPTION)) {
		add_option(MH_BRAND_OPTION, mh_brand_defaults());
	}
	mh_brand_register_content();
	mh_brand_seed_pages();
	mh_brand_seed_categories();
	update_option(MH_BRAND_SETUP_OPTION, 1);
	flush_rewrite_rules();
});

register_deactivation_hook(__FILE__, static function() {
	flush_rewrite_rules();
});

function mh_brand_maybe_seed_defaults() {
	if (get_option(MH_BRAND_SETUP_OPTION)) {
		return;
	}

	mh_brand_seed_pages();
	mh_brand_seed_categories();
	update_option(MH_BRAND_SETUP_OPTION, 1);
}

function mh_brand_seed_pages() {
	$pages = [
		'about' => ['About', 'Share Mariam’s story, values, and current season here.'],
		'contact' => ['Contact', 'Invite readers, collaborators, and brand partners to get in touch.'],
		'letters-younger-me' => ['Letters to My Younger Self', 'Use this page for the intro copy, featured image, and SEO for the Younger Me letters collection.'],
		'letters-current-me' => ['Letters to My Current Self', 'Use this page for the intro copy, featured image, and SEO for the Current Me letters collection.'],
		'letters-future-me' => ['Letters to My Future Self', 'Use this page for the intro copy, featured image, and SEO for the Future Me letters collection.'],
		'newsletter' => ['Newsletter', 'Introduce the newsletter and why someone should subscribe.'],
		'reviews' => ['Reviews', 'Share approved testimonials and invite visitors to submit their own.'],
		'resources' => ['Resources', 'List your offerings, curated recommendations, or signature resources.'],
		'privacy-policy' => ['Privacy Policy', 'Add your privacy policy here.'],
		'terms' => ['Terms', 'Add your terms and conditions here.'],
	];

	foreach ($pages as $slug => $page) {
		if (! get_page_by_path($slug, OBJECT, 'page')) {
			wp_insert_post([
				'post_type' => 'page',
				'post_status' => 'publish',
				'post_title' => $page[0],
				'post_name' => $slug,
				'post_content' => wpautop($page[1]),
			]);
		}
	}
}

function mh_brand_seed_categories() {
	$categories = [
		'younger-me' => 'Letters to My Younger Self',
		'current-me' => 'Letters to My Current Self',
		'future-me' => 'Letters to My Future Self',
	];

	foreach ($categories as $slug => $name) {
		if (! term_exists($slug, 'category')) {
			wp_insert_term($name, 'category', [
				'slug' => $slug,
			]);
		}
	}
}

function mh_brand_menu_items($location) {
	$locations = get_nav_menu_locations();
	$menu_id = $locations[ $location ] ?? 0;
	$items = $menu_id ? wp_get_nav_menu_items($menu_id) : [];

	return array_values(array_filter(array_map(static function($item) {
		if (! $item) {
			return null;
		}

		return [
			'id' => (int) $item->ID,
			'title' => html_entity_decode($item->title),
			'url' => $item->url,
			'target' => $item->target ?: '',
		];
	}, is_array($items) ? $items : [])));
}

function mh_brand_social_links($settings) {
	$links = [
		['label' => 'Website', 'url' => $settings['social_website']],
		['label' => 'Instagram', 'url' => $settings['social_instagram']],
		['label' => 'LinkedIn', 'url' => $settings['social_linkedin']],
		['label' => 'Pinterest', 'url' => $settings['social_pinterest']],
		['label' => 'YouTube', 'url' => $settings['social_youtube']],
		['label' => 'X', 'url' => $settings['social_x']],
	];

	return array_values(array_filter($links, static function($item) {
		return ! empty($item['url']);
	}));
}

function mh_brand_register_meta() {
	$seo_targets = ['post', 'page', 'resource'];
	foreach ($seo_targets as $type) {
		register_post_meta($type, '_mh_seo_title', ['show_in_rest' => true, 'single' => true, 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field']);
		register_post_meta($type, '_mh_seo_description', ['show_in_rest' => true, 'single' => true, 'type' => 'string', 'sanitize_callback' => 'sanitize_textarea_field']);
		register_post_meta($type, '_mh_og_image', ['show_in_rest' => true, 'single' => true, 'type' => 'string', 'sanitize_callback' => 'esc_url_raw']);
	}
	register_post_meta('resource', '_mh_resource_cta_label', ['show_in_rest' => true, 'single' => true, 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field']);
	register_post_meta('resource', '_mh_resource_url', ['show_in_rest' => true, 'single' => true, 'type' => 'string', 'sanitize_callback' => 'esc_url_raw']);
	register_post_meta('resource', '_mh_resource_highlight', ['show_in_rest' => true, 'single' => true, 'type' => 'boolean', 'sanitize_callback' => 'rest_sanitize_boolean']);
	register_post_meta('testimonial', '_mh_testimonial_rating', ['show_in_rest' => true, 'single' => true, 'type' => 'integer', 'sanitize_callback' => 'absint']);
	register_post_meta('testimonial', '_mh_submitter_name', ['show_in_rest' => true, 'single' => true, 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field']);
	register_post_meta('testimonial', '_mh_submitter_email', ['show_in_rest' => false, 'single' => true, 'type' => 'string', 'sanitize_callback' => 'sanitize_email']);
}
add_action('rest_api_init', 'mh_brand_register_meta');

function mh_brand_rest_settings() {
	$settings = mh_brand_settings();
	$logo_id = (int) get_theme_mod('custom_logo');
	return [
		'siteTitle' => get_bloginfo('name'),
		'siteDescription' => get_bloginfo('description'),
		'siteUrl' => home_url('/'),
		'logoUrl' => $logo_id ? wp_get_attachment_image_url($logo_id, 'full') : '',
		'logoAlt' => $logo_id ? get_post_meta($logo_id, '_wp_attachment_image_alt', true) : '',
		'primaryMenu' => mh_brand_menu_items('primary'),
		'footerMenu' => mh_brand_menu_items('footer'),
		'hero' => [
			'eyebrow' => $settings['hero_eyebrow'],
			'title' => $settings['hero_title'],
			'subtitle' => $settings['hero_subtitle'],
			'primaryCtaLabel' => $settings['hero_primary_label'],
			'primaryCtaUrl' => $settings['hero_primary_url'],
			'secondaryCtaLabel' => $settings['hero_secondary_label'],
			'secondaryCtaUrl' => $settings['hero_secondary_url'],
		],
		'newsletter' => [
			'eyebrow' => $settings['newsletter_eyebrow'],
			'title' => $settings['newsletter_title'],
			'description' => $settings['newsletter_description'],
			'placeholder' => $settings['newsletter_placeholder'],
			'buttonLabel' => $settings['newsletter_button_label'],
			'disclaimer' => $settings['newsletter_disclaimer'],
		],
		'contact' => [
			'email' => $settings['contact_email'],
			'phone' => $settings['contact_phone'],
			'location' => $settings['contact_location'],
			'availability' => $settings['contact_availability'],
		],
		'socialLinks' => mh_brand_social_links($settings),
		'footer' => [
			'blurb' => $settings['footer_blurb'],
			'copyright' => $settings['footer_copyright'],
			'newsletterCtaLabel' => $settings['footer_newsletter_label'],
			'newsletterCtaUrl' => $settings['footer_newsletter_url'],
		],
	];
}

function mh_brand_register_routes() {
	register_rest_route('mh-site/v1', '/settings', [
		'methods' => 'GET',
		'permission_callback' => '__return_true',
		'callback' => static function() {
			return rest_ensure_response(mh_brand_rest_settings());
		},
	]);

	register_rest_route('mh-site/v1', '/testimonials/submit', [
		'methods' => 'POST',
		'permission_callback' => '__return_true',
		'callback' => 'mh_brand_submit_testimonial',
	]);

	register_rest_route('mh-site/v1', '/contact', [
		'methods' => 'POST',
		'permission_callback' => '__return_true',
		'callback' => 'mh_brand_submit_contact',
	]);
}
add_action('rest_api_init', 'mh_brand_register_routes');

function mh_brand_rate_limit($prefix) {
	$ip = sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? 'unknown');
	$key = 'mh_brand_' . $prefix . '_' . md5($ip);
	if (get_transient($key)) {
		return new WP_Error('too_many_requests', 'Please wait a moment before trying again.', ['status' => 429]);
	}
	set_transient($key, 1, MINUTE_IN_SECONDS * 3);
	return true;
}

function mh_brand_submit_testimonial(WP_REST_Request $request) {
	$limited = mh_brand_rate_limit('review');
	if (is_wp_error($limited)) {
		return $limited;
	}

	$name = sanitize_text_field((string) $request->get_param('name'));
	$email = sanitize_email((string) $request->get_param('email'));
	$rating = max(1, min(5, absint($request->get_param('rating'))));
	$message = wp_kses_post(wpautop((string) $request->get_param('message')));
	$website = sanitize_text_field((string) $request->get_param('website'));
	$started = absint($request->get_param('startedAt'));

	if ($website || ! $name || ! is_email($email) || ! $message) {
		return new WP_Error('invalid_submission', 'Please complete every required field.', ['status' => 400]);
	}
	if ($started && (round(microtime(true) * 1000) - $started) < 3000) {
		return new WP_Error('spam_detected', 'Please take a moment before submitting.', ['status' => 400]);
	}

	$post_id = wp_insert_post([
		'post_type' => 'testimonial',
		'post_status' => 'pending',
		'post_title' => $name,
		'post_content' => $message,
		'post_excerpt' => wp_trim_words(wp_strip_all_tags($message), 28),
	]);

	if (is_wp_error($post_id) || ! $post_id) {
		return new WP_Error('save_failed', 'We could not save your testimonial right now.', ['status' => 500]);
	}

	update_post_meta($post_id, '_mh_testimonial_rating', $rating);
	update_post_meta($post_id, '_mh_submitter_name', $name);
	update_post_meta($post_id, '_mh_submitter_email', $email);

	$files = $request->get_file_params();
	if (! empty($files['photo']['tmp_name'])) {
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		$_FILES['photo'] = $files['photo'];
		$attachment_id = media_handle_upload('photo', $post_id);
		if (! is_wp_error($attachment_id)) {
			set_post_thumbnail($post_id, $attachment_id);
		}
	}

	return rest_ensure_response(['message' => 'Thank you. Your testimonial has been received and is awaiting approval.']);
}

function mh_brand_submit_contact(WP_REST_Request $request) {
	$limited = mh_brand_rate_limit('contact');
	if (is_wp_error($limited)) {
		return $limited;
	}

	$name = sanitize_text_field((string) $request->get_param('name'));
	$email = sanitize_email((string) $request->get_param('email'));
	$subject = sanitize_text_field((string) $request->get_param('subject'));
	$message = wp_kses_post(wpautop((string) $request->get_param('message')));

	if (! $name || ! is_email($email) || ! $subject || ! $message) {
		return new WP_Error('invalid_contact', 'Please complete every required field.', ['status' => 400]);
	}

	$post_id = wp_insert_post([
		'post_type' => 'contact_message',
		'post_status' => 'private',
		'post_title' => $subject . ' — ' . $name,
		'post_content' => $message,
	]);

	if ($post_id && ! is_wp_error($post_id)) {
		update_post_meta($post_id, '_mh_submitter_email', $email);
	}

	$settings = mh_brand_settings();
	if (! empty($settings['contact_email']) && function_exists('wp_mail')) {
		wp_mail($settings['contact_email'], '[Website] ' . $subject, wp_strip_all_tags($message) . "\n\nFrom: {$name} <{$email}>");
	}

	return rest_ensure_response(['message' => 'Your message has been sent.']);
}

add_action('admin_init', static function() {
	register_setting('mh_brand_settings_group', MH_BRAND_OPTION, [
		'sanitize_callback' => static function($input) {
			$output = mh_brand_defaults();
			foreach ($output as $key => $value) {
				$current = $input[ $key ] ?? '';
				$is_email = false !== strpos($key, 'email');
				$is_url = false !== strpos($key, 'url') || false !== strpos($key, 'social_');
				$output[ $key ] = $is_email ? sanitize_email($current) : ($is_url ? esc_url_raw($current) : sanitize_text_field($current));
			}
			return $output;
		},
	]);
});

add_action('admin_menu', static function() {
	add_menu_page('Mariam Brand', 'Mariam Brand', 'manage_options', 'mh-brand-settings', 'mh_brand_render_settings_page', 'dashicons-admin-customizer', 25);
});

function mh_brand_field($settings, $key, $label, $type = 'text') {
	$value = esc_attr($settings[ $key ] ?? '');
	echo '<tr><th scope="row"><label for="' . esc_attr($key) . '">' . esc_html($label) . '</label></th><td>';
	if ('textarea' === $type) {
		echo '<textarea class="large-text" rows="4" id="' . esc_attr($key) . '" name="' . esc_attr(MH_BRAND_OPTION) . '[' . esc_attr($key) . ']">' . esc_textarea($settings[ $key ] ?? '') . '</textarea>';
	} else {
		echo '<input class="regular-text" type="' . esc_attr($type) . '" id="' . esc_attr($key) . '" name="' . esc_attr(MH_BRAND_OPTION) . '[' . esc_attr($key) . ']" value="' . $value . '">';
	}
	echo '</td></tr>';
}

function mh_brand_render_settings_page() {
	$settings = mh_brand_settings();
	?>
	<div class="wrap">
		<h1>Mariam Brand Settings</h1>
		<p>Manage hero copy, newsletter text, contact details, social links, and footer content for the headless frontend.</p>
		<form method="post" action="options.php">
			<?php settings_fields('mh_brand_settings_group'); ?>
			<h2>Hero</h2><table class="form-table"><?php mh_brand_field($settings, 'hero_eyebrow', 'Eyebrow'); mh_brand_field($settings, 'hero_title', 'Title', 'textarea'); mh_brand_field($settings, 'hero_subtitle', 'Subtitle', 'textarea'); mh_brand_field($settings, 'hero_primary_label', 'Primary CTA Label'); mh_brand_field($settings, 'hero_primary_url', 'Primary CTA URL', 'url'); mh_brand_field($settings, 'hero_secondary_label', 'Secondary CTA Label'); mh_brand_field($settings, 'hero_secondary_url', 'Secondary CTA URL', 'url'); ?></table>
			<h2>Newsletter</h2><table class="form-table"><?php mh_brand_field($settings, 'newsletter_eyebrow', 'Eyebrow'); mh_brand_field($settings, 'newsletter_title', 'Title', 'textarea'); mh_brand_field($settings, 'newsletter_description', 'Description', 'textarea'); mh_brand_field($settings, 'newsletter_placeholder', 'Placeholder'); mh_brand_field($settings, 'newsletter_button_label', 'Button label'); mh_brand_field($settings, 'newsletter_disclaimer', 'Disclaimer', 'textarea'); ?></table>
			<h2>Contact</h2><table class="form-table"><?php mh_brand_field($settings, 'contact_email', 'Email', 'email'); mh_brand_field($settings, 'contact_phone', 'Phone'); mh_brand_field($settings, 'contact_location', 'Location'); mh_brand_field($settings, 'contact_availability', 'Availability', 'textarea'); ?></table>
			<h2>Social Links</h2><table class="form-table"><?php mh_brand_field($settings, 'social_website', 'Website', 'url'); mh_brand_field($settings, 'social_instagram', 'Instagram', 'url'); mh_brand_field($settings, 'social_linkedin', 'LinkedIn', 'url'); mh_brand_field($settings, 'social_pinterest', 'Pinterest', 'url'); mh_brand_field($settings, 'social_youtube', 'YouTube', 'url'); mh_brand_field($settings, 'social_x', 'X', 'url'); ?></table>
			<h2>Footer</h2><table class="form-table"><?php mh_brand_field($settings, 'footer_blurb', 'Blurb', 'textarea'); mh_brand_field($settings, 'footer_copyright', 'Copyright'); mh_brand_field($settings, 'footer_newsletter_label', 'Newsletter CTA Label'); mh_brand_field($settings, 'footer_newsletter_url', 'Newsletter CTA URL', 'url'); ?></table>
			<?php submit_button('Save brand settings'); ?>
		</form>
		<p><strong>Menus:</strong> assign your main and footer menus in Appearance → Menus using the <em>Primary Navigation</em> and <em>Footer Navigation</em> locations.</p>
		<p><strong>Logo:</strong> upload it in Appearance → Customize → Site Identity.</p>
	</div>
	<?php
}

add_action('add_meta_boxes', static function() {
	add_meta_box('mh-seo-fields', 'Headless SEO', 'mh_brand_render_seo_box', ['post', 'page', 'resource'], 'normal', 'high');
	add_meta_box('mh-resource-fields', 'Resource Details', 'mh_brand_render_resource_box', 'resource', 'side');
	add_meta_box('mh-testimonial-fields', 'Submission Details', 'mh_brand_render_testimonial_box', 'testimonial', 'side');
});

function mh_brand_nonce() {
	wp_nonce_field('mh_brand_meta', 'mh_brand_meta_nonce');
}

function mh_brand_render_seo_box($post) {
	mh_brand_nonce();
	echo '<p><label>SEO Title</label><br><input class="widefat" name="mh_seo_title" value="' . esc_attr(get_post_meta($post->ID, '_mh_seo_title', true)) . '"></p>';
	echo '<p><label>SEO Description</label><br><textarea class="widefat" rows="3" name="mh_seo_description">' . esc_textarea(get_post_meta($post->ID, '_mh_seo_description', true)) . '</textarea></p>';
	echo '<p><label>Open Graph Image URL</label><br><input class="widefat" name="mh_og_image" value="' . esc_attr(get_post_meta($post->ID, '_mh_og_image', true)) . '"></p>';
}

function mh_brand_render_resource_box($post) {
	mh_brand_nonce();
	echo '<p><label>CTA Label</label><br><input class="widefat" name="mh_resource_cta_label" value="' . esc_attr(get_post_meta($post->ID, '_mh_resource_cta_label', true)) . '"></p>';
	echo '<p><label>CTA URL</label><br><input class="widefat" name="mh_resource_url" value="' . esc_attr(get_post_meta($post->ID, '_mh_resource_url', true)) . '"></p>';
	echo '<p><label><input type="checkbox" name="mh_resource_highlight" value="1" ' . checked((bool) get_post_meta($post->ID, '_mh_resource_highlight', true), true, false) . '> Highlight this resource</label></p>';
}

function mh_brand_render_testimonial_box($post) {
	mh_brand_nonce();
	echo '<p><label>Submitter Name</label><br><input class="widefat" name="mh_submitter_name" value="' . esc_attr(get_post_meta($post->ID, '_mh_submitter_name', true)) . '"></p>';
	echo '<p><label>Submitter Email</label><br><input class="widefat" name="mh_submitter_email" value="' . esc_attr(get_post_meta($post->ID, '_mh_submitter_email', true)) . '"></p>';
	echo '<p><label>Rating</label><br><input class="small-text" type="number" min="1" max="5" name="mh_testimonial_rating" value="' . esc_attr(get_post_meta($post->ID, '_mh_testimonial_rating', true) ?: 5) . '"></p>';
		echo '<p>Keep testimonials as <strong>Pending Review</strong> until approved. Only published testimonials appear on the live site.</p>';
}

add_action('save_post', static function($post_id) {
	if (! isset($_POST['mh_brand_meta_nonce']) || ! wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['mh_brand_meta_nonce'])), 'mh_brand_meta') || defined('DOING_AUTOSAVE')) {
		return;
	}
	if (! current_user_can('edit_post', $post_id)) {
		return;
	}
	update_post_meta($post_id, '_mh_seo_title', sanitize_text_field(wp_unslash($_POST['mh_seo_title'] ?? '')));
	update_post_meta($post_id, '_mh_seo_description', sanitize_textarea_field(wp_unslash($_POST['mh_seo_description'] ?? '')));
	update_post_meta($post_id, '_mh_og_image', esc_url_raw(wp_unslash($_POST['mh_og_image'] ?? '')));
	if ('resource' === get_post_type($post_id)) {
		update_post_meta($post_id, '_mh_resource_cta_label', sanitize_text_field(wp_unslash($_POST['mh_resource_cta_label'] ?? '')));
		update_post_meta($post_id, '_mh_resource_url', esc_url_raw(wp_unslash($_POST['mh_resource_url'] ?? '')));
		update_post_meta($post_id, '_mh_resource_highlight', isset($_POST['mh_resource_highlight']));
	}
	if ('testimonial' === get_post_type($post_id)) {
		update_post_meta($post_id, '_mh_submitter_name', sanitize_text_field(wp_unslash($_POST['mh_submitter_name'] ?? '')));
		update_post_meta($post_id, '_mh_submitter_email', sanitize_email(wp_unslash($_POST['mh_submitter_email'] ?? '')));
		update_post_meta($post_id, '_mh_testimonial_rating', max(1, min(5, absint($_POST['mh_testimonial_rating'] ?? 5))));
	}
});
