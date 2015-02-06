// This is for the moustache-like templates
// prevents collisions with JSP tags
_.templateSettings = {
	interpolate : /\{\{(.+?)\}\}/g
};

$(document).ready(function() {
	var mainView = new MainView({el: "#main_container"});
	mainView.render();
});
