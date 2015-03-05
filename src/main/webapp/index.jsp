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
			<div role="tabpanel" class="tab-pane active container home-pane" id="tab-home-page">
				<div class="home-page-main-text">
					<h4>What is <span class="stressed-text">perturbation biology</span>?</h4>
					<div class="main-paragraph">
						Perturbation biology is an experimental-computational technology for inferring
						network models that predict the response of cells to perturbations,
						and that may be useful in the design of combinatorial therapy against cancer.
						Beyond nomination of effective drug combinations, the perturbation biology
						method paves the way for model-driven quantitative cell biology with diverse
						applications in many fields of biology.
					</div>
				</div>
				<div class="main-image">
					<img src="images/figure1_bpmel.png" class="img-responsive" alt="BP mel">
				</div>
				<div class="home-page-image-text">
					<h4>How does <span class="stressed-text">perturbation biology</span> work?</h4>
					<div class="main-paragraph">
						Perturbation biology involves systematic perturbations of cells with combinations of
						targeted compounds (Box 1-2), high-throughput measurements of response profiles (Box 2),
						automated extraction of prior signaling information from databases (Box 3-4),
						construction of ODE-based signaling pathway models (Box 5) with the belief propagation (BP)
						based network inference algorithm (Box 6) and prediction of system response to
						novel perturbations with the models and simulations (Box 7).
						The "prior extraction and reduction algorithm" (PERA) generates a qualitative prior model,
						which is a network of known interactions between the proteins of interest
						(i.e., profiled (phospho)proteins). This is achieved through a search in
						the Pathway Commons information resource, which integrates biological pathway information
						from multiple public databases (Box 3-4). In the quantitative network models,
						the nodes represent measured levels of (phospho)proteins or cellular phenotypes and
						the edges represent the influence of the upstream nodes on the time derivative of
						their downstream effectors. This definition corresponds to a simple yet efficient
						ODE-based mathematical description of models (Box 5). Our BP-based modeling approach
						combines information from the perturbation data (phosphoproteomic and phenotypic) with
						prior information to generate network models of signaling (Box 6). We execute the resulting
						ODE based models to predict system response to untested perturbation conditions (Box 7).
					</div>
				</div>
			</div>

			<div role="tabpanel" class="tab-pane default-pane" id="tab-data-matrix">
				<img src="images/loading.gif" alt="Loading...">
			</div>

			<div role="tabpanel" class="tab-pane container" id="tab-model-method">
				<h4>Network inference</h4>
				<div class="main-paragraph">
					Deriving models of a (biological) system is called
					<span class="stressed-text">model inference</span>.<br>
					The objective of model inference is to find a set of parameters such that the model equations:
					<ul>
						<li>Best reproduce (have low error) an experimental training data (perturbation response data)</li>
						<li>Have predictive power beyond the training data (predict response to untested perturbations)</li>
					</ul>
				</div>
				<div class="main-image">
					<img src="images/network_inference.png" class="img-responsive" alt="BP mel">
				</div>
				<h4>Network inference is a hard problem</h4>
				<div class="main-paragraph">
					Computation of the cost of all possible network configurations will,
					in principle, lead to inference of optimal network configurations.
					However, explicit enumeration and cost calculation of all possible
					parameter configurations is a prohibitively complicated task for even
					moderately sized systems. To circumvent this problem, we have adapted
					from statistical physics a two-step approach. The approach is based on
					first calculating probability distributions for each possible interaction
					with Belief propagation algorithm, and then computing distinct solutions
					by sampling the probability distributions.
				</div>
				<h4>What is belief propagation?</h4>
				<div class="main-paragraph">
					Belief propagation (BP) is a message passing algorithm for probabilistic
					inference on graphical models. BP exploits a mean-field like cavity
					approach, in which the probability distribution of the variables in a
					<span class="stressed-text">cavity</span> can be defined by
					collective statistical properties of
					the surrounding variables. Thus, the distribution of the parameters
					can be treated by statistical mechanics principles; the probability
					distribution for each parameter value is defined by the Boltzmann
					distribution and computed numerically. BP works by passing mathematical
					messages on a factor graph between model parameters and experimental
					constraints iteratively until consecutive messages converge.
					Explicitly, the message passing equations are iteratively calculated
					until convergence. The result of BP is a set of probability distributions
					for all unfixed model parameters. By means of the probabilistic approach,
					the time-complexity of the problem is reduced and the obstacles imposed
					by combinatorial complexity are circumvented. Next, thousands of distinct
					networks models are instantiated from probability distributions with
					BP-guided decimation algorithm.
				</div>
				<div class="main-image">
					<img src="images/bp_algorithm.png" class="img-responsive" alt="BP mel">
				</div>
				<h4>Iteration process for Belief Propagation</h4>
				<div class="main-paragraph">
					Top panel: the global information consists of collecting the probability
					distributions of the non-cavity parameters without the contribution from
					the cavity condition. This is a simple product over all
					&rho;<sup>v</sup>(w<sub>ij</sub>)
					factors except that from the cavity constraint &mu;.
					Distributions centered on zero denote unlikely interactions (see j = 2),
					centered on the right of zero denote likely positive interactions (see j = 3),
					and centered on the left denote likely negative interactions (see j = N).
					These distributions inform the parameters of the Gaussian distribution
					for the mean-field, aggregate sum variable s<sup>&mu;</sup><sub>k</sub>.
					The distribution P<sup>&mu;</sup>(s<sup>&mu;</sup><sub>k</sub>)
					summarizes the state of the non-cavity parameters.<br>
					<br>
					Bottom panel: we calculate the probability of each possible parameter assignment
					&omega;&isin;&Omega;
					to the cavity parameter w<sub>ik</sub>
					constrained to the data in the cavity condition. This calculation boils down
					to a simple convolution of the fitness function with a fixed parameter assignment
					F<sup>&mu;</sup>(s<sup>&mu;</sup><sub>k</sub>)
					with the probability of the aggregate sum variable
					P<sup>&mu;</sup>(s<sup>&mu;</sup><sub>k</sub>),
					obtained by integrating over all values of
					s<sup>&mu;</sup><sub>k</sub>.
					Each assignment
					&omega;&isin;&Omega;
					contributes proportional to the area under the curve.
					The resulting update is the contribution of condition &mu;
					on the distribution of w<sub>ik</sub>,
					denoted &rho;<sup>&mu;</sup>(w<sub>ik</sub>).
					This recently updated distribution becomes part of
					the global information for successive updates to other parameters.
				</div>
			</div>

			<div role="tabpanel" class="tab-pane default-pane" id="tab-ave-model">
				TODO: network model here
			</div>

			<div role="tabpanel" class="tab-pane default-pane" id="tab-exec-model"></div>

			<div role="tabpanel" class="tab-pane container" id="tab-prediction-background">
				<h4>Model execution with in silico perturbations</h4>
				<div class="main-paragraph">
					Thanks to their ODE-based mathematical descriptions, the models can be executed
					to predict cellular response to novel perturbations. The systematic predictions
					go beyond the analysis of few particular edges in the system and capture the
					collective signaling mechanisms of response to drugs. We execute the parameterized
					model ODEs with in silico perturbations acting on node (i) as a real numbered u(i)
					value until all the system variables (i.e. node values, {x<sub>i</sub>}) reach to
					steady state. The simulations expand the size of the response map by three orders
					of magnitude from few thousand experimental response data to millions of
					predicted responses.
				</div>
				<div class="main-image">
					<img src="images/model_execution_in_silico.png" class="img-responsive" alt="BP mel">
				</div>
			</div>

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
