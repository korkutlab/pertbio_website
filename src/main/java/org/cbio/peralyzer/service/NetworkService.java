package org.cbio.peralyzer.service;


import org.springframework.core.io.Resource;

public class NetworkService
{
	// source directory for the average model networks
	private Resource averageBpmelModelsResource;

	public Resource getAverageBpmelModelsResource()
	{
		return averageBpmelModelsResource;
	}
	public void setAverageBpmelModelsResource(Resource averageBpmelModelsResource)
	{
		this.averageBpmelModelsResource = averageBpmelModelsResource;
	}

}
