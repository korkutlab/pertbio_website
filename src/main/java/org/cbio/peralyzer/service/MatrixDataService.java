package org.cbio.peralyzer.service;

import flexjson.JSONSerializer;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.Resource;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

//TODO do not allow access to .. or /
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

	@Cacheable("matrixServiceListCache")
	public String listMatrices(String directory) throws IOException
	{
		String dirName = this.getMatrixDataResource().getFile().getAbsolutePath() +
		                  "/" + directory.replaceAll("\\|", "/");

		File matrixDir = new File(dirName);

		JSONSerializer jsonSerializer = new JSONSerializer().exclude("*.class");

		List<String> matrices = new ArrayList<>();

		if (matrixDir.isDirectory())
		{
			for (File matrix: matrixDir.listFiles())
			{
				// ignore the sub directories
				if (matrix.isDirectory())
				{
					continue;
				}

				// ignore the extension as well
				String[] parts = matrix.getName().split("\\.");

				if (parts.length > 0)
				{
					matrices.add(parts[0]);
				}
			}
		}

		return jsonSerializer.deepSerialize(matrices);
	}

	@Cacheable("matrixServiceDataCache")
	public String getMatrixData(String name) throws IOException
	{
		String filename = this.getMatrixDataResource().getFile().getAbsolutePath() +
		                  "/" + name.replaceAll("\\|", "/") + ".txt";

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
