<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/html">
  <head>
    <meta charset="utf-8">
    <title>Peralyzer</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- jQuery UI -->
	<link href="css/jquery-ui.min.css" rel="stylesheet">

    <!-- Bootstrap -->
    <link href="css/bootstrap.min.css" rel="stylesheet">
	<link href="css/bootstrap-theme.min.css" rel="stylesheet">
    <link href="css/bootstrap-switch.css" rel="stylesheet">

    <!-- Flat UI -->
    <!--link href="css/flat-ui.css" rel="stylesheet"-->
    <!--link rel="shortcut icon" href="images/favicon.ico"-->

    <link href="css/jquery.fancybox-1.3.4.css" rel="stylesheet">
	<link href="css/jquery.qtip.min.css" rel="stylesheet">
	<link href="css/chosen.min.css" rel="stylesheet">

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
	<script src="js/lib/jquery.noty.packaged.min.js"></script>
	<script src="js/lib/jquery.qtip.min.js"></script>
	<script src="js/lib/bootstrap.min.js"></script>
	<script src="js/lib/bootstrap-switch.min.js"></script>
	<script src="js/lib/cytoscape.min.js"></script>
	<script src="js/lib/underscore-min.js"></script>
	<script src="js/lib/backbone-min.js"></script>
	<!--script src="js/lib/jquery.expander.min.js"></script-->
	<!--script src="js/lib/arbor.js"></script-->
	<script src="js/lib/chosen.jquery.min.js"></script>
	<script src="js/lib/d3.min.js"></script>
	<script src="js/lib/d3.tip.js"></script>
	<script src="js/lib/colorbrewer.js"></script>

	<!--[if lt IE 8]>
	<!--script src="js/lib/icon-font-ie7.js"></script>
	<![endif]-->

	<script src="js/src/component/HeatMap.js"></script>
	<script src="js/src/component/BarChart.js"></script>
	<script src="js/src/component/GradientLegend.js"></script>
	<script src="js/src/util/HeatMapDataUtil.js"></script>
	<script src="js/src/util/MatrixParser.js"></script>
	<script src="js/src/util/ViewUtil.js"></script>
	<script src="js/src/util/SvgUtil.js"></script>
	<script src="js/src/model/DataModel.js"></script>
	<script src="js/src/view/MainView.js"></script>
	<script src="js/src/view/NotyView.js"></script>
	<script src="js/src/view/HeatMapView.js"></script>
	<script src="js/src/view/HeatMapTipView.js"></script>
	<script src="js/src/view/NetworkView.js"></script>
	<script src="js/src/view/ModelView.js"></script>
	<script src="js/src/view/SimulationView.js"></script>
	<script src="js/src/view/CrossValidationView.js"></script>
	<script src="js/src/peralyzer.js"></script>

	<!-- Backbone templates -->

	<%@ include file="templates/home_page.html" %>
	<%@ include file="templates/network_modelling.html" %>
	<%@ include file="templates/prediction_background.html" %>

	<script type="text/template" id="main_view_template">
		<!-- Navigation Bar -->
		<div class="navbar navbar-default peralyzer-navbar navbar-static-top" role="navigation">
		<!--div class="navbar navbar-default peralyzer-navbar navbar-collapse collapse navbar-fixed-top" role="navigation">
			<div class="navbar-header">
				<button class="navbar-toggle collapsed" type="button" data-toggle="collapse" data-target=".peralyzer-navbar">
					<span class="sr-only">...</span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
				</button>
				<a href="#" class="navbar-brand">Peralyzer</a>
			</div-->
			<div class="navbar-inner">
				<ul class="nav navbar-nav">
					<li class="active"><a href="#tab-home-page" data-toggle="tab">Home</a></li>
					<li class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Data <span class="caret"></span></a>
						<ul class="dropdown-menu" role="menu">
							<li><a href="#tab-data-matrix" data-toggle="tab"
							       class="link-data-matrix">Experimental Response Map</a></li>
						</ul>
					</li>
					<li class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Models <span class="caret"></span></a>
						<ul class="dropdown-menu" role="menu">
							<li><a href="#tab-model-method" data-toggle="tab">Network Modelling</a></li>
							<li><a href="#tab-exec-model" data-toggle="tab" class="link-exec-model">Executable Models</a></li>
							<li><a href="#tab-ave-model" data-toggle="tab" class="link-ave-model">Average Model</a></li>
						</ul>
					</li>
					<li class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Prediction <span class="caret"></span></a>
						<ul class="dropdown-menu" role="menu">
							<li><a href="#tab-prediction-background" data-toggle="tab">Background</a></li>
							<li><a href="#tab-simulation" data-toggle="tab" class="link-simulation">Simulation</a></li>
							<!--li class="divider"></li-->
						</ul>
					</li>
					<li><a href="#tab-cross-validation" data-toggle="tab" class="link-cross-validation">Cross Validation</a></li>
					<li><a href="#tab-source-code" data-toggle="tab">Source Code</a></li>
					<li><a href="#tab-about" data-toggle="tab">About</a></li>
				</ul>
			</div>
		</div>

		<!-- Tab Panes -->
		<div class="tab-content">
			<div role="tabpanel" class="tab-pane active container home-pane" id="tab-home-page"></div>

			<div role="tabpanel" class="tab-pane default-pane" id="tab-data-matrix">
				<img src="images/loading.gif" alt="Loading...">
			</div>

			<div role="tabpanel" class="tab-pane container" id="tab-model-method"></div>

			<div role="tabpanel" class="tab-pane default-pane" id="tab-ave-model">
				TODO: network model here
			</div>

			<div role="tabpanel" class="tab-pane default-pane" id="tab-exec-model"></div>

			<div role="tabpanel" class="tab-pane container" id="tab-prediction-background"></div>

			<div role="tabpanel" class="tab-pane default-pane" id="tab-simulation">
				<img src="images/loading.gif" alt="Loading...">
			</div>

			<div role="tabpanel" class="tab-pane default-pane" id="tab-cross-validation">
				<img src="images/loading.gif" alt="Loading...">
			</div>

			<div role="tabpanel" class="tab-pane default-pane" id="tab-source-code"></div>

			<div role="tabpanel" class="tab-pane default-pane" id="tab-about"></div>
		</div>
	</script>

	<script type="text/template" id="loader_template">
		<div class="network-loading">
			<h4>Loading...</h4>
			<img src="images/loading.gif" alt="Loading...">
		</div>
	</script>

	<script type="text/template" id="noty-error-msg-template">
		{{errorMsg}}
	</script>

	<script type="text/template" id="pert_heatmap_tip_template">
		X <sub>i</sub><sup class='tooltip-superscript'>u</sup>=
		{{parseFloat(datum.score).toFixed(2)}}<br>
		{{display.rowHeader}}: {{datum.rowHeader}}<br>
		{{display.colHeader}}: {{datum.colHeader}}<br>
	</script>

	<script type="text/template" id="prot_heatmap_tip_template">
		<table class='prot-heatmap-tip-table'>
			<tr>
				<td class='text-align-center'>{{datum.colHeader}} &rarr; {{datum.rowHeader}}</td>
			</tr>
			<tr>
				<td class='text-align-center'>
					W<sub>ij</sub>={{parseFloat(datum.score).toFixed(2)}}
				</td>
			</tr>
		</table>
	</script>

	<script type="text/template" id="select_item_template">
		<option value="{{selectId}}">{{selectName}}</option>
	</script>

	<script type="text/template" id="model_visualizer_template">
		<div class="heatmap-controls">
			<table>
				<tr>
					<td>
						<div class="select-box-title model-select-title">Select a model to load...</div>
						<div>
							<select class="select-box model-box span2" tabindex="1">
								{{selectOptions}}
							</select>
						</div>
					</td>
				</tr>
			</table>
		</div>
		<div class="heatmap-view"></div>
	</script>

	<script type="text/template" id="simulation_visualizer_template">
		<div class="simulation-controls">
			<table class="simulation-controls-table">
				<tr>
					<td>
						<div class="select-box-title simulation-select-title">Phenotype</div>
						<div>
							<select class="select-box simulation-box span2" tabindex="1">
								{{selectOptions}}
							</select>
						</div>
					</td>
					<td>
						<div class="select-box-title">Perturbation 1 Line</div>
						<div class="line-checkbox">
							<input type="checkbox" name="node1-line-chart" class="node1-line-checkbox"
							       data-on-color="primary">
						</div>
					</td>
					<td>
						<div class="select-box-title">Perturbation 2 Line</div>
						<div class="line-checkbox">
							<input type="checkbox" name="node2-line-chart" class="node2-line-checkbox"
							       data-on-color="success">
						</div>
					</td>
				</tr>
			</table>
		</div>
		<div class="simulation-view"></div>
	</script>

	<script type="text/template" id="simulation_view_template">
		<div class="node-strength-selection">
			<table class="node-strength-selection-table">
				<tr>
					<td>
						<div class="select-box-title node-select-title">Perturbation 1</div>
						<div>
							<select class="select-box row-node-box span2" tabindex="1">
								{{rowNodeSelectOptions}}
							</select>
						</div>
					</td>
					<td>
						<div class="select-box-title strength-select-title">Strength</div>
						<div>
							<select class="select-box row-strength-box span2" tabindex="1">
								{{rowStrengthSelectOptions}}
							</select>
						</div>
					</td>
					<td>
						<div class="select-box-title node-select-title">Perturbation 2</div>
						<div>
							<select class="select-box col-node-box span2" tabindex="1">
								{{colNodeSelectOptions}}
							</select>
						</div>
					</td>
					<td>
						<div class="select-box-title strength-select-title">Strength</div>
						<div>
							<select class="select-box col-strength-box span2" tabindex="1">
								{{colStrengthSelectOptions}}
							</select>
						</div>
					</td>
					<td>
						<button class="btn btn-default simulate-button" type="button">Visualize</div>
					</td>
				</tr>
			</table>
		</div>
		<div class="simulation-result">
			<div class="simulation-summary"></div>
			<div class="simulation-histogram"></div>
		</div>
	</script>

	<script type="text/template" id="cross_validation_visualizer_template">
		<div class="simulation-controls">
			<table class="simulation-controls-table">
				<tr>
					<td>
						<div class="select-box-title cross-validation-select-title">Readout</div>
						<div>
							<select class="select-box cross-validation-box span2" tabindex="1">
								{{selectOptions}}
							</select>
						</div>
					</td>
				</tr>
			</table>
		</div>
		<div class="simulation-view"></div>
	</script>

	<script type="text/template" id="cross_validation_view_template">
		<div class="node-strength-selection">
			<table class="node-strength-selection-table">
				<tr>
					<td>
						<div class="select-box-title node-select-title">Perturbation 1</div>
						<div>
							<select class="select-box row-node-box span2" tabindex="1">
								{{rowNodeSelectOptions}}
							</select>
						</div>
					</td>
					<td>
						<div class="select-box-title node-select-title">Perturbation 2</div>
						<div>
							<select class="select-box col-node-box span2" tabindex="1">
								{{colNodeSelectOptions}}
							</select>
						</div>
					</td>
					<td>
						<button class="btn btn-default simulate-button" type="button">Visualize</div>
					</td>
				</tr>
			</table>
		</div>
		<div class="simulation-result">
			<div class="simulation-summary"></div>
			<div class="simulation-histogram"></div>
		</div>
	</script>

	<script type="text/template" id="heatmap_view_template">
		<div class="heatmap-container"></div>
		<div class="legend-view">
			<table>
				<tr>
					<td class="legend-title">{{legendTitle}}</td>
				</tr>
				<tr>
					<td><div class="legend-container"></div></td>
				</tr>
			</table>
		</div>
	</script>

	<div id="main_container"></div>

  </body>
</html>
