<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@page import="org.springframework.web.context.WebApplicationContext"%>
<%@page import="org.springframework.web.context.support.WebApplicationContextUtils"%>

<%--
  ~ Copyright 2014 Memorial-Sloan Kettering Cancer Center.
  ~
  ~ This file is part of GraphViz.
  ~
  ~ GraphViz is free software: you can redistribute it and/or modify
  ~ it under the terms of the GNU Lesser General Public License as published by
  ~ the Free Software Foundation, either version 3 of the License, or
  ~ (at your option) any later version.
  ~
  ~ GraphViz is distributed in the hope that it will be useful,
  ~ but WITHOUT ANY WARRANTY; without even the implied warranty of
  ~ MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  ~ GNU Lesser General Public License for more details.
  ~
  ~ You should have received a copy of the GNU Lesser General Public License
  ~ along with GraphViz. If not, see <http://www.gnu.org/licenses/>.
  --%>

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
    <!--link href="css/jquery-ui-1.10.3.custom.css" rel="stylesheet"-->
	<link href="css/jquery-ui.min.css" rel="stylesheet">

      <!-- Loading Bootstrap -->
    <link href="css/bootstrap.css" rel="stylesheet">

    <!-- Loading Flat UI -->
    <!--link href="css/flat-ui.css" rel="stylesheet"-->
    <!--link rel="shortcut icon" href="images/favicon.ico"-->

    <link href="css/jquery.fancybox-1.3.4.css" rel="stylesheet">


    <!-- Loading cytoscape.js plugins -->
    <link href="css/jquery.cytoscape-panzoom.css" rel="stylesheet">
    <link href="//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css" rel="stylesheet">

    <!-- Loading Peralyzer; this should always be the last to call! -->
	<link href="css/peralyzer.css" rel="stylesheet">

    <!-- HTML5 shim, for IE6-8 support of HTML5 elements. All other JS at the end of file. -->
    <!--[if lt IE 9]>
      <script src="js/lib/html5shiv.js"></script>
    <![endif]-->

  </head>
  <body>
	<!-- JS libraries -->
	<script src="js/lib/jquery-2.1.3.min.js"></script>
	<!--script src="js/lib/jquery-ui-1.10.3.custom.min.js"></script-->
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
	<script src="js/lib/application.js"></script>
	<script src="js/lib/underscore-min.js"></script>
	<script src="js/lib/backbone-min.js"></script>
	<script src="js/lib/jquery.fancybox-1.3.4.pack.js"></script>
	<script src="js/lib/jquery.easing-1.3.pack.js"></script>
	<script src="js/lib/jquery.expander.min.js"></script>
	<script src="js/lib/noty/jquery.noty.js"></script>
	<script src="js/lib/noty/layouts/bottomRight.js"></script>
	<script src="js/lib/noty/themes/noty.pcviz.theme.js"></script>
	<script src="js/lib/store.js"></script>
	<script src="js/lib/jquery.scrollTo-1.4.3.1-min.js"></script>
	<script src="js/lib/js_cols.min.js"></script>
	<script src="js/lib/d3.min.js"></script>

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
	<script src="js/src/view/NetworkView.js"></script>
	<script src="js/src/peralyzer.js"></script>

	<script type="text/template" id="noty-error-msg-template">
		{{errorMsg}}
	</script>

    <div id="main_network_view"></div>
	<div id="main_heatmap_view"></div>

  </body>
</html>
