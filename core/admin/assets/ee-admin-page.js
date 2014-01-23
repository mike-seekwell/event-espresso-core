jQuery(document).ready(function($) {

	$.ajaxSetup ({ cache: false });
	// clear firefox and safari cache
	$(window).unload( function() {});




	function validate_form_inputs( submittedForm ) {
	
		var goodToGo = true;
		var cntr = 1;
		
		$( submittedForm ).find('.required').each( function( index ) {
			if( $(this).val() === '' || $(this).val() === 0 ) {
				$(this).addClass('requires-value').siblings( '.validation-notice-dv' ).fadeIn();
				goodToGo = false;
			}
			$(this).on( 'change', function() {
				if( $(this).val() !== '' || $(this).val() !== 0 ) {
					$(this).removeClass('requires-value').siblings( '.validation-notice-dv' ).fadeOut('fast');
				}
			});
			if ( cntr === 1 ) {
				var thisPos = $(this).offset();
				$(window).scrollTop( thisPos.top - 200 );
			}
			cntr++;
		});
		return goodToGo;
	}

	
	$('.submit-for-validation').click(function(event) {
		event.preventDefault();
		var submittedForm = $(this).closest('form');
		if ( validate_form_inputs( submittedForm ) ) {
			submittedForm.submit();
		}
	});
	
	$('#admin-recaptcha-settings-slct').change( function() {
		if ( $(this).val() == 1 ) {
			$('.admin-recaptcha-settings-tr').find('.maybe-required').removeClass('maybe-required').addClass('required');
			$('.admin-recaptcha-settings-tr').show();
			$('.admin-recaptcha-settings-hdr').show();
		} else {
			$('.admin-recaptcha-settings-tr').find('.required').removeClass('required').addClass('maybe-required');
			$('.admin-recaptcha-settings-tr').hide();
			$('.admin-recaptcha-settings-hdr').hide();
		}
	});
				
	$('#admin-recaptcha-settings-slct').trigger( 'change' );


		
	function escape_square_brackets( value ) {
		value = value.replace(/[[]/g,'\\\[');
		value = value.replace(/]/g,'\\\]');
		return value; 
	}


	//Confirm Delete
	function confirmDelete(){
		if (confirm('Are you sure want to delete?')){
			return true;
		}
		return false;
	}


	//Select All
	function selectAll(x) {
		for(var i=0,l=x.form.length; i<l; i++) {
			if(x.form[i].type == 'checkbox' && x.form[i].name != 'sAll') {
				x.form[i].checked=x.form[i].checked?false:true
			}
		}
	}
		
			
	
	var overlay = $( "#espresso-admin-page-overlay-dv" );
	window.eeTimeout = false;
	window.overlay = overlay;



	$('.confirm-delete').click(function() {
		var what = $(this).attr('rel');
		var answer = confirm( eei18n.confirm_delete );
		return answer;
	});

	$('.updated.fade').delay(5000).fadeOut();
	
	/*
	Floating "Save" and "Save & Close" buttons
	 */
	$(window).scroll(function() {
		var scrollTop = $(this).scrollTop();
		var offset = $('#espresso_major_buttons_wrapper .publishing-action').offset();
		if( typeof offset !== 'undefined' && offset !== null && offset.top !== 'undefined' ) {
			if ( (scrollTop+33) > offset.top ) {
				$('#event-editor-floating-save-btns').removeClass('hidden');
				$('#espresso_major_buttons_wrapper .button-primary').addClass('hidden');
			} else {
				$('#event-editor-floating-save-btns').addClass('hidden');
				$('#espresso_major_buttons_wrapper .button-primary').removeClass('hidden');
			}
		}
	});



	// Tabs for Messages box on Event Editor Page
	$(document).on('click', '.inside .nav-tab', function(e) {
		e.preventDefault();
		var content_id = $(this).attr('rel');
		//first set all content as hidden and other nav tabs as not active
		$('.ee-nav-tabs .nav-tab-content').hide();
		$('.ee-nav-tabs .nav-tab').removeClass('nav-tab-active');
		//set new active tab
		$(this).addClass('nav-tab-active');
		$('#'+content_id).show();
	});

	
	

	window.do_before_admin_page_ajax = function do_before_admin_page_ajax() {
		// stop any message alerts that are in progress
		$('#message').stop().hide();
		// spinny things pacify the masses
		var st = $('html').scrollTop();
		var po = $('#espresso-ajax-loading').parent().offset();
		var mal_top = ( st+( parseInt( $(window).height(), 10 )/5 )-po.top ) - 15;
		var ww = $('#espresso-ajax-loading').parent().width();
		var mal_left = ( ww/2 ) -15;
		//alert( 'mal_top = ' + mal_top + '\n' + 'mal_left = ' + mal_left );
		$('#espresso-ajax-loading').css({ 'top' : mal_top, 'left' : mal_left }).show();
	};
	


	window.show_admin_page_ajax_msg = function show_admin_page_ajax_msg( response, beforeWhat, closeModal ) {
			
		$('#espresso-ajax-loading').fadeOut('fast');
		if (( response.success !== 'undefined' && response.success !== '' ) || ( response.errors !== 'undefined' && response.errors !== '' )) {
		
			if ( closeModal === 'undefined' ) {
				closeModal = false;
			}

			var fadeaway = true;
			var existing_message = $('#message');

			if ( response.success !== 'undefined' && response.success !== '' ) {
				msg = '<p>' + response.success + '</p>';
				msg = existing_message.length > 0 ? msg : '<div id="message" class="updated hidden">'+msg+'</div>';
			}
		
			if ( response.errors !== 'undefined' && response.errors !== '' ) {
				msg = '<p>' + response.errors + '</p>';
				msg = existing_message.length > 0 ? msg : '<div id="message" class="error hidden">'+msg+'</div>';
				$(existing_message).removeClass('updated').addClass('error');
				fadeaway = false;
			}
			
			if ( beforeWhat === 'undefined' ) {
				beforeWhat = '#post-body-content';
			}
			
			// display message
			if ( existing_message.length > 0 ) {
				existing_message.html(msg);
			}else {
				$( beforeWhat ).before( msg );
			}
			if ( fadeaway === true ) {
				$('#message').removeClass('hidden').show().delay(8000).fadeOut();
			} else {
				$('#message').removeClass('hidden').show();
			}

		}

	};


	/**
	 * add in our own statuses IF they exist
	 */
	var our_status = $('#cur_status').text();
	// handle removing "move to trash" text if post_status is trash
	if ( our_status == 'Trashed' )
		$('#delete-action').hide();
	if ( typeof(eeCPTstatuses) !== 'undefined' ) {
		var wp_status = $('.ee-status-container', '#misc-publishing-actions').first();
		var extra_statuses = $('#ee_post_status').html();
		if ( our_status !== '' ) {
			$('#post-status-display').text(our_status);
			$('#save-post', '#save-action').val( $('#localized_status_save').text() );
		}

		//if custom stati is selected, let's update the text
		$('.save-post-status', '#post-status-select').on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			updatePostStatus();
			return false;
		});


		updatePostStatus = function(cancel) {
			cancel = typeof(cancel) === 'undefined' ? false : true;
			var selector = $('#post_status');
			var chngval = cancel ? $('#cur_stat_id').text() : $(selector).val();
			var chnglabel = eeCPTstatuses[chngval].label;
			$('#save-post', '#save-action').val(eeCPTstatuses[chngval].save_label);
			$('#cur_stat_id').text(chngval);
			if ( cancel ) {
				selector.val(chngval);
				$('#post-status-display').text(chnglabel);
			}
		};

		$('.cancel-post-status', '#post-status-select').on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			updatePostStatus(true);
			return false;
		});

		$('#post').on('submit', function(e) {
			updatePostStatus();
		});



		if ( extra_statuses !== '' )
			$(extra_statuses).appendTo($('#post_status'));
	}

	/**
	 * temporarily remove preview button
	 */
	$('#preview-action').remove();


	/**
	 * EE Help dialog loads
	 */
	$('.espresso-admin').on('click', '.ee-dialog', function(e) {
		e.preventDefault();
		//parse url to get the dialog ref
		var url = $(this).attr('href');
		//create dummy url for parser
		url = 'http://dummyurl.com/' + url;
		console.log(url);
		var queryparts = parseUri(url);

		//set dialog window
		var help_dialog = $( '#' + queryparts.queryKey.inlineId ).draggable();
		window.dialog = help_dialog;

		position_overlay();
		position_dialog();
		overlay.on('click', function() {
			dialog.fadeOut( 'fast' );
			overlay.fadeOut( 'fast' );
		});
	});



	$('#wpcontent').on( 'click', '.espresso-help-tab-lnk', function(){
		var target_help_tab = '#tab-link-' + $(this).attr('id') + ' a';
		if ( $('#contextual-help-wrap').css('display') == 'none' ) {
			$('#contextual-help-link').trigger('click');
		}
		$(target_help_tab).trigger('click');
	});



	/**
	 * lazy loading of content
	 */

	espressoAjaxPopulate = function(el) {
		function show(i, id) {
			var p, e = $('#' + id).find('.widget-loading');
			if ( e.length ) {
				p = e.parent();
				var u = $('#' + id + '_url').text();
				setTimeout( function(){
					p.load( ajaxurl + '?action=espresso-ajax-content&ee_admin_ajax=1&contentid=' + id + '&contenturl=' + u, '', function() {
						p.hide().slideDown('normal', function(){
							$(this).css('display', '');
						});
					});
				}, i * 500 );
			}
		}

		if ( el ) {
			el = el.toString();
			if ( $.inArray(el, eeLazyLoadingContainers) != -1 )
				show(0, el);
		} else {
			$.each( eeLazyLoadingContainers, show );
		}
	};
	espressoAjaxPopulate();


});