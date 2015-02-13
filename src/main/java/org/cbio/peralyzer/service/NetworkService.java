package org.cbio.peralyzer.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.Resource;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class NetworkService
{
	// source directory for the network model files
	private Resource networkModelsResource;

	public Resource getNetworkModelsResource()
	{
		return networkModelsResource;
	}
	public void setNetworkModelsResource(Resource networkModelsResource)
	{
		this.networkModelsResource = networkModelsResource;
	}

	@Cacheable("networkDataCache")
	public String getNetworkData(String model) throws IOException
	{
		String filename = this.getNetworkModelsResource().getFile().getAbsolutePath() +
		                  "/" + model + ".cyjs";

		BufferedReader in = new BufferedReader(new FileReader(filename));
		String line;
		StringBuilder buffer = new StringBuilder();

		while((line = in.readLine()) != null)
		{
			buffer.append(line);
			buffer.append("\n");
		}

		in.close();

		return buffer.toString();
	}
}
