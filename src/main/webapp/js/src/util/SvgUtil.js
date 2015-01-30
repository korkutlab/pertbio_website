/**
 * Singleton utility class for SVG drawing related tasks.
 *
 * @author Selcuk Onur Sumer
 */
var SvgUtil = (function() {
	/**
	 * Creates the main svg (graphical) component.
	 *
	 * @param container main container (div, etc.)
	 * @param width     width of the svg area
	 * @param height    height of the svg area
	 * @return {object} svg component
	 */
	function createSvg(container, width, height)
	{
		var svg = container.append("svg");

		svg.attr('width', width);
		svg.attr('height', height);

		return svg;
	}

	return {
		createSvg: createSvg
	};
})();
