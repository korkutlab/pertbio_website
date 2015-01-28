/**
 * Singleton class for generic view utility tasks.
 */
var ViewUtil = (function()
{
	/**
	 * Displays an error message to the user as a NotyView.
	 *
	 * @param message   message content
	 */
	function displayErrorMessage(message)
	{
		//$("#main-network-view").empty();
		//self.networkView = null;

		var notyView = new NotyView({
			template: "#noty-error-msg-template",
			error: true,
			model: {
				errorMsg: message
			}
		});

		notyView.render();
	}

	/**
	 * Default tooltip (qTip) options.
	 *
	 * @returns {Object}    qTip options object
	 */
	function defaultTooltipOptions()
	{
		return {
			content: null,
			hide: {fixed: true, delay: 100, event: 'mouseout'},
			show: {event: 'mouseover'},
			style: {classes: 'qtip-light qtip-rounded qtip-shadow'},
			position: {my:'bottom left', at:'top center' , viewport: $(window)}
		};
	}

	return {
		displayErrorMessage: displayErrorMessage,
		defaultTooltipOptions: defaultTooltipOptions
	};
})();
