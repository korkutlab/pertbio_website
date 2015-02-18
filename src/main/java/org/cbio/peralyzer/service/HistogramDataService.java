package org.cbio.peralyzer.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.Resource;

import java.io.BufferedReader;
import java.io.File;
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
		BufferedReader in = new BufferedReader(new FileReader(generateFilename(prediction)));
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

	protected String generateFilename(String prediction) throws IOException
	{
		String filename = this.getHistogramDataResource().getFile().getAbsolutePath() +
		                  "/" + prediction + ".json";

		File histFile = new File(filename);

		// swap the node names and try again
		if (!histFile.exists())
		{
			String parts[] = prediction.split("_");

			if (parts.length > 4)
			{
				String newPredict = "predict_" + parts[2] + "_" +
				                    parts[1] + "_" +
			                        parts[3] + "_" +
			                        parts[4];

				filename = this.getHistogramDataResource().getFile().getAbsolutePath() +
				           "/" + newPredict + ".json";
			}
		}

		return filename;
	}
}

