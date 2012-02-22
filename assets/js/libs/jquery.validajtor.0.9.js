/************************************************
 *
 *  File     :  Validajtor.js
 *  Desc     :  Form validation
 *  Version  :  0.9
 *  Author   :  Pud.ca (c) 2011 // 'drej
 *  Rights   :  GNU Public License
 *
 ************************************************/

(function( $ ){
	$.fn.validajte = function(options) {
		var settings = {
			'labelpos' : 'relative',
			'ajax' : false
		}

		$.extend(settings, options)

		$('input[data-validation], select[data-validation]', this).each(function() {
			var $label = $('label[for=' + $(this).attr('id') + ']');
			$label.append('<strong> *</strong>')
		})
		
		this.attr('novalidate', 'novalidate');

		this.live('submit', function(e) {
			var valid = true;
			var ct = 0;
			var $form = $(this);
			var action = $form.attr('action');
			var $btn = $('button[type=submit]', $form);

			// reset previous failed states
			$('.failed', $form).removeClass('failed');
			$('.error', $form).fadeOut().remove();
			
			$('input:not([type=submit]), select, textarea', $form).filter(":visible").each(function() {
				var params = {
					required: false,
					type: 'text',
					match: false,
					message: 'This is a required field'
				}
				
				var $el = $(this);
				var $label = $('label[for=' + $el.attr('id') + ']');
				var o = $.extend(params, $el.data('validation'));
				var msg = o.message;
				var failed = false;
				
				// required
					// text inputs
					if(o.required == true && !$el.val()) {
						failed = true;
					}
					
					// radio and checkbox
					if(o.required == true && $el.is(':radio, :checkbox')) {
						var group = $el.attr('name');
						if (!$('input[name='+group+']:checked').length > 0) {
							failed = true; 
						}
					}
					
					// select inputs
					if(o.required == true && $el.is('select') && $el.val() == '') {
						failed = true;
					}
				
				// type
					// email
					if(o.type == 'email') {
						var regexp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9][a-zA-Z0-9.-]*[\.]{1}[a-zA-Z]{2,4}$/;
						if ($el.val().search(regexp) == -1) {
							failed = true;
						}
					}
					
					// secure password
					if(o.type == 'securepass') {
						var regexp = /^.*(?=.{6,})(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).*$/;
						if ($el.val().search(regexp) == -1) {
							failed = true;
							msg = 'Password needs to be at least 8 characters in length, contain an uppercase letter and a special character or number';
						}
					}
					
					// date
					if(o.type == 'date') {
						//var regexp = /^\d{1,2}(\-|\/|\.)\d{1,2}\1\d{4}$/;
						var regexp = /^(0[1-9]|1[012])[\/](0[1-9]|[12][0-9]|3[01])[\/](19|20)\d\d$/;
						if ($el.val().search(regexp) == -1) {
							failed = true;
							msg = 'Date needs to be entered in MM/DD/YYYY format';
						}			
					}
					
					//zip
					if(o.type == 'zip') {
						var regexp = /^(\d{5}|\d{9}|\d{5}-\d{4})$/;
						if ($el.val().search(regexp) == -1) {
							failed = true;
							msg = 'Please provide a valid zip codes';
						}						
					}
					
					//postal
					if(o.type == 'postal') {
						var regexp = /^[ABCEGHJKLMNPRSTVXYabceghjklmnprstvxy]{1}\d{1}[A-Za-z]{1} *\d{1}[A-Za-z]{1}\d{1}$/;
						if ($el.val().search(regexp) == -1) {
							failed = true;
							msg = 'Please provide a valid postal codes';
						}						
					}
				
				// match
					if(o.match) {
						var $label = $('label[for=' + $el.attr('id') + ']');
						var txt = $label.text().replace(':','').replace('*', '');
						var $tomatch = $('#' + o.match);
						
						if ($el.val() != $tomatch.val()) {
							failed = true;
							msg = txt + ' needs to match';
							$tomatch.parent().addClass('failed'); 
						}
					}

				// regexp
					if(o.regexp) {
						var regexp = o.regexp;
						if ($el.val().search(regexp) == -1) {
							failed = true;
						}
					}
					
				// build error message and fail state
				if(failed == true) {
					$el.addClass('failed');
					$label.addClass('failed');
					$el.parent().append('<div class="error">' + msg + '</div>')
					
					if (o.match && ($('.error', $el.parent()).length < 1 )) {
						$tomatch.parent().append('<div class="error">' + msg + '</div>')
					}
					
					if (settings.labelpos == 'absolute') {
						var loffset = $el.outerWidth() + $label.outerWidth() + 8;
						$el.siblings('.error').css( {
							'left' : loffset + 'px',
							'position' : 'absolute'	
						})
					}
					
					ct++
				}
			})
			
			// check if there are any failed items per counter
			if (ct > 0) valid = false;
			
			if (valid == true) {
				// submit form
				
				if (settings.ajax == true) { // ajax submit
					$.post(action, $form.serialize(), function(data) {

						$('.errormsg').remove();

						/* the following relies on a JSON object response from the server, can be enabled if need be, but needs some normalization before it should be implemented permanently. */
						if (data.status == 'success') {
							$('.successmsg').appendTo($form);
							$('.successmsg').html(data.msg);
						}
						
						else if (data.status == 'failed') {
							$('.errormsg').remove();
							$btn.before('<div class="errormsg">' + data.message + '</div>');
						}
						
						else if (data.status == 'redirect') {
							window.open(data.rel, '_blank')
						}

					}, "json") 

					e.preventDefault();
					return false;

				}
				else { // non ajax submit
					return true;
				}
			}
			
			else {
				if (settings.labelpos == 'absolute') {
					$('.error').fadeIn();
				}
				else {
					$('.error').slideDown();
				}
				
				$('input.failed, textarea.failed, select.failed').eq(0).focus();
				
				// prevent submit
				e.preventDefault();
				return false;
			};
		});
	};
})( jQuery );