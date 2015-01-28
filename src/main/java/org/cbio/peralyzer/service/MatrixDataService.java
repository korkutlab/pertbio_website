package org.cbio.peralyzer.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.Resource;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class MatrixDataService
{
	// source directory for the matrix data files
	private Resource matrixDataResource;

	public Resource getMatrixDataResource()
	{
		return matrixDataResource;
	}
	public void setMatrixDataResource(Resource matrixDataResource)
	{
		this.matrixDataResource = matrixDataResource;
	}

	@Cacheable("matrixDataCache")
	public String getMatrixData(String name) throws IOException
	{
		String filename = this.getMatrixDataResource().getFile().getAbsolutePath() +
		                  "/" + name.replaceAll("\\|", "/") + ".txt";

		BufferedReader in = new BufferedReader(new FileReader(filename));
		String line;
		StringBuilder buffer = new StringBuilder();

		// assuming the file is not empty & first line is the header
		while((line = in.readLine()) != null)
		{
			buffer.append(line);
			buffer.append("\n");
		}

		in.close();

		return buffer.toString();
	}
}
