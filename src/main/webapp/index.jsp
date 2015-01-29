<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@page import="org.springframework.web.context.WebApplicationContext"%>
<%@page import="org.springframework.web.context.support.WebApplicationContextUtils"%>

<%
    WebApplicationContext context = WebApplicationContextUtils.getWebApplicationContext(application);
    //String pcURL = (String) context.getBean("pathwayCommonsURLStr");
    //String pcVizURL = (String) context.getBean("pcVizURLStr");
%>
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/html">
  <head>
    <meta charset="utf-8">
    <title>Peralyzer</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- jQuery UI -->
	<link href="css/jquery-ui.min.css" rel="stylesheet">

    <!-- Bootstrap -->
    <link href="css/bootstrap.css" rel="stylesheet">

    <!-- Flat UI -->
    <!--link href="css/flat-ui.css" rel="stylesheet"-->
    <!--link rel="shortcut icon" href="images/favicon.ico"-->

    <link href="css/jquery.fancybox-1.3.4.css" rel="stylesheet">
	<link href="css/jquery.qtip.min.css" rel="stylesheet">

    <!-- cytoscape.js -->
    <link href="css/jquery.cytoscape-panzoom.css" rel="stylesheet">
    <link href="//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css" rel="stylesheet">

    <!-- Peralyzer; this should always be the last to call! -->
	<link href="css/peralyzer.css" rel="stylesheet">

    <!-- HTML5 shim, for IE6-8 support of HTML5 elements. All other JS at the end of file. -->
    <!--[if lt IE 9]>
      <script src="js/lib/html5shiv.js"></script>
    <![endif]-->

  </head>
  <body>
	<!-- JS libraries -->
	<script src="js/lib/jquery-2.1.3.min.js"></script>
	<script src="js/lib/jquery-ui.min.js"></script>
	<script src="js/lib/jquery.dropkick-1.0.0.js"></script>
	<script src="js/lib/custom_checkbox_and_radio.js"></script>
	<script src="js/lib/custom_checkbox_and_radio.js"></script>
	<script src="js/lib/custom_radio.js"></script>
	<script src="js/lib/jquery.tagsinput.js"></script>
	<script src="js/lib/jquery.ui.touch-punch.min.js"></script>
	<script src="js/lib/bootstrap.min.js"></script>
	<script src="js/lib/jquery.placeholder.js"></script>
	<script src="js/lib/arbor.js"></script>
	<script src="js/lib/cytoscape.min.js"></script>
	<script src="js/lib/jquery.cytoscape-panzoom.min.js"></script>
	<script src="js/lib/underscore-min.js"></script>
	<script src="js/lib/backbone-min.js"></script>
	<script src="js/lib/jquery.fancybox-1.3.4.pack.js"></script>
	<script src="js/lib/jquery.easing-1.3.pack.js"></script>
	<script src="js/lib/jquery.expander.min.js"></script>
	<script src="js/lib/jquery.noty.packaged.min.js"></script>
	<script src="js/lib/jquery.qtip.min.js"></script>
	<script src="js/lib/store.js"></script>
	<script src="js/lib/jquery.scrollTo-1.4.3.1-min.js"></script>
	<script src="js/lib/js_cols.min.js"></script>
	<script src="js/lib/d3.min.js"></script>
	<script src="js/lib/colorbrewer.js"></script>

	<!--[if lt IE 8]>
	<!--script src="js/lib/icon-font-ie7.js"></script>
	<![endif]-->

	<script src="js/src/component/heatmap.js"></script>
	<script src="js/src/util/HeatMapDataUtil.js"></script>
	<script src="js/src/util/MatrixParser.js"></script>
	<script src="js/src/util/ViewUtil.js"></script>
	<script src="js/src/model/DataModel.js"></script>
	<script src="js/src/view/NotyView.js"></script>
	<script src="js/src/view/HeatMapView.js"></script>
	<script src="js/src/view/HeatMapTipView.js"></script>
	<script src="js/src/view/NetworkView.js"></script>
	<script src="js/src/view/ModelView.js"></script>
	<script src="js/src/peralyzer.js"></script>

	<script type="text/template" id="loader_template">
		<div class="network-loading">
			<h4>Loading network...</h4>
			<img src="images/loading.gif" alt="loading network...">
		</div>
	</script>

	<script type="text/template" id="noty-error-msg-template">
		{{errorMsg}}
	</script>

	<script type="text/template" id="heatmap_tip_template">
		[{{datum.row}}, {{datum.col}}]<br>
		{{display.score}}: {{datum.score}}<br>
		{{display.rowHeader}}: {{datum.rowHeader}}<br>
		{{display.colHeader}}: {{datum.colHeader}}<br>
	</script>

	<script type="text/template" id="select_item_template">
		<option value="{{selectId}}">{{selectName}}</option>
	</script>

	<script type="text/template" id="model_visualizer_template">
		<div class="heatmap-controls">
			<select class="model-box span3" tabindex="1">
				{{modelOptions}}
			</select>
		</div>
		<div class="heatmap-container"></div>
	</script>

	<div id="model_view"></div>
	<!--div id="main_network_view"></div-->
	<div id="heatmap1"></div>
	<div id="heatmap2"></div>

  </body>
</html>
