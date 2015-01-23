/**
 * Singleton class for generic view utility tasks.
 */
var ViewUtil = (function()
{
	// displays an error message to the user as a NotyView
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

	return {
		displayErrorMessage: displayErrorMessage
	};
})();
