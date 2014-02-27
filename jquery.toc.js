/*
	Table of Contents v0.2
	by Pete Cook (@cookpete)
*/
;(function ($, window, document, undefined) {

	$.fn.toc = function(options) {

		// Default settings
		var defaults = {
				selector: 	'h1, h2, h3, h4, h5, h6',
				exclude: 	'',
				classes: 	''
			};

		// Merge options
		options = $.extend({}, defaults, options);

		var depthArray = options.selector.split(',').map($.trim), 	// Used in getDepth()
			names = {}, 			// For counting duplicate headings
			headings = [],
			arrays = [headings],
			prevDepth,
			newHeading;

		// Heading class

		function Heading(element){
			this.element 		= element;
			this.text 			= $(element).html();
			this.subheadings 	= [];

			this.name = slug(this.text);

			if(names[this.name]) {
				this.name += '-' + (++names[this.name]);
			} else {
				names[this.name] = 1;
			}

			$(this.element).attr('id', this.name);

			if(options.linkHeadings) {
				$(this.element).wrapInner('<a href="#' + this.name + '">');
			}
		}

		Heading.prototype = {

			toString: function(){
				
				var html = '';

				html += '<li>';
				html += '<a href="#' + this.name + '">';

				if(this.num) {
					html += '<span class="toc-num">' + this.num + '</span>';
				}

				html += this.text;
				html += '</a>';

				if(this.subheadings.length) {
					html += '<ul>';
					html += this.subheadings.join('');
					html += '</ul>';
				}

				html += '</li>';

				return html;
			}

		};

		// Get the content that we want to search through
		var content = this;

		// Cut the top off if options.toc is set
		if(options.toc) {
			content = content.find(options.toc).nextAll();
		}

		// Filter and exclude using options
		content = content.filter(options.selector);
		content = content.not(options.exclude);

		// Loop through all the headings we can find
		content.each(function(){

			var depth = getDepth(this);

			if(depth > prevDepth) {
				for(i = depth - prevDepth; i; i--) arrays.push(newHeading.subheadings);
			}
			if(depth < prevDepth) {
				for(i = prevDepth - depth; i; i--) arrays.pop();
			}

			newHeading = new Heading(this);
			arrays[arrays.length - 1].push(newHeading);

			prevDepth = depth;

		});

		if(options.numbered) {
			numerateHeadings(headings);
		}

		// Build TOC
		$ul = $(options.toc);

		if(!$(options.toc).is('ul')) {
			$ul.append('<ul>');
			$ul = $ul.find('ul');
		}

		$ul.html(headings.join(''));

		// // Prepend the TOC to our element
		// if(options.toc) {
		// 	$(options.toc).append($ul);
		// } else {
		// 	this.prepend($ul);
		// }

		// Functions

		function getDepth(element){
			return $.inArray(element.tagName.toLowerCase(), depthArray);
		}

		function numerateHeadings(headings, prefix) {
			prefix = prefix || '';
			for (var i = 0, l = headings.length; i !== l; i++) {
				var heading = headings[i],
					num = prefix + (i + 1);

				heading.num = num;

				if(options.numberHeadings) {
					$(heading.element).prepend('<span class="toc-num">' + num + '</span> ');
				}

				if(heading.subheadings) {
					numerateHeadings(heading.subheadings, num + '.');
				}
			}
		}

		function slug(str){
			str = str.toLowerCase();
			str = str.replace(/&.+?;/gi, ''); 		// Remove HTML chars
			str = str.replace(/\s+/g, '-');			// Spaces into dashes
			str = str.replace(/[^a-z0-9-]/gi, '');	// Remove all weird chars
			return str;
		}

		return this;

	}

}(jQuery, window, document));