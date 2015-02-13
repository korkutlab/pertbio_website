package org.cbio.peralyzer.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.Resource;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class HistogramDataService
{
	// source directory for the histogram data files
	private Resource histogramDataResource;

	public Resource getHistogramDataResource()
	{
		return histogramDataResource;
	}
	public void setHistogramDataResource(Resource histogramDataResource)
	{
		this.histogramDataResource = histogramDataResource;
	}

	@Cacheable("histogramDataCache")
	public String getHistogramData(String prediction) throws IOException
	{
		String filename = this.getHistogramDataResource().getFile().getAbsolutePath() +
		                  "/" + prediction + ".json";

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

