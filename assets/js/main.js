/*
	Ethereal by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	// Settings.
		var settings = {

			// Keyboard shortcuts.
				keyboardShortcuts: {
					enabled: true,
					distance: 80
				},

			// Dragging.
				dragging: {
					enabled: true,
					momentum: 0.875,
					threshold: 10
				},

			// If set to a valid selector, prevents key/mouse events from bubbling from these elements.
				excludeSelector: 'input:focus, select:focus, textarea:focus, audio, video, iframe',

			// Link scroll speed.
				linkScrollSpeed: 1000

		};

	// Vars.
		var	$window = $(window),
			$document = $(document),
			$body = $('body'),
			$html = $('html'),
			$bodyHtml = $('body,html'),
			$wrapper = $('#wrapper');

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ '361px',   '480px'  ],
			xxsmall:  [ null,      '360px'  ],
			short:    '(min-aspect-ratio: 16/7)',
			xshort:   '(min-aspect-ratio: 16/6)'
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Mobile: disable dragging (native scroll handles it).
		if (browser.mobile) {
			settings.keyboardShortcuts.enabled = false;
			settings.dragging.enabled = false;
		}

	// Polyfill: Object fit.
		if (!browser.canUse('object-fit')) {

			$('.image[data-position]').each(function() {

				var $this = $(this),
					$img = $this.children('img');

				$this
					.css('background-image', 'url("' + $img.attr('src') + '")')
					.css('background-position', $this.data('position'))
					.css('background-size', 'cover')
					.css('background-repeat', 'no-repeat');

				$img.css('opacity', '0');

			});

		}

	// Keyboard shortcuts (vertical).
		if (settings.keyboardShortcuts.enabled)
			(function() {

				$wrapper
					.on('keypress keyup keydown', settings.excludeSelector, function(event) {
						event.stopPropagation();
					});

				$window
					.on('keydown', function(event) {

						var scrolled = false;

						switch (event.keyCode) {

							// Up arrow.
								case 38:
									$document.scrollTop($document.scrollTop() - settings.keyboardShortcuts.distance);
									scrolled = true;
									break;

							// Down arrow.
								case 40:
									$document.scrollTop($document.scrollTop() + settings.keyboardShortcuts.distance);
									scrolled = true;
									break;

							// Page Up.
								case 33:
									$document.scrollTop($document.scrollTop() - $window.height() + 100);
									scrolled = true;
									break;

							// Page Down, Space.
								case 34:
								case 32:
									$document.scrollTop($document.scrollTop() + $window.height() - 100);
									scrolled = true;
									break;

							// Home.
								case 36:
									$document.scrollTop(0);
									scrolled = true;
									break;

							// End.
								case 35:
									$document.scrollTop($document.height());
									scrolled = true;
									break;

						}

						if (scrolled) {
							event.preventDefault();
							event.stopPropagation();
							$bodyHtml.stop();
						}

					});

			})();

	// Dragging (vertical).
		if (settings.dragging.enabled)
			(function() {

				var dragging = false,
					dragged = false,
					distance = 0,
					startScroll,
					momentumIntervalId, velocityIntervalId,
					startY, currentY, previousY,
					velocity, direction;

				$wrapper

					// Prevent image drag and drop.
						.on('mouseup mousemove mousedown', '.image, img', function(event) {
							event.preventDefault();
						})

					// Prevent mouse events inside excluded elements from bubbling.
						.on('mouseup mousemove mousedown', settings.excludeSelector, function(event) {
							event.stopPropagation();
							dragging = false;
							$wrapper.removeClass('is-dragging');
							clearInterval(velocityIntervalId);
							clearInterval(momentumIntervalId);
						})

					// Mousedown event.
						.on('mousedown', function(event) {

							if (breakpoints.active('<=small'))
								return;

							clearInterval(momentumIntervalId);
							$bodyHtml.stop();

							dragging = true;
							$wrapper.addClass('is-dragging');

							startScroll = $document.scrollTop();
							startY = event.clientY;
							previousY = startY;
							currentY = startY;
							distance = 0;
							direction = 0;

							clearInterval(velocityIntervalId);

							velocityIntervalId = setInterval(function() {
								velocity = Math.abs(currentY - previousY);
								direction = (currentY > previousY ? -1 : 1);
								previousY = currentY;
							}, 50);

						})

					// Mousemove event.
						.on('mousemove', function(event) {

							if (!dragging)
								return;

							currentY = event.clientY;
							$document.scrollTop(startScroll + (startY - currentY));
							distance = Math.abs(startScroll - $document.scrollTop());

							if (!dragged && distance > settings.dragging.threshold) {
								$wrapper.addClass('is-dragged');
								dragged = true;
							}

						})

					// Mouseup/mouseleave event.
						.on('mouseup mouseleave', function(event) {

							var m;

							if (!dragging)
								return;

							if (dragged) {
								setTimeout(function() {
									$wrapper.removeClass('is-dragged');
								}, 100);
								dragged = false;
							}

							if (distance > settings.dragging.threshold)
								event.preventDefault();

							dragging = false;
							$wrapper.removeClass('is-dragging');
							clearInterval(velocityIntervalId);
							clearInterval(momentumIntervalId);

							if (settings.dragging.momentum > 0) {

								m = velocity;

								momentumIntervalId = setInterval(function() {

									if (isNaN(m)) {
										clearInterval(momentumIntervalId);
										return;
									}

									$document.scrollTop($document.scrollTop() + (m * direction));
									m = m * settings.dragging.momentum;

									if (Math.abs(m) < 1)
										clearInterval(momentumIntervalId);

								}, 15);

							}

						});

			})();

	// Link scroll (vertical).
		$wrapper
			.on('mousedown mouseup', 'a[href^="#"]', function(event) {
				event.stopPropagation();
			})
			.on('click', 'a[href^="#"]', function(event) {

				var	$this = $(this),
					href = $this.attr('href'),
					$target, x;

				if (href == '#' || ($target = $(href)).length == 0)
					return;

				event.preventDefault();
				event.stopPropagation();

				x = $target.offset().top - (Math.max(0, $window.height() - $target.outerHeight()) / 2);

				$bodyHtml
					.stop()
					.animate({ scrollTop: x }, settings.linkScrollSpeed, 'swing');

			});

	// Gallery.
		$('.gallery')
			.on('click', 'a', function(event) {

				var $a = $(this),
					$gallery = $a.parents('.gallery'),
					$modal = $gallery.children('.modal'),
					$modalImg = $modal.find('img'),
					href = $a.attr('href');

				if (!href.match(/\.(jpg|gif|png|mp4)$/))
					return;

				event.preventDefault();
				event.stopPropagation();

				if ($modal[0]._locked)
					return;

				$modal[0]._locked = true;
				$modalImg.attr('src', href);
				$modal.addClass('visible');
				$modal.focus();

				setTimeout(function() {
					$modal[0]._locked = false;
				}, 600);

			})
			.on('click', '.modal', function(event) {

				var $modal = $(this),
					$modalImg = $modal.find('img');

				if ($modal[0]._locked)
					return;

				if (!$modal.hasClass('visible'))
					return;

				event.stopPropagation();

				$modal[0]._locked = true;
				$modal.removeClass('loaded');

				setTimeout(function() {

					$modal.removeClass('visible');

					setTimeout(function() {
						$modalImg.attr('src', '');
						$modal[0]._locked = false;
						$body.focus();
					}, 475);

				}, 125);

			})
			.on('keypress', '.modal', function(event) {

				var $modal = $(this);

				if (event.keyCode == 27)
					$modal.trigger('click');

			})
			.on('mouseup mousedown mousemove', '.modal', function(event) {
				event.stopPropagation();
			})
			.prepend('<div class="modal" tabIndex="-1"><div class="inner"><img src="" /></div></div>')
				.find('img')
					.on('load', function(event) {

						var $modalImg = $(this),
							$modal = $modalImg.parents('.modal');

						setTimeout(function() {

							if (!$modal.hasClass('visible'))
								return;

							$modal.addClass('loaded');

						}, 275);

					});

})(jQuery);
