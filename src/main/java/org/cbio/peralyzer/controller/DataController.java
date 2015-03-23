package org.cbio.peralyzer.controller;

import org.cbio.peralyzer.service.HistogramDataService;
import org.cbio.peralyzer.service.MatrixDataService;
import org.cbio.peralyzer.service.NetworkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.io.IOException;

@Controller
@RequestMapping("/data")
public class DataController
{
	@Autowired
	NetworkService networkService;

	@Autowired
	MatrixDataService matrixDataService;

	@Autowired
	HistogramDataService histogramDataService;

	public NetworkService getNetworkService()
	{
		return networkService;
	}
	public void setNetworkService(NetworkService networkService)
	{
		this.networkService = networkService;
	}

	public MatrixDataService getMatrixDataService()
	{
		return matrixDataService;
	}
	public void setMatrixDataService(MatrixDataService matrixDataService)
	{
		this.matrixDataService = matrixDataService;
	}

	@RequestMapping(value = "network/{model}", method = {RequestMethod.GET, RequestMethod.POST},
	                headers = "Accept=application/json")
	public ResponseEntity<String> getNetworkData(@PathVariable String model)
	{
		HttpHeaders headers = new HttpHeaders();
		headers.add("Content-Type", "application/json; charset=utf-8");

		String response;
		try {
			response = networkService.getNetworkData(model);
		} catch (IOException e) {
			return new ResponseEntity<String>(e.getMessage(), headers, HttpStatus.BAD_REQUEST);
		}

		return new ResponseEntity<String>(response, headers, HttpStatus.OK);
	}

	@RequestMapping(value = "matrix/{name}",
	                method = {RequestMethod.GET, RequestMethod.POST},
	                headers = "Accept=application/text+plain")
	public ResponseEntity<String> getMatrixData(@PathVariable String name)
	{
		HttpHeaders headers = new HttpHeaders();
		headers.add("Content-Type", "application/text+plain; charset=utf-8");

		String response;
		try {
			response = matrixDataService.getMatrixData(name);
		} catch (Exception e) {
			return new ResponseEntity<String>(e.getMessage(), headers, HttpStatus.BAD_REQUEST);
		}

		return new ResponseEntity<String>(response, headers, HttpStatus.OK);
	}

	@RequestMapping(value = "histogram/{name}",
	                method = {RequestMethod.GET, RequestMethod.POST},
	                headers = "Accept=application/text+plain")
	public ResponseEntity<String> getHistogramData(@PathVariable String name)
	{
		HttpHeaders headers = new HttpHeaders();
		headers.add("Content-Type", "application/text+plain; charset=utf-8");

		String response;
		try {
			response = histogramDataService.getHistogramData(name);
		} catch (Exception e) {
			return new ResponseEntity<String>(e.getMessage(), headers, HttpStatus.BAD_REQUEST);
		}

		return new ResponseEntity<String>(response, headers, HttpStatus.OK);
	}

	@RequestMapping(value = "list/matrix/{directory}",
	                method = {RequestMethod.GET, RequestMethod.POST},
	                headers = "Accept=application/json")
	public ResponseEntity<String> getMatrixList(@PathVariable String directory)
	{
		HttpHeaders headers = new HttpHeaders();
		headers.add("Content-Type", "application/json; charset=utf-8");

		String matrices;

		try {
			matrices = matrixDataService.listMatrices(directory);
		} catch (Exception e) {
			return new ResponseEntity<String>(e.getMessage(), headers, HttpStatus.BAD_REQUEST);
		}

		return new ResponseEntity<String>(matrices, headers, HttpStatus.OK);
	}
}
